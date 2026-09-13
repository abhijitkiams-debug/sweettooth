import { CATEGORY_LABELS, CRAVINGS, SWEET_TYPES, matchesEntry } from "@/data/taxonomy";
import { humanizeSlug } from "@/lib/utils/format";
import type { ProductWithRelations } from "@/lib/types";

export interface CategoryOption {
  slug: string;
  label: string;
}

/** Known categories (from taxonomy labels) merged with those in the catalogue. */
export function categoryOptions(products: ProductWithRelations[]): CategoryOption[] {
  const slugs = new Set<string>([
    ...Object.keys(CATEGORY_LABELS),
    ...products.map((p) => p.categorySlug),
  ]);
  return [...slugs]
    .sort()
    .map((slug) => ({ slug, label: CATEGORY_LABELS[slug] ?? humanizeSlug(slug) }));
}

export interface CategoryMappingRow {
  slug: string;
  label: string;
  total: number;
  certified: number;
  caution: number;
  disqualified: number;
  /** Directory pages (craving / sweet-type) that surface this category. */
  directoryPages: { label: string; href: string }[];
}

/** Builds the category → directory-page mapping used by the admin mapping view. */
export function categoryMapping(products: ProductWithRelations[]): CategoryMappingRow[] {
  const opts = categoryOptions(products);

  return opts.map(({ slug, label }) => {
    const inCat = products.filter((p) => p.categorySlug === slug);

    // A directory page surfaces this category if any product in it matches the entry.
    const directoryPages: { label: string; href: string }[] = [];
    for (const c of CRAVINGS) {
      if (c.categorySlugs.includes(slug) || inCat.some((p) => matchesEntry(p, c))) {
        directoryPages.push({ label: c.h1, href: `/low-gi/${c.slug}` });
      }
    }
    for (const s of SWEET_TYPES) {
      if (s.categorySlugs.includes(slug) || inCat.some((p) => matchesEntry(p, s))) {
        directoryPages.push({ label: s.h1, href: `/diabetic-friendly/${s.slug}` });
      }
    }

    return {
      slug,
      label,
      total: inCat.length,
      certified: inCat.filter((p) => p.riskTier === "CERTIFIED_SAFE").length,
      caution: inCat.filter((p) => p.riskTier === "CAUTION").length,
      disqualified: inCat.filter((p) => p.riskTier === "DISQUALIFIED").length,
      directoryPages,
    };
  });
}
