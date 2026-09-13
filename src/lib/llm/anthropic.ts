import Anthropic from "@anthropic-ai/sdk";
import type { LLMCompleteInput, LLMProvider } from "./provider";

/**
 * Anthropic Claude provider. Model id comes from `LLM_MODEL`
 * (default `claude-sonnet-5`). Uses the official SDK.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  readonly model: string;
  private client: Anthropic;

  constructor(apiKey: string, model: string) {
    this.model = model;
    this.client = new Anthropic({ apiKey });
  }

  async complete({ system, prompt, maxTokens = 1024 }: LLMCompleteInput): Promise<string> {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
  }
}
