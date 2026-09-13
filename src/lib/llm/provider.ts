/**
 * Multi-LLM backend abstraction.
 *
 * The curation engine talks only to the `LLMProvider` interface, so adding a
 * new backend = one file implementing `complete()`. The active provider and
 * model are chosen from env (`LLM_PROVIDER`, `LLM_MODEL`) at runtime. When no
 * provider is configured (or its API key is missing), `getLLM()` returns null
 * and callers fall back to the deterministic rule-based scorer.
 */
export interface LLMCompleteInput {
  system: string;
  prompt: string;
  /** Encourage strict JSON output. */
  maxTokens?: number;
}

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  /** Returns the model's raw text response (expected to be JSON for our use). */
  complete(input: LLMCompleteInput): Promise<string>;
}

export type ProviderName = "anthropic" | "openai" | "none";

export function resolveProviderName(): ProviderName {
  const raw = (process.env.LLM_PROVIDER || "").trim().toLowerCase();
  if (raw === "anthropic" || raw === "openai" || raw === "none") return raw;
  // Default: prefer anthropic if a key exists, else openai, else none.
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

/** Extract the first balanced JSON object from a possibly-fenced string. */
export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return body.trim();
  return body.slice(start, end + 1).trim();
}
