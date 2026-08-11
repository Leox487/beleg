import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";
import type { Venture } from "@/lib/types";
import { NewVentureForm } from "@/app/components/NewVentureForm";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ventureRows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE clerk_user_id = ${userId}
    ORDER BY created_at DESC
  `;

  const ventures = ventureRows.map((row) =>
    mapVenture(row as Record<string, unknown>),
  ) as Venture[];

  // Entry counts for the user's ventures, gathered in one query.
  const counts = new Map<string, number>();
  if (ventures.length > 0) {
    const ids = ventures.map((v) => v.id);
    const entryRows = await sql`
      SELECT venture_id FROM entries
      WHERE venture_id IN ${sql(ids)}
    `;
    for (const row of entryRows) {
      const id = String((row as { venture_id: string }).venture_id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  if (ventures.length === 0) {
    return (
      <main className="page">
        <div className="empty-state">
          <h1 className="empty-title">Start your first ledger</h1>
          <p className="empty-help">
            A venture is the thing you&apos;re building — a company, a product, a
            project. You&apos;ll add milestones as they happen, and share one
            public link with reviewers, judges, or investors.
          </p>
          <NewVentureForm />
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-header">
          <h1 className="page-title">Your ventures</h1>
        </header>

        <div className="card-grid">
          {ventures.map((v) => (
            <Link key={v.id} href={`/v/${v.id}`} className="venture-card">
              <span className="venture-name">{v.name}</span>
              {v.tagline ? (
                <span className="venture-tagline">{v.tagline}</span>
              ) : null}
              <span className="venture-meta">
                {counts.get(v.id) ?? 0}{" "}
                {(counts.get(v.id) ?? 0) === 1 ? "entry" : "entries"} ·{" "}
                {formatDate(v.created_at)}
              </span>
            </Link>
          ))}
        </div>

        <section className="new-venture-section">
          <NewVentureForm collapsible />
        </section>
      </div>
    </main>
  );
}
