export type CivicPortalType = "ckan" | "socrata" | "federal";

export type CivicFederalFile = {
  id: string;
  name: string;
  url: string;
};

export type CivicCitySeed = {
  city: string;
  state: string;
  portal: string;
  type: CivicPortalType;
  datasets: readonly string[];
  files?: readonly CivicFederalFile[];
};

/**
 * Portal registry. Dataset ID arrays are the original hand-checked seeds.
 * Discovery (`lib/civic-discovery.ts`) crawls every dataset on the portal;
 * ingest hashes URLs already stored in civic_records.
 *
 * CKAN: GET ${portal}/api/3/action/site_read → { success: true }
 * (WPRDC is CKAN but does not implement site_read.)
 *
 * Socrata: GET ${portal}/api/views.json?limit=5 → JSON array.
 * Dataset IDs checked 2026-09-07 via GET ${portal}/api/views/${id}.json.
 *
 * Socrata IDs from the original list that 404'd (skipped, replacements noted):
 * Chicago n09s-v5gm, me58-569n → x394-e874, rsxa-ify5
 * Seattle 3k2p-39jp, msxe-mced → 8u2j-imqx, m6va-m4qe (no contracts view)
 * Austin fpys-esm8 → 84ih-p28j
 * Los Angeles cf4n-hma5, bsry-qfk4 → 5242-pnmt, ih6g-qkwz (no contracts view)
 *
 * Later known-good IDs that 404'd (skipped): Chicago ydr8-6mm6;
 * Seattle 3nt7-sbjm, mags-97de, j9km-ydkc; Austin q3ct-6qcp, hcnj-rei3,
 * g5cv-6xbg; Los Angeles iru8-2uf4; San Francisco bu6k-3a8i.
 * Chicago wrvz-psew is taxi trips (oversized). LA rq3b-xjk8 is 311.
 * Chicago v6vf-nfxy stays in SKIP_DATASETS.
 *
 * Federal files checked 2026-09-07 (direct GET, skip 404/HTML):
 * USASpending listed CSVs 404; archive zips exist but are 0.9–1.2GB.
 * CMS 9wzi-peqs 410 (legacy SODA). Replaced with Medicare MSPB hospital CSV.
 * Federal Reserve h6.htm / h15.htm are HTML — skipped.
 * Rechecked 2026-09-10: added GovInfo bills/CREC RSS, FEC DEMO_KEY filings,
 * Senate LDA filings. Skipped SEC EFTS search-index (500), House roll-call
 * index (HTML), CourtListener opinions (auth required). Chicago/Austin/SF
 * crime CSVs estimated well over 50MB — skipped.
 *
 * Not Socrata (views.json is not a JSON array) — skipped:
 * Denver (denvergov.org / data.denvergov.org HTML),
 * Nashville (data.nashville.gov 404),
 * Baltimore (data.baltimorecity.gov 404).
 *
 * Rechecked 2026-09-10 (CKAN site_read or Socrata views.json?limit=5):
 * Added: Edmonton (Socrata), New Orleans, Kansas City.
 * Still not CKAN/Socrata: Ottawa, Vancouver (Huwise), Denver (HTML catalog),
 * Baltimore, Nashville, Detroit, Louisville, Memphis, Minneapolis,
 * Charlotte, Indianapolis, Oklahoma City, Albuquerque, Sacramento,
 * Long Beach (Huwise). Fetch failed: Atlanta, Columbus, Tucson,
 * Virginia Beach, Omaha. ArcGIS skipped: Raleigh, Fresno, Miami.
 * Mesa and Colorado Springs have no verified portal.
 */
