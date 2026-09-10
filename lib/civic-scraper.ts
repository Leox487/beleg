import "server-only";

import { createHash } from "crypto";

import {
  CITY_SEEDS,
  citySlug,
  type CivicCitySeed,
} from "@/lib/civic-cities";
import {
  civicSnapshotToText,
  diffCivicContent,
  extractCivicSnapshot,
  parseStoredDiff,
  refineDiffWithTotals,
  type CivicDiffSummary,
  type CivicRowSnapshot,
} from "@/lib/civic-diff";
import { asTimestamp } from "@/lib/row";
import { sendCivicChangeEmail } from "@/lib/civic-email";
import { generateChangeStory } from "@/lib/civic-story";
import { stampHashHex, upgradeProofBase64 } from "@/lib/ots";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

export const FETCH_MS = 80_000;
export const FEDERAL_FETCH_MS = 60_000;
export const MAX_BYTES = 50 * 1024 * 1024;
export const FETCH_UA =
  "BelegCivicAudit/1.0 (+https://belegapp.com; beleg.app@proton.me)";
const UPGRADE_MIN_AGE_MS = 60 * 60 * 1000;
const INGEST_BUDGET_MS = 75_000;

const SKIP_HOSTS = [
  "docs.google.com",
  "youtube.com",
  "youtu.be",
  "powerbigov.us",
  "powerbi.com",
];

const SKIP_DATASETS = new Set([
  "v6vf-nfxy",
  "ijzp-q8t2",
  "fdj4-gpfu",
  "wg3w-h783",
]);

export function isSkippedDataset(id: string): boolean {
  if (!SKIP_DATASETS.has(id)) return false;
  console.log(`skipped (oversized) ${id}`);
  return true;
}

export type CivicHashResult =
  | { ok: true; hash: string; size: number; snapshot: CivicRowSnapshot | null }
  | { ok: false; reason: "oversized" | "fetch" };

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

type IngestCounters = {
  checked: number;
  changed: number;
  new_records: number;
  errors: string[];
};

export function isDownloadable(url: string, format?: string): boolean {
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

export async function probeContentLength(
  url: string,
): Promise<{ length: number | null; skip: boolean }> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": FETCH_UA, Accept: "*/*" },
    });
    const raw = res.headers.get("content-length");
    if (raw == null || raw === "") return { length: null, skip: false };
    const length = Number(raw);
    if (!Number.isFinite(length) || length < 0) {
      return { length: null, skip: false };
    }
    return { length, skip: length > MAX_BYTES };
  } catch {
    return { length: null, skip: false };
  }
}

async function hashUrl(
  url: string,
  timeoutMs = FETCH_MS,
): Promise<CivicHashResult> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": FETCH_UA, Accept: "*/*" },
  });
  if (!res.ok || !res.body) return { ok: false, reason: "fetch" };

  const declared = Number(res.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    await res.body.cancel();
    return { ok: false, reason: "oversized" };
  }

  const hasher = createHash("sha256");
  let size = 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let collectText = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return { ok: false, reason: "oversized" };
    }
    hasher.update(value);
    if (collectText) {
      if (chunks.length === 0 && isLikelyBinary(value)) {
        collectText = false;
      } else {
        chunks.push(value);
      }
    }
  }

  let snapshot: CivicRowSnapshot | null = null;
  if (collectText && chunks.length > 0) {
    try {
      snapshot = extractCivicSnapshot(Buffer.concat(chunks).toString("utf8"));
    } catch {
      snapshot = null;
    }
  }

  return {
    ok: true,
    hash: hasher.digest("hex"),
    size,
    snapshot,
  };
}

function isLikelyBinary(bytes: Uint8Array): boolean {
  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) return true;
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return true;
  }
  const n = Math.min(bytes.length, 512);
  let control = 0;
  for (let i = 0; i < n; i += 1) {
    const byte = bytes[i];
    if (byte === 0) return true;
    if (byte < 7 && byte !== 9 && byte !== 10 && byte !== 13) control += 1;
  }
  return control > n * 0.1;
}

export async function hashResource(
  url: string,
  timeoutMs = FETCH_MS,
): Promise<CivicHashResult> {
  const probe = await probeContentLength(url);
  if (probe.skip) return { ok: false, reason: "oversized" };
  try {
    return await hashUrl(url, timeoutMs);
  } catch (error) {
    console.error(`Fetch/hash failed for ${url}`, error);
    return { ok: false, reason: "fetch" };
  }
}

