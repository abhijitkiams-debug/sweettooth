import Link from "next/link";
import { ChevronRight, XCircle } from "lucide-react";
import type { DirectoryEntry } from "@/data/taxonomy";
import { getProductsForEntry } from "@/lib/db/repository";
import { faqJsonLd, breadcrumbJsonLd, siteUrl } from "@/lib/engine/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { GeoClaimBlock } from "@/components/seo/GeoClaimBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqBlock } from "@/components/FaqBlock";

/**
 * Renders a programmatic directory page (a craving or sweet-type). Shared by
 * /low-gi/[craving] and /diabetic-friendly/[sweet-type].
 */
export async function DirectoryPage({
  entry,
  basePath,
  crumbLabel,
}: {
  entry: DirectoryEntry;
  basePath: string;
  crumbLabel: string;
}) {
  const { certified, cautionOrWorse } = await getProductsForEntry(entry);
  const pageUrl = `${siteUrl()}${basePath}/${entry.slug}`;

  return (
    <div className="container-page py-8 md:py-10">
      <JsonLd
        data={[
          faqJsonLd(entry.faqs),
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl() },
            { name: crumbLabel, url: `${siteUrl()}${basePath}` },
            { name: entry.h1, url: pageUrl },
          ]),
        ]}
      />

      <nav className="flex items-center gap-1 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <span className="text-ink">{crumbLabel}</span>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{entry.h1}</h1>
        <p className="mt-3 text-ink-soft">{entry.intro}</p>
      </header>

      <div className="mt-6">
        <GeoClaimBlock question={entry.question} answer={entry.answer} />
      </div>

      {certified.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-ink">Certified-safe picks</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certified.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-10 rounded-xl bg-mint-50 px-4 py-6 text-center text-ink-soft">
          We&apos;re still certifying products for this category — check back soon.
        </p>
      )}

      {cautionOrWorse.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
            <XCircle size={20} className="text-red-500" /> Watch out for these
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            These match your search but scored Caution or worse — usually a hidden
            spike ingredient.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cautionOrWorse.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold text-ink">Questions & answers</h2>
        <div className="mt-5">
          <FaqBlock faqs={entry.faqs} />
        </div>
      </section>
    </div>
  );
}
