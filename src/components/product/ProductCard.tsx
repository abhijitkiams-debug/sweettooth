import Link from "next/link";
import { Activity } from "lucide-react";
import type { ProductWithRelations } from "@/lib/types";
import { formatINR, discountPct } from "@/lib/utils/format";
import { lowestPrice } from "@/lib/engine/seo";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { ProductImage } from "./ProductImage";
import { RiskTierBadge } from "./RiskTierBadge";

const SCORE_COLOR = (tier: string) =>
  tier === "CERTIFIED_SAFE" ? "text-mint-700" : tier === "CAUTION" ? "text-amber-600" : "text-red-600";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const price = lowestPrice(product);
  const mrp = product.affiliateLinks.length
    ? Math.max(...product.affiliateLinks.map((l) => l.mrpINR))
    : null;
  const off = price != null && mrp != null ? discountPct(mrp, price) : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative p-3">
        <ProductImage
          slug={product.slug}
          title={product.title}
          tier={product.riskTier}
          imageUrls={product.imageUrls}
        />
        <div className="absolute right-5 top-5">
          <RiskTierBadge tier={product.riskTier} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-1">
        <span className="text-xs font-medium text-ink-muted">
          {CATEGORY_LABELS[product.categorySlug] ?? product.categorySlug} · {product.brand}
        </span>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <Activity size={15} className={SCORE_COLOR(product.riskTier)} strokeWidth={2.5} />
          <span className={`font-semibold ${SCORE_COLOR(product.riskTier)}`}>
            {product.zeroSpikeScore}/100
          </span>
          <span className="text-ink-muted">· {product.netCarbsPerServe}g net carbs</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          {price != null ? (
            <div>
              <span className="font-semibold text-ink">{formatINR(price)}</span>
              {off > 0 && mrp != null && (
                <span className="ml-2 text-xs text-ink-muted line-through">{formatINR(mrp)}</span>
              )}
            </div>
          ) : (
            <span className="text-sm text-ink-muted">—</span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-mint-50 px-2 py-0.5 text-xs font-semibold text-mint-700">
              {off}% off
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
