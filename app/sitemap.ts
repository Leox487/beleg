import type { MetadataRoute } from "next";

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
