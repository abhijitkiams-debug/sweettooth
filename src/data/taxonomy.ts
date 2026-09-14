import type { Product } from "@/lib/types";
import { humanizeSlug } from "@/lib/utils/format";

/**
 * Programmatic-SEO taxonomy. Each craving / sweet-type is an indexable landing
 * page (PRD §6). A directory entry maps a keyword slug to the products that
 * answer it (by category and/or an explicit match predicate) plus the curated
 * intro + FAQ copy that makes the page content-rich and GEO-friendly.
 */
export interface DirectoryEntry {
  slug: string;
  h1: string;
  /** The exact question a user would ask an LLM. */
  question: string;
  /** 1-2 sentence answer-first block, lifted into AI answers. */
  answer: string;
  intro: string;
  /** Category slugs whose products belong on this page. */
  categorySlugs: string[];
  /** Extra keyword to match against title/brand/ingredients. */
  matchKeywords?: string[];
  faqs: { q: string; a: string }[];
}

export const CRAVINGS: DirectoryEntry[] = [
  {
    slug: "rice-alternative",
    h1: "Low-GI Rice Alternatives",
    question: "What is the best low-GI alternative to white rice for diabetics?",
    answer:
      "The best low-GI rice alternatives are konjac (shirataki) rice and resistant-starch blends, which have a glycemic index of 8–20 versus ~73 for white rice. ZeroSpike-certified options carry 1–5g net carbs per serving and keep post-meal glucose nearly flat.",
    intro:
      "Rice, but make it chill. These swaps give you the big comforting bowl without the afternoon nosedive — ranked, of course, by ZeroSpike Score.",
    categorySlugs: ["staples"],
    matchKeywords: ["rice", "konjac"],
    faqs: [
      {
        q: "Is konjac rice safe for diabetics?",
        a: "Yes. Konjac (shirataki) rice is almost pure glucomannan fiber with ~1g net carbs and a glycemic index near 8, making it one of the safest rice alternatives for diabetics.",
      },
      {
        q: "Does brown rice count as low-GI?",
        a: "Only marginally. Brown rice has a glycemic index around 68 — better than white rice but still high. Konjac or resistant-starch blends are far safer for blood-sugar control.",
      },
    ],
  },
  {
    slug: "roti-alternative",
    h1: "Low-GI Roti & Atta Alternatives",
    question: "What flour makes the lowest-GI roti for diabetics?",
    answer:
      "The lowest-GI roti is made from almond flour, coconut flour, flaxseed meal and psyllium husk blends (GI ~12) rather than wheat atta (GI ~62). ZeroSpike-certified keto atta keeps net carbs to 3–5g per roti.",
    intro:
      "Soft, foldable, ghee-ready rotis — minus the post-lunch slump. These almond-, coconut- and flax-based attas roll out beautifully and behave themselves.",
    categorySlugs: ["flours"],
    matchKeywords: ["roti", "atta", "flour"],
    faqs: [
      {
        q: "Why does wheat roti spike blood sugar?",
        a: "Wheat atta is mostly starch that digests into glucose quickly, giving it a glycemic index around 62. Almond/coconut/psyllium blends replace most of that starch with fat and fiber.",
      },
      {
        q: "Do keto atta rotis taste like normal rotis?",
        a: "They are softer and nuttier. A little psyllium husk and warm water gives them the pliability to roll and puff like wheat rotis.",
      },
    ],
  },
  {
    slug: "sugar-alternative",
    h1: "Safe Sugar Alternatives (Zero Spike)",
    question: "Which sugar substitutes do not raise blood sugar?",
    answer:
      "Monk fruit, stevia (Reb-M/Reb-A), allulose and erythritol do not meaningfully raise blood sugar and are ZeroSpike-approved. Avoid maltitol, isomalt, dextrose and maltodextrin, which have a high glycemic index despite 'sugar-free' labels.",
    intro:
      "Not all 'sugar-free' is created equal (some of it's a bit of a fibber). These picks stick to the good sweeteners — monk fruit, stevia, allulose, erythritol — and skip the sneaky stuff.",
    categorySlugs: ["chocolate", "cookies", "mithai"],
    matchKeywords: ["monk fruit", "stevia", "erythritol", "allulose"],
    faqs: [
      {
        q: "Is maltitol a safe sugar substitute?",
        a: "No. Maltitol has a glycemic index of about 35–52 (and up to 74 in some products) and commonly causes bloating. ZeroSpike disqualifies any product whose primary sweetener is maltitol.",
      },
      {
        q: "Is erythritol safe for diabetics?",
        a: "Yes. Erythritol has a glycemic index of 0, is largely excreted unchanged, and is one of ZeroSpike's four approved sweeteners.",
      },
    ],
  },
  {
    slug: "chocolate-alternative",
    h1: "Low-GI & Sugar-Free Chocolate",
    question: "What is the best sugar-free chocolate that won't spike blood sugar?",
    answer:
      "The best diabetic-friendly chocolates are sweetened with stevia or erythritol (not maltitol) and have 2–3g net carbs. ZeroSpike-certified dark chocolates keep glycemic index in the low teens.",
    intro:
      "Chocolate that just wants to be chocolate. These bars lean on stevia, monk fruit or erythritol — no maltitol pretending to be innocent.",
    categorySlugs: ["chocolate"],
    matchKeywords: ["chocolate", "cocoa"],
    faqs: [
      {
        q: "Why is maltitol chocolate bad for diabetics?",
        a: "Maltitol is a sugar alcohol with a glycemic index near sugar in some formulations, so maltitol-sweetened chocolate can spike blood sugar and cause digestive distress.",
      },
    ],
  },
];

