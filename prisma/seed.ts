import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "../src/data/seed-products";
import { productJsonLd } from "../src/lib/engine/seo";

/**
 * Upserts the bundled catalogue into Postgres. Run with `npm run seed`
 * (requires DATABASE_URL + `npm run prisma:push` first).
 */
const prisma = new PrismaClient();

async function main() {
  for (const p of SEED_PRODUCTS) {
    // Compute JSON-LD from the fully-related product for storage in SeoMetadata.
    const schemaJson = productJsonLd(p) as object;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        rawIngredients: p.rawIngredients,
        zeroSpikeScore: p.zeroSpikeScore,
        riskTier: p.riskTier,
        netCarbsPerServe: p.netCarbsPerServe,
        glycemicIndex: p.glycemicIndex,
        primarySweetener: p.primarySweetener,
        hasMaltitol: p.hasMaltitol,
        imageUrls: p.imageUrls,
        categorySlug: p.categorySlug,
        description: p.description ?? null,
        bulletPoints: p.bulletPoints ?? [],
        specsJson: (p.specs ?? []) as object,
        tags: p.tags ?? [],
        ratingAvg: p.ratingAvg ?? null,
        ratingCount: p.ratingCount ?? null,
        zerospikeOffer: p.zerospikeOffer ?? null,
        affiliateLinks: {
          create: p.affiliateLinks.map(({ id, productId, ...rest }) => rest),
        },
        reviews: {
          create: p.reviews.map(({ id, productId, ...rest }) => rest),
        },
        youtubeVideos: {
          create: p.youtubeVideos.map(({ id, productId, ...rest }) => rest),
        },
        seoMeta: p.seoMeta
          ? {
              create: {
                metaTitle: p.seoMeta.metaTitle,
                metaDescription: p.seoMeta.metaDescription,
                geoAnswerBlock: p.seoMeta.geoAnswerBlock,
                schemaJson,
              },
            }
          : undefined,
      },
    });
    console.log(`  ✔ ${p.slug}`);
  }
  console.log(`Seeded ${SEED_PRODUCTS.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
