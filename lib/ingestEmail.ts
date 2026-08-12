/**
 * Domain used for venture ingest addresses: `{slug}@{domain}`.
 * Prefer the public env so Server Components and client UI agree.
 */
export function ingestEmailDomain(): string {
  const fromPublic = process.env.NEXT_PUBLIC_INGEST_EMAIL_DOMAIN?.trim();
  if (fromPublic) return fromPublic.toLowerCase();

  const fromAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    "",
  )
    .replace(/\/.*$/, "")
    .trim();
  if (fromAppUrl) return fromAppUrl.toLowerCase();

  const fromServer = process.env.INGEST_EMAIL_DOMAIN?.trim();
  if (fromServer) return fromServer.toLowerCase();

  return "belegapp.com";
}

export function ingestAddressForSlug(slug: string): string {
  return `${slug.trim().toLowerCase()}@${ingestEmailDomain()}`;
}
