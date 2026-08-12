/**
 * Domain used for venture ingest addresses: `{slug}@{domain}`.
 * Prefer the public env so Server Components and client UI agree.
 *
 * Production uses Resend's managed inbound host
 * (`nexeerdele.resend.app`), not the custom sending domain.
 */
export function ingestEmailDomain(): string {
  const fromPublic = process.env.NEXT_PUBLIC_INGEST_EMAIL_DOMAIN?.trim();
  if (fromPublic) return fromPublic.toLowerCase();

  const fromServer = process.env.INGEST_EMAIL_DOMAIN?.trim();
  if (fromServer) return fromServer.toLowerCase();

  const fromAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    "",
  )
    .replace(/\/.*$/, "")
    .trim();
  if (fromAppUrl && fromAppUrl.endsWith(".resend.app")) {
    return fromAppUrl.toLowerCase();
  }

  return "";
}

export function ingestAddressForSlug(slug: string): string {
  const domain = ingestEmailDomain();
  const local = slug.trim().toLowerCase();
  if (!domain) {
    return `${local}@<set-NEXT_PUBLIC_INGEST_EMAIL_DOMAIN>`;
  }
  return `${local}@${domain}`;
}
