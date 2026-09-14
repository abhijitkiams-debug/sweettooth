import type { Metadata } from "next";
import { getAllProducts } from "@/lib/db/repository";
import { ProductGrid } from "@/components/product/ProductGrid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop everything",
  description:
    "Every treat on ZeroSpike — cookies, chocolate, mithai, ice cream and more. Browse by category, filter and sort your way to a new favourite.",
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="container-wide py-12 md:py-16">
      <header className="max-w-3xl">
        <span className="eyebrow">The whole pantry</span>
        <h1 className="mt-4 display-sm text-ink">Everything, in one happy place.</h1>
        <p className="lede mt-5">Browse by category, or filter and sort your way to a new favourite.</p>
      </header>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
