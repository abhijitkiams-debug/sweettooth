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
    h1: "Rice Swaps",
    question: "Puja, what's the smart swap for white rice?",
    answer:
      "Go for shirataki rice or a resistant-starch blend — around 1–5g net carbs a bowl and a texture that soaks up curry beautifully. All the comfort, none of the afternoon nosedive.",
    intro:
      "Rice, but make it chill. These swaps give you the big comforting bowl without the afternoon nosedive — ranked, of course, by ZeroSpike Score.",
    categorySlugs: ["staples"],
    matchKeywords: ["rice", "konjac"],
    faqs: [
      {
        q: "Does shirataki rice actually taste like rice?",
        a: "It's more neutral and springy — rinse it, dry-roast for a minute, then cook as usual and it happily takes on whatever you pair it with.",
      },
      {
        q: "Is brown rice a good swap?",
        a: "Only a little better than white — it still climbs fast. Shirataki and resistant-starch blends are the smarter pick.",
      },
    ],
  },
  {
    slug: "roti-alternative",
    h1: "Roti Swaps",
    question: "Puja, which atta makes the best everyday roti?",
    answer:
      "An almond-, coconut- and flax-based atta with a little psyllium. It rolls soft, puffs on the tawa and keeps you comfortably full — around 3–5g net carbs a roti.",
    intro:
      "Soft, foldable, ghee-ready rotis — minus the post-lunch slump. These almond-, coconut- and flax-based attas roll out beautifully and behave themselves.",
    categorySlugs: ["flours"],
    matchKeywords: ["roti", "atta", "flour"],
    faqs: [
      {
        q: "Do these rotis roll and puff like wheat ones?",
        a: "Yes — a little psyllium and warm water gives them the stretch to roll thin and puff up on the tawa.",
      },
      {
        q: "What are they made of?",
        a: "Mostly almond and coconut flour with flaxseed and psyllium — nutty, filling and naturally gluten-free.",
      },
    ],
  },
  {
    slug: "sugar-alternative",
    h1: "Better Sweeteners",
    question: "Puja, which sweeteners can I actually trust?",
    answer:
      "Monk fruit, stevia, allulose and erythritol — they sweeten beautifully and keep things steady. We skip maltitol, dextrose and maltodextrin, which behave far more like sugar than the label lets on.",
    intro:
      "Not every 'sweet' is created equal (some are a bit of a fibber). These picks stick to the good four — monk fruit, stevia, allulose, erythritol — and skip the sneaky stuff.",
    categorySlugs: ["chocolate", "cookies", "mithai"],
    matchKeywords: ["monk fruit", "stevia", "erythritol", "allulose"],
    faqs: [
      {
        q: "Is maltitol one of the good ones?",
        a: "Not really — it can behave a lot like sugar and often upsets tummies, so we leave it off the list.",
      },
      {
        q: "Is erythritol a safe pick?",
        a: "Yes — it's one of our four go-to sweeteners: clean-tasting and gentle.",
      },
    ],
  },
  {
    slug: "chocolate-alternative",
    h1: "Chocolate",
    question: "Puja, which chocolate can I enjoy guilt-free?",
    answer:
      "The ones sweetened with stevia, monk fruit or erythritol — rich, snappy, around 2–3g net carbs for a few squares. We steer clear of the maltitol bars pretending to be innocent.",
    intro:
      "Chocolate that just wants to be chocolate. These bars lean on stevia, monk fruit or erythritol — no maltitol pretending to be innocent.",
    categorySlugs: ["chocolate"],
    matchKeywords: ["chocolate", "cocoa"],
    faqs: [
      {
        q: "Why do you skip maltitol chocolate?",
        a: "Because maltitol can behave a lot like sugar and often causes bloating — not the treat experience we're after.",
      },
    ],
  },
];

export const SWEET_TYPES: DirectoryEntry[] = [
  {
    slug: "kaju-katli",
    h1: "Kaju Katli",
    question: "Puja, is there a kaju katli I can enjoy every day?",
    answer:
      "Yes — cashew kaju katli sweetened with erythritol and monk fruit. Same melt-in-the-mouth cardamom magic, around 3g net carbs a piece. Perfect for gifting and grazing.",
    intro:
      "The festive favourite, reimagined. All the cashew-and-cardamom, melt-in-the-mouth magic — none of the sugar avalanche. Gift it, graze it, repeat.",
    categorySlugs: ["mithai"],
    matchKeywords: ["kaju", "katli", "cashew"],
    faqs: [
      {
        q: "Does it taste like the real thing?",
        a: "It is the real thing — cashews, ghee and cardamom — just sweetened smarter, so you'd never guess.",
      },
    ],
  },
  {
    slug: "cookies",
    h1: "Cookies",
    question: "Puja, which cookies are a proper yes?",
    answer:
      "Almond- and coconut-flour bakes sweetened with monk fruit or erythritol — soft, buttery, around 1–3g net carbs. We flag the 'protein' cookies that quietly lean on maltodextrin.",
    intro:
      "A cookie should spark joy, not a nap. These almond-flour, monk-fruit bakes keep things steady — and we cheerfully call out the 'protein' cookies hiding maltodextrin.",
    categorySlugs: ["cookies"],
    matchKeywords: ["cookie", "biscuit"],
    faqs: [
      {
        q: "Are 'protein' cookies a good pick?",
        a: "Not always — a lot of them lean on maltodextrin, which behaves like sugar. We check the label so you don't have to.",
      },
    ],
  },
  {
    slug: "ice-cream",
    h1: "Ice Cream",
    question: "Puja, can ice cream ever be a green light?",
    answer:
      "Absolutely — tubs built on allulose or erythritol scoop soft and stay light, around 3–5g net carbs a serving. We skip the maltitol-and-corn-syrup ones.",
    intro:
      "Yes, actually good ice cream — built on allulose or erythritol instead of maltitol and corn syrup. More scoops landing here soon.",
    categorySlugs: ["ice-cream"],
    matchKeywords: ["ice cream", "kulfi"],
    faqs: [
      {
        q: "Which sweetener makes the best scoop?",
        a: "Allulose — it scoops soft straight from the freezer and stays gentle. Erythritol and monk-fruit blends are close behind.",
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
