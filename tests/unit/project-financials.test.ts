import { describe, it, expect } from "vitest";

import {
  computeFinancials,
  aggregateDashboard,
  type ProjectSummary,
  type ProjectFinancials,
} from "@/server/services/project-financials";
import type { ProjectWithFinancials } from "@/server/repositories/project";

function project(over: Partial<ProjectWithFinancials>): ProjectWithFinancials {
  return {
    id: "p",
    status: "ACTIVE",
    budgets: [],
    invoices: [],
    vendorBills: [],
    scheduleTasks: [],
    ...over,
  } as unknown as ProjectWithFinancials;
}

const zero: ProjectFinancials = {
  contractValue: 0,
  billed: 0,
  collected: 0,
  costsOut: 0,
  profit: 0,
  progress: 0,
};

describe("computeFinancials", () => {
  it("derives the Maple-Street-like project's numbers", () => {
    const f = computeFinancials(
      project({
        budgets: [
          {
            status: "FINAL",
            sections: [{ items: [{ qty: 1, unitCost: 36986, markupPct: 0 }] }],
          },
        ],
        invoices: [
          { status: "PAID", amount: 7500, payments: [{ amount: 7500 }] },
          { status: "PAID", amount: 10900, payments: [{ amount: 10900 }] },
          { status: "OVERDUE", amount: 12500, payments: [] },
        ],
        vendorBills: [{ amount: 4200 }, { amount: 3750 }, { amount: 4000 }],
        scheduleTasks: [
          { durationDays: 3, percentComplete: 100 },
          { durationDays: 4, percentComplete: 100 },
          { durationDays: 5, percentComplete: 100 },
          { durationDays: 4, percentComplete: 60 },
          { durationDays: 6, percentComplete: 30 },
          { durationDays: 3, percentComplete: 0 },
          { durationDays: 5, percentComplete: 0 },
        ],
      } as unknown as Partial<ProjectWithFinancials>),
    );
    expect(f.contractValue).toBe(36986);
    expect(f.billed).toBe(30900); // non-draft invoices
    expect(f.collected).toBe(18400); // payments
    expect(f.costsOut).toBe(11950); // vendor bills
    expect(f.profit).toBe(25036); // value − costs
    expect(f.progress).toBe(54); // duration-weighted
  });

  it("returns zeros for a project with no data", () => {
    expect(computeFinancials(project({}))).toEqual(zero);
  });

  it("prefers the FINAL budget over a draft", () => {
    const f = computeFinancials(
      project({
        budgets: [
          {
            status: "DRAFT",
            sections: [{ items: [{ qty: 1, unitCost: 999 }] }],
          },
          {
            status: "FINAL",
            sections: [{ items: [{ qty: 2, unitCost: 100 }] }],
          },
        ],
      } as unknown as Partial<ProjectWithFinancials>),
    );
    expect(f.contractValue).toBe(200);
  });
});

describe("aggregateDashboard", () => {
  const summary = (
    status: string,
    financials: Partial<ProjectFinancials>,
    invoices: { status: string; amount: number }[] = [],
  ): ProjectSummary => ({
    project: {
      status,
      invoices,
    } as unknown as ProjectSummary["project"],
    financials: { ...zero, ...financials },
  });

  it("counts active, pipeline, and overdue", () => {
    const stats = aggregateDashboard([
      summary("ACTIVE", { contractValue: 36986, progress: 54 }, [
        { status: "OVERDUE", amount: 12500 },
      ]),
      summary("ACTIVE", { contractValue: 184500, progress: 34 }),
      summary("BIDDING", { contractValue: 27800 }),
      summary("PLANNING", { contractValue: 96400 }),
    ]);
    expect(stats.activeCount).toBe(2);
    expect(stats.overdueAmount).toBe(12500);
    expect(stats.overdueCount).toBe(1);
    expect(stats.pipeline).toBe(124200); // 27800 + 96400
    expect(stats.pipelineCount).toBe(2);
  });
});