async function latestSnapshot(url: string): Promise<{
  id: string;
  hash: string;
  rowCount: number | null;
  colNames: string[] | null;
  sampleRows: Record<string, string>[] | null;
} | null> {
  const rows = await sql`
    SELECT id, file_hash, row_count, col_names, sample_rows
    FROM civic_records
    WHERE resource_url = ${url}
    ORDER BY retrieved_at DESC
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row?.id || row.file_hash == null) return null;
  return {
    id: String(row.id),
    hash: String(row.file_hash),
    rowCount: row.row_count == null ? null : Number(row.row_count),
    colNames: Array.isArray(row.col_names)
      ? row.col_names.map((name) => String(name))
      : null,
    sampleRows: parseSampleRows(row.sample_rows),
  };
}

function parseSampleRows(value: unknown): Record<string, string>[] | null {
  const raw =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((item) => {
    const record: Record<string, string> = {};
    if (item && typeof item === "object" && !Array.isArray(item)) {
      for (const [key, cell] of Object.entries(item as Record<string, unknown>)) {
        record[key] = cell == null ? "" : String(cell);
      }
    }
    return record;
  });
}

export async function insertRecord(input: {
  city: string;
  state: string;
  datasetId: string;
  datasetName: string;
  resourceUrl: string;
  fileHash: string;
  fileSize: number;
  sourceType: CivicCitySeed["type"];
  snapshot?: CivicRowSnapshot | null;
}): Promise<void> {
  let otsProof: string | null = null;
  const anchorStatus = "pending";
  try {
    otsProof = await stampHashHex(input.fileHash);
  } catch (error) {
    console.error(`OTS stamp failed for ${input.resourceUrl}:`, error);
  }

  const snapshot = input.snapshot ?? null;

  await sql`
    INSERT INTO civic_records (
      city, state, dataset_id, dataset_name, resource_url, file_hash, file_size,
      ots_proof, anchor_status, source_type, row_count, col_names, sample_rows
    ) VALUES (
      ${input.city}, ${input.state}, ${input.datasetId}, ${input.datasetName},
      ${input.resourceUrl}, ${input.fileHash}, ${input.fileSize}, ${otsProof},
      ${anchorStatus}, ${input.sourceType},
      ${snapshot?.row_count ?? null},
      ${snapshot ? sql.array(snapshot.col_names) : null},
      ${snapshot ? sql.json(snapshot.sample_rows) : null}
    )
  `;
}

async function ingestResource(
  seed: CivicCitySeed,
  datasetId: string,
  datasetName: string,
  resourceUrl: string,
  counters: IngestCounters,
  timeoutMs = FETCH_MS,
): Promise<void> {
  if (isSkippedDataset(datasetId)) return;

  counters.checked += 1;

  const hashed = await hashResource(resourceUrl, timeoutMs);
  if (!hashed.ok) {
    if (hashed.reason === "oversized") {
      console.log(`skipped (oversized) ${resourceUrl}`);
      return;
    }
    counters.errors.push(`Could not hash ${resourceUrl}`);
    return;
  }

  const previous = await latestSnapshot(resourceUrl);
  if (previous?.hash === hashed.hash) {
    if (!previous.sampleRows && hashed.snapshot) {
      await backfillSnapshot(previous.id, hashed.snapshot);
    }
    return;
  }

  try {
    await insertRecord({
      city: seed.city,
      state: seed.state,
      datasetId,
      datasetName,
      resourceUrl,
      fileHash: hashed.hash,
      fileSize: hashed.size,
      sourceType: seed.type,
      snapshot: hashed.snapshot,
    });
    counters.new_records += 1;

    if (previous) {
      const contentDiff = await diffFromSnapshots(
        previous.sampleRows && previous.colNames
          ? {
              row_count: previous.rowCount ?? previous.sampleRows.length,
              col_names: previous.colNames,
              sample_rows: previous.sampleRows,
            }
          : null,
        hashed.snapshot,
        datasetName,
      );
      const detectedAt = new Date().toISOString();
      let story: string | null = null;
      if (contentDiff?.notable_changes.length) {
        try {
          const text = await generateChangeStory({
            city: seed.city,
            state: seed.state,
            datasetName,
            resourceUrl,
            detectedAt,
            diff: contentDiff,
          });
          story = text || null;
        } catch (error) {
          console.error("Civic story generation failed:", error);
        }
      }
      await sql`
        INSERT INTO civic_changes (
          city, state, dataset_name, resource_url, old_hash, new_hash,
          change_type, content_diff, story
        ) VALUES (
          ${seed.city}, ${seed.state}, ${datasetName}, ${resourceUrl},
          ${previous.hash}, ${hashed.hash}, ${"content_modified"},
          ${contentDiff ? sql.json(JSON.parse(JSON.stringify(contentDiff))) : null},
          ${story}
        )
      `;
      counters.changed += 1;
      void notifyCitySubscribers({
        city: seed.city,
        datasetName,
        resourceUrl,
        oldHash: previous.hash,
        newHash: hashed.hash,
        contentDiff,
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

async function existingTargets(city: string): Promise<
  Array<{
    datasetId: string;
    datasetName: string;
    resourceUrl: string;
    retrievedAt: string;
  }>
> {
  const rows = await sql`
    SELECT DISTINCT ON (resource_url)
      dataset_id, dataset_name, resource_url, retrieved_at
    FROM civic_records
    WHERE city = ${city}
    ORDER BY resource_url, retrieved_at DESC
  `;
  return [...rows]
    .map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        datasetId: String(row.dataset_id ?? ""),
        datasetName: String(row.dataset_name ?? row.dataset_id ?? ""),
        resourceUrl: String(row.resource_url ?? ""),
        retrievedAt: String(row.retrieved_at ?? ""),
      };
    })
    .filter((row) => row.resourceUrl)
    .sort((a, b) => {
      const aTime = Date.parse(a.retrievedAt) || 0;
      const bTime = Date.parse(b.retrievedAt) || 0;
      return aTime - bTime;
    });
}

/**
 * Re-hashes URLs already stored for each city and writes a civic_records
 * row when the bytes are new or have changed. Discovery adds new URLs;
 * this path does not crawl the portal catalog.
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

  const started = Date.now();
  for (const seed of seeds) {
    const timeoutMs = seed.type === "federal" ? FEDERAL_FETCH_MS : FETCH_MS;
    const targets = await existingTargets(seed.city);
    for (const target of targets) {
      if (Date.now() - started > INGEST_BUDGET_MS) break;
      await ingestResource(
        seed,
        target.datasetId,
        target.datasetName,
        target.resourceUrl,
        counters,
        timeoutMs,
      );
    }
  }

  await backfillChangeStories(cityFilter ? seeds[0]?.city : undefined);
  return counters;
}

async function backfillChangeStories(city?: string): Promise<void> {
  const rows = city
    ? await sql`
        SELECT id, city, state, dataset_name, resource_url, detected_at, content_diff
        FROM civic_changes
        WHERE city = ${city}
          AND story IS NULL
          AND content_diff IS NOT NULL
        ORDER BY detected_at DESC
        LIMIT 20
      `
    : await sql`
        SELECT id, city, state, dataset_name, resource_url, detected_at, content_diff
        FROM civic_changes
        WHERE story IS NULL
          AND content_diff IS NOT NULL
        ORDER BY detected_at DESC
        LIMIT 20
      `;

  for (const raw of rows) {
    const row = raw as Record<string, unknown>;
    const diff = parseStoredDiff(row.content_diff);
    if (!diff?.notable_changes.length) continue;
    try {
      const text = await generateChangeStory({
        city: String(row.city ?? ""),
        state: String(row.state ?? ""),
        datasetName: String(row.dataset_name ?? ""),
        resourceUrl: String(row.resource_url ?? ""),
        detectedAt: asTimestamp(row.detected_at),
        diff,
      });
      if (!text) continue;
      await sql`
        UPDATE civic_changes
        SET story = ${text}
        WHERE id = ${String(row.id)}
          AND story IS NULL
      `;
    } catch (error) {
      console.error("Civic story backfill failed:", error);
    }
  }
}

async function backfillSnapshot(
  id: string,
  snapshot: CivicRowSnapshot,
): Promise<void> {
  await sql`
    UPDATE civic_records
    SET
      row_count = ${snapshot.row_count},
      col_names = ${sql.array(snapshot.col_names)},
      sample_rows = ${sql.json(snapshot.sample_rows)}
    WHERE id = ${id}
      AND sample_rows IS NULL
  `;
}

async function diffFromSnapshots(
  previous: CivicRowSnapshot | null,
  next: CivicRowSnapshot | null,
  datasetName: string,
): Promise<CivicDiffSummary | null> {
  if (!previous?.sample_rows?.length || !next?.sample_rows?.length) {
    return null;
  }
  const diff = await diffCivicContent(
    civicSnapshotToText(previous),
    civicSnapshotToText(next),
    datasetName,
  );
  return refineDiffWithTotals(
    diff,
    previous.row_count,
    next.row_count,
    datasetName,
  );
}

async function notifyCitySubscribers(input: {
  city: string;
  datasetName: string;
  resourceUrl: string;
  oldHash: string;
  newHash: string;
  contentDiff?: CivicDiffSummary | null;
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
      diffSummary: input.contentDiff?.notable_changes[0] ?? null,
      contentDiff: input.contentDiff ?? null,
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
