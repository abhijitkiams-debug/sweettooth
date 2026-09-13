import { prisma } from "./prisma";
import { memoryStore, genId } from "./store";
import { dataSource } from "./repository";
import { evaluateIngredients } from "@/lib/engine/evaluator";
import { geoAnswer, geoQuestion, productJsonLd } from "@/lib/engine/seo";
import { slugify } from "@/lib/utils/format";
import type { ProductInput } from "@/lib/admin/product-input";
import type { ProductWithRelations, SeoMetadata } from "@/lib/types";

/**
 * Product write layer. Uses Prisma when DATABASE_URL is set, otherwise mutates
 * the process-local memory store. Either way the server re-runs the curation
 * engine so the ZeroSpike score/tier is authoritative — not client-supplied.
 */

function uniqueSlug(desired: string, all: { slug: string }[], excludeSlug?: string): string {
  const base = slugify(desired) || "product";
  let slug = base;
  let n = 2;
  const taken = new Set(all.map((p) => p.slug).filter((s) => s !== excludeSlug));
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

/** Build the SeoMetadata block, auto-generating any field the admin left blank. */
function buildSeo(product: ProductWithRelations, input: ProductInput, id: string): SeoMetadata {
  const metaTitle =
    input.seo?.metaTitle?.trim() ||
    `${product.title} — ${product.brand} · ${product.zeroSpikeScore}/100 ZeroSpike`;
  const metaDescription =
    input.seo?.metaDescription?.trim() || geoAnswer(product).slice(0, 300);
  const geoAnswerBlock = input.seo?.geoAnswerBlock?.trim() || geoAnswer(product);
  return {
    id,
    productId: product.id,
    metaTitle,
    metaDescription,
    geoAnswerBlock,
    schemaJson: {},
  };
}

async function assemble(
  input: ProductInput,
  ids: { productId: string; slug: string },
): Promise<ProductWithRelations> {
  const evaluation = await evaluateIngredients(input.rawIngredients, {
    netCarbsHint: input.netCarbsHint,
    glycemicIndexHint: input.glycemicIndexHint,
  });

  const now = new Date();
  const product: ProductWithRelations = {
    id: ids.productId,
    slug: ids.slug,
    title: input.title.trim(),
    brand: input.brand.trim(),
    rawIngredients: input.rawIngredients.trim(),
    zeroSpikeScore: evaluation.zeroSpikeScore,
    riskTier: evaluation.riskTier,
    netCarbsPerServe: evaluation.netCarbsPerServe,
    glycemicIndex: evaluation.glycemicIndex,
    primarySweetener: evaluation.primarySweetener,
    hasMaltitol: evaluation.hasMaltitol,
    imageUrls: input.imageUrls ?? [],
    categorySlug: slugify(input.categorySlug),
    createdAt: now,
    updatedAt: now,
    affiliateLinks: input.affiliateLinks.map((l) => ({
      id: genId("al"),
      productId: ids.productId,
      integrationType: l.integrationType,
      targetUrl: l.targetUrl.trim(),
      asinOrNodeId: l.asinOrNodeId || null,
      affiliateTag: l.affiliateTag || null,
      couponCode: l.couponCode || null,
      referralNote: l.referralNote || null,
      priceINR: l.priceINR,
      mrpINR: l.mrpINR,
      isPrimary: Boolean(l.isPrimary),
    })),
    reviews: (input.reviews ?? []).map((r) => ({
      id: genId("rv"),
      productId: ids.productId,
      source: r.source,
      reviewerName: r.reviewerName,
      rating: r.rating,
      reviewText: r.reviewText,
      isCgmVerified: Boolean(r.isCgmVerified),
      sentiment: r.sentiment,
    })),
    youtubeVideos: (input.youtubeVideos ?? []).map((v) => ({
      id: genId("yt"),
      productId: ids.productId,
      videoId: v.videoId,
      title: v.title,
      channelName: v.channelName,
      cgmTimestamp: v.cgmTimestamp || null,
    })),
    seoMeta: null,
  };

  product.seoMeta = buildSeo(product, input, genId("seo"));
  return product;
}

export async function createProduct(input: ProductInput): Promise<ProductWithRelations> {
  if (prisma && dataSource() === "database") {
    const existing = await prisma.product.findMany({ select: { slug: true } });
    const slug = uniqueSlug(input.slug || input.title, existing);
    const built = await assemble(input, { productId: genId("prod"), slug });
    const schemaJson = productJsonLd(built) as object;
    const created = await prisma.product.create({
      data: {
        slug,
        title: built.title,
        brand: built.brand,
        rawIngredients: built.rawIngredients,
        zeroSpikeScore: built.zeroSpikeScore,
        riskTier: built.riskTier,
        netCarbsPerServe: built.netCarbsPerServe,
        glycemicIndex: built.glycemicIndex,
        primarySweetener: built.primarySweetener,
        hasMaltitol: built.hasMaltitol,
        imageUrls: built.imageUrls,
        categorySlug: built.categorySlug,
        affiliateLinks: { create: built.affiliateLinks.map(stripIds) },
        reviews: { create: built.reviews.map(stripIds) },
        youtubeVideos: { create: built.youtubeVideos.map(stripIds) },
        seoMeta: built.seoMeta
          ? {
              create: {
                metaTitle: built.seoMeta.metaTitle,
                metaDescription: built.seoMeta.metaDescription,
                geoAnswerBlock: built.seoMeta.geoAnswerBlock,
                schemaJson,
              },
            }
          : undefined,
      },
      include: { affiliateLinks: true, reviews: true, youtubeVideos: true, seoMeta: true },
    });
    return created as unknown as ProductWithRelations;
  }

  // Memory path.
  const store = memoryStore();
  const slug = uniqueSlug(input.slug || input.title, store);
  const built = await assemble(input, { productId: genId("prod"), slug });
  store.unshift(built);
  return built;
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductWithRelations | null> {
  if (prisma && dataSource() === "database") {
    const current = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
    if (!current) return null;
    const others = await prisma.product.findMany({ select: { slug: true } });
    const slug = uniqueSlug(input.slug || current.slug, others, current.slug);
    const built = await assemble(input, { productId: id, slug });
    const schemaJson = productJsonLd(built) as object;

    // Replace relations wholesale for simplicity.
    await prisma.$transaction([
      prisma.affiliateLink.deleteMany({ where: { productId: id } }),
      prisma.harvestedReview.deleteMany({ where: { productId: id } }),
      prisma.youTubeEmbed.deleteMany({ where: { productId: id } }),
    ]);
    const updated = await prisma.product.update({
      where: { id },
      data: {
        slug,
        title: built.title,
        brand: built.brand,
        rawIngredients: built.rawIngredients,
        zeroSpikeScore: built.zeroSpikeScore,
        riskTier: built.riskTier,
        netCarbsPerServe: built.netCarbsPerServe,
        glycemicIndex: built.glycemicIndex,
        primarySweetener: built.primarySweetener,
        hasMaltitol: built.hasMaltitol,
        imageUrls: built.imageUrls,
        categorySlug: built.categorySlug,
        affiliateLinks: { create: built.affiliateLinks.map(stripIds) },
        reviews: { create: built.reviews.map(stripIds) },
        youtubeVideos: { create: built.youtubeVideos.map(stripIds) },
        seoMeta: built.seoMeta
          ? {
              upsert: {
                create: {
                  metaTitle: built.seoMeta.metaTitle,
                  metaDescription: built.seoMeta.metaDescription,
                  geoAnswerBlock: built.seoMeta.geoAnswerBlock,
                  schemaJson,
                },
                update: {
                  metaTitle: built.seoMeta.metaTitle,
                  metaDescription: built.seoMeta.metaDescription,
                  geoAnswerBlock: built.seoMeta.geoAnswerBlock,
                  schemaJson,
                },
              },
            }
          : undefined,
      },
      include: { affiliateLinks: true, reviews: true, youtubeVideos: true, seoMeta: true },
    });
    return updated as unknown as ProductWithRelations;
  }

  // Memory path.
  const store = memoryStore();
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const slug = uniqueSlug(input.slug || store[idx].slug, store, store[idx].slug);
  const built = await assemble(input, { productId: id, slug });
  built.createdAt = store[idx].createdAt;
  store[idx] = built;
  return built;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (prisma && dataSource() === "database") {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const store = memoryStore();
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

// Prisma nested `create` rows must not carry id/productId.
function stripIds<T extends { id?: string; productId?: string }>(row: T) {
  const { id, productId, ...rest } = row;
  void id;
  void productId;
  return rest;
}
