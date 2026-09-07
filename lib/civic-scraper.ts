import "server-only";

import { createHash } from "crypto";

import {
  CITY_SEEDS,
  citySlug,
  type CivicCitySeed,
} from "@/lib/civic-cities";
import { sendCivicChangeEmail } from "@/lib/civic-email";
import { stampHashHex, upgradeProofBase64 } from "@/lib/ots";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

const FETCH_MS = 80_000;
const MAX_BYTES = 400 * 1024 * 1024;
const UPGRADE_MIN_AGE_MS = 60 * 60 * 1000;

const SKIP_HOSTS = [
  "docs.google.com",
  "youtube.com",
  "youtu.be",
  "powerbigov.us",
  "powerbi.com",
];

const SKIP_DATASETS = new Set(["v6vf-nfxy"]);

function isSkippedDataset(id: string): boolean {
  if (!SKIP_DATASETS.has(id)) return false;
  console.log(`skipped (oversized) ${id}`);
  return true;
}

export interface CivicIngestResult {
  checked: number;
  changed: number;
  new_records: number;
  errors: string[];
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

interface SocrataView {
  id?: string;
  name?: string;
  error?: boolean;
}

type IngestCounters = {
  checked: number;
  changed: number;
  new_records: number;
  errors: string[];
};

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

  // Stream raw bytes into SHA-256 so large CKAN dumps are not buffered.
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

async function showSocrataView(
  portal: string,
  id: string,
): Promise<{ id: string; name: string } | null> {
  const base = portal.replace(/\/$/, "");
  const res = await fetch(`${base}/api/views/${encodeURIComponent(id)}.json`, {
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as SocrataView;
  if (!body || body.error || !body.id) return null;
  return { id: String(body.id), name: String(body.name || body.id) };
}

function socrataCsvUrl(portal: string, id: string): string {
  const base = portal.replace(/\/$/, "");
  return `${base}/api/views/${encodeURIComponent(id)}/rows.csv?accessType=DOWNLOAD`;
}

async function ingestResource(
  seed: CivicCitySeed,
  datasetId: string,
  datasetName: string,
  resourceUrl: string,
  counters: IngestCounters,
): Promise<void> {
  if (isSkippedDataset(datasetId)) return;

  counters.checked += 1;

  let hashed: { hash: string; size: number } | null = null;
  try {
    hashed = await hashUrl(resourceUrl);
  } catch (error) {
    const message = `Fetch/hash failed for ${resourceUrl}`;
    console.error(message, error);
    counters.errors.push(message);
    return;
  }
  if (!hashed) {
    counters.errors.push(`Could not hash ${resourceUrl}`);
    return;
  }

  const previous = await latestHash(resourceUrl);
  if (previous === hashed.hash) return;

  try {
    await insertRecord({
      city: seed.city,
      state: seed.state,
      datasetId,
      datasetName,
      resourceUrl,
      fileHash: hashed.hash,
      fileSize: hashed.size,
    });
    counters.new_records += 1;

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
      counters.changed += 1;
      void notifyCitySubscribers({
        city: seed.city,
        datasetName,
        resourceUrl,
        oldHash: previous,
        newHash: hashed.hash,
      }).catch((error) => {
        console.error("Civic subscriber notify failed:", error);
      });
    }
  } catch (error) {
    const message = `Insert failed for ${resourceUrl}`;
    console.error(message, error);
    counters.errors.push(message);
  }
}

async function scrapeCkanCity(
  seed: CivicCitySeed,
  counters: IngestCounters,
): Promise<void> {
  for (const datasetId of seed.datasets) {
    if (isSkippedDataset(datasetId)) continue;
    let pack: CkanPackage["result"] | null = null;
    try {
      pack = await showPackage(seed.portal, datasetId);
    } catch (error) {
      const message = `CKAN lookup failed for ${seed.city}/${datasetId}`;
      console.error(message, error);
      counters.errors.push(message);
      continue;
    }
    if (!pack) {
      counters.errors.push(`No CKAN package for ${seed.city}/${datasetId}`);
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
      await ingestResource(
        seed,
        resolvedId,
        datasetName,
        resource.url as string,
        counters,
      );
    }
  }
}

async function scrapeSocrataCity(
  seed: CivicCitySeed,
  counters: IngestCounters,
): Promise<void> {
  for (const datasetId of seed.datasets) {
    if (isSkippedDataset(datasetId)) continue;
    let view: { id: string; name: string } | null = null;
    try {
      view = await showSocrataView(seed.portal, datasetId);
    } catch (error) {
      const message = `Socrata lookup failed for ${seed.city}/${datasetId}`;
      console.error(message, error);
      counters.errors.push(message);
      continue;
    }
    if (!view) {
      counters.errors.push(`No Socrata view for ${seed.city}/${datasetId}`);
      console.error(`No Socrata view for ${seed.city}/${datasetId}`);
      continue;
    }

    await ingestResource(
      seed,
      view.id,
      view.name,
      socrataCsvUrl(seed.portal, view.id),
      counters,
    );
  }
}

/**
 * Pulls seeded CKAN packages or Socrata views for each city, hashes
 * downloadable resources, and writes a civic_records row when the bytes
 * are new or have changed.
 * Pass a city slug to process one city; omit it to process all seeds.
 */
export async function scrapeCivicRecords(
  cityFilter?: string,
): Promise<CivicIngestResult> {
  const seeds = cityFilter
    ? CITY_SEEDS.filter((seed) => citySlug(seed.city) === cityFilter)
    : CITY_SEEDS;

  if (cityFilter && seeds.length === 0) {
    console.error(`No civic seed for city=${cityFilter}`);
    return { checked: 0, changed: 0, new_records: 0, errors: [`unknown city: ${cityFilter}`] };
  }

  const counters: IngestCounters = {
    checked: 0,
    changed: 0,
    new_records: 0,
    errors: [],
  };

  for (const seed of seeds) {
    if (seed.type === "socrata") {
      await scrapeSocrataCity(seed, counters);
    } else {
      await scrapeCkanCity(seed, counters);
    }
  }

  return counters;
}

async function notifyCitySubscribers(input: {
  city: string;
  datasetName: string;
  resourceUrl: string;
  oldHash: string;
  newHash: string;
}): Promise<void> {
  const rows = await sql`
    SELECT email
    FROM civic_subscribers
    WHERE city = ${input.city}
  `;
  const auditUrl = `${SITE_URL}/audit/${citySlug(input.city)}`;
  const detectedAt = new Date().toISOString();
  for (const raw of rows) {
    const email = String((raw as Record<string, unknown>).email ?? "");
    if (!email) continue;
    await sendCivicChangeEmail({
      to: email,
      city: input.city,
      datasetName: input.datasetName,
      resourceUrl: input.resourceUrl,
      oldHash: input.oldHash,
      newHash: input.newHash,
      detectedAt,
      auditUrl,
    });
  }
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
            anchor_status = ${"confirmed"},
            bitcoin_block_height = ${result.bitcoinBlockHeight}
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
