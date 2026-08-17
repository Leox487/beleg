import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CopyText } from "@/app/components/CopyText";
import { DeleteVentureForm } from "@/app/components/DeleteVentureForm";
import { StripeConnect } from "@/app/components/StripeConnect";
import { TaglineForm } from "@/app/components/TaglineForm";
import WhitelistManager from "@/app/components/WhitelistManager";
import { ingestAddressForSlug } from "@/lib/ingestEmail";
import { mapVenture } from "@/lib/row";
import sql from "@/lib/supabase";

function formatCreated(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

  const [entryCountRows, attestationCountRows] = await Promise.all([
    sql`
      SELECT count(*)::int AS count
      FROM entries
      WHERE venture_id = ${venture.id}
    `,
    sql`
      SELECT count(*)::int AS count
      FROM attestations
      WHERE venture_id = ${venture.id} AND status = 'confirmed'
    `,
  ]);

  const entryCount = Number(entryCountRows[0]?.count ?? 0);
  const confirmedAttestations = Number(attestationCountRows[0]?.count ?? 0);
  const ingestEmail = ingestAddressForSlug(venture.slug);
  const publicPath = `/p/${venture.slug}`;
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://belegapp.com";

  const stripeRows = await sql`
    SELECT stripe_account_id
    FROM stripe_connections
    WHERE venture_id = ${venture.id}
    LIMIT 1
  `;
  const stripeConnection = stripeRows[0]
    ? {
        accountId: String(stripeRows[0].stripe_account_id),
        webhookUrl: `${appOrigin}/api/stripe/webhook/${venture.id}`,
      }
    : null;

  return (
    <main className="page">
      <div className="page-inner ledger settings-page">
        <p className="muted">
          <Link href={`/v/${venture.id}`}>← Back to ledger</Link>
        </p>

        <header className="ledger-header">
          <h1 className="page-title">{venture.name}</h1>
          <p className="muted settings-immutable-note">
            Name and URL cannot be changed. This protects the integrity of
            existing proof page links.
          </p>
          <div className="public-link">
            <span className="muted">Public proof page:</span>{" "}
            <CopyText value={publicPath} />
            <a
              className="public-open"
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open →
            </a>
          </div>
          <dl className="settings-stats">
            <div>
              <dt>Created</dt>
              <dd>{formatCreated(venture.created_at)}</dd>
            </div>
            <div>
              <dt>Entries</dt>
              <dd>{entryCount}</dd>
            </div>
            <div>
              <dt>Confirmed attestations</dt>
              <dd>{confirmedAttestations}</dd>
            </div>
          </dl>
        </header>

        <section className="settings-section">
          <TaglineForm
            ventureId={venture.id}
            initialTagline={venture.tagline}
          />
        </section>

        <section className="settings-section">
          <h2 className="section-title">Stripe Integration</h2>
          <StripeConnect
            ventureId={venture.id}
            initial={stripeConnection}
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
