import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getAllProducts } from "@/lib/db/repository";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { formatINR } from "@/lib/utils/format";
import { lowestPrice } from "@/lib/engine/seo";
import { RiskTierBadge } from "@/components/product/RiskTierBadge";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-ink-soft">{products.length} in the catalogue</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <PlusCircle size={16} /> Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-3 py-1 font-semibold">Product</th>
              <th className="px-3 py-1 font-semibold">Category</th>
              <th className="px-3 py-1 font-semibold">Score</th>
              <th className="px-3 py-1 font-semibold">Tier</th>
              <th className="px-3 py-1 font-semibold">Price</th>
              <th className="px-3 py-1 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const price = lowestPrice(p);
              return (
                <tr key={p.id} className="bg-paper">
                  <td className="rounded-l-xl px-3 py-3">
                    <div className="font-semibold text-ink">{p.title}</div>
                    <div className="text-xs text-ink-muted">{p.brand}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {CATEGORY_LABELS[p.categorySlug] ?? p.categorySlug}
                  </td>
                  <td className="px-3 py-3 font-semibold text-ink">{p.zeroSpikeScore}</td>
                  <td className="px-3 py-3">
                    <RiskTierBadge tier={p.riskTier} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{price != null ? formatINR(price) : "—"}</td>
                  <td className="rounded-r-xl px-3 py-3">
                    <ProductRowActions id={p.id} slug={p.slug} title={p.title} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
