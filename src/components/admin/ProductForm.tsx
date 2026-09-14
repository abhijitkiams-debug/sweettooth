"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, FlaskConical, Save, Link2, Wand2 } from "lucide-react";
import type { IntegrationType, ProductWithRelations, RiskTier } from "@/lib/types";
import { ZeroSpikeScoreCard } from "@/components/product/ZeroSpikeScoreCard";

interface LinkRow {
  integrationType: IntegrationType;
  targetUrl: string;
  affiliateTag: string;
  couponCode: string;
  referralNote: string;
  priceINR: string;
  mrpINR: string;
  isPrimary: boolean;
}

interface EvalPreview {
  zeroSpikeScore: number;
  riskTier: RiskTier;
  netCarbsPerServe: number;
  glycemicIndex: number | null;
  primarySweetener: string;
  hasMaltitol: boolean;
  flaggedIngredients: string[];
  engine: string;
}

const INTEGRATION_OPTS: { value: IntegrationType; label: string }[] = [
  { value: "AMAZON_TAG", label: "Amazon (?tag=)" },
  { value: "FLIPKART_AFFID", label: "Flipkart (?affid=)" },
  { value: "GOAFFPRO", label: "GoAffPro (?ref=)" },
  { value: "D2C_REFERRAL", label: "D2C + coupon" },
];

const emptyLink = (): LinkRow => ({
  integrationType: "AMAZON_TAG",
  targetUrl: "",
  affiliateTag: "",
  couponCode: "",
  referralNote: "",
  priceINR: "",
  mrpINR: "",
  isPrimary: false,
});

