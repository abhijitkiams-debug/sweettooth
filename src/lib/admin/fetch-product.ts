import { getLLM, extractJson } from "@/lib/llm";
import type { IntegrationType, ProductSpec } from "@/lib/types";

/**
 * Best-effort product-detail enrichment from a pasted URL.
 *
 * Strategy (merge, most-reliable-first):
 *   1. Detect merchant + product id (ASIN / Flipkart pid) from the URL.
 *   2. Fetch the page HTML with a browser-like UA.
 *   3. Extract structured data: schema.org/Product JSON-LD, then Open Graph /
 *      meta tags, then a few merchant-specific selectors.
 *   4. If an LLM provider is configured, ask it to extract the remaining fields
 *      (bullets, tags, description, brand) from the visible page text.
 *
 * Everything is graceful: if a page blocks scraping (Amazon often does), we
 * return whatever we could get plus warnings, and the admin fills the rest.
 * For guaranteed Amazon data, wire a paid provider (PA-API / Rainforest) via
 * FETCH_PROVIDER_* env — see README.
 */

export interface ProductDraft {
  title?: string;
  brand?: string;
  imageUrls: string[];
  description?: string;
  bulletPoints: string[];
  specs: ProductSpec[];
  tags: string[];
  ratingAvg?: number;
  ratingCount?: number;
  price?: number;
  mrp?: number;
  offers: string[];
  affiliate: {
    integrationType: IntegrationType;
    targetUrl: string;
    asinOrNodeId?: string;
    affiliateTag?: string;
  };
  source: string[];
  warnings: string[];
}

interface MerchantInfo {
  integrationType: IntegrationType;
  asinOrNodeId?: string;
  affiliateTag?: string;
  cleanUrl: string;
}

function detectMerchant(rawUrl: string): MerchantInfo {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { integrationType: "D2C_REFERRAL", cleanUrl: rawUrl };
  }
  const host = url.hostname.toLowerCase();

  if (host.includes("amazon.")) {
    const m = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
    const asin = m?.[1];
    const clean = asin ? `${url.origin}/dp/${asin}` : `${url.origin}${url.pathname}`;
    return {
      integrationType: "AMAZON_TAG",
      asinOrNodeId: asin,
      affiliateTag: process.env.NEXT_PUBLIC_DEFAULT_AMAZON_TAG || "zerospike-21",
      cleanUrl: clean,
    };
  }
  if (host.includes("flipkart.")) {
    const pid = url.searchParams.get("pid") ?? undefined;
    return {
      integrationType: "FLIPKART_AFFID",
      asinOrNodeId: pid,
      affiliateTag: "zerospike",
      cleanUrl: `${url.origin}${url.pathname}${pid ? `?pid=${pid}` : ""}`,
    };
  }
  return { integrationType: "D2C_REFERRAL", cleanUrl: `${url.origin}${url.pathname}` };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, key: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
    "i",
  );
  return html.match(re)?.[1] ?? html.match(alt)?.[1];
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Pull the first schema.org Product node out of any JSON-LD blocks. */
function parseJsonLdProduct(html: string): Record<string, unknown> | null {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const nodes: Record<string, unknown>[] = [];
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b[1].trim());
      const arr = Array.isArray(parsed) ? parsed : parsed["@graph"] ? parsed["@graph"] : [parsed];
      for (const node of arr) if (node && typeof node === "object") nodes.push(node);
    } catch {
      /* ignore malformed block */
    }
  }
  return (
    nodes.find((n) => {
      const t = n["@type"];
      return t === "Product" || (Array.isArray(t) && t.includes("Product"));
    }) ?? null
  );
}

function applyJsonLd(draft: ProductDraft, node: Record<string, unknown>) {
  if (typeof node.name === "string") draft.title ??= node.name;
  if (typeof node.description === "string") draft.description ??= node.description;

  const brand = node.brand as { name?: string } | string | undefined;
  if (typeof brand === "string") draft.brand ??= brand;
  else if (brand?.name) draft.brand ??= brand.name;

  const image = node.image as string | string[] | { url?: string } | undefined;
  if (typeof image === "string") draft.imageUrls.push(image);
  else if (Array.isArray(image)) draft.imageUrls.push(...image.filter((x) => typeof x === "string"));
  else if (image?.url) draft.imageUrls.push(image.url);

  const rating = node.aggregateRating as
    | { ratingValue?: unknown; reviewCount?: unknown; ratingCount?: unknown }
    | undefined;
  if (rating) {
    draft.ratingAvg ??= toNumber(rating.ratingValue);
    draft.ratingCount ??= toNumber(rating.reviewCount ?? rating.ratingCount);
  }

  const offers = node.offers as
    | { price?: unknown; lowPrice?: unknown; highPrice?: unknown; priceCurrency?: unknown }
    | Array<{ price?: unknown }>
    | undefined;
  const firstOffer = Array.isArray(offers) ? offers[0] : offers;
  if (firstOffer) {
    draft.price ??= toNumber((firstOffer as { price?: unknown }).price ?? (firstOffer as { lowPrice?: unknown }).lowPrice);
    draft.mrp ??= toNumber((firstOffer as { highPrice?: unknown }).highPrice);
  }

  const props = node.additionalProperty as Array<{ name?: string; value?: unknown }> | undefined;
  if (Array.isArray(props)) {
    for (const p of props) {
      if (p?.name && p.value != null) draft.specs.push({ label: String(p.name), value: String(p.value) });
    }
  }
}

