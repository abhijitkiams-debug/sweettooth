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

      <header className="mt-4 max-w-3xl">
        <h1 className="display-sm text-ink">{entry.h1}</h1>
        <p className="lede mt-5">{entry.intro}</p>
      </header>

      <div className="mt-6">
        <GeoClaimBlock question={entry.question} answer={entry.answer} />
      </div>

      {certified.length > 0 ? (
        <section className="mt-10">
          <h2 className="display-sm text-ink">Green-light picks</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {certified.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-10 rounded-xl bg-mint-50 px-4 py-6 text-center text-ink-soft">
          New green-light picks are on the way for this one — check back soon!
        </p>
      )}

      {cautionOrWorse.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 display-sm text-ink">
            <XCircle size={26} className="text-danger" /> Maybe save these for later
          </h2>
          <p className="mt-3 text-ink-soft">
            These matched your craving but landed in go-easy or hard-pass — usually
            a sneaky ingredient backstage. Just a friendly heads-up.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
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
