import "server-only";

import { createHash } from "crypto";

import { stampHashHex, upgradeProofBase64 } from "@/lib/ots";
import sql from "@/lib/supabase";

const CKAN = "https://data.wprdc.org/api/3/action/package_show";

const SEED = [
  {
    slug: "city-of-pittsburgh-budget",
    aliases: ["city-revenues-and-expenses"],
  },
  {
    slug: "city-of-pittsburgh-contracts",
    aliases: [],
  },
  {
    slug: "311-data",
    aliases: [],
  },
  {
    slug: "city-of-pittsburgh-operating-budget",
    aliases: ["city-pittsburgh-operating-budget"],
  },
] as const;

const FETCH_MS = 45_000;
const MAX_BYTES = 80 * 1024 * 1024;

export interface CivicIngestResult {
  checked: number;
  changed: number;
  new_records: number;
}

export interface CivicUpgradeResult {
  checked: number;
  confirmed: number;
  updated: number;
}

const UPGRADE_MIN_AGE_MS = 60 * 60 * 1000;

interface CkanResource {
  url?: string;
  name?: string;
  format?: string;
}

interface CkanPackage {
  success?: boolean;
  result?: {
    name?: string;
    title?: string;
    resources?: CkanResource[];
  };
}

function isDownloadable(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.hostname.includes("docs.google.com")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function showPackage(id: string): Promise<CkanPackage["result"] | null> {
  const res = await fetch(`${CKAN}?id=${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as CkanPackage;
  if (!body.success || !body.result) return null;
  return body.result;
}

async function resolveDataset(slug: string, aliases: readonly string[]) {
  for (const id of [slug, ...aliases]) {
    const pack = await showPackage(id);
    if (pack) return { id, pack };
  }
  return null;
}

async function hashUrl(
  url: string,
): Promise<{ hash: string; size: number } | null> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok || !res.body) return null;

  const hasher = createHash("sha256");
  let size = 0;
  const reader = res.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    hasher.update(value);
  }

  return { hash: hasher.digest("hex"), size };
}

async function latestHash(url: string): Promise<string | null> {
  const rows = await sql`
    SELECT file_hash
    FROM civic_records
    WHERE resource_url = ${url}
    ORDER BY retrieved_at DESC
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row?.file_hash == null ? null : String(row.file_hash);
}

async function insertRecord(input: {
  datasetId: string;
  datasetName: string;
  resourceUrl: string;
  fileHash: string;
  fileSize: number;
}): Promise<void> {
  let otsProof: string | null = null;
  let anchorStatus = "pending";
  try {
    otsProof = await stampHashHex(input.fileHash);
  } catch (error) {
    console.error(`OTS stamp failed for ${input.resourceUrl}:`, error);
  }

  await sql`
    INSERT INTO civic_records (
      dataset_id, dataset_name, resource_url, file_hash, file_size,
      ots_proof, anchor_status
    ) VALUES (
      ${input.datasetId}, ${input.datasetName}, ${input.resourceUrl},
      ${input.fileHash}, ${input.fileSize}, ${otsProof}, ${anchorStatus}
    )
  `;
}

/**
 * Pulls the seeded WPRDC packages, hashes each downloadable resource, and
 * writes a new civic_records row when the bytes are new or have changed.
 */
export async function scrapeCivicRecords(): Promise<CivicIngestResult> {
  let checked = 0;
  let changed = 0;
  let new_records = 0;

  for (const seed of SEED) {
    let resolved: Awaited<ReturnType<typeof resolveDataset>>;
    try {
      resolved = await resolveDataset(seed.slug, seed.aliases);
    } catch (error) {
      console.error(`CKAN lookup failed for ${seed.slug}:`, error);
      continue;
    }
    if (!resolved) {
      console.error(`No WPRDC package for ${seed.slug}`);
      continue;
    }

    const datasetId = resolved.pack.name || resolved.id;
    const datasetName = resolved.pack.title || seed.slug;
    const resources = (resolved.pack.resources ?? []).filter(
      (resource) => resource.url && isDownloadable(resource.url),
    );

    for (const resource of resources) {
      const resourceUrl = resource.url as string;
      checked += 1;

      let hashed: { hash: string; size: number } | null = null;
      try {
        hashed = await hashUrl(resourceUrl);
      } catch (error) {
        console.error(`Fetch/hash failed for ${resourceUrl}:`, error);
        continue;
      }
      if (!hashed) continue;

      const previous = await latestHash(resourceUrl);
      if (previous === hashed.hash) continue;

      try {
        await insertRecord({
          datasetId,
          datasetName,
          resourceUrl,
          fileHash: hashed.hash,
          fileSize: hashed.size,
        });
        new_records += 1;

        if (previous) {
          await sql`
            INSERT INTO civic_changes (
              dataset_name, resource_url, old_hash, new_hash, change_type
            ) VALUES (
              ${datasetName}, ${resourceUrl}, ${previous}, ${hashed.hash},
              ${"content_modified"}
            )
          `;
          changed += 1;
        }
      } catch (error) {
        console.error(`Insert failed for ${resourceUrl}:`, error);
      }
    }
  }

  return { checked, changed, new_records };
}

/**
 * Upgrade pending civic OpenTimestamps proofs. Stamp only submits to
 * calendars; Bitcoin confirmation needs a later upgrade pass.
 */
export async function upgradeCivicAnchors(): Promise<CivicUpgradeResult> {
  const cutoff = new Date(Date.now() - UPGRADE_MIN_AGE_MS).toISOString();
  const pendingRows = await sql`
    SELECT id, ots_proof
    FROM civic_records
    WHERE anchor_status = 'pending'
      AND ots_proof IS NOT NULL
      AND retrieved_at < ${cutoff}
  `;

  let confirmed = 0;
  let updated = 0;

  for (const raw of pendingRows) {
    const row = raw as Record<string, unknown>;
    const id = String(row.id);
    const proof = row.ots_proof == null ? null : String(row.ots_proof);
    if (!proof) continue;

    try {
      const result = await upgradeProofBase64(proof);
      if (result.confirmed) {
        await sql`
          UPDATE civic_records
          SET
            ots_proof = ${result.proofBase64},
            anchor_status = ${"confirmed"}
          WHERE id = ${id}
        `;
        confirmed += 1;
      } else if (result.changed) {
        await sql`
          UPDATE civic_records
          SET ots_proof = ${result.proofBase64}
          WHERE id = ${id}
        `;
        updated += 1;
      }
    } catch (error) {
      console.error(`Civic OTS upgrade failed for ${id}:`, error);
    }
  }

  return { checked: pendingRows.length, confirmed, updated };
}
