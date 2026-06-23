import type { AIProvider } from "./provider";
import { stubProvider } from "./stub";

/**
 * Resolve the active AI provider. Local-preview stub today; in Phase 19 this
 * returns a live Claude provider when ANTHROPIC_API_KEY (or the AI Gateway) is
 * configured — the rest of the app is unaffected because both satisfy AIProvider.
 */
export function getAIProvider(): AIProvider {
  // Phase 19: if (process.env.ANTHROPIC_API_KEY) return claudeProvider;
  return stubProvider;
}

export type { AIProvider, AssistantContext, ChatMessage } from "./provider";
