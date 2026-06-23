import { describe, it, expect } from "vitest";

import { stubReply } from "@/lib/ai/stub";
import type { AssistantContext } from "@/lib/ai/provider";

const ctx: AssistantContext = {
  orgName: "Apex Build Co.",
  activeCount: 2,
  overdueAmount: 12500,
  collected: 18400,
  projects: [
    {
      name: "Maple Street Kitchen Remodel",
      status: "ACTIVE",
      contractValue: 36986,
      billed: 30900,
      collected: 18400,
      outstanding: 12500,
      progress: 54,
    },
    {
      name: "Oakwood ADU Build",
      status: "ACTIVE",
      contractValue: 120000,
      billed: 62000,
      collected: 0,
      outstanding: 62000,
      progress: 20,
    },
  ],
};

describe("stubReply", () => {
  it("answers outstanding/overdue questions from real data", () => {
    const r = stubReply("what's overdue?", ctx);
    expect(r).toContain("$12,500");
    expect(r).toMatch(/Maple|outstanding/i);
  });

  it("summarizes a named project", () => {
    const r = stubReply("summarize Maple Street Kitchen Remodel", ctx);
    expect(r).toContain("Maple Street Kitchen Remodel");
    expect(r).toMatch(/contract|collected|complete/i);
  });

  it("flags schedule risk for low-progress projects", () => {
    const r = stubReply("where is the schedule risk?", ctx);
    expect(r).toMatch(/Oakwood|critical|complete/i);
  });

  it("falls back helpfully and names the org", () => {
    const r = stubReply("xyzzy", ctx);
    expect(r).toContain("Apex Build Co.");
  });
});
