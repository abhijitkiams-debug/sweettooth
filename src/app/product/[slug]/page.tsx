import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { getAllSlugs, getProductBySlug, getProductsByCategory } from "@/lib/db/repository";
import { scoreIngredients } from "@/lib/engine/scoring-rules";
import {
  productJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
  geoAnswer,
  geoQuestion,
  productUrl,
  siteUrl,
} from "@/lib/engine/seo";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { titleCase } from "@/lib/utils/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { GeoClaimBlock } from "@/components/seo/GeoClaimBlock";
import { ZeroSpikeScoreCard } from "@/components/product/ZeroSpikeScoreCard";
import { GlucoseSpikeVisualizer } from "@/components/product/GlucoseSpikeVisualizer";
import { ProductImage } from "@/components/product/ProductImage";
import { AffiliateBuyBox } from "@/components/product/AffiliateBuyBox";
import { ReviewList } from "@/components/product/ReviewList";
import { YouTubeEmbed } from "@/components/product/YouTubeEmbed";
import { ProductCard } from "@/components/product/ProductCard";
import { FaqBlock } from "@/components/FaqBlock";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  const title = product.seoMeta?.metaTitle ?? `${product.title} — ${product.brand}`;
  const description = product.seoMeta?.metaDescription ?? geoAnswer(product);
  return {
    title,
    description,
    alternates: { canonical: productUrl(product.slug) },
    openGraph: { title, description, type: "website", url: productUrl(product.slug) },
  };
}

function buildFaqs(product: Awaited<ReturnType<typeof getProductBySlug>>) {
  if (!product) return [];
  const tierWord =
    product.riskTier === "CERTIFIED_SAFE"
      ? "safe for"
      : product.riskTier === "CAUTION"
        ? "usable with caution on"
        : "not recommended for";
  return [
    {
      q: `Is ${product.brand} ${product.title} safe for diabetics?`,
      a: geoAnswer(product),
    },
    {
      q: `How many net carbs are in ${product.title}?`,
      a: `${product.title} has approximately ${product.netCarbsPerServe}g net carbs per serving${
        product.glycemicIndex != null
          ? ` and an estimated glycemic index of ${product.glycemicIndex}`
          : ""
      }, making it ${tierWord} low-GI and keto diets.`,
    },
    {
      q: `What sweetener does ${product.title} use?`,
      a: `Its primary sweetener is ${product.primarySweetener}.${
        product.hasMaltitol ? " Note: it contains maltitol, which ZeroSpike flags as a spike risk." : ""
      }`,
    },
  ];
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const rules = scoreIngredients(product.rawIngredients);
  const related = (await getProductsByCategory(product.categorySlug))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);
  const faqs = buildFaqs(product);

  const categoryLabel = CATEGORY_LABELS[product.categorySlug] ?? product.categorySlug;

  return (
    <div className="container-page py-8 md:py-10">
      <JsonLd
        data={[
          productJsonLd(product),
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", url: siteUrl() },
            { name: "Products", url: `${siteUrl()}/products` },
            { name: product.title, url: productUrl(product.slug) },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={13} />
        <Link href="/products" className="hover:text-ink">Products</Link>
        <ChevronRight size={13} />
        <span className="text-ink">{product.title}</span>
      </nav>

      {/* GEO answer block at the very top (PRD §6) */}
      <div className="mt-4">
        <GeoClaimBlock
          question={geoQuestion(product)}
          answer={geoAnswer(product)}
          score={product.zeroSpikeScore}
        />
      </div>

      {/* Main layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <ProductImage
              slug={product.slug}
              title={product.title}
              tier={product.riskTier}
              imageUrls={product.imageUrls}
              aspect="aspect-square"
            />
            <div>
              <span className="text-sm font-medium text-ink-muted">
                {categoryLabel} · {product.brand}
              </span>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-ink">
                {product.title}
              </h1>
              <div className="mt-4 flex items-center gap-5">
                <ZeroSpikeScoreCard score={product.zeroSpikeScore} tier={product.riskTier} size={110} />
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Fact label="Net carbs" value={`${product.netCarbsPerServe} g`} />
                  <Fact label="Glycemic index" value={product.glycemicIndex != null ? `${product.glycemicIndex}` : "—"} />
                  <Fact label="Sweetener" value={product.primarySweetener} />
                  <Fact label="Maltitol" value={product.hasMaltitol ? "Yes ⚠︎" : "No"} />
                </dl>
              </div>
            </div>
          </div>

          <GlucoseSpikeVisualizer
            tier={product.riskTier}
            score={product.zeroSpikeScore}
            glycemicIndex={product.glycemicIndex}
          />

          {/* Ingredient breakdown */}
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Ingredient breakdown</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{product.rawIngredients}</p>

            {(rules.approvedFound.length > 0 || rules.flaggedIngredients.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {rules.approvedFound.map((i) => (
                  <span key={`ok-${i}`} className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1 text-xs font-medium text-mint-800 ring-1 ring-inset ring-mint-200">
                    <ShieldCheck size={13} /> {titleCase(i)}
                  </span>
                ))}
                {rules.flaggedIngredients.map((i) => (
                  <span key={`flag-${i}`} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-200">
                    <AlertTriangle size={13} /> {titleCase(i)}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* CGM proof / videos */}
          {product.youtubeVideos.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                <Sparkles size={18} className="text-mint-600" /> Blood-sugar test videos
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {product.youtubeVideos.map((v) => (
                  <YouTubeEmbed key={v.id} video={v} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">
              What people (and their CGMs) say
            </h2>
            <div className="mt-4">
              <ReviewList reviews={product.reviews} />
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Frequently asked</h2>
            <div className="mt-4">
              <FaqBlock faqs={faqs} />
            </div>
          </section>
        </div>

        {/* Sticky buy rail */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <AffiliateBuyBox productSlug={product.slug} links={product.affiliateLinks} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">More {categoryLabel}</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}
