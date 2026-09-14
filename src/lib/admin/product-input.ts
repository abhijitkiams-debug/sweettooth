import { z } from "zod";

/** Payload accepted by the admin create/update endpoints (from ProductForm). */
export const AffiliateLinkInputSchema = z.object({
  integrationType: z.enum(["AMAZON_TAG", "FLIPKART_AFFID", "GOAFFPRO", "D2C_REFERRAL"]),
  targetUrl: z.string().min(1, "Target URL is required"),
  asinOrNodeId: z.string().optional().nullable(),
  affiliateTag: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  referralNote: z.string().optional().nullable(),
  priceINR: z.coerce.number().min(0),
  mrpINR: z.coerce.number().min(0),
  isPrimary: z.boolean().optional().default(false),
});

export const ReviewInputSchema = z.object({
  source: z.string().min(1),
  reviewerName: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().min(1),
  isCgmVerified: z.boolean().optional().default(false),
  sentiment: z.string().default("taste_match"),
});

export const YouTubeInputSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  channelName: z.string().min(1),
  cgmTimestamp: z.string().optional().nullable(),
});

export const SpecInputSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const ProductInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  brand: z.string().min(1, "Brand is required"),
  rawIngredients: z.string().min(3, "Ingredient list is required"),
  categorySlug: z.string().min(1, "Category is required"),
  slug: z.string().optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  netCarbsHint: z.coerce.number().min(0).optional(),
  glycemicIndexHint: z.coerce.number().int().min(0).optional(),
  affiliateLinks: z.array(AffiliateLinkInputSchema).default([]),
  reviews: z.array(ReviewInputSchema).optional().default([]),
  youtubeVideos: z.array(YouTubeInputSchema).optional().default([]),
  // Rich merchandising details (auto-fetchable).
  description: z.string().optional().nullable(),
  bulletPoints: z.array(z.string()).optional().default([]),
  specs: z.array(SpecInputSchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  ratingAvg: z.coerce.number().min(0).max(5).optional().nullable(),
  ratingCount: z.coerce.number().int().min(0).optional().nullable(),
  zerospikeOffer: z.string().optional().nullable(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      geoAnswerBlock: z.string().optional(),
    })
    .optional(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
export type AffiliateLinkInput = z.infer<typeof AffiliateLinkInputSchema>;
