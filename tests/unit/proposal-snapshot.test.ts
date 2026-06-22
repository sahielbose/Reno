import { describe, it, expect } from "vitest";

import {
  buildBudgetSnapshot,
  generateScope,
} from "@/server/services/proposal-from-budget";

const budget = {
  sections: [
    {
      name: "Demolition",
      items: [{ name: "Demo", qty: 1, unit: "LS", unitCost: 3200 }],
    },
    {
      name: "Cabinetry",
      items: [
        { name: "Cabinets", qty: 18, unit: "LF", unitCost: 520 },
        { name: "Island", qty: 1, unit: "EA", unitCost: 4200 },
      ],
    },
  ],
};

describe("buildBudgetSnapshot", () => {
  it("snapshots sections, line totals, and grand total", () => {
    const snap = buildBudgetSnapshot(
      budget,
      new Date("2026-03-15T12:00:00.000Z"),
    );
    expect(snap.total).toBe(16760); // 3200 + 9360 + 4200
    expect(snap.sections).toHaveLength(2);
    expect(snap.sections[1].total).toBe(13560);
    expect(snap.sections[1].items[0].lineTotal).toBe(9360);
    expect(snap.generatedAt).toBe("2026-03-15T12:00:00.000Z");
  });

  it("applies markup in line totals", () => {
    const snap = buildBudgetSnapshot(
      {
        sections: [
          {
            name: "x",
            items: [
              { name: "a", qty: 1, unit: "EA", unitCost: 100, markupPct: 20 },
            ],
          },
        ],
      },
      new Date(0),
    );
    expect(snap.total).toBe(120);
  });
});

describe("generateScope", () => {
  it("names the contractor, address, and sections", () => {
    const snap = buildBudgetSnapshot(budget, new Date(0));
    const scope = generateScope("Apex Build Co.", "412 Maple St", snap);
    expect(scope).toContain("Apex Build Co.");
    expect(scope).toContain("412 Maple St");
    expect(scope).toContain("demolition");
    expect(scope).toContain("cabinetry");
  });
});