export const CITY_SEEDS: readonly CivicCitySeed[] = [
  {
    city: "Pittsburgh",
    state: "PA",
    portal: "https://data.wprdc.org",
    type: "ckan",
    datasets: [
      "city-revenues-and-expenses",
      "city-pittsburgh-operating-budget",
      "311-data",
      "pli-permits",
    ],
  },
  {
    city: "Houston",
    state: "TX",
    portal: "https://data.houstontx.gov",
    type: "ckan",
    datasets: [
      "city-of-houston-fiscal-year-adopted-operating-budgets",
      "all-city-of-houston-procurement-contracts",
      "checkbook",
    ],
  },
  {
    city: "Phoenix",
    state: "AZ",
    portal: "https://www.phoenixopendata.com",
    type: "ckan",
    datasets: [
      "city-checkbook26",
      "phoenix-az-building-permit-data",
      "crime-data",
    ],
  },
  {
    city: "San Antonio",
    state: "TX",
    portal: "https://data.sanantonio.gov",
    type: "ckan",
    datasets: ["service-calls", "building-permits", "sapd-offenses"],
  },
  {
    city: "San Jose",
    state: "CA",
    portal: "https://data.sanjoseca.gov",
    type: "ckan",
    datasets: [
      "311-service-request-data",
      "active-building-permits",
      "police-calls-for-service",
    ],
  },
  {
    city: "Boston",
    state: "MA",
    portal: "https://data.boston.gov",
    type: "ckan",
    datasets: [
      "revenue-budget",
      "city-of-boston-contract-award",
      "approved-building-permits",
    ],
  },
  {
    city: "Chicago",
    state: "IL",
    portal: "https://data.cityofchicago.org",
    type: "socrata",
    datasets: [
      "x394-e874",
      "rsxa-ify5",
      "tt4n-kn4t",
      "g5h3-jkgt",
      "pahz-egmi",
      "g8p5-y4m5",
      "njrn-3hws",
      "5wd9-d675",
      "xika-473c",
      "s4vu-giwb",
      "gxzc-43gg",
      "fa8m-mqz6",
    ],
  },
  {
    city: "Seattle",
    state: "WA",
    portal: "https://data.seattle.gov",
    type: "socrata",
    datasets: [
      "8u2j-imqx",
      "m6va-m4qe",
      "2khk-5ukd",
      "bsgq-948x",
      "uxxb-mmuq",
      "pr2n-4pn6",
      "5avq-r9hj",
      "6d4q-w9dv",
      "y6ef-jf2w",
      "wnbq-64tb",
      "qhwj-ipk4",
      "6gnm-7jex",
    ],
  },
  {
    city: "Austin",
    state: "TX",
    portal: "https://data.austintexas.gov",
    type: "socrata",
    datasets: [
      "g5k8-8sud",
      "84ih-p28j",
      "ad5y-pg42",
      "5rhv-xasu",
      "yeeq-kk6v",
      "65fu-87cp",
      "gd3e-xut2",
      "m5xf-v2bw",
      "cnaj-c72e",
      "5a85-i8sd",
      "8c6z-qnmj",
    ],
  },
  {
    city: "Los Angeles",
    state: "CA",
    portal: "https://data.lacity.org",
    type: "socrata",
    datasets: [
      "5242-pnmt",
      "ih6g-qkwz",
      "ebs9-fdwv",
      "32qm-7vr3",
      "3sn9-wkuu",
      "k4k6-bwwv",
      "qrkr-kfbh",
      "ybqa-gmkn",
      "9z5d-hgrh",
      "j4zm-9kqu",
      "h6ky-vznd",
      "4bdv-srep",
    ],
  },
  {
    city: "San Francisco",
    state: "CA",
    portal: "https://data.sfgov.org",
    type: "socrata",
    datasets: [
      "xdgd-c79v",
      "cqi5-hm2d",
      "4zfx-f2ts",
      "h3jp-c25d",
      "qkex-vh98",
      "m793-kis4",
      "b947-pj2q",
      "8w9a-q5s8",
      "p5r5-fd7g",
      "88g8-5mnd",
      "bpnb-jwfb",
      "n9pm-xkyq",
    ],
  },
  {
    city: "Edmonton",
    state: "AB",
    portal: "https://data.edmonton.ca",
    type: "socrata",
    datasets: [],
  },
  {
    city: "New Orleans",
    state: "LA",
    portal: "https://data.nola.gov",
    type: "socrata",
    datasets: [],
  },
  {
    city: "Kansas City",
    state: "MO",
    portal: "https://data.kcmo.org",
    type: "socrata",
    datasets: [],
  },
  {
    city: "Federal",
    state: "US",
    portal: "https://www.usa.gov",
    type: "federal",
    datasets: [],
    files: [
      {
        id: "house-member-data",
        name: "Current House members",
        url: "https://clerk.house.gov/xml/lists/MemberData.xml",
      },
      {
        id: "senate-member-data",
        name: "Current Senate members",
        url: "https://www.senate.gov/general/contact_information/senators_cfm.xml",
      },
      {
        id: "sec-edgar-company-index-2026-q3",
        name: "SEC EDGAR company index — 2026 Q3",
        url: "https://www.sec.gov/Archives/edgar/full-index/2026/QTR3/company.idx",
      },
      {
        id: "sec-edgar-form-index-2026-q3",
        name: "SEC EDGAR form index — 2026 Q3",
        url: "https://www.sec.gov/Archives/edgar/full-index/2026/QTR3/form.idx",
      },
      {
        id: "cms-medicare-spending-hospital",
        name: "Medicare spending per beneficiary — hospital",
        url: "https://data.cms.gov/provider-data/sites/default/files/resources/69874ce604586980ac088283c1b35095_1785189964/Medicare_Hospital_Spending_Per_Patient-Hospital.csv",
      },
      {
        id: "cdc-provisional-deaths",
        name: "CDC provisional COVID-19 deaths by sex and age",
        url: "https://data.cdc.gov/api/views/9bhg-hcku/rows.csv?accessType=DOWNLOAD",
      },
      {
        id: "healthdata-hospital-capacity",
        name: "Hospital capacity and quality (HHS Protect)",
        url: "https://healthdata.gov/api/views/g62h-syeh/rows.csv?accessType=DOWNLOAD",
      },
      {
        id: "govinfo-bills-rss",
        name: "New bills introduced (GovInfo)",
        url: "https://www.govinfo.gov/rss/bills.xml",
      },
      {
        id: "govinfo-crec-rss",
        name: "Congressional Record daily (GovInfo)",
        url: "https://www.govinfo.gov/rss/crec.xml",
      },
      {
        id: "fec-recent-filings",
        name: "FEC campaign finance filings",
        url: "https://api.open.fec.gov/v1/filings/?api_key=DEMO_KEY&per_page=20&sort=-receipt_date",
      },
      {
        id: "senate-lda-filings",
        name: "Senate lobbying disclosures",
        url: "https://lda.senate.gov/api/v1/filings/?format=json&filing_year=2026&limit=20",
      },
    ],
  },
];

