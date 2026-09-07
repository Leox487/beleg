export type CivicPortalType = "ckan" | "socrata";

export type CivicCitySeed = {
  city: string;
  state: string;
  portal: string;
  type: CivicPortalType;
  datasets: readonly string[];
};

/**
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
 * Not Socrata (views.json is not a JSON array) — skipped:
 * Denver (denvergov.org / data.denvergov.org HTML),
 * Nashville (data.nashville.gov 404),
 * Baltimore (data.baltimorecity.gov 404).
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
    datasets: ["x394-e874", "rsxa-ify5", "v6vf-nfxy"],
  },
  {
    city: "Seattle",
    state: "WA",
    portal: "https://data.seattle.gov",
    type: "socrata",
    datasets: ["8u2j-imqx", "m6va-m4qe"],
  },
  {
    city: "Austin",
    state: "TX",
    portal: "https://data.austintexas.gov",
    type: "socrata",
    datasets: ["g5k8-8sud", "84ih-p28j"],
  },
  {
    city: "Los Angeles",
    state: "CA",
    portal: "https://data.lacity.org",
    type: "socrata",
    datasets: ["5242-pnmt", "ih6g-qkwz"],
  },
  {
    city: "San Francisco",
    state: "CA",
    portal: "https://data.sfgov.org",
    type: "socrata",
    datasets: ["xdgd-c79v", "cqi5-hm2d"],
  },
];

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
      seed.city.toLowerCase() === trimmed.toLowerCase(),
  );
}
