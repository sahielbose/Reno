import { describe, it, expect } from "vitest";

import {
  lineCost,
  lineTotal,
  lineMargin,
  sectionTotal,
  budgetTotal,
  marginPct,
  round2,
} from "@/lib/money";

describe("money math", () => {
  it("lineCost = qty × unitCost", () => {
    expect(lineCost(18, 520)).toBe(9360);
    expect(lineCost(62, 95)).toBe(5890);
  });

  it("lineTotal applies markup", () => {
    expect(lineTotal(1, 100, 0)).toBe(100);
    expect(lineTotal(1, 100, 20)).toBe(120);
    expect(lineTotal(2, 50, 10)).toBe(110);
  });

  it("lineMargin = sell − cost", () => {
    expect(lineMargin(1, 100, 20)).toBe(20);
    expect(lineMargin(1, 100, 0)).toBe(0);
  });

  it("sectionTotal sums its lines", () => {
    expect(
      sectionTotal([
        { qty: 18, unitCost: 520 },
        { qty: 1, unitCost: 4200 },
      ]),
    ).toBe(13560);
  });

  it("budgetTotal matches the seeded Maple Street budget", () => {
    const sections = [
      { items: [{ qty: 1, unitCost: 3200 }] },
      {
        items: [
          { qty: 18, unitCost: 520 },
          { qty: 1, unitCost: 4200 },
        ],
      },
      { items: [{ qty: 62, unitCost: 95 }] },
      { items: [{ qty: 1, unitCost: 5600 }] },
      { items: [{ qty: 1, unitCost: 4800 }] },
      {
        items: [
          { qty: 48, unitCost: 32 },
          { qty: 1, unitCost: 2400 },
        ],
      },
    ];
    expect(budgetTotal(sections)).toBe(36986);
  });

  it("accepts string / Decimal-like inputs", () => {
    expect(lineCost("18", "520")).toBe(9360);
  });

  it("round2 and marginPct", () => {
    expect(round2(1 / 3)).toBe(0.33);
    expect(marginPct(100, 75)).toBe(25);
    expect(marginPct(0, 0)).toBe(0);
  });
});
