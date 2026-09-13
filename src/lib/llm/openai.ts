import type { LLMCompleteInput, LLMProvider } from "./provider";

/**
 * OpenAI-compatible provider (OpenAI, Azure OpenAI, or any gateway exposing the
 * /chat/completions API). Uses fetch — no extra dependency. Point it at another
 * gateway with OPENAI_BASE_URL.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  readonly model: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  }

  async complete({ system, prompt, maxTokens = 1024 }: LLMCompleteInput): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI provider error ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  }
}
