import { z } from "zod";
import type { RiskTier } from "@/lib/types";
import { getLLM, extractJson } from "@/lib/llm";
import { scoreIngredients, tierForScore } from "./scoring-rules";

/**
 * Curation engine (PRD §3). Evaluates a product's raw ingredient list into a
 * ZeroSpike score + risk tier.
 *
 * Strategy:
 *  1. Run the deterministic rule-based scorer — always available, offline.
 *  2. If an LLM provider is configured, ask it for a structured judgement.
 *  3. Reconcile: the LLM may refine `netCarbsPerServe`, `glycemicIndex`,
 *     `primarySweetener` (softer facts), but any hard-fail ingredient the
 *     rules detect forces DISQUALIFIED/0 regardless of the model — so a
 *     hallucinated score can never pass a maltitol product as "safe".
 */

export const EvaluationSchema = z.object({
  zeroSpikeScore: z.number().min(0).max(100),
  riskTier: z.enum(["CERTIFIED_SAFE", "CAUTION", "DISQUALIFIED"]),
  hasMaltitol: z.boolean(),
  netCarbsPerServe: z.number().min(0),
  primarySweetener: z.string(),
  glycemicIndex: z.number().int().nullable(),
  flaggedIngredients: z.array(z.string()),
});

export type Evaluation = z.infer<typeof EvaluationSchema> & {
  /** Which backend produced this result. */
  engine: string;
};

const SYSTEM_PROMPT = `You are ZeroSpike's clinical low-GI food curation engine.
You evaluate a packaged-food ingredient list for suitability for people managing
blood sugar (diabetic / keto / low-GI). Apply these rules strictly:

HARD FAIL (score 0, riskTier DISQUALIFIED) if the list contains any of:
Maltitol, Isomalt, High-Fructose Corn Syrup (HFCS), Dextrose, Maltodextrin, Tapioca Syrup.

CAUTION (score 40-79) if it contains: Sorbitol, Xylitol, Sucralose, or refined
wheat-flour blends (maida), and no hard-fail ingredient.

CERTIFIED_SAFE (score 80-100) when sweetened only with Pure Monk Fruit, Stevia
(Reb-M/Reb-A), Allulose, or Erythritol AND based on approved low-GI bases
(almond flour, coconut flour, psyllium husk, flaxseed meal, resistant starch type 4).

Score = 100 - glycemic penalty - additive penalty.

Respond with ONLY a JSON object, no prose, matching exactly:
{
  "zeroSpikeScore": <int 0-100>,
  "riskTier": "CERTIFIED_SAFE" | "CAUTION" | "DISQUALIFIED",
  "hasMaltitol": <bool>,
  "netCarbsPerServe": <number grams>,
  "primarySweetener": "<name>",
  "glycemicIndex": <int or null>,
  "flaggedIngredients": ["<ingredient>", ...]
}`;

export interface EvaluateOptions {
  /** Fallback net carbs when the model/rules can't infer it. */
  netCarbsHint?: number;
  glycemicIndexHint?: number;
}

export async function evaluateIngredients(
  rawIngredients: string,
  opts: EvaluateOptions = {},
): Promise<Evaluation> {
  const rules = scoreIngredients(rawIngredients);

  const deterministic: Evaluation = {
    zeroSpikeScore: rules.zeroSpikeScore,
    riskTier: rules.riskTier,
    hasMaltitol: rules.hasMaltitol,
    netCarbsPerServe: opts.netCarbsHint ?? estimateNetCarbs(rules.riskTier),
    primarySweetener: rules.approvedFound[0] ?? "Unspecified",
    glycemicIndex: opts.glycemicIndexHint ?? estimateGi(rules.riskTier),
    flaggedIngredients: rules.flaggedIngredients,
    engine: "deterministic-rules",
  };

  const llm = getLLM();
  if (!llm) return deterministic;

  try {
    const raw = await llm.complete({
      system: SYSTEM_PROMPT,
      prompt: `Ingredient list:\n"""${rawIngredients}"""`,
      maxTokens: 700,
    });
    const parsed = EvaluationSchema.parse(JSON.parse(extractJson(raw)));
    return reconcile(parsed, rules, `${llm.name}:${llm.model}`);
  } catch (err) {
    // Any LLM/parse failure: fall back to the deterministic result.
    console.warn("[evaluator] LLM path failed, using deterministic scorer:", err);
    return deterministic;
  }
}

/**
 * Reconcile the LLM judgement with the deterministic rules. Hard safety facts
 * (hard-fail => DISQUALIFIED/0) always win; softer estimates come from the LLM.
 */
function reconcile(
  llm: z.infer<typeof EvaluationSchema>,
  rules: ReturnType<typeof scoreIngredients>,
  engine: string,
): Evaluation {
  const hardFail = rules.riskTier === "DISQUALIFIED" && rules.zeroSpikeScore === 0;

  let score = llm.zeroSpikeScore;
  let tier: RiskTier = llm.riskTier;

  if (hardFail) {
    score = 0;
    tier = "DISQUALIFIED";
  } else {
    // Keep the LLM score, but never let the tier disagree with its own score.
    tier = tierForScore(score);
    // If rules flagged a caution ingredient, don't allow CERTIFIED_SAFE.
    if (rules.flaggedIngredients.length > 0 && tier === "CERTIFIED_SAFE") {
      score = Math.min(score, 79);
      tier = "CAUTION";
    }
  }

  return {
    zeroSpikeScore: score,
    riskTier: tier,
    hasMaltitol: rules.hasMaltitol || llm.hasMaltitol,
    netCarbsPerServe: llm.netCarbsPerServe,
    primarySweetener: llm.primarySweetener || rules.approvedFound[0] || "Unspecified",
    glycemicIndex: llm.glycemicIndex,
    flaggedIngredients: Array.from(
      new Set([...rules.flaggedIngredients, ...llm.flaggedIngredients]),
    ),
    engine,
  };
}

function estimateNetCarbs(tier: RiskTier): number {
  return tier === "CERTIFIED_SAFE" ? 2 : tier === "CAUTION" ? 8 : 22;
}

function estimateGi(tier: RiskTier): number {
  return tier === "CERTIFIED_SAFE" ? 15 : tier === "CAUTION" ? 45 : 70;
}
