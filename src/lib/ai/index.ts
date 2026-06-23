import type { AIProvider } from "./provider";
import { stubProvider } from "./stub";
import { createClaudeProvider } from "./claude";

/**
 * Resolve the active AI provider for an org. Precedence:
 *   1. the org's own saved Anthropic key (Settings -> AI)
 *   2. a shared ANTHROPIC_API_KEY from the environment
 *   3. the local rule-based stub (demo mode)
 * All three satisfy AIProvider, so the rest of the app is unaffected.
 */
export function resolveAIProvider(config?: {
  apiKey?: string | null;
  model?: string | null;
}): AIProvider {
  const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const model =
      config?.model || process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
    return createClaudeProvider(apiKey, model);
  }
  return stubProvider;
}

/** Env-only resolution (no org context). */
export function getAIProvider(): AIProvider {
  return resolveAIProvider();
}

/** True when a live Anthropic key is available (org key or shared env). */
export function aiIsLive(orgKey?: string | null): boolean {
  return Boolean(orgKey || process.env.ANTHROPIC_API_KEY);
}

export type { AIProvider, AssistantContext, ChatMessage } from "./provider";
