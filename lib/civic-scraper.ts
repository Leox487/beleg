import "server-only";

import { createHash } from "crypto";

import { CITY_SEEDS } from "@/lib/civic-cities";
import { stampHashHex, upgradeProofBase64 } from "@/lib/ots";
import sql from "@/lib/supabase";

const FETCH_MS = 45_000;
const MAX_BYTES = 80 * 1024 * 1024;
const UPGRADE_MIN_AGE_MS = 60 * 60 * 1000;

const SKIP_HOSTS = [
  "docs.google.com",
  "youtube.com",
  "youtu.be",
  "powerbigov.us",
  "powerbi.com",
];

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

function isDownloadable(url: string, format?: string): boolean {
  const fmt = (format ?? "").trim().toUpperCase();
  if (fmt === "HTML" || fmt === "ARC GIS GEOSERVICES REST API") {
    return false;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (SKIP_HOSTS.some((skip) => host === skip || host.endsWith(`.${skip}`))) {
      return false;
    }
    if (parsed.pathname.includes("/arcgis/rest/")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function showPackage(
  portal: string,
  id: string,
): Promise<CkanPackage["result"] | null> {
  const base = portal.replace(/\/$/, "");
  const res = await fetch(
    `${base}/api/3/action/package_show?id=${encodeURIComponent(id)}`,
    {
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json" },
    },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as CkanPackage;
  if (!body.success || !body.result) return null;
  return body.result;
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
  city: string;
  state: string;
  datasetId: string;
  datasetName: string;
  resourceUrl: string;
  fileHash: string;
  fileSize: number;
}): Promise<void> {
  let otsProof: string | null = null;
  const anchorStatus = "pending";
  try {
    otsProof = await stampHashHex(input.fileHash);
  } catch (error) {
    console.error(`OTS stamp failed for ${input.resourceUrl}:`, error);
  }

  await sql`
    INSERT INTO civic_records (
      city, state, dataset_id, dataset_name, resource_url, file_hash, file_size,
      ots_proof, anchor_status
    ) VALUES (
      ${input.city}, ${input.state}, ${input.datasetId}, ${input.datasetName},
      ${input.resourceUrl}, ${input.fileHash}, ${input.fileSize}, ${otsProof},
      ${anchorStatus}
    )
  `;
}

/**
 * Pulls seeded CKAN packages for each city, hashes downloadable resources,
 * and writes a civic_records row when the bytes are new or have changed.
 */
export async function scrapeCivicRecords(): Promise<CivicIngestResult> {
  let checked = 0;
  let changed = 0;
  let new_records = 0;

  for (const seed of CITY_SEEDS) {
    for (const datasetId of seed.datasets) {
      let pack: CkanPackage["result"] | null = null;
      try {
        pack = await showPackage(seed.portal, datasetId);
      } catch (error) {
        console.error(
          `CKAN lookup failed for ${seed.city}/${datasetId}:`,
          error,
        );
        continue;
      }
      if (!pack) {
        console.error(`No CKAN package for ${seed.city}/${datasetId}`);
        continue;
      }

      const resolvedId = pack.name || datasetId;
      const datasetName = pack.title || datasetId;
      const resources = (pack.resources ?? []).filter(
        (resource) =>
          resource.url && isDownloadable(resource.url, resource.format),
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
            city: seed.city,
            state: seed.state,
            datasetId: resolvedId,
            datasetName,
            resourceUrl,
            fileHash: hashed.hash,
            fileSize: hashed.size,
          });
          new_records += 1;

          if (previous) {
            await sql`
              INSERT INTO civic_changes (
                city, state, dataset_name, resource_url, old_hash, new_hash,
                change_type
              ) VALUES (
                ${seed.city}, ${seed.state}, ${datasetName}, ${resourceUrl},
                ${previous}, ${hashed.hash}, ${"content_modified"}
              )
            `;
            changed += 1;
          }
        } catch (error) {
          console.error(`Insert failed for ${resourceUrl}:`, error);
        }
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
