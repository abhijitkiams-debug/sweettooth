import Link from "next/link";
import {
  ShieldCheck,
  ScanLine,
  Activity,
  XCircle,
  ArrowRight,
  Leaf,
  FlaskConical,
} from "lucide-react";
import { getFeaturedProducts, getStats, getProductsByTier } from "@/lib/db/repository";
import { ProductCard } from "@/components/product/ProductCard";
import { CRAVINGS, SWEET_TYPES } from "@/data/taxonomy";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/engine/seo";

export const revalidate = 3600;

const HOW = [
  {
    icon: ScanLine,
    title: "We read the label",
    body: "Every product's full ingredient list is parsed by our curation engine — no marketing claims, just what's actually inside.",
  },
  {
    icon: FlaskConical,
    title: "We score the spike",
    body: "Hard-fail additives like maltitol and maltodextrin disqualify instantly. Monk fruit, stevia, allulose and erythritol earn certification.",
  },
  {
    icon: Activity,
    title: "We verify with CGM proof",
    body: "Where possible we surface continuous-glucose-monitor readings and blood-sugar tests from real users and reviewers.",
  },
];

export default async function HomePage() {
  const [featured, stats, disqualified] = await Promise.all([
    getFeaturedProducts(6),
    getStats(),
    getProductsByTier("DISQUALIFIED"),
  ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZeroSpike",
    url: siteUrl(),
    description:
      "ZeroSpike scores packaged foods for blood-sugar safety against their ingredient labels.",
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-b from-mint-50/70 to-cream">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <span className="eyebrow inline-flex items-center gap-1.5">
              <Leaf size={14} /> Low-GI, verified from the label up
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
              Sweet without the <span className="text-mint-600">spike.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              ZeroSpike scores diabetic-friendly and keto foods against their real
              ingredients. Monk fruit and stevia in — maltitol out. Every score is
              CGM-backed where we can prove it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Browse certified foods <ArrowRight size={16} />
              </Link>
              <Link href="/methodology" className="btn-outline">
                How we score
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <Stat value={`${stats.certified}`} label="Certified safe" />
              <Stat value={`${stats.total}`} label="Products scored" />
              <Stat value={`${stats.categories}`} label="Categories" />
            </dl>
          </div>

          <div className="animate-fade-up">
            <div className="card p-6">
              <div className="flex items-center gap-2 text-mint-700">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold">The ZeroSpike test</span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <RuleRow ok label="Monk Fruit, Stevia, Allulose, Erythritol" note="Approved sweeteners" />
                <RuleRow ok label="Almond & coconut flour, psyllium, flax" note="Approved bases" />
                <RuleRow label="Sorbitol, Xylitol, Sucralose, maida" note="Caution" warn />
                <RuleRow label="Maltitol, HFCS, Dextrose, Maltodextrin" note="Instant disqualification" />
              </ul>
              <p className="mt-5 rounded-xl bg-mint-50 px-4 py-3 text-xs text-mint-800">
                Score = 100 − glycemic penalty − additive penalty. A hard-fail
                ingredient forces a 0, no matter the marketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by craving */}
      <section className="container-page py-14">
        <SectionHeading eyebrow="Programmatic directory" title="Find a low-GI swap for any craving" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...CRAVINGS, ...SWEET_TYPES.slice(0, 4)].map((c) => (
            <Link
              key={c.slug}
              href={
                CRAVINGS.includes(c) ? `/low-gi/${c.slug}` : `/diabetic-friendly/${c.slug}`
              }
              className="card flex items-center justify-between gap-2 p-4 transition hover:border-mint-300 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-ink">{c.h1.replace(/^Low-GI |^Diabetic-Friendly |^Safe /, "")}</span>
              <ArrowRight size={16} className="text-mint-600" />
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-page py-14">
          <SectionHeading eyebrow="How ZeroSpike works" title="No hype. Just the ingredient truth." />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW.map((h) => (
              <div key={h.title} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-mint-600 text-white">
                  <h.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured certified */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Certified safe" title="Top-scoring picks" />
          <Link href="/products" className="hidden text-sm font-semibold text-mint-700 hover:text-mint-800 sm:inline-flex sm:items-center sm:gap-1">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* What to avoid — trust/honesty */}
      {disqualified.length > 0 && (
        <section className="border-t border-ink/10 bg-red-50/40">
          <div className="container-page py-14">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle size={18} />
              <span className="eyebrow !text-red-700">We tell you what to avoid</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Disqualified: “sugar-free” that still spikes
            </h2>
            <p className="mt-2 max-w-2xl text-ink-soft">
              These popular products fail the ZeroSpike test — usually because
              they hide maltitol or maltodextrin behind a “sugar-free” label.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {disqualified.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-semibold text-ink">{value}</dt>
      <dd className="text-xs text-ink-muted">{label}</dd>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
    </div>
  );
}

function RuleRow({
  label,
  note,
  ok,
  warn,
}: {
  label: string;
  note: string;
  ok?: boolean;
  warn?: boolean;
}) {
  const color = ok ? "text-mint-600" : warn ? "text-amber-500" : "text-red-500";
  const Icon = ok ? ShieldCheck : warn ? Activity : XCircle;
  return (
    <li className="flex items-start gap-3">
      <Icon size={17} className={`mt-0.5 shrink-0 ${color}`} />
      <span>
        <span className="font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink-muted">{note}</span>
      </span>
    </li>
  );
}
