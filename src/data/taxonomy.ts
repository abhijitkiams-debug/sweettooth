import type { Product } from "@/lib/types";

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
      "White rice has a glycemic index around 73 and can send blood sugar soaring. These curated, ingredient-verified rice swaps let you keep the bowl without the spike — ranked by our ZeroSpike Score.",
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
      "Wheat atta spikes glucose fast. These almond-, coconut- and flax-based flour blends roll into soft rotis with a fraction of the carbs — each verified against its ingredient label.",
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
      "Not all 'sugar-free' sweeteners are equal. These products use only monk fruit, stevia, allulose or erythritol — the four sweeteners that keep glucose flat — and steer clear of maltitol.",
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
      "Most 'sugar-free' chocolate hides maltitol, which spikes glucose almost like sugar. These picks use only stevia, monk fruit or erythritol — verified from the label up.",
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
      "Traditional kaju katli is roughly half sugar. These versions keep the cashew-and-cardamom taste using only erythritol and monk fruit — a genuinely low-GI mithai for festivals.",
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
      "A cookie doesn't have to be a spike. These almond-flour, monk-fruit-sweetened bakes stay flat on a CGM — and we flag the 'high-protein' cookies that sneak in maltodextrin.",
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
      "Low-GI ice cream is possible when it's built on allulose or erythritol instead of maltitol and corn syrup. We're expanding this directory — check back as certified tubs are added.",
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

export const CATEGORY_LABELS: Record<string, string> = {
  cookies: "Cookies & Biscuits",
  chocolate: "Chocolate",
  mithai: "Indian Mithai",
  flours: "Flours & Atta",
  staples: "Rice & Staples",
  spreads: "Spreads & Butters",
  snacks: "Snacks",
  bakery: "Bakery",
  bars: "Protein Bars",
  "ice-cream": "Ice Cream",
};
