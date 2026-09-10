import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/app/components/Footer";
import { citySlug } from "@/lib/civic-cities";
import { asTimestamp } from "@/lib/row";
import { SITE_URL } from "@/lib/site";
import sql from "@/lib/supabase";

import { formatWhen } from "../civic-map";
import "../civic.css";

export const metadata: Metadata = {
  title: "Government Data Changes — Beleg",
  description:
    "Automatically generated summaries of detected changes in public government datasets. Every story is cryptographically verified.",
  alternates: {
    canonical: `${SITE_URL}/audit/stories`,
  },
};

export const dynamic = "force-dynamic";

type StoryRow = {
  id: string;
  city: string;
  state: string;
  dataset_name: string;
  detected_at: string;
  story: string;
};

export default async function CivicStoriesPage() {
  const rows = await sql`
    SELECT id, city, state, dataset_name, detected_at, story
    FROM civic_changes
    WHERE story IS NOT NULL
      AND story <> ''
    ORDER BY detected_at DESC
    LIMIT 100
  `;

  const stories: StoryRow[] = [...rows].map((raw) => {
    const row = raw as Record<string, unknown>;
    return {
      id: String(row.id),
      city: String(row.city ?? ""),
      state: String(row.state ?? ""),
      dataset_name: String(row.dataset_name ?? ""),
      detected_at: asTimestamp(row.detected_at),
      story: String(row.story ?? ""),
    };
  });

  return (
    <main className="page civic-page civic-stories-page">
      <div className="civic-inner civic-stories-inner">
        <header className="doc-header">
          <nav className="civic-crumb" aria-label="Breadcrumb">
            <Link href="/audit">Audit</Link>
            <span aria-hidden="true"> / </span>
            <span>Stories</span>
          </nav>
          <h1 className="h1 doc-title">Government Data Changes</h1>
          <p className="lp-lead">
            Automatically generated summaries of detected changes in public
            government datasets. Every story is cryptographically verified.
          </p>
        </header>

        {stories.length === 0 ? (
          <p className="civic-empty">
            No stories yet. A story appears when a monitored file changes and
            Beleg can summarize a structured diff.
          </p>
        ) : (
          <ol className="civic-story-feed">
            {stories.map((row) => {
              const place = row.state ? `${row.city}, ${row.state}` : row.city;
              const slug = citySlug(row.city || "federal");
              return (
                <li key={row.id}>
                  <article className="civic-story-card">
                    <p className="civic-story-dateline">
                      {place ? `${place.toUpperCase()} — ` : null}
                      {formatWhen(row.detected_at)}
                    </p>
                    <p className="civic-story-body">{row.story}</p>
                    <p className="civic-story-meta">{row.dataset_name}</p>
                    <p className="civic-story-proof">
                      <Link href={`/audit/${slug}`}>
                        View cryptographic proof →
                      </Link>
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      <Footer />
    </main>
  );
}
