"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { ProductWithRelations, RiskTier } from "@/lib/types";
import { CATEGORY_LABELS, categoryRank, categoryMeta } from "@/data/taxonomy";
import { ProductCard } from "./ProductCard";

type Sort = "category" | "score" | "price-asc" | "carbs-asc";
type TierFilter = RiskTier | "ALL";

/** Client-side filter + sort. Default view groups products by category rank. */
export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  const [tier, setTier] = useState<TierFilter>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<Sort>("category");

  // Category options ordered by merchandising rank.
  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.categorySlug))).sort(
        (a, b) => categoryRank(a) - categoryRank(b),
      ),
    [products],
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) => (tier === "ALL" ? true : p.riskTier === tier))
      .filter((p) => (category === "ALL" ? true : p.categorySlug === category))
      .filter((p) => p.zeroSpikeScore >= minScore);
  }, [products, tier, category, minScore]);

  const flatSorted = useMemo(() => {
    const priceOf = (p: ProductWithRelations) =>
      p.affiliateLinks.length ? Math.min(...p.affiliateLinks.map((l) => l.priceINR)) : Infinity;
    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return priceOf(a) - priceOf(b);
      if (sort === "carbs-asc") return a.netCarbsPerServe - b.netCarbsPerServe;
      return b.zeroSpikeScore - a.zeroSpikeScore;
    });
  }, [filtered, sort]);

  // Grouped-by-category view (category rank order, score desc within each).
  const groups = useMemo(() => {
    const bySlug = new Map<string, ProductWithRelations[]>();
    for (const p of filtered) {
      if (!bySlug.has(p.categorySlug)) bySlug.set(p.categorySlug, []);
      bySlug.get(p.categorySlug)!.push(p);
    }
    return [...bySlug.entries()]
      .sort(([a], [b]) => categoryRank(a) - categoryRank(b))
      .map(([slug, items]) => ({
        slug,
        meta: categoryMeta(slug),
        items: items.sort((a, b) => b.zeroSpikeScore - a.zeroSpikeScore),
      }));
  }, [filtered]);

  return (
    <div>
      <div className="card mb-8 flex flex-wrap items-end gap-4 p-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <SlidersHorizontal size={16} /> Filter
        </div>

        <Field label="Tier">
          <Select value={tier} onChange={(v) => setTier(v as TierFilter)}>
            <option value="ALL">All tiers</option>
            <option value="CERTIFIED_SAFE">Certified Safe</option>
            <option value="CAUTION">Caution</option>
            <option value="DISQUALIFIED">Disqualified</option>
          </Select>
        </Field>

        <Field label="Category">
          <Select value={category} onChange={setCategory}>
            <option value="ALL">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={`Min score: ${minScore}`}>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-32 accent-mint-500"
          />
        </Field>

        <Field label="Sort by">
          <Select value={sort} onChange={(v) => setSort(v as Sort)}>
            <option value="category">Category</option>
            <option value="score">ZeroSpike Score</option>
            <option value="price-asc">Price: low to high</option>
            <option value="carbs-asc">Net carbs: low to high</option>
          </Select>
        </Field>

        <span className="ml-auto text-sm text-ink-muted">{filtered.length} products</span>
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-ink-muted">No products match these filters.</p>
      )}

      {/* Grouped by category (default) */}
      {sort === "category" &&
        groups.map((g) => (
          <section key={g.slug} id={g.slug} className="mb-14 scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="inline-block h-7 w-2 rounded-full"
                style={{ backgroundColor: g.meta.accent }}
                aria-hidden
              />
              <h2 className="font-display text-2xl font-semibold text-ink">{g.meta.label}</h2>
              <span className="text-sm text-ink-muted">{g.items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {g.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}

      {/* Flat sorted view */}
      {sort !== "category" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {flatSorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
      {label}
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-mint-500 focus:outline-none"
    >
      {children}
    </select>
  );
}
