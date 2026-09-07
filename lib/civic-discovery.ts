import "server-only";

import {
  FEDERAL_DATA_GOV_AGENCIES,
  findCityBySlug,
  type CivicCitySeed,
} from "@/lib/civic-cities";
import {
  FEDERAL_FETCH_MS,
  FETCH_MS,
  FETCH_UA,
  hashResource,
  insertRecord,
  isDownloadable,
  isSkippedDataset,
} from "@/lib/civic-scraper";
import sql from "@/lib/supabase";

const DISCOVER_BUDGET_MS = 270_000;
const CATALOG_MS = 20_000;
const DATA_GOV_CKAN = "https://catalog.data.gov/api/3/action/package_search";
const DATA_GOV_SEARCH = "https://catalog.data.gov/search";

const TEXT_FORMAT = /\b(CSV|JSON|XML|GEOJSON|TSV)\b/i;

export type CivicDiscoverResult = {
  discovered: number;
  added: number;
  skipped_oversized: number;
  skipped_duplicate: number;
};

type DiscoveredResource = {
  datasetId: string;
  datasetName: string;
  url: string;
};

type CkanResource = {
  url?: string;
  name?: string;
  format?: string;
};

type CkanPackage = {
  name?: string;
  title?: string;
  resources?: CkanResource[];
};

type CkanEnvelope<T> = {
  success?: boolean;
  result?: T;
};

type SocrataView = {
  id?: string;
  name?: string;
  error?: boolean;
  viewType?: string;
  displayType?: string;
  publicationStage?: string;
};

function portalBase(portal: string): string {
  return portal.replace(/\/$/, "");
}

function isMonitorableFormat(format?: string, url?: string): boolean {
  const fmt = (format ?? "").trim();
  const upper = fmt.toUpperCase();
  if (
    upper === "HTML" ||
    upper === "PDF" ||
    upper.includes("ZIP") ||
    upper.includes("SHAPE") ||
    upper.includes("ARC GIS")
  ) {
    return false;
  }
  if (fmt && TEXT_FORMAT.test(fmt)) return true;
  const lower = (url ?? "").toLowerCase();
  return (
    lower.endsWith(".csv") ||
    lower.endsWith(".json") ||
    lower.endsWith(".xml") ||
    lower.endsWith(".geojson") ||
    lower.endsWith(".tsv") ||
    lower.includes("rows.csv") ||
    lower.includes("format=csv") ||
    lower.includes("format=json") ||
    lower.includes("format=xml")
  );
}

async function fetchJson<T>(
  url: string,
  timeoutMs = CATALOG_MS,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json", "User-Agent": FETCH_UA },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Civic discovery fetch failed for ${url}`, error);
    return null;
  }
}

function resourcesFromPackage(pack: CkanPackage): DiscoveredResource[] {
  const datasetId = String(pack.name ?? "");
  const datasetName = String(pack.title || pack.name || datasetId);
  if (!datasetId) return [];
  const out: DiscoveredResource[] = [];
  for (const resource of pack.resources ?? []) {
    if (!resource.url) continue;
    if (!isDownloadable(resource.url, resource.format)) continue;
    if (!isMonitorableFormat(resource.format, resource.url)) continue;
    out.push({ datasetId, datasetName, url: resource.url });
  }
  return out;
}

async function ckanPackageShow(
  portal: string,
  slug: string,
): Promise<CkanPackage | null> {
  const body = await fetchJson<CkanEnvelope<CkanPackage>>(
    `${portalBase(portal)}/api/3/action/package_show?id=${encodeURIComponent(slug)}`,
  );
  if (!body?.success || !body.result) return null;
  return body.result;
}

async function ckanPackageList(portal: string): Promise<string[]> {
  const body = await fetchJson<CkanEnvelope<string[]>>(
    `${portalBase(portal)}/api/3/action/package_list`,
    30_000,
  );
  if (!body?.success || !Array.isArray(body.result)) return [];
  return body.result.map(String).filter(Boolean);
}

async function ckanPackageSearchPage(
  portal: string,
  start: number,
  rows: number,
): Promise<CkanPackage[] | null> {
  const body = await fetchJson<
    CkanEnvelope<{ results?: CkanPackage[]; count?: number }>
  >(
    `${portalBase(portal)}/api/3/action/package_search?rows=${rows}&start=${start}`,
  );
  if (!body?.success || !Array.isArray(body.result?.results)) return null;
  return body.result.results;
}

