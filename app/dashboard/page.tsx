import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase";
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

  const supabase = createSupabaseServiceRoleClient();

  const { data: venturesData } = await supabase
    .from("ventures")
    .select("id, clerk_user_id, name, slug, tagline, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  const ventures = (venturesData ?? []) as Venture[];

  // Entry counts for the user's ventures, gathered in one query.
  const counts = new Map<string, number>();
  if (ventures.length > 0) {
    const { data: entryRows } = await supabase
      .from("entries")
      .select("venture_id")
      .in(
        "venture_id",
        ventures.map((v) => v.id),
      );
    for (const row of entryRows ?? []) {
      const id = (row as { venture_id: string }).venture_id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  if (ventures.length === 0) {
    return (
      <main className="page">
        <div className="empty-state">
          <h1 className="empty-title">Start your first ledger</h1>
          <p className="muted">
            A venture is an append-only, hash-chained record of what you actually
            did. Name it to begin.
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