/** Data.gov org slugs for federal auto-discovery (CKAN fq + current catalog API). */
export const FEDERAL_DATA_GOV_AGENCIES = [
  { ckanOrg: "hhs-gov", catalogSlug: "hhs", query: "" },
  { ckanOrg: "cdc-gov", catalogSlug: "hhs", query: "CDC" },
  { ckanOrg: "cms", catalogSlug: "hhs", query: "CMS" },
  { ckanOrg: "sec-gov", catalogSlug: "sec", query: "" },
  { ckanOrg: "treasury", catalogSlug: "treasury", query: "" },
  { ckanOrg: "doj-gov", catalogSlug: "doj", query: "" },
] as const;

export const MUNICIPAL_SEEDS = CITY_SEEDS.filter(
  (seed) => seed.type !== "federal",
);

export function civicDisplayName(seed: CivicCitySeed): string {
  return seed.type === "federal" ? "US Federal Government" : `${seed.city}, ${seed.state}`;
}

export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findCityBySlug(slug: string): CivicCitySeed | undefined {
  return CITY_SEEDS.find((seed) => citySlug(seed.city) === slug);
}

export function findCity(query: string): CivicCitySeed | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  const slug = citySlug(trimmed);
  return CITY_SEEDS.find(
    (seed) =>
      citySlug(seed.city) === slug ||
      seed.city.toLowerCase() === trimmed.toLowerCase() ||
      (seed.type === "federal" && /federal/i.test(trimmed)),
  );
}
