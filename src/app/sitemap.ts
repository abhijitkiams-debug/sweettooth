import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/db/repository";
import { CRAVINGS, SWEET_TYPES } from "@/data/taxonomy";
import { siteUrl } from "@/lib/engine/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/products`, lastModified: now, priority: 0.9 },
    { url: `${base}/methodology`, lastModified: now, priority: 0.5 },
  ];

  const slugs = await getAllSlugs();
  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/product/${slug}`,
    lastModified: now,
    priority: 0.8,
  }));

  const cravingRoutes: MetadataRoute.Sitemap = CRAVINGS.map((c) => ({
    url: `${base}/low-gi/${c.slug}`,
    lastModified: now,
    priority: 0.7,
  }));

  const sweetRoutes: MetadataRoute.Sitemap = SWEET_TYPES.map((c) => ({
    url: `${base}/diabetic-friendly/${c.slug}`,
    lastModified: now,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...cravingRoutes, ...sweetRoutes];
}
