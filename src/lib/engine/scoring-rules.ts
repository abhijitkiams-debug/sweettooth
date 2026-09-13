import type { RiskTier } from "@/lib/types";

/**
 * ZeroSpike scoring rule tables (PRD §3).
 *
 *   ZeroSpike Score = 100 − (Glycemic Penalty) − (Additive Penalty)
 *
 * Keyword matching is case-insensitive and normalizes common spellings so that
 * "Maltitol Syrup", "hydrogenated maltitol" etc. all trip the same rule.
 */

// Hard-fail: any of these force Score = 0 / DISQUALIFIED regardless of anything else.
export const HARD_FAIL_INGREDIENTS = [
  "maltitol",
  "isomalt",
  "high-fructose corn syrup",
  "high fructose corn syrup",
  "hfcs",
  "dextrose",
  "maltodextrin",
  "tapioca syrup",
  "tapioca starch syrup",
  "invert sugar",
  "glucose syrup",
  "corn syrup",
] as const;

// Caution: these cap the product into the CAUTION band (Score 40–79).
export const CAUTION_INGREDIENTS = [
  "sorbitol",
  "xylitol",
  "sucralose",
  "wheat flour",
  "refined flour",
  "maida",
  "aspartame",
  "acesulfame",
  "brown rice syrup",
] as const;

// Certified-safe approved sweeteners.
export const APPROVED_SWEETENERS = [
  "monk fruit",
  "monkfruit",
  "luo han guo",
  "stevia",
  "reb-m",
  "reb m",
  "reb-a",
  "reb a",
  "steviol",
  "allulose",
  "erythritol",
] as const;

// Certified-safe approved bases.
export const APPROVED_BASES = [
  "almond flour",
  "coconut flour",
  "psyllium husk",
  "psyllium",
  "flaxseed meal",
  "flax seed meal",
  "flaxseed",
  "resistant starch type 4",
  "resistant starch",
  "rs4",
  "peanut flour",
  "sunflower seed flour",
  "oat fiber",
] as const;

export function tierForScore(score: number): RiskTier {
  if (score >= 80) return "CERTIFIED_SAFE";
  if (score >= 40) return "CAUTION";
  return "DISQUALIFIED";
}

export interface DeterministicResult {
  zeroSpikeScore: number;
  riskTier: RiskTier;
  hasMaltitol: boolean;
  flaggedIngredients: string[];
  approvedFound: string[];
  glycemicPenalty: number;
  additivePenalty: number;
}

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function findMatches(haystack: string, needles: readonly string[]): string[] {
  const hits = new Set<string>();
  for (const n of needles) {
    if (haystack.includes(normalize(n))) hits.add(n);
  }
  return [...hits];
}

/**
 * Deterministic, offline rule-based scorer. This is the source of truth for
 * tiers/penalties; the LLM evaluator's output is reconciled against it so a
 * hallucinated score can never override a hard-fail ingredient.
 */
export function scoreIngredients(rawIngredients: string): DeterministicResult {
  const text = normalize(rawIngredients);

  const hardFails = findMatches(text, HARD_FAIL_INGREDIENTS);
  const cautions = findMatches(text, CAUTION_INGREDIENTS);
  const approvedSweeteners = findMatches(text, APPROVED_SWEETENERS);
  const approvedBases = findMatches(text, APPROVED_BASES);

  const hasMaltitol = text.includes("maltitol");

  // Hard fail — disqualified, score 0.
  if (hardFails.length > 0) {
    return {
      zeroSpikeScore: 0,
      riskTier: "DISQUALIFIED",
      hasMaltitol,
      flaggedIngredients: hardFails,
      approvedFound: [...approvedSweeteners, ...approvedBases],
      glycemicPenalty: 100,
      additivePenalty: 0,
    };
  }

  // Penalty model. Glycemic penalty is driven by caution-tier sugar alcohols /
  // artificial sweeteners; additive penalty by refined-flour bases.
  let glycemicPenalty = 0;
  let additivePenalty = 0;

  for (const c of cautions) {
    if (["wheat flour", "refined flour", "maida"].includes(c)) {
      glycemicPenalty += 22; // refined-carb base spikes glucose
    } else {
      glycemicPenalty += 14; // sugar alcohol / artificial sweetener caution
    }
  }

  // Reward approved sweeteners/bases by softening residual penalties.
  const approvedCount = approvedSweeteners.length + approvedBases.length;
  if (approvedCount > 0) {
    glycemicPenalty = Math.max(0, glycemicPenalty - approvedCount * 2);
  }

  // Clean, fully-approved formulation with no caution flags scores near-perfect.
  if (cautions.length === 0) {
    additivePenalty = approvedCount >= 2 ? 2 : approvedCount === 1 ? 6 : 12;
  } else {
    additivePenalty = 4;
  }

  let score = Math.max(0, Math.min(100, 100 - glycemicPenalty - additivePenalty));

  // Any caution-tier ingredient caps the product into the CAUTION band (40–79):
  // per PRD it can never be CERTIFIED_SAFE, regardless of approved offsets.
  if (cautions.length > 0) {
    score = Math.max(40, Math.min(79, score));
  }

  return {
    zeroSpikeScore: score,
    riskTier: tierForScore(score),
    hasMaltitol,
    flaggedIngredients: [...hardFails, ...cautions],
    approvedFound: [...approvedSweeteners, ...approvedBases],
    glycemicPenalty,
    additivePenalty,
  };
}
