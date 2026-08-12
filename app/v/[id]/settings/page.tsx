import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DeleteVentureForm } from "@/app/components/DeleteVentureForm";
import { TaglineForm } from "@/app/components/TaglineForm";
import WhitelistManager from "@/app/components/WhitelistManager";
import { CopyText } from "@/app/components/CopyText";
import { ingestAddressForSlug } from "@/lib/ingestEmail";
import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

export default async function VentureSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ventureRows = await sql`
    SELECT id, clerk_user_id, name, slug, tagline, created_at
    FROM ventures
    WHERE id = ${id}
    LIMIT 1
  `;
  const venture = ventureRows[0]
    ? mapVenture(ventureRows[0] as Record<string, unknown>)
    : null;
  if (!venture || venture.clerk_user_id !== userId) notFound();

  const ingestEmail = ingestAddressForSlug(venture.slug);

  return (
    <main className="page">
      <div className="page-inner ledger settings-page">
        <p className="muted">
          <Link href={`/v/${venture.id}`}>← Back to ledger</Link>
        </p>

        <header className="ledger-header">
          <h1 className="page-title">Settings</h1>
          <p className="ledger-tagline">{venture.name}</p>
        </header>

        <section className="settings-section">
          <h2 className="section-title">Venture</h2>
          <p className="muted">
            Name and URL cannot be changed after creation.
          </p>
          <dl className="settings-dl">
            <div>
              <dt>Name</dt>
              <dd>{venture.name}</dd>
            </div>
            <div>
              <dt>Public URL</dt>
              <dd>
                <code>/p/{venture.slug}</code>
              </dd>
            </div>
          </dl>
          <TaglineForm
            ventureId={venture.id}
            initialTagline={venture.tagline}
          />
        </section>

        <section className="settings-section">
          <h2 className="section-title">Email ingestion</h2>
          <p className="muted">
            Forward emails to this address to auto-create sealed ledger entries.
            Only whitelisted senders are processed.
          </p>
          <div className="ingest-address-row">
            <code className="ingest-address">{ingestEmail}</code>
            <CopyText value={ingestEmail} />
          </div>
          <div className="whitelist-wrap">
            <h3 className="settings-subhead">Whitelisted senders</h3>
            <WhitelistManager ventureId={venture.id} />
          </div>
        </section>

        <section className="settings-section settings-danger">
          <h2 className="section-title">Danger zone</h2>
          <DeleteVentureForm
            ventureId={venture.id}
            ventureName={venture.name}
          />
        </section>
      </div>
    </main>
  );
}
