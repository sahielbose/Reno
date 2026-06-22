import { getOrgContext } from "@/lib/auth";
import { ensureProjectBudget } from "@/server/repositories/budget";
import { listCatalog } from "@/server/repositories/catalog";
import { toNumber } from "@/lib/format";
import {
  BudgetGrid,
  type GridSection,
  type CatalogPick,
} from "@/components/app/budget/budget-grid";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const [budget, catalogRows] = await Promise.all([
    ensureProjectBudget(orgId, id),
    listCatalog(orgId),
  ]);
  const catalog: CatalogPick[] = catalogRows.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    unit: c.unit,
    defaultUnitCost: toNumber(c.defaultUnitCost),
  }));

  // Map Prisma Decimals to plain numbers for the client grid.
  const sections: GridSection[] = budget.sections.map((s) => ({
    id: s.id,
    name: s.name,
    items: s.items.map((it) => ({
      id: it.id,
      code: it.catalogItem?.code ?? null,
      name: it.name,
      qty: toNumber(it.qty),
      unit: it.unit,
      unitCost: toNumber(it.unitCost),
      markupPct: toNumber(it.markupPct),
    })),
  }));

  return (
    <BudgetGrid
      projectId={id}
      budgetId={budget.id}
      sections={sections}
      catalog={catalog}
    />
  );
}