export function ProductForm({
  categories,
  initial,
}: {
  categories: { slug: string; label: string }[];
  initial?: ProductWithRelations;
}) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [rawIngredients, setRawIngredients] = useState(initial?.rawIngredients ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? categories[0]?.slug ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrls, setImageUrls] = useState((initial?.imageUrls ?? []).join(", "));
  const [netCarbsHint, setNetCarbsHint] = useState(initial ? String(initial.netCarbsPerServe) : "");
  const [giHint, setGiHint] = useState(initial?.glycemicIndex != null ? String(initial.glycemicIndex) : "");

  // Rich, auto-fetchable details.
  const [description, setDescription] = useState(initial?.description ?? "");
  const [bulletPoints, setBulletPoints] = useState((initial?.bulletPoints ?? []).join("\n"));
  const [specs, setSpecs] = useState(
    (initial?.specs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n"),
  );
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [ratingAvg, setRatingAvg] = useState(initial?.ratingAvg != null ? String(initial.ratingAvg) : "");
  const [ratingCount, setRatingCount] = useState(initial?.ratingCount != null ? String(initial.ratingCount) : "");
  const [zerospikeOffer, setZerospikeOffer] = useState(initial?.zerospikeOffer ?? "");

  const [metaTitle, setMetaTitle] = useState(initial?.seoMeta?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.seoMeta?.metaDescription ?? "");
  const [geoAnswerBlock, setGeoAnswerBlock] = useState(initial?.seoMeta?.geoAnswerBlock ?? "");

  const [links, setLinks] = useState<LinkRow[]>(
    initial?.affiliateLinks.length
      ? initial.affiliateLinks.map((l) => ({
          integrationType: l.integrationType,
          targetUrl: l.targetUrl,
          affiliateTag: l.affiliateTag ?? "",
          couponCode: l.couponCode ?? "",
          referralNote: l.referralNote ?? "",
          priceINR: String(l.priceINR),
          mrpINR: String(l.mrpINR),
          isPrimary: l.isPrimary,
        }))
      : [{ ...emptyLink(), isPrimary: true }],
  );

  // Auto-fetch importer state.
  const [importUrl, setImportUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchNote, setFetchNote] = useState<string | null>(null);

  const [preview, setPreview] = useState<EvalPreview | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const runPreview = useCallback(async (text: string, nc: string, gi: string) => {
    if (text.trim().length < 3) {
      setPreview(null);
      return;
    }
    setEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rawIngredients: text,
          netCarbsHint: nc ? Number(nc) : undefined,
          glycemicIndexHint: gi ? Number(gi) : undefined,
        }),
      });
      const data = await res.json();
      setPreview({ ...data.evaluation, engine: data.engine });
    } catch {
      setPreview(null);
    } finally {
      setEvaluating(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runPreview(rawIngredients, netCarbsHint, giHint), 500);
    return () => clearTimeout(debounce.current);
  }, [rawIngredients, netCarbsHint, giHint, runPreview]);

  const setLink = (i: number, patch: Partial<LinkRow>) =>
    setLinks((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const setPrimary = (i: number) =>
    setLinks((rows) => rows.map((r, idx) => ({ ...r, isPrimary: idx === i })));

  const onFetch = async () => {
    if (!/^https?:\/\//i.test(importUrl.trim())) {
      setFetchNote("Paste a full product URL (https://…).");
      return;
    }
    setFetching(true);
    setFetchNote(null);
    try {
      const res = await fetch("/api/admin/fetch-product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchNote(data.error === "unauthorized" ? "Unauthorized — admin token required." : data.error || "Fetch failed.");
        return;
      }
      const d = data.draft;
      if (d.title) setTitle(d.title);
      if (d.brand) setBrand(d.brand);
      if (d.imageUrls?.length) setImageUrls(d.imageUrls.join(", "));
      if (d.description) setDescription(d.description);
      if (d.bulletPoints?.length) setBulletPoints(d.bulletPoints.join("\n"));
      if (d.tags?.length) setTags(d.tags.join(", "));
      if (d.specs?.length) setSpecs(d.specs.map((s: { label: string; value: string }) => `${s.label}: ${s.value}`).join("\n"));
      if (d.ratingAvg != null) setRatingAvg(String(d.ratingAvg));
      if (d.ratingCount != null) setRatingCount(String(d.ratingCount));

      // Fill the primary affiliate link from the detected merchant.
      setLinks((rows) => {
        const base = rows[0] ?? emptyLink();
        const first: LinkRow = {
          ...base,
          integrationType: d.affiliate?.integrationType ?? base.integrationType,
          targetUrl: d.affiliate?.targetUrl ?? base.targetUrl,
          affiliateTag: d.affiliate?.affiliateTag ?? base.affiliateTag,
          priceINR: d.price != null ? String(d.price) : base.priceINR,
          mrpINR: d.mrp != null ? String(d.mrp) : base.mrpINR,
          isPrimary: true,
        };
        return [first, ...rows.slice(1)];
      });

      const notes: string[] = [];
      if (d.source?.length) notes.push(`Filled from: ${d.source.join(", ")}.`);
      if (d.warnings?.length) notes.push(...d.warnings);
      setFetchNote(notes.join(" "));
    } catch {
      setFetchNote("Couldn't reach the fetch service.");
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const finalCategory = categorySlug === "__custom__" ? customCategory : categorySlug;

    const payload = {
      title,
      brand,
      rawIngredients,
      categorySlug: finalCategory,
      imageUrls: splitList(imageUrls, ","),
      netCarbsHint: netCarbsHint ? Number(netCarbsHint) : undefined,
      glycemicIndexHint: giHint ? Number(giHint) : undefined,
      description: description || undefined,
      bulletPoints: splitList(bulletPoints, "\n"),
      tags: splitList(tags, ","),
      specs: splitList(specs, "\n")
        .map((line) => {
          const i = line.indexOf(":");
          if (i < 0) return null;
          return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
        })
        .filter((s): s is { label: string; value: string } => Boolean(s && s.label && s.value)),
      ratingAvg: ratingAvg ? Number(ratingAvg) : undefined,
      ratingCount: ratingCount ? Number(ratingCount) : undefined,
      zerospikeOffer: zerospikeOffer || undefined,
      affiliateLinks: links
        .filter((l) => l.targetUrl.trim())
        .map((l) => ({
          integrationType: l.integrationType,
          targetUrl: l.targetUrl,
          affiliateTag: l.affiliateTag || null,
          couponCode: l.couponCode || null,
          referralNote: l.referralNote || null,
          priceINR: Number(l.priceINR || 0),
          mrpINR: Number(l.mrpINR || l.priceINR || 0),
          isPrimary: l.isPrimary,
        })),
      seo: {
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        geoAnswerBlock: geoAnswerBlock || undefined,
      },
    };

    const url = editing ? `/api/admin/products/${initial!.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === "unauthorized"
          ? "Unauthorized — set the admin token to save."
          : data.error === "validation failed"
            ? "Please fill in all required fields (title, brand, ingredients, category)."
            : "Save failed. Check the fields and try again.",
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        {/* Auto-fetch importer */}
        <fieldset className="card space-y-3 p-5">
          <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-ink">
            <Wand2 size={15} className="text-mint-600" /> Auto-fill from a product link
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Link2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                className="inp !pl-9"
                placeholder="Paste an Amazon / Flipkart / brand product URL"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
            </div>
            <button type="button" onClick={onFetch} disabled={fetching} className="btn-primary shrink-0">
              {fetching ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Fetch details
            </button>
          </div>
          {fetchNote && <p className="text-xs text-ink-muted">{fetchNote}</p>}
          <p className="text-[11px] text-ink-muted">
            We auto-fill title, images, price, bullets, description, specs, tags and rating where the
            page exposes them. Always paste the ingredient list yourself — that&apos;s what we score.
          </p>
        </fieldset>

        {/* Basics */}
        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Product basics</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title *">
              <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>
            <Field label="Brand *">
              <input className="inp" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </Field>
          </div>

          <Field label="Category *">
            <div className="flex gap-2">
              <select className="inp" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label} ({c.slug})
                  </option>
                ))}
                <option value="__custom__">+ New category…</option>
              </select>
              {categorySlug === "__custom__" && (
                <input
                  className="inp"
                  placeholder="e.g. energy-bars"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>
          </Field>

          <Field label="Raw ingredients * (the label, comma-separated)">
            <textarea
              className="inp min-h-24"
              value={rawIngredients}
              onChange={(e) => setRawIngredients(e.target.value)}
              placeholder="Almond flour, monk fruit extract, erythritol, psyllium husk…"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Net carbs / serving (g) — optional override">
              <input className="inp" type="number" step="0.1" value={netCarbsHint} onChange={(e) => setNetCarbsHint(e.target.value)} />
            </Field>
            <Field label="Glycemic index — optional override">
              <input className="inp" type="number" value={giHint} onChange={(e) => setGiHint(e.target.value)} />
            </Field>
          </div>

          <Field label="Image URLs (comma-separated, optional)">
            <input className="inp" value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} placeholder="Leave blank for a branded tile" />
          </Field>
        </fieldset>

        {/* Rich details */}
        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Product details (auto-fillable)</legend>
          <Field label="About this item (one bullet per line)">
            <textarea
              className="inp min-h-24"
              value={bulletPoints}
              onChange={(e) => setBulletPoints(e.target.value)}
              placeholder={"Sweetened only with monk fruit\n1.6g net carbs per serving\nGluten-free almond base"}
            />
          </Field>
          <Field label="Description">
            <textarea className="inp min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Specs (one “Label: value” per line)">
            <textarea
              className="inp min-h-20"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder={"Net weight: 200g\nShelf life: 6 months\nManufacturer: WonderNosh Foods"}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tags (comma-separated)">
              <input className="inp" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="keto, gluten-free" />
            </Field>
            <Field label="Rating (0–5)">
              <input className="inp" type="number" step="0.1" max={5} value={ratingAvg} onChange={(e) => setRatingAvg(e.target.value)} />
            </Field>
            <Field label="Number of ratings">
              <input className="inp" type="number" value={ratingCount} onChange={(e) => setRatingCount(e.target.value)} />
            </Field>
          </div>
          <Field label="Special offer by ZeroSpike (optional)">
            <input className="inp" value={zerospikeOffer} onChange={(e) => setZerospikeOffer(e.target.value)} placeholder="Extra 10% off with code ZEROSPIKE10" />
          </Field>
        </fieldset>

        {/* Affiliate links */}
        <fieldset className="card space-y-3 p-5">
          <legend className="px-1 text-sm font-semibold text-ink">Affiliate links</legend>
          {links.map((l, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <select className="inp !w-auto" value={l.integrationType} onChange={(e) => setLink(i, { integrationType: e.target.value as IntegrationType })}>
                  {INTEGRATION_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <input type="radio" name="primary" checked={l.isPrimary} onChange={() => setPrimary(i)} />
                  Primary
                </label>
                {links.length > 1 && (
                  <button type="button" onClick={() => setLinks((r) => r.filter((_, idx) => idx !== i))} className="ml-auto text-red-500 hover:text-red-600" title="Remove">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <input className="inp mt-2" placeholder="Target URL (product page)" value={l.targetUrl} onChange={(e) => setLink(i, { targetUrl: e.target.value })} />
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input className="inp" placeholder="Price ₹" type="number" value={l.priceINR} onChange={(e) => setLink(i, { priceINR: e.target.value })} />
                <input className="inp" placeholder="MRP ₹" type="number" value={l.mrpINR} onChange={(e) => setLink(i, { mrpINR: e.target.value })} />
                <input className="inp" placeholder="Affiliate tag" value={l.affiliateTag} onChange={(e) => setLink(i, { affiliateTag: e.target.value })} />
                <input className="inp" placeholder="Coupon code" value={l.couponCode} onChange={(e) => setLink(i, { couponCode: e.target.value })} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setLinks((r) => [...r, emptyLink()])} className="btn-outline">
            <Plus size={15} /> Add link
          </button>
        </fieldset>

        {/* SEO overrides */}
        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-ink">SEO / GEO (optional — auto-generated if blank)</legend>
          <Field label="Meta title">
            <input className="inp" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </Field>
          <Field label="Meta description">
            <textarea className="inp" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
          </Field>
          <Field label="GEO answer block (the quotable 1–2 sentence answer)">
            <textarea className="inp" value={geoAnswerBlock} onChange={(e) => setGeoAnswerBlock(e.target.value)} />
          </Field>
        </fieldset>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {editing ? "Save changes" : "Create product"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-outline">
            Cancel
          </button>
        </div>
      </div>

      {/* Live evaluation preview */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FlaskConical size={16} className="text-mint-600" />
            Live ZeroSpike evaluation
            {evaluating && <Loader2 size={14} className="animate-spin text-ink-muted" />}
          </div>

          {preview ? (
            <div className="mt-4 flex flex-col items-center gap-4">
              <ZeroSpikeScoreCard score={preview.zeroSpikeScore} tier={preview.riskTier} size={120} />
              <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <PreviewFact label="Net carbs" value={`${preview.netCarbsPerServe} g`} />
                <PreviewFact label="Glycemic index" value={preview.glycemicIndex != null ? `${preview.glycemicIndex}` : "—"} />
                <PreviewFact label="Sweetener" value={preview.primarySweetener} />
                <PreviewFact label="Maltitol" value={preview.hasMaltitol ? "Yes ⚠︎" : "No"} />
              </dl>
              {preview.flaggedIngredients.length > 0 && (
                <div className="w-full">
                  <p className="text-xs font-semibold text-ink-muted">Flagged</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {preview.flaggedIngredients.map((f) => (
                      <span key={f} className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-ink-muted">engine: {preview.engine}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              Start typing the ingredient list to see the score. The final score is
              recomputed on the server when you save.
            </p>
          )}
        </div>
      </aside>

      <style jsx>{`
        :global(.inp) {
          width: 100%;
          border-radius: 0.6rem;
          border: 1px solid rgb(27 26 21 / 0.15);
          background: white;
          padding: 0.5rem 0.7rem;
          font-size: 0.875rem;
          color: #1b1a15;
        }
        :global(.inp:focus) {
          outline: none;
          border-color: #12ad54;
        }
      `}</style>
    </form>
  );
}

function splitList(value: string, sep: string): string[] {
  return value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function PreviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}
