import { db } from "@/lib/db";
import type { AssistantContext } from "@/lib/ai/provider";
import { getDashboardStats } from "@/server/services/project-financials";

/** Assemble a compact, real-data snapshot for the assistant to reason over. */
export async function buildAssistantContext(
  orgId: string,
): Promise<AssistantContext> {
  const [org, stats] = await Promise.all([
    db.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    }),
    getDashboardStats(orgId),
  ]);

  return {
    orgName: org?.name ?? "your company",
    activeCount: stats.activeCount,
    overdueAmount: stats.overdueAmount,
    collected: stats.collected,
    projects: stats.summaries.map((s) => ({
      name: s.project.name,
      status: s.project.status,
      contractValue: s.financials.contractValue,
      billed: s.financials.billed,
      collected: s.financials.collected,
      outstanding:
        Math.round((s.financials.billed - s.financials.collected) * 100) / 100,
      progress: s.financials.progress,
    })),
  };
}
