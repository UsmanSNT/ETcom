import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/databaseUrl";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = getDatabaseUrl();

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
