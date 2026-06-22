import { describe, it, expect } from "vitest";

import { costCatalogItemInputSchema } from "@/server/schemas/catalog";

describe("costCatalogItemInputSchema", () => {
  it("accepts a valid cost code", () => {
    const r = costCatalogItemInputSchema.safeParse({
      code: "100",
      name: "Demo & disposal",
      unit: "LS",
      defaultUnitCost: 3200,
    });
    expect(r.success).toBe(true);
  });

  it("requires code and name", () => {
    expect(
      costCatalogItemInputSchema.safeParse({ code: "", name: "x" }).success,
    ).toBe(false);
    expect(
      costCatalogItemInputSchema.safeParse({ code: "100", name: "" }).success,
    ).toBe(false);
  });

  it("defaults unit to EA and cost to 0", () => {
    const r = costCatalogItemInputSchema.safeParse({
      code: "200",
      name: "Cabinets",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.unit).toBe("EA");
      expect(r.data.defaultUnitCost).toBe(0);
    }
  });

  it("coerces cost from a string and rejects negatives", () => {
    const ok = costCatalogItemInputSchema.safeParse({
      code: "210",
      name: "Cabinetry",
      defaultUnitCost: "520",
    });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.defaultUnitCost).toBe(520);
    expect(
      costCatalogItemInputSchema.safeParse({
        code: "1",
        name: "x",
        defaultUnitCost: -5,
      }).success,
    ).toBe(false);
  });
});