async function discoverCkan(portal: string): Promise<DiscoveredResource[]> {
  const found: DiscoveredResource[] = [];
  const seen = new Set<string>();
  const add = (items: DiscoveredResource[]) => {
    for (const item of items) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      found.push(item);
    }
  };

  // package_search returns the same package documents as package_show,
  // with resources included, so a full portal fits in a few calls.
  let start = 0;
  const pageSize = 1000;
  let usedSearch = false;
  while (start < 20_000) {
    const page = await ckanPackageSearchPage(portal, start, pageSize);
    if (!page) break;
    usedSearch = true;
    if (page.length === 0) break;
    for (const pack of page) add(resourcesFromPackage(pack));
    if (page.length < pageSize) break;
    start += pageSize;
  }
  if (usedSearch && found.length > 0) return found;

  const slugs = await ckanPackageList(portal);
  for (const slug of slugs) {
    const pack = await ckanPackageShow(portal, slug);
    if (pack) add(resourcesFromPackage(pack));
  }
  return found;
}

function socrataCsvUrl(portal: string, id: string): string {
  return `${portalBase(portal)}/api/views/${encodeURIComponent(id)}/rows.csv?accessType=DOWNLOAD`;
}

function isSocrataMonitorable(view: SocrataView): boolean {
  if (!view.id || view.error) return false;
  if (view.publicationStage && view.publicationStage !== "published") {
    return false;
  }
  const viewType = (view.viewType ?? "").toLowerCase();
  if (viewType === "href" || viewType === "map" || viewType === "blobby") {
    return false;
  }
  return viewType === "tabular" || viewType === "geo";
}

async function discoverSocrata(portal: string): Promise<DiscoveredResource[]> {
  const found: DiscoveredResource[] = [];
  const seen = new Set<string>();
  const pageSize = 1000;
  for (let offset = 0; offset < 20_000; offset += pageSize) {
    const page = await fetchJson<SocrataView[]>(
      `${portalBase(portal)}/api/views.json?limit=${pageSize}&offset=${offset}`,
    );
    if (!Array.isArray(page) || page.length === 0) break;
    for (const view of page) {
      if (!isSocrataMonitorable(view)) continue;
      const id = String(view.id);
      const url = socrataCsvUrl(portal, id);
      if (seen.has(url)) continue;
      seen.add(url);
      found.push({
        datasetId: id,
        datasetName: String(view.name || id),
        url,
      });
    }
    if (page.length < pageSize) break;
  }
  return found;
}

function distributionsFromDataGov(row: Record<string, unknown>): {
  datasetId: string;
  datasetName: string;
  urls: Array<{ url: string; format?: string }>;
} | null {
  const dcat =
    row.dcat && typeof row.dcat === "object"
      ? (row.dcat as Record<string, unknown>)
      : row;
  const datasetId = String(row.slug ?? dcat.identifier ?? row.identifier ?? "");
  const datasetName = String(row.title ?? dcat.title ?? datasetId);
  if (!datasetId) return null;
  const raw = Array.isArray(dcat.distribution)
    ? dcat.distribution
    : Array.isArray(row.distribution)
      ? row.distribution
      : [];
  const urls: Array<{ url: string; format?: string }> = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const dist = item as Record<string, unknown>;
    const url = String(dist.downloadURL ?? dist.url ?? "");
    if (!url) continue;
    urls.push({
      url,
      format: String(dist.format ?? dist.mediaType ?? ""),
    });
  }
  return { datasetId, datasetName, urls };
}

async function discoverDataGovCkan(
  organization: string,
): Promise<DiscoveredResource[] | null> {
  const url =
    `${DATA_GOV_CKAN}?fq=organization:${encodeURIComponent(organization)}` +
    `&rows=50&sort=${encodeURIComponent("views_recent desc")}`;
  const body = await fetchJson<CkanEnvelope<{ results?: CkanPackage[] }>>(url);
  if (!body?.success || !Array.isArray(body.result?.results)) return null;
  const found: DiscoveredResource[] = [];
  for (const pack of body.result.results) {
    found.push(...resourcesFromPackage(pack));
  }
  return found;
}

