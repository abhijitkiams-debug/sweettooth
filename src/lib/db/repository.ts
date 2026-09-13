import { prisma } from "./prisma";
import { memoryStore } from "./store";
import { CRAVINGS, SWEET_TYPES, matchesEntry, type DirectoryEntry } from "@/data/taxonomy";
import type { ProductWithRelations, RiskTier } from "@/lib/types";

/**
 * Data-access layer. Every page reads through here. If DATABASE_URL is set and
 * Prisma succeeds, real data is returned; otherwise (no DB, or a connection
 * error) the bundled seed catalogue is served so the whole site still renders.
 *
 * `dataSource()` reports which path is live, for status UIs.
 */

const RELATION_INCLUDE = {
  affiliateLinks: true,
  reviews: true,
  youtubeVideos: true,
  seoMeta: true,
} as const;

let dbHealthy = Boolean(prisma);

export function dataSource(): "database" | "seed" {
  return prisma && dbHealthy ? "database" : "seed";
}

async function fromDb<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!prisma || !dbHealthy) return null;
  try {
    return await fn();
  } catch (err) {
    // First failure flips us to seed mode for the rest of the process.
    dbHealthy = false;
    console.warn("[repository] DB query failed, falling back to seed data:", err);
    return null;
  }
}

function sortByScore(a: ProductWithRelations, b: ProductWithRelations): number {
  return b.zeroSpikeScore - a.zeroSpikeScore;
}

export async function getAllProducts(): Promise<ProductWithRelations[]> {
  const db = await fromDb(() =>
    prisma!.product.findMany({ include: RELATION_INCLUDE, orderBy: { zeroSpikeScore: "desc" } }),
  );
  if (db) return db as unknown as ProductWithRelations[];
  return [...memoryStore()].sort(sortByScore);
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const db = await fromDb(() =>
    prisma!.product.findUnique({ where: { slug }, include: RELATION_INCLUDE }),
  );
  if (db !== null) return db as unknown as ProductWithRelations;
  if (dataSource() === "database") return null; // DB is live but slug not found
  return memoryStore().find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const db = await fromDb(() =>
    prisma!.product.findUnique({ where: { id }, include: RELATION_INCLUDE }),
  );
  if (db !== null) return db as unknown as ProductWithRelations;
  if (dataSource() === "database") return null;
  return memoryStore().find((p) => p.id === id) ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const products = await getAllProducts();
  return products.map((p) => p.slug);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.riskTier === "CERTIFIED_SAFE").slice(0, limit);
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductWithRelations[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.categorySlug === categorySlug).sort(sortByScore);
}

export async function getProductsByTier(tier: RiskTier): Promise<ProductWithRelations[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.riskTier === tier).sort(sortByScore);
}

/** Products for a programmatic directory page (craving / sweet-type). */
export async function getProductsForEntry(entry: DirectoryEntry): Promise<{
  certified: ProductWithRelations[];
  cautionOrWorse: ProductWithRelations[];
}> {
  const all = await getAllProducts();
  const matched = all.filter((p) => matchesEntry(p, entry)).sort(sortByScore);
  return {
    certified: matched.filter((p) => p.riskTier === "CERTIFIED_SAFE"),
    cautionOrWorse: matched.filter((p) => p.riskTier !== "CERTIFIED_SAFE"),
  };
}

export function getCraving(slug: string): DirectoryEntry | undefined {
  return CRAVINGS.find((c) => c.slug === slug);
}

export function getSweetType(slug: string): DirectoryEntry | undefined {
  return SWEET_TYPES.find((c) => c.slug === slug);
}

export interface CatalogueStats {
  total: number;
  certified: number;
  caution: number;
  disqualified: number;
  categories: number;
}

export async function getStats(): Promise<CatalogueStats> {
  const all = await getAllProducts();
  return {
    total: all.length,
    certified: all.filter((p) => p.riskTier === "CERTIFIED_SAFE").length,
    caution: all.filter((p) => p.riskTier === "CAUTION").length,
    disqualified: all.filter((p) => p.riskTier === "DISQUALIFIED").length,
    categories: new Set(all.map((p) => p.categorySlug)).size,
  };
}