async function llmExtract(draft: ProductDraft, text: string) {
  const llm = getLLM();
  if (!llm || text.length < 40) return;
  try {
    const raw = await llm.complete({
      system:
        "You extract e-commerce product details from page text. Respond with ONLY a JSON object: " +
        '{"title":string,"brand":string,"description":string,"bulletPoints":string[],' +
        '"tags":string[],"specs":[{"label":string,"value":string}],"ratingAvg":number|null,' +
        '"ratingCount":number|null,"price":number|null,"mrp":number|null}. ' +
        "bulletPoints = the 'About this item' feature lines. tags = 4-8 short keywords. " +
        "Use null/empty when unknown. Prices as plain numbers (INR).",
      prompt: `Product page text:\n"""${text.slice(0, 12000)}"""`,
      maxTokens: 900,
    });
    const j = JSON.parse(extractJson(raw)) as Record<string, unknown>;
    draft.title ??= typeof j.title === "string" ? j.title : undefined;
    draft.brand ??= typeof j.brand === "string" ? j.brand : undefined;
    draft.description ??= typeof j.description === "string" ? j.description : undefined;
    if (Array.isArray(j.bulletPoints) && !draft.bulletPoints.length)
      draft.bulletPoints = j.bulletPoints.filter((x) => typeof x === "string").slice(0, 10);
    if (Array.isArray(j.tags) && !draft.tags.length)
      draft.tags = j.tags.filter((x) => typeof x === "string").slice(0, 8);
    if (Array.isArray(j.specs) && !draft.specs.length)
      draft.specs = (j.specs as ProductSpec[])
        .filter((s) => s && s.label && s.value)
        .map((s) => ({ label: String(s.label), value: String(s.value) }))
        .slice(0, 12);
    draft.ratingAvg ??= toNumber(j.ratingAvg);
    draft.ratingCount ??= toNumber(j.ratingCount);
    draft.price ??= toNumber(j.price);
    draft.mrp ??= toNumber(j.mrp);
    draft.source.push(`llm:${llm.name}`);
  } catch {
    /* LLM extraction is best-effort */
  }
}

export async function fetchProductDraft(rawUrl: string): Promise<ProductDraft> {
  const merchant = detectMerchant(rawUrl);
  const draft: ProductDraft = {
    imageUrls: [],
    bulletPoints: [],
    specs: [],
    tags: [],
    offers: [],
    affiliate: {
      integrationType: merchant.integrationType,
      targetUrl: merchant.cleanUrl,
      asinOrNodeId: merchant.asinOrNodeId,
      affiliateTag: merchant.affiliateTag,
    },
    source: [],
    warnings: [],
  };

  let html = "";
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(t);
    if (!res.ok) {
      draft.warnings.push(`Page returned HTTP ${res.status} — some fields could not be fetched.`);
    } else {
      html = await res.text();
    }
  } catch {
    draft.warnings.push(
      "Couldn't load the page (it may block automated requests). Fill in the details manually, or configure a fetch provider.",
    );
  }

  if (html) {
    const jsonLd = parseJsonLdProduct(html);
    if (jsonLd) {
      applyJsonLd(draft, jsonLd);
      draft.source.push("json-ld");
    }
    // Open Graph / meta fallback.
    draft.title ??= metaContent(html, "og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    draft.description ??= metaContent(html, "og:description") ?? metaContent(html, "description");
    const ogImg = metaContent(html, "og:image");
    if (ogImg && !draft.imageUrls.includes(ogImg)) draft.imageUrls.push(ogImg);
    draft.price ??= toNumber(metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount"));
    draft.brand ??= metaContent(html, "og:brand") ?? metaContent(html, "product:brand");
    if (draft.source.length) {
      /* had structured data */
    } else if (draft.title) {
      draft.source.push("opengraph");
    }

    // LLM pass fills bullets/tags/specs/brand from visible text.
    await llmExtract(draft, stripTags(html));
  }

  if (draft.title) draft.title = decodeEntities(draft.title);
  if (draft.description) draft.description = decodeEntities(draft.description);

  // De-dupe images, cap.
  draft.imageUrls = [...new Set(draft.imageUrls)].slice(0, 6);

  if (!draft.title) draft.warnings.push("Couldn't detect a product title — please enter it manually.");
  draft.warnings.push("Ingredient list can't be read from most product pages — paste it so we can score the product.");

  return draft;
}
