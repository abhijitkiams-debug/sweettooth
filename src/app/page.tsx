import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getFeaturedProducts, getStats, getProductsByTier, getAllProducts } from "@/lib/db/repository";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { CRAVINGS, SWEET_TYPES, CATEGORIES } from "@/data/taxonomy";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/engine/seo";

export const revalidate = 3600;

const STEPS = [
  { n: "01", title: "We read the label", body: "Every ingredient list is parsed by our curation engine — not the marketing on the front." },
  { n: "02", title: "We score the spike", body: "Maltitol and maltodextrin disqualify instantly. Monk fruit, stevia, allulose and erythritol earn certification." },
  { n: "03", title: "We prove it flat", body: "We surface real continuous-glucose-monitor readings so you can see the response, not just trust it." },
];

export default async function HomePage() {
  const [featured, stats, disqualified, all] = await Promise.all([
    getFeaturedProducts(8),
    getStats(),
    getProductsByTier("DISQUALIFIED"),
    getAllProducts(),
  ]);

  const heroProducts = featured.slice(0, 2);
  const grid = featured.slice(0, 6);

  // Categories that have products, in merchandising rank order.
  const catCounts = new Map<string, number>();
  for (const p of all) catCounts.set(p.categorySlug, (catCounts.get(p.categorySlug) ?? 0) + 1);
  const shopCategories = CATEGORIES.filter((c) => catCounts.has(c.slug));

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZeroSpike",
    url: siteUrl(),
    description: "ZeroSpike scores packaged foods for blood-sugar safety against their ingredient labels.",
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />

      {/* ───────── Hero ───────── */}
      <section className="container-wide pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-fade-up">
            <span className="eyebrow">Low-GI living, verified</span>
            <h1 className="mt-5 display text-ink">
              Eat sweet.
              <br />
              Stay <span className="text-mint-500">flat.</span>
            </h1>
            <p className="lede mt-6 max-w-lg">
              A curated pantry of diabetic-friendly and keto foods, scored against
              their real ingredients. The treats you love — without the spike you
              don&apos;t.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/products" className="btn-primary">
                Explore the pantry <ArrowRight size={17} />
              </Link>
              <Link href="/methodology" className="group inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-ink">
                How we score
                <span className="transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            </div>
          </div>

          {/* Lifestyle collage */}
          <div className="animate-fade-up">
            <div className="grid grid-cols-2 gap-4">
              {heroProducts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className={i === 1 ? "mt-10" : ""}
                >
                  <ProductImage
                    slug={p.slug}
                    title={p.title}
                    categorySlug={p.categorySlug}
                    imageUrls={p.imageUrls}
                    overline={p.brand}
                    aspect="aspect-[3/4]"
                  />
                  <p className="mt-2.5 font-display text-lg leading-tight text-ink">{p.title}</p>
                  <p className="text-sm text-mint-600">{p.zeroSpikeScore}/100 · certified</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Stat rule ───────── */}
      <section className="rule border-b border-ink/10">
        <div className="container-wide grid grid-cols-2 divide-x divide-ink/10 py-8 md:grid-cols-4">
          <Stat value={stats.certified} label="Certified safe" />
          <Stat value={stats.total} label="Products scored" />
          <Stat value={stats.categories} label="Categories" />
          <Stat value="0" label="Maltitol allowed" />
        </div>
      </section>

      {/* ───────── Manifesto ───────── */}
      <section className="bg-sand">
        <div className="container-wide py-20 md:py-28">
          <div className="max-w-4xl">
            <span className="eyebrow">Why ZeroSpike</span>
            <p className="mt-6 font-display text-headline font-medium leading-[1.15] text-ink">
              “Sugar-free” has been lying to us for years. Maltitol spikes. Maltodextrin
              spikes. We built ZeroSpike so a label can&apos;t hide behind a claim —
              <span className="text-mint-600"> only the ingredients get a vote.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Shop by category (ranked) ───────── */}
      <section className="container-wide py-20 md:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">Shop by category</span>
          <h2 className="mt-4 display-sm text-ink">Start with the good stuff.</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shopCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/products#${c.slug}`}
              className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-3xl p-5 transition hover:-translate-y-1"
              style={{ backgroundColor: c.tint }}
            >
              <span
                className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                style={{ color: c.accent }}
              >
                {catCounts.get(c.slug)} picks
              </span>
              <div>
                <span
                  className="pointer-events-none absolute -right-3 -top-4 font-display text-7xl font-bold opacity-20"
                  style={{ color: c.accent }}
                  aria-hidden
                >
                  {c.label.charAt(0)}
                </span>
                <h3 className="font-display text-xl font-semibold leading-tight text-ink">
                  {c.label}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm" style={{ color: c.accent }}>
                  Shop <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="container-wide py-20 md:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">The method</span>
          <h2 className="mt-4 display-sm text-ink">No hype. Just the ingredient truth.</h2>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-display text-4xl font-semibold text-mint-300">{s.n}</span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Featured ───────── */}
      <section className="container-wide pb-6">
        <div className="flex items-end justify-between border-t border-ink/10 pt-10">
          <div>
            <span className="eyebrow">The edit</span>
            <h2 className="mt-3 display-sm text-ink">Top-scoring picks</h2>
          </div>
          <Link href="/products" className="hidden items-center gap-1.5 text-[0.95rem] font-medium text-ink hover:text-mint-600 sm:inline-flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {grid.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ───────── Browse by craving ───────── */}
      <section className="container-wide py-20 md:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">Find your swap</span>
          <h2 className="mt-4 display-sm text-ink">A low-GI answer for every craving.</h2>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...CRAVINGS, ...SWEET_TYPES.slice(0, 4)].map((c) => {
            const href = CRAVINGS.includes(c) ? `/low-gi/${c.slug}` : `/diabetic-friendly/${c.slug}`;
            const label = c.h1.replace(/^Low-GI |^Diabetic-Friendly |^Safe |^Best /, "");
            return (
              <Link
                key={c.slug}
                href={href}
                className="group flex items-center justify-between gap-2 rounded-2xl bg-paper px-5 py-5 ring-1 ring-ink/[0.06] transition hover:ring-mint-300"
              >
                <span className="font-display text-lg font-medium text-ink">{label}</span>
                <ArrowUpRight size={18} className="text-ink-muted transition group-hover:text-mint-600" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── CGM quote / lifestyle proof ───────── */}
      <section className="bg-ink text-cream">
        <div className="container-wide py-20 md:py-28">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-mint-300">
            Proof, on a monitor
          </span>
          <blockquote className="mt-8 max-w-4xl font-display text-headline font-medium leading-[1.2]">
            “Wore my Libre and stayed flat at 96 mg/dL two hours after two cookies.
            Finally a treat that doesn&apos;t spike.”
          </blockquote>
          <p className="mt-6 text-cream/70">Dr. Kavya R. · CGM-verified review</p>
        </div>
      </section>

      {/* ───────── What to avoid ───────── */}
      {disqualified.length > 0 && (
        <section className="container-wide py-20 md:py-24">
          <div className="max-w-2xl">
            <span className="eyebrow !text-danger">We tell you what to avoid</span>
            <h2 className="mt-4 display-sm text-ink">“Sugar-free” that still spikes.</h2>
            <p className="lede mt-4">
              These popular products fail the ZeroSpike test — usually because they
              hide maltitol or maltodextrin behind the label.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
            {disqualified.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── Final CTA ───────── */}
      <section className="container-wide pb-24">
        <div className="rounded-3xl bg-mint-600 px-8 py-16 text-center text-cream md:py-20">
          <h2 className="display-sm mx-auto max-w-3xl !text-cream">
            Your pantry, minus the guesswork.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/85">
            Browse every certified-safe food, ranked by ZeroSpike Score.
          </p>
          <Link href="/products" className="btn mt-8 bg-cream text-ink hover:bg-paper">
            Explore the pantry <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-4 first:pl-0">
      <div className="font-display text-4xl font-semibold text-ink md:text-5xl">{value}</div>
      <div className="mt-1 text-sm text-ink-muted">{label}</div>
    </div>
  );
}