async function discoverDataGovCatalog(
  slug: string,
  query: string,
): Promise<DiscoveredResource[]> {
  const params = new URLSearchParams({
    org_slug: slug,
    per_page: "50",
    sort: "popularity",
  });
  if (query) params.set("q", query);
  const body = await fetchJson<{ results?: Record<string, unknown>[] }>(
    `${DATA_GOV_SEARCH}?${params.toString()}`,
  );
  const found: DiscoveredResource[] = [];
  const seen = new Set<string>();
  for (const row of body?.results ?? []) {
    const parsed = distributionsFromDataGov(row);
    if (!parsed) continue;
    for (const resource of parsed.urls) {
      if (!isDownloadable(resource.url, resource.format)) continue;
      if (!isMonitorableFormat(resource.format, resource.url)) continue;
      if (seen.has(resource.url)) continue;
      seen.add(resource.url);
      found.push({
        datasetId: parsed.datasetId,
        datasetName: parsed.datasetName,
        url: resource.url,
      });
    }
  }
  return found;
}

async function discoverFederal(
  seed: CivicCitySeed,
): Promise<DiscoveredResource[]> {
  const found: DiscoveredResource[] = [];
  const seen = new Set<string>();
  const add = (items: DiscoveredResource[]) => {
    for (const item of items) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      found.push(item);
    }
  };

  for (const file of seed.files ?? []) {
    add([{ datasetId: file.id, datasetName: file.name, url: file.url }]);
  }

  for (const agency of FEDERAL_DATA_GOV_AGENCIES) {
    const ckan = await discoverDataGovCkan(agency.ckanOrg);
    if (ckan) {
      add(ckan);
      continue;
    }
    add(await discoverDataGovCatalog(agency.catalogSlug, agency.query));
  }

  return found;
}

async function listMonitorable(seed: CivicCitySeed): Promise<DiscoveredResource[]> {
  if (seed.type === "federal") return discoverFederal(seed);
  if (seed.type === "socrata") return discoverSocrata(seed.portal);
  return discoverCkan(seed.portal);
}

async function knownUrls(city: string): Promise<Set<string>> {
  const rows = await sql`
    SELECT DISTINCT resource_url
    FROM civic_records
    WHERE city = ${city}
  `;
  return new Set(
    [...rows]
      .map((raw) => String((raw as Record<string, unknown>).resource_url ?? ""))
      .filter(Boolean),
  );
}

/**
 * Crawl one city's portal for monitorable CSV/JSON/XML files, then hash and
 * insert any URL not already in civic_records. Stops before the function
 * time budget so a later run can continue adding the rest.
 */
export async function discoverCityRecords(
  cityFilter: string,
): Promise<CivicDiscoverResult> {
  const seed = findCityBySlug(cityFilter);
  if (!seed) {
    return {
      discovered: 0,
      added: 0,
      skipped_oversized: 0,
      skipped_duplicate: 0,
    };
  }

  const started = Date.now();
  const known = await knownUrls(seed.city);
  const resources = await listMonitorable(seed);
  const timeoutMs = seed.type === "federal" ? FEDERAL_FETCH_MS : FETCH_MS;

  const result: CivicDiscoverResult = {
    discovered: resources.length,
    added: 0,
    skipped_oversized: 0,
    skipped_duplicate: 0,
  };

  for (const resource of resources) {
    if (Date.now() - started > DISCOVER_BUDGET_MS) break;
    if (isSkippedDataset(resource.datasetId)) {
      result.skipped_oversized += 1;
      continue;
    }
    if (known.has(resource.url)) {
      result.skipped_duplicate += 1;
      continue;
    }

    const hashed = await hashResource(resource.url, timeoutMs);
    if (!hashed.ok) {
      if (hashed.reason === "oversized") result.skipped_oversized += 1;
      continue;
    }

    try {
      await insertRecord({
        city: seed.city,
        state: seed.state,
        datasetId: resource.datasetId,
        datasetName: resource.datasetName,
        resourceUrl: resource.url,
        fileHash: hashed.hash,
        fileSize: hashed.size,
        content: hashed.content,
        sourceType: seed.type,
      });
      known.add(resource.url);
      result.added += 1;
    } catch (error) {
      console.error(`Discovery insert failed for ${resource.url}`, error);
    }
  }

  return result;
}
