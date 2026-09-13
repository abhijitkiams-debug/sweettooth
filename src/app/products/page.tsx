import type { Metadata } from "next";
import { getAllProducts, getStats } from "@/lib/db/repository";
import { ProductGrid } from "@/components/product/ProductGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Low-GI & Diabetic-Friendly Products",
  description:
    "Every product ZeroSpike has scored — filter by risk tier, category, and ZeroSpike Score. Monk fruit and stevia in, maltitol out.",
};

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([getAllProducts(), getStats()]);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-2xl">
        <span className="eyebrow">The full catalogue</span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {stats.total} products, scored against their labels
        </h1>
        <p className="mt-3 text-ink-soft">
          {stats.certified} certified safe · {stats.caution} caution ·{" "}
          {stats.disqualified} disqualified. Filter to find exactly what fits your
          blood-sugar goals.
        </p>
      </header>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
