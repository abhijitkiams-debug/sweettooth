import { getAllProducts } from "@/lib/db/repository";
import { categoryOptions } from "@/lib/admin/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const products = await getAllProducts();
  const categories = categoryOptions(products);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Add a product</h1>
      <p className="mt-1 text-ink-soft">
        Paste the ingredient label — the curation engine scores it live, and the
        score is finalised server-side on save.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
