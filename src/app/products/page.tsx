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
    <div className="container-wide py-12 md:py-16">
      <header className="max-w-3xl">
        <span className="eyebrow">The pantry</span>
        <h1 className="mt-4 display-sm text-ink">Every food, scored against its label.</h1>
        <p className="lede mt-5">
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
