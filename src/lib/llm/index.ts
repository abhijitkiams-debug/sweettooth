import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { resolveProviderName, type LLMProvider } from "./provider";

export * from "./provider";

let cached: LLMProvider | null | undefined;

/**
 * Returns the configured LLM provider, or null when none is available
 * (provider = none, or the selected provider's API key is missing). Callers
 * must handle null by falling back to the deterministic scorer.
 */
export function getLLM(): LLMProvider | null {
  if (cached !== undefined) return cached;

  const provider = resolveProviderName();
  const model = (process.env.LLM_MODEL || "").trim();

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    cached = new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      model || "claude-sonnet-5",
    );
  } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
    cached = new OpenAIProvider(
      process.env.OPENAI_API_KEY,
      model || "gpt-4o-mini",
      process.env.OPENAI_BASE_URL || undefined,
    );
  } else {
    cached = null;
  }

  return cached;
}

/** Human-readable description of the active curation backend (for status UIs). */
export function describeLLM(): string {
  const llm = getLLM();
  return llm ? `${llm.name}:${llm.model}` : "deterministic-rules (offline)";
}
