export type CivicCitySeed = {
  city: string;
  state: string;
  portal: string;
  datasets: readonly string[];
};

/**
 * Only portals that speak CKAN. Checked 2026-09-07:
 * GET ${portal}/api/3/action/site_read → { success: true }
 * except WPRDC, which is CKAN but does not implement site_read
 * (status_show and package_show both succeed).
 *
 * Skipped — not CKAN at the listed host (site_read ≠ {success:true}):
 * Chicago, Seattle, Austin, Denver, Nashville, Detroit, New Orleans,
 * Los Angeles, Philadelphia (data.phila.gov 403), Baltimore, San Francisco,
 * Kansas City, Louisville, Memphis, Atlanta, Minneapolis, Portland,
 * Tucson, Raleigh.
 */
export const CITY_SEEDS: readonly CivicCitySeed[] = [
  {
    city: "Pittsburgh",
    state: "PA",
    portal: "https://data.wprdc.org",
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
    datasets: ["service-calls", "building-permits", "sapd-offenses"],
  },
  {
    city: "San Jose",
    state: "CA",
    portal: "https://data.sanjoseca.gov",
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
    datasets: [
      "revenue-budget",
      "city-of-boston-contract-award",
      "approved-building-permits",
    ],
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