export const SWEET_TYPES: DirectoryEntry[] = [
  {
    slug: "kaju-katli",
    h1: "Diabetic-Friendly Kaju Katli",
    question: "Is there a diabetic-friendly kaju katli that won't spike blood sugar?",
    answer:
      "Yes — kaju katli made from cashews sweetened with erythritol and monk fruit (no sugar, no maltitol) is diabetic-friendly, with ~3g net carbs per piece and a glycemic index under 20. ZeroSpike certifies these at 80+.",
    intro:
      "The festive favourite, reimagined. All the cashew-and-cardamom, melt-in-the-mouth magic — none of the sugar avalanche. Gift it, graze it, repeat.",
    categorySlugs: ["mithai"],
    matchKeywords: ["kaju", "katli", "cashew"],
    faqs: [
      {
        q: "How much sugar is in normal kaju katli?",
        a: "Traditional kaju katli is around 45–55% sugar by weight, which is why it spikes blood sugar quickly. Erythritol/monk-fruit versions remove that sugar entirely.",
      },
    ],
  },
  {
    slug: "cookies",
    h1: "Diabetic-Friendly Cookies & Biscuits",
    question: "Which cookies are safe for diabetics?",
    answer:
      "Diabetic-safe cookies are baked from almond or coconut flour and sweetened with monk fruit or erythritol, giving 1–3g net carbs and a glycemic index in the low teens. Avoid 'protein' cookies that use maltodextrin or dextrose.",
    intro:
      "A cookie should spark joy, not a nap. These almond-flour, monk-fruit bakes keep things steady — and we cheerfully call out the 'protein' cookies hiding maltodextrin.",
    categorySlugs: ["cookies"],
    matchKeywords: ["cookie", "biscuit"],
    faqs: [
      {
        q: "Are 'high-protein' cookies good for diabetics?",
        a: "Not always. Many use maltodextrin or dextrose as binders — both have a very high glycemic index. Always check the label; ZeroSpike disqualifies these regardless of protein content.",
      },
    ],
  },
  {
    slug: "ice-cream",
    h1: "Diabetic-Friendly Ice Cream",
    question: "Is there an ice cream that is safe for diabetics?",
    answer:
      "Yes — ice creams sweetened with allulose, erythritol or monk fruit and thickened with fiber (not maltodextrin) can have 3–5g net carbs and a low glycemic index. Watch for maltitol, which is common in 'no sugar added' tubs.",
    intro:
      "Yes, actually good ice cream — built on allulose or erythritol instead of maltitol and corn syrup. More scoops landing here soon.",
    categorySlugs: ["ice-cream"],
    matchKeywords: ["ice cream", "kulfi"],
    faqs: [
      {
        q: "What sweetener makes the best low-GI ice cream?",
        a: "Allulose, because it scoops soft straight from the freezer and has virtually no glycemic impact — followed by erythritol/monk-fruit blends.",
      },
    ],
  },
];

/** Whether a product belongs on a directory page. */
export function matchesEntry(product: Product, entry: DirectoryEntry): boolean {
  if (entry.categorySlugs.includes(product.categorySlug)) return true;
  if (entry.matchKeywords?.length) {
    const hay = `${product.title} ${product.brand} ${product.rawIngredients}`.toLowerCase();
    return entry.matchKeywords.some((k) => hay.includes(k.toLowerCase()));
  }
  return false;
}

/**
 * Category catalogue — ordered by merchandising rank and given a joyful,
 * appetising colour so product tiles pop (guilt-free treat energy, not dull).
 * `tint` is the tile background; `accent` is the strong text/graphic colour.
 * Order here is the canonical display order across the whole site.
 */
export interface CategoryMeta {
  slug: string;
  label: string;
  tint: string;
  accent: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: "mithai", label: "Sweets & Mithai", tint: "#ffe6bf", accent: "#e0891b" },
  { slug: "chocolate", label: "Chocolate", tint: "#ecd6c4", accent: "#8a5433" },
  { slug: "ice-cream", label: "Ice Cream", tint: "#ffd7e5", accent: "#e2547f" },
  { slug: "cakes", label: "Cakes", tint: "#eed7f7", accent: "#a556cf" },
  { slug: "cookies", label: "Biscuits & Cookies", tint: "#f8e3c2", accent: "#c67f27" },
  { slug: "drinks", label: "Drinks", tint: "#cdeef4", accent: "#1f93a6" },
  { slug: "staples", label: "Rice & Staples", tint: "#d6f0dd", accent: "#1a9a51" },
  { slug: "flours", label: "Flours & Atta", tint: "#f0e2c3", accent: "#b17f2c" },
  { slug: "spreads", label: "Spreads & Butters", tint: "#efe0c6", accent: "#b0863f" },
  { slug: "snacks", label: "Snacks", tint: "#d2ece7", accent: "#1f9a8e" },
  { slug: "bakery", label: "Bakery", tint: "#f8ddc7", accent: "#c37340" },
  { slug: "bars", label: "Protein Bars", tint: "#f9d6d1", accent: "#d5514a" },
];

const CATEGORY_INDEX = new Map(CATEGORIES.map((c, i) => [c.slug, i]));

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
);

/** Rank for sorting; unknown categories sort to the end (alphabetically after). */
export function categoryRank(slug: string): number {
  return CATEGORY_INDEX.has(slug) ? CATEGORY_INDEX.get(slug)! : CATEGORIES.length + 1;
}

export function categoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORIES.find((c) => c.slug === slug) ?? {
      slug,
      label: humanizeSlug(slug),
      tint: "#e9e4d6",
      accent: "#5b6b52",
    }
  );
}
