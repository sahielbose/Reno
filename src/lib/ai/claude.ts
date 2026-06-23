import type { AIProvider, AssistantContext, ChatMessage } from "./provider";

const SYSTEM_PROMPT =
  "You are Reno's assistant inside a construction-management app. Answer " +
  "concisely and practically for a contractor, using ONLY the org data " +
  "snapshot provided. Be specific with dollar amounts and project names. " +
  "If the data doesn't cover the question, say so briefly.";

type AnthropicResponse = { content?: { type: string; text?: string }[] };

/**
 * Live Claude provider via the Anthropic Messages API (no SDK dependency).
 * Activated by getAIProvider() when ANTHROPIC_API_KEY is set; otherwise the
 * local rule-based stub answers. Same AIProvider interface either way.
 */
export function createClaudeProvider(
  apiKey: string,
  model = "claude-opus-4-8",
): AIProvider {
  return {
    name: "claude",
    live: true,
    async complete(messages: ChatMessage[], ctx: AssistantContext) {
      const system = `${SYSTEM_PROMPT}\n\nOrg data snapshot (JSON):\n${JSON.stringify(
        ctx,
      )}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
      }
      const data = (await res.json()) as AnthropicResponse;
      const text = (data.content ?? [])
        .map((b) => b.text ?? "")
        .join("")
        .trim();
      return text || "I couldn't generate a response just now.";
    },
  };
}
