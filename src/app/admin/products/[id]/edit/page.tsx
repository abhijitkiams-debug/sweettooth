import { notFound } from "next/navigation";
import { getAllProducts, getProductById } from "@/lib/db/repository";
import { categoryOptions } from "@/lib/admin/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, products] = await Promise.all([getProductById(params.id), getAllProducts()]);
  if (!product) notFound();
  const categories = categoryOptions(products);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Edit product</h1>
      <p className="mt-1 text-ink-soft">
        Editing <span className="font-medium text-ink">{product.title}</span>. Changing
        the ingredients re-runs the curation engine and re-scores it on save.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} initial={product} />
      </div>
    </div>
  );
}
