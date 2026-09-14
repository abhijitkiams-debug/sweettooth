import type { ProductWithRelations, RiskTier } from "@/lib/types";

/** Absolute site URL for canonical links / schema. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function productUrl(slug: string): string {
  return `${siteUrl()}/product/${slug}`;
}

const TIER_LABEL: Record<RiskTier, string> = {
  CERTIFIED_SAFE: "Green Light",
  CAUTION: "Go Easy",
  DISQUALIFIED: "Hard Pass",
};

export function tierLabel(tier: RiskTier): string {
  return TIER_LABEL[tier];
}

/** Average review rating (rounded to 1 dp) or null when no reviews. */
export function avgRating(p: ProductWithRelations): number | null {
  if (!p.reviews.length) return null;
  const sum = p.reviews.reduce((a, r) => a + r.rating, 0);
  return Math.round((sum / p.reviews.length) * 10) / 10;
}

export function lowestPrice(p: ProductWithRelations): number | null {
  if (!p.affiliateLinks.length) return null;
  return Math.min(...p.affiliateLinks.map((l) => l.priceINR));
}

/**
 * schema.org/Product JSON-LD with Offer + AggregateRating + Review. This is the
 * machine-readable claim block that AI Overviews / search engines quote.
 */
export function productJsonLd(p: ProductWithRelations): Record<string, unknown> {
  const rating = avgRating(p);
  const price = lowestPrice(p);

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    brand: { "@type": "Brand", name: p.brand },
    description: p.seoMeta?.metaDescription ?? geoAnswer(p),
    image: p.imageUrls,
    sku: p.slug,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "ZeroSpike Score",
        value: p.zeroSpikeScore,
        maxValue: 100,
      },
      {
        "@type": "PropertyValue",
        name: "Net carbs per serving (g)",
        value: p.netCarbsPerServe,
      },
      ...(p.glycemicIndex != null
        ? [
            {
              "@type": "PropertyValue",
              name: "Glycemic Index",
              value: p.glycemicIndex,
            },
          ]
        : []),
      {
        "@type": "PropertyValue",
        name: "Primary sweetener",
        value: p.primarySweetener,
      },
    ],
  };

  if (price != null) {
    json.offers = {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: productUrl(p.slug),
    };
  }

  if (rating != null) {
    json.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: p.reviews.length,
      bestRating: 5,
    };
    json.review = p.reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.reviewerName },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      reviewBody: r.reviewText,
    }));
  }

  return json;
}

export function faqJsonLd(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** The 1-2 sentence GEO answer designed to be lifted verbatim into AI answers. */
export function geoAnswer(p: ProductWithRelations): string {
  if (p.seoMeta?.geoAnswerBlock) return p.seoMeta.geoAnswerBlock;

  const verdict =
    p.riskTier === "CERTIFIED_SAFE"
      ? `${p.title} by ${p.brand} gets a ZeroSpike green light — ${p.zeroSpikeScore}/100.`
      : p.riskTier === "CAUTION"
        ? `${p.title} by ${p.brand} scores ${p.zeroSpikeScore}/100 — a go-easy, now-and-then pick.`
        : `${p.title} by ${p.brand} gets a ZeroSpike hard pass (${p.zeroSpikeScore}/100).`;

  return `${verdict} It is sweetened with ${p.primarySweetener}, has about ${p.netCarbsPerServe}g net carbs per serving${
    p.glycemicIndex != null ? ` and an estimated glycemic index of ${p.glycemicIndex}` : ""
  }.`;
}

export function geoQuestion(p: ProductWithRelations): string {
  return `Is ${p.brand} ${p.title} safe for diabetics and low-GI diets?`;
}
