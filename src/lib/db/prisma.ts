import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Only instantiated when DATABASE_URL is present — otherwise
 * the repository layer serves bundled seed data and never touches Prisma.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient | null = process.env.DATABASE_URL
  ? globalForPrisma.prisma ??
    new PrismaClient({ log: ["error", "warn"] })
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
