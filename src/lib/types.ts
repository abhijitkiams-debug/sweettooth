// Domain types shared by the Prisma layer and the DB-less seed fallback.
// These mirror the Prisma models so a `Product` from either source is identical
// to the UI. Enums are string unions matching prisma/schema.prisma.

export type RiskTier = "CERTIFIED_SAFE" | "CAUTION" | "DISQUALIFIED";

export type IntegrationType =
  | "AMAZON_TAG"
  | "FLIPKART_AFFID"
  | "GOAFFPRO"
  | "D2C_REFERRAL";

export interface AffiliateLink {
  id: string;
  productId: string;
  integrationType: IntegrationType;
  targetUrl: string;
  asinOrNodeId: string | null;
  affiliateTag: string | null;
  couponCode: string | null;
  referralNote: string | null;
  priceINR: number;
  mrpINR: number;
  isPrimary: boolean;
}

export interface HarvestedReview {
  id: string;
  productId: string;
  source: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  isCgmVerified: boolean;
  sentiment: "glucose_flat" | "taste_match" | "caution" | string;
}

export interface YouTubeEmbed {
  id: string;
  productId: string;
  videoId: string;
  title: string;
  channelName: string;
  cgmTimestamp: string | null;
}

export interface SeoMetadata {
  id: string;
  productId: string;
  metaTitle: string;
  metaDescription: string;
  geoAnswerBlock: string;
  schemaJson: unknown;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  rawIngredients: string;
  zeroSpikeScore: number;
  riskTier: RiskTier;
  netCarbsPerServe: number;
  glycemicIndex: number | null;
  primarySweetener: string;
  hasMaltitol: boolean;
  imageUrls: string[];
  categorySlug: string;
  createdAt: Date;
  updatedAt: Date;

  // Rich, auto-fetchable merchandising details (optional — populated by the
  // admin "Fetch details" flow or filled in manually).
  description?: string | null;
  bulletPoints?: string[]; // "About this item"
  specs?: ProductSpec[]; // technical details (weight, dimensions, manufacturer…)
  tags?: string[];
  ratingAvg?: number | null;
  ratingCount?: number | null;
  zerospikeOffer?: string | null; // "Special Offers by ZeroSpike"
}

// Product with all relations loaded — what detail/listing pages consume.
export interface ProductWithRelations extends Product {
  affiliateLinks: AffiliateLink[];
  reviews: HarvestedReview[];
  youtubeVideos: YouTubeEmbed[];
  seoMeta: SeoMetadata | null;
}
