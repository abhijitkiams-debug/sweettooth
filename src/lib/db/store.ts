import { SEED_PRODUCTS } from "@/data/seed-products";
import type { ProductWithRelations } from "@/lib/types";

/**
 * Process-local product store for the DB-less mode. Initialized (once) from the
 * bundled seed catalogue; admin create/update/delete mutate it so the whole app
 * reflects the change for the life of the running server. This is ephemeral —
 * set DATABASE_URL for durable persistence (the repository writes to Postgres
 * instead when a DB is configured).
 */
const globalForStore = globalThis as unknown as {
  __zerospikeStore?: ProductWithRelations[];
};

function clone(products: ProductWithRelations[]): ProductWithRelations[] {
  return products.map((p) => ({
    ...p,
    imageUrls: [...p.imageUrls],
    affiliateLinks: p.affiliateLinks.map((l) => ({ ...l })),
    reviews: p.reviews.map((r) => ({ ...r })),
    youtubeVideos: p.youtubeVideos.map((v) => ({ ...v })),
    seoMeta: p.seoMeta ? { ...p.seoMeta } : null,
  }));
}

export function memoryStore(): ProductWithRelations[] {
  if (!globalForStore.__zerospikeStore) {
    globalForStore.__zerospikeStore = clone(SEED_PRODUCTS);
  }
  return globalForStore.__zerospikeStore;
}

/** Short, unique-enough id for records created at runtime (no DB). */
export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
