import Link from "next/link";
import type { ProductWithRelations } from "@/lib/types";
import { formatINR, discountPct } from "@/lib/utils/format";
import { lowestPrice } from "@/lib/engine/seo";
import { ProductImage } from "./ProductImage";

const SCORE_COLOR = (tier: string) =>
  tier === "CERTIFIED_SAFE" ? "text-mint-600" : tier === "CAUTION" ? "text-caution" : "text-danger";

const TIER_WORD: Record<string, string> = {
  CERTIFIED_SAFE: "Certified",
  CAUTION: "Caution",
  DISQUALIFIED: "Avoid",
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const price = lowestPrice(product);
  const mrp = product.affiliateLinks.length
    ? Math.max(...product.affiliateLinks.map((l) => l.mrpINR))
    : null;
  const off = price != null && mrp != null ? discountPct(mrp, price) : 0;

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <ProductImage
            slug={product.slug}
            title={product.title}
            categorySlug={product.categorySlug}
            imageUrls={product.imageUrls}
            overline={product.brand}
          />
        </div>
        {/* Score chip — the one piece of data-forward chrome */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
          <span className={SCORE_COLOR(product.riskTier)}>{product.zeroSpikeScore}</span>
          <span className="text-ink-muted">/100</span>
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <span className={`text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${SCORE_COLOR(product.riskTier)}`}>
          {TIER_WORD[product.riskTier]} · {product.netCarbsPerServe}g net carbs
        </span>
        <h3 className="mt-1.5 font-display text-2xl font-semibold leading-[1.1] text-ink">
          {product.title}
        </h3>
        <span className="mt-1 text-sm text-ink-muted">{product.brand}</span>

        <div className="mt-3 flex items-baseline gap-2">
          {price != null ? (
            <>
              <span className="text-lg font-semibold text-ink">{formatINR(price)}</span>
              {off > 0 && mrp != null && (
                <span className="text-sm text-ink-muted line-through">{formatINR(mrp)}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-ink-muted">—</span>
          )}
        </div>
      </div>
    </Link>
  );
}
