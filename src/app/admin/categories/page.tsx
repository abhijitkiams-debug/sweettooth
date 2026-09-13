import Link from "next/link";
import { FolderTree, ArrowUpRight } from "lucide-react";
import { getAllProducts } from "@/lib/db/repository";
import { categoryMapping } from "@/lib/admin/categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const products = await getAllProducts();
  const rows = categoryMapping(products);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-ink">
        <FolderTree size={26} className="text-mint-600" /> Category mapping
      </h1>
      <p className="mt-1 max-w-2xl text-ink-soft">
        Each product&apos;s <code className="rounded bg-ink/5 px-1">categorySlug</code> decides
        which programmatic SEO pages surface it. Assign a product&apos;s category on its edit
        form; this view shows how each category flows into the low-GI and diabetic-friendly
        directories.
      </p>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.slug} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{row.label}</h2>
                <code className="text-xs text-ink-muted">{row.slug}</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Pill className="bg-ink/5 text-ink-soft">{row.total} total</Pill>
                {row.certified > 0 && <Pill className="bg-mint-50 text-mint-700">{row.certified} certified</Pill>}
                {row.caution > 0 && <Pill className="bg-amber-50 text-amber-700">{row.caution} caution</Pill>}
                {row.disqualified > 0 && <Pill className="bg-red-50 text-red-700">{row.disqualified} disqualified</Pill>}
              </div>
            </div>

            <div className="mt-3 border-t border-ink/10 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Surfaces on these directory pages
              </p>
              {row.directoryPages.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {row.directoryPages.map((d) => (
                    <Link
                      key={d.href}
                      href={d.href}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-800 hover:bg-mint-100"
                    >
                      {d.label} <ArrowUpRight size={12} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-ink-muted">
                  Not yet mapped to a directory page. Add a matching craving/sweet-type in{" "}
                  <code className="rounded bg-ink/5 px-1">src/data/taxonomy.ts</code> to feature it.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2 py-0.5 font-semibold ${className}`}>{children}</span>;
}
