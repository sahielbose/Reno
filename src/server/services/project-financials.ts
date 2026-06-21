import "server-only";

import { budgetTotal, sum, round2 } from "@/lib/money";
import {
  listProjectsWithFinancials,
  getProjectWithFinancials,
  type ProjectWithFinancials,
} from "@/server/repositories/project";

export interface ProjectFinancials {
  /** Contract value = the active (FINAL, else first) budget's grand total. */
  contractValue: number;
  /** Billed = sum of non-draft invoices. */
  billed: number;
  /** Collected = sum of recorded payments. */
  collected: number;
  /** Costs out = sum of vendor bills. */
  costsOut: number;
  /** Profit = contract value − costs out. */
  profit: number;
  /** Schedule progress, duration-weighted % complete (0–100). */
  progress: number;
}

function computeProgress(
  tasks: { durationDays: number; percentComplete: number }[],
): number {
  const totalDays = tasks.reduce((a, t) => a + t.durationDays, 0);
  if (totalDays === 0) return 0;
  const weighted = tasks.reduce(
    (a, t) => a + t.durationDays * t.percentComplete,
    0,
  );
  return Math.round(weighted / totalDays);
}

/** Pure: derive a project's financials from its loaded relations. */
export function computeFinancials(p: ProjectWithFinancials): ProjectFinancials {
  const budget = p.budgets.find((b) => b.status === "FINAL") ?? p.budgets[0];
  const contractValue = budget ? budgetTotal(budget.sections) : 0;

  const billed = sum(
    p.invoices.filter((i) => i.status !== "DRAFT").map((i) => i.amount),
  );
  const collected = sum(
    p.invoices.flatMap((i) => i.payments.map((pay) => pay.amount)),
  );
  const costsOut = sum(p.vendorBills.map((b) => b.amount));

  return {
    contractValue,
    billed,
    collected,
    costsOut,
    profit: round2(contractValue - costsOut),
    progress: computeProgress(p.scheduleTasks),
  };
}

export type ProjectSummary = {
  project: ProjectWithFinancials;
  financials: ProjectFinancials;
};

export async function getProjectFinancials(
  orgId: string,
  projectId: string,
): Promise<ProjectSummary | null> {
  const project = await getProjectWithFinancials(orgId, projectId);
  if (!project) return null;
  return { project, financials: computeFinancials(project) };
}

export async function listProjectSummaries(
  orgId: string,
): Promise<ProjectSummary[]> {
  const projects = await listProjectsWithFinancials(orgId);
  return projects.map((project) => ({
    project,
    financials: computeFinancials(project),
  }));
}

export interface DashboardStats {
  activeCount: number;
  inBuildCount: number;
  overdueAmount: number;
  overdueCount: number;
  pipeline: number;
  pipelineCount: number;
  collected: number;
  summaries: ProjectSummary[];
}

/** Aggregate the home-dashboard stat cards from all projects. */
export function aggregateDashboard(
  summaries: ProjectSummary[],
): DashboardStats {
  const active = summaries.filter((s) => s.project.status === "ACTIVE");
  const open = summaries.filter(
    (s) => s.project.status === "BIDDING" || s.project.status === "PLANNING",
  );
  const overdueInvoices = summaries.flatMap((s) =>
    s.project.invoices.filter((i) => i.status === "OVERDUE"),
  );

  return {
    activeCount: active.length,
    inBuildCount: active.filter((s) => s.financials.progress > 0).length,
    overdueAmount: sum(overdueInvoices.map((i) => i.amount)),
    overdueCount: overdueInvoices.length,
    pipeline: sum(open.map((s) => s.financials.contractValue)),
    pipelineCount: open.length,
    collected: sum(summaries.map((s) => s.financials.collected)),
    summaries,
  };
}

export async function getDashboardStats(
  orgId: string,
): Promise<DashboardStats> {
  const summaries = await listProjectSummaries(orgId);
  return aggregateDashboard(summaries);
}
