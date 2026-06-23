import { formatCurrency } from "@/lib/format";
import type { AIProvider, AssistantContext, ChatMessage } from "./provider";

/** Deterministic, rule-based assistant that answers from real org data.
 *  No network, no keys — a believable preview until live AI lands. */
export function stubReply(message: string, ctx: AssistantContext): string {
  const q = message.toLowerCase();
  const active = ctx.projects.filter((p) => p.status === "ACTIVE");

  const match = (...words: string[]) => words.some((w) => q.includes(w));

  if (!message.trim()) {
    return `Hi — I'm Reno's assistant. Ask me about project status, what's outstanding, schedule risk, or drafting a proposal.`;
  }

  if (match("hello", "hi ", "hey", "what can you")) {
    return `Hi! I can see ${ctx.orgName}'s ${ctx.projects.length} project${
      ctx.projects.length === 1 ? "" : "s"
    }. Try: "what's overdue", "summarize ${
      active[0]?.name ?? "my projects"
    }", "where's the schedule risk", or "draft a proposal".`;
  }

  if (
    match("overdue", "outstanding", "owe", "unpaid", "collect", "receivable")
  ) {
    const owed = ctx.projects.filter((p) => p.outstanding > 0);
    if (!owed.length)
      return `Nothing outstanding right now — every invoice is collected. 🎉`;
    const lines = owed
      .map((p) => `• ${p.name}: ${formatCurrency(p.outstanding)} outstanding`)
      .join("\n");
    return `You have ${formatCurrency(
      ctx.overdueAmount,
    )} in overdue invoices. Outstanding by project:\n${lines}\n\nWant me to draft a reminder?`;
  }

  if (match("schedule", "deadline", "late", "critical", "risk", "behind")) {
    const behind = active
      .filter((p) => p.progress < 60)
      .map((p) => `• ${p.name}: ${Math.round(p.progress)}% complete`);
    return behind.length
      ? `Watch these on the schedule:\n${behind.join(
          "\n",
        )}\n\nOpen a project's Schedule tab to see the critical path in amber.`
      : `Schedules look healthy — active projects are tracking above 60% on their critical paths.`;
  }

  if (match("proposal", "scope", "estimate", "quote", "bid")) {
    const p = active[0] ?? ctx.projects[0];
    return p
      ? `I can turn ${p.name}'s budget (${formatCurrency(
          p.contractValue,
        )} contract value) into a client proposal. Open the project's Proposal tab and hit "Generate from budget" — the scope and section totals carry over automatically.`
      : `Create a project and build its budget first, then I'll draft a proposal from it.`;
  }

  if (match("summar", "status", "how is", "how are", "overview", "going")) {
    if (!ctx.projects.length)
      return `No projects yet — create one to get started.`;
    const named = ctx.projects.find((p) => q.includes(p.name.toLowerCase()));
    const targets = named ? [named] : ctx.projects.slice(0, 4);
    const lines = targets
      .map(
        (p) =>
          `• ${p.name} (${p.status.toLowerCase()}): ${formatCurrency(
            p.contractValue,
          )} contract, ${formatCurrency(p.collected)} collected, ${Math.round(
            p.progress,
          )}% complete`,
      )
      .join("\n");
    return `Here's where things stand:\n${lines}`;
  }

  if (match("profit", "margin", "money", "cash", "revenue", "finance")) {
    return `Across ${ctx.orgName} you've collected ${formatCurrency(
      ctx.collected,
    )} so far, with ${ctx.activeCount} active project${
      ctx.activeCount === 1 ? "" : "s"
    }. Each project's Overview tab breaks down contract, billed, costs, and profit.`;
  }

  return `Here's what I know about ${ctx.orgName}: ${ctx.projects.length} project${
    ctx.projects.length === 1 ? "" : "s"
  }, ${formatCurrency(ctx.collected)} collected, ${formatCurrency(
    ctx.overdueAmount,
  )} overdue. I can summarize a project, flag what's outstanding, check schedule risk, or help draft a proposal. (This is a local preview — connect a key in Phase 19 for full AI.)`;
}

export const stubProvider: AIProvider = {
  name: "local-preview",
  live: false,
  async complete(messages: ChatMessage[], ctx: AssistantContext) {
    const last = [...messages].reverse().find((m) => m.role === "user");
    return stubReply(last?.content ?? "", ctx);
  },
};
