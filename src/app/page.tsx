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
  { n: "01", title: "We read the teeny-tiny print", body: "Every ingredient list gets a proper read — the actual stuff inside, not the big promises on the front." },
  { n: "02", title: "We do the maths for you", body: "The sneaky spike-y bits get shown the door. Monk fruit, stevia, allulose and erythritol get the gold star." },
  { n: "03", title: "We keep it real", body: "Real people, real reviews, real receipts — so you can trust the vibe, not just the packaging." },
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
            <span className="eyebrow">Snacking, upgraded</span>
            <h1 className="mt-5 display text-ink">
              Have your cake.
              <br />
              And <span className="text-mint-500">eat it.</span>
            </h1>
            <p className="lede mt-6 max-w-lg">
              A joyful little pantry of cookies, chocolate, mithai and more —
              scored against what&apos;s <em>actually</em> inside. All the treat,
              none of the 3pm crash or the guilt.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/products" className="btn-primary">
                Start snacking <ArrowRight size={17} />
              </Link>
              <Link href="/methodology" className="group inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-ink">
                How the score works
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
                  <p className="text-sm text-mint-600">{p.zeroSpikeScore}/100 · green light</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Stat rule ───────── */}
      <section className="rule border-b border-ink/10">
        <div className="container-wide grid grid-cols-2 divide-x divide-ink/10 py-8 md:grid-cols-4">
          <Stat value={stats.certified} label="Green-light treats" />
          <Stat value={stats.total} label="Snacks decoded" />
          <Stat value={stats.categories} label="Cravings covered" />
          <Stat value="0" label="Sneaky sugars allowed" />
        </div>
      </section>

      {/* ───────── Manifesto ───────── */}
      <section className="bg-sand">
        <div className="container-wide py-20 md:py-28">
          <div className="max-w-4xl">
            <span className="eyebrow">Why we exist</span>
            <p className="mt-6 font-display text-headline font-medium leading-[1.15] text-ink">
              Plenty of “treats” have pulled sneaky moves over the years — a little
              maltitol here, some maltodextrin there. So we made one house rule:
              <span className="text-mint-600"> only the real ingredients get a vote.</span>{" "}
              Treats should just be treats.
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
          <span className="eyebrow">How the magic happens</span>
          <h2 className="mt-4 display-sm text-ink">No lectures. Just the good stuff, decoded.</h2>
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
            <span className="eyebrow">Crowd favourites</span>
            <h2 className="mt-3 display-sm text-ink">The ones everyone reaches for.</h2>
          </div>
          <Link href="/products" className="hidden items-center gap-1.5 text-[0.95rem] font-medium text-ink hover:text-mint-600 sm:inline-flex">
            See the whole pantry <ArrowRight size={16} />
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
          <span className="eyebrow">Craving something?</span>
          <h2 className="mt-4 display-sm text-ink">There&apos;s a happy swap for that.</h2>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...CRAVINGS, ...SWEET_TYPES.slice(0, 4)].map((c) => {
            const href = CRAVINGS.includes(c) ? `/low-gi/${c.slug}` : `/diabetic-friendly/${c.slug}`;
            const label = c.h1;
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
            Receipts, not promises
          </span>
          <blockquote className="mt-8 max-w-4xl font-display text-headline font-medium leading-[1.2]">
            “Two cookies with my evening chai and not a hint of that afternoon
            slump. Honestly, I&apos;m obsessed.”
          </blockquote>
          <p className="mt-6 text-cream/70">Kavya R. · verified buyer</p>
        </div>
      </section>

      {/* ───────── What to avoid ───────── */}
      {disqualified.length > 0 && (
        <section className="container-wide py-20 md:py-24">
          <div className="max-w-2xl">
            <span className="eyebrow !text-danger">The cheeky little naughty list</span>
            <h2 className="mt-4 display-sm text-ink">Big claims, sneaky ingredients.</h2>
            <p className="lede mt-4">
              These crowd-pleasers didn&apos;t make the cut — usually a bit of
              maltitol or maltodextrin hiding backstage. No shade, just a
              friendly heads-up.
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
            Good stuff. Zero homework.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/85">
            Browse every green-light treat, ranked by the ZeroSpike Score.
          </p>
          <Link href="/products" className="btn mt-8 bg-cream text-ink hover:bg-paper">
            Start snacking <ArrowRight size={17} />
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
