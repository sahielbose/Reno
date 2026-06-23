import { toNumber } from "@/lib/format";

/**
 * Money + budget math - the heart of the "numbers carry forward" spine.
 * All inputs accept number | string | Prisma.Decimal (anything with toString).
 * Pure and dependency-free so it's trivially unit-testable.
 */

type Num = number | string | { toString(): string };

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Cost basis of a line: qty × unit cost (what the budget grid shows). */
export function lineCost(qty: Num, unitCost: Num): number {
  return round2(toNumber(qty) * toNumber(unitCost));
}

/** Sell price of a line: cost × (1 + markup%). */
export function lineTotal(qty: Num, unitCost: Num, markupPct: Num = 0): number {
  return round2(lineCost(qty, unitCost) * (1 + toNumber(markupPct) / 100));
}

/** Per-line margin (sell − cost). */
export function lineMargin(
  qty: Num,
  unitCost: Num,
  markupPct: Num = 0,
): number {
  return round2(lineTotal(qty, unitCost, markupPct) - lineCost(qty, unitCost));
}

type LineLike = { qty: Num; unitCost: Num; markupPct?: Num };

export function sectionTotal(items: LineLike[]): number {
  return round2(
    items.reduce(
      (sum, i) => sum + lineTotal(i.qty, i.unitCost, i.markupPct),
      0,
    ),
  );
}

export function sectionCost(items: LineLike[]): number {
  return round2(items.reduce((sum, i) => sum + lineCost(i.qty, i.unitCost), 0));
}

type SectionLike = { items: LineLike[] };

/** Grand total (sell) of a budget across all sections. */
export function budgetTotal(sections: SectionLike[]): number {
  return round2(sections.reduce((sum, s) => sum + sectionTotal(s.items), 0));
}

/** Grand cost basis of a budget across all sections. */
export function budgetCost(sections: SectionLike[]): number {
  return round2(sections.reduce((sum, s) => sum + sectionCost(s.items), 0));
}

/** Sum a list of amounts. */
export function sum(amounts: Num[]): number {
  return round2(amounts.reduce((a: number, n) => a + toNumber(n), 0));
}

/** Margin as a percentage of revenue (0 when revenue is 0). */
export function marginPct(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return round2(((revenue - cost) / revenue) * 100);
}
