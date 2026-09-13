import { NextRequest, NextResponse } from "next/server";
import { evaluateIngredients } from "@/lib/engine/evaluator";
import { describeLLM } from "@/lib/llm";

/**
 * Curation utility endpoint. POST { rawIngredients } → structured evaluation.
 * Uses the configured LLM if available, else the deterministic scorer.
 *
 *   curl -X POST localhost:3000/api/evaluate \
 *     -H 'content-type: application/json' \
 *     -d '{"rawIngredients":"Almond flour, monk fruit, erythritol"}'
 */
export async function POST(req: NextRequest) {
  let body: { rawIngredients?: string; netCarbsHint?: number; glycemicIndexHint?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const raw = (body.rawIngredients ?? "").trim();
  if (!raw) {
    return NextResponse.json({ error: "rawIngredients is required" }, { status: 400 });
  }

  const evaluation = await evaluateIngredients(raw, {
    netCarbsHint: body.netCarbsHint,
    glycemicIndexHint: body.glycemicIndexHint,
  });

  return NextResponse.json({ engine: describeLLM(), evaluation });
}
