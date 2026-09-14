"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { ProductWithRelations, RiskTier } from "@/lib/types";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { ProductCard } from "./ProductCard";

type Sort = "score" | "price-asc" | "carbs-asc";
type TierFilter = RiskTier | "ALL";

/** Client-side filter + sort over a server-provided product list. */
export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  const [tier, setTier] = useState<TierFilter>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState<Sort>("score");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.categorySlug))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const priceOf = (p: ProductWithRelations) =>
      p.affiliateLinks.length ? Math.min(...p.affiliateLinks.map((l) => l.priceINR)) : Infinity;

    return products
      .filter((p) => (tier === "ALL" ? true : p.riskTier === tier))
      .filter((p) => (category === "ALL" ? true : p.categorySlug === category))
      .filter((p) => p.zeroSpikeScore >= minScore)
      .sort((a, b) => {
        if (sort === "price-asc") return priceOf(a) - priceOf(b);
        if (sort === "carbs-asc") return a.netCarbsPerServe - b.netCarbsPerServe;
        return b.zeroSpikeScore - a.zeroSpikeScore;
      });
  }, [products, tier, category, minScore, sort]);

  return (
    <div>
      <div className="card mb-6 flex flex-wrap items-end gap-4 p-4">
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
            className="w-32 accent-mint-600"
          />
        </Field>

        <Field label="Sort by">
          <Select value={sort} onChange={(v) => setSort(v as Sort)}>
            <option value="score">ZeroSpike Score</option>
            <option value="price-asc">Price: low to high</option>
            <option value="carbs-asc">Net carbs: low to high</option>
          </Select>
        </Field>

        <span className="ml-auto text-sm text-ink-muted">{filtered.length} products</span>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-ink-muted">No products match these filters.</p>
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
