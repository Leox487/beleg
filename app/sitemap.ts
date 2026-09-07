import type { MetadataRoute } from "next";

import { CITY_SEEDS, citySlug } from "@/lib/civic-cities";
import { SITE_URL } from "@/lib/site";

const PATHS = [
  "/",
  "/about",
  "/how-it-works",
  "/uses",
  "/tools",
  "/for-reviewers",
  "/verify",
  "/verify-guide",
  "/changelog",
  "/glossary",
  "/faq",
  "/security",
  "/contact",
  "/privacy",
  "/terms",
  "/audit",
  ...CITY_SEEDS.map((seed) => `/audit/${citySlug(seed.city)}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency:
      path === "/" ? "weekly" : path.startsWith("/audit") ? "daily" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/audit") ? 0.7 : 0.6,
  }));
}
