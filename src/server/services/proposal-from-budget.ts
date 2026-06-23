import { lineTotal, sectionTotal, budgetTotal } from "@/lib/money";
import { toNumber } from "@/lib/format";

/** Immutable snapshot of a budget captured into a proposal at generate time. */
export type SnapshotItem = {
  name: string;
  qty: number;
  unit: string;
  lineTotal: number;
};
export type SnapshotSection = {
  name: string;
  total: number;
  items: SnapshotItem[];
};
export type ProposalSnapshot = {
  sections: SnapshotSection[];
  total: number;
  generatedAt: string;
};

type Numeric = number | string | { toString(): string };
type BudgetLike = {
  sections: {
    name: string;
    items: {
      name: string;
      qty: Numeric;
      unit: string;
      unitCost: Numeric;
      markupPct?: Numeric;
    }[];
  }[];
};

export function buildBudgetSnapshot(
  budget: BudgetLike,
  now: Date,
): ProposalSnapshot {
  const sections: SnapshotSection[] = budget.sections.map((s) => ({
    name: s.name,
    total: sectionTotal(s.items),
    items: s.items.map((it) => ({
      name: it.name,
      qty: toNumber(it.qty),
      unit: it.unit,
      lineTotal: lineTotal(it.qty, it.unitCost, it.markupPct ?? 0),
    })),
  }));
  return {
    sections,
    total: budgetTotal(budget.sections),
    generatedAt: now.toISOString(),
  };
}

/** Draft a plain-English scope-of-work from the snapshot (human edits after). */
export function generateScope(
  orgName: string,
  address: string | null,
  snapshot: ProposalSnapshot,
): string {
  const names = snapshot.sections
    .map((s) => s.name.toLowerCase())
    .filter(Boolean);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
      : (names[0] ?? "the agreed scope");
  return `${orgName} will furnish all labor, materials, and equipment to complete the work at ${address ?? "the project address"}: ${list}. Sample scope generated from the budget - edit as needed.`;
}
