import "server-only";
import postgres from "postgres";

const globalForSql = globalThis as unknown as {
  __belegSql?: ReturnType<typeof postgres>;
};

function resolveDatabaseUrl(): string {
  const explicit =
    process.env.DATABASE_URL_POOLED ||
    process.env.DATABASE_POOL_URL ||
    process.env.DATABASE_URL;
  if (!explicit) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const url = new URL(explicit);
    if (
      url.hostname.includes("neon.tech") &&
      !url.hostname.includes("-pooler")
    ) {
      url.hostname = url.hostname.replace(/^([^.]+)/, "$1-pooler");
      return url.toString();
    }
  } catch {
    return explicit;
  }

  return explicit;
}

const sql =
  globalForSql.__belegSql ??
  postgres(resolveDatabaseUrl(), {
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Neon pooler (PgBouncer transaction mode) cannot reuse named statements.
    prepare: false,
  });

globalForSql.__belegSql = sql;

export default sql;
