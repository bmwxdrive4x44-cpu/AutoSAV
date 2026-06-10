import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrismaRuntimeUrl(): string | undefined {
  const raw = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!raw) return undefined;

  // Supabase pooler in transaction mode needs Prisma PgBouncer flags to avoid
  // prepared statement collisions in serverless concurrency.
  if (raw.includes("pooler.supabase.com")) {
    try {
      const url = new URL(raw);
      if (url.searchParams.get("pgbouncer") !== "true") {
        url.searchParams.set("pgbouncer", "true");
      }
      if (!url.searchParams.get("connection_limit")) {
        url.searchParams.set("connection_limit", "1");
      }
      if (!url.searchParams.get("sslmode")) {
        url.searchParams.set("sslmode", "require");
      }
      return url.toString();
    } catch {
      return raw;
    }
  }

  try {
    const url = new URL(raw);
    if (!url.searchParams.get("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const runtimeDbUrl = buildPrismaRuntimeUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    runtimeDbUrl
      ? {
          datasources: {
            db: {
              url: runtimeDbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

