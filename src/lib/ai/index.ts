import type { AIProvider } from "./provider";
import { stubProvider } from "./stub";
import { createClaudeProvider } from "./claude";

/**
 * Resolve the active AI provider: live Claude when ANTHROPIC_API_KEY is set,
 * otherwise the local rule-based stub. The rest of the app is unaffected
 * because both satisfy AIProvider.
 */
export function getAIProvider(): AIProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    return createClaudeProvider(
      apiKey,
      process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
    );
  }
  return stubProvider;
}

export type { AIProvider, AssistantContext, ChatMessage } from "./provider";
