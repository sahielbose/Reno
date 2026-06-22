import { db } from "@/lib/db";

/** A budget with its sections and ordered line items (+ linked catalog items). */
export function getProjectBudget(orgId: string, projectId: string) {
  return db.budget.findFirst({
    where: { orgId, projectId },
    orderBy: { createdAt: "asc" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: { catalogItem: true },
          },
        },
      },
    },
  });
}

export function getBudget(orgId: string, budgetId: string) {
  return db.budget.findFirst({
    where: { id: budgetId, orgId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export type ProjectBudget = NonNullable<
  Awaited<ReturnType<typeof getProjectBudget>>
>;

/** Get the project's budget, creating an empty one if none exists. */
export async function ensureProjectBudget(orgId: string, projectId: string) {
  const existing = await getProjectBudget(orgId, projectId);
  if (existing) return existing;
  // Confirm the project belongs to the org before creating.
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  await db.budget.create({ data: { orgId, projectId, name: "Budget" } });
  const created = await getProjectBudget(orgId, projectId);
  if (!created) throw new Error("Failed to create budget");
  return created;
}

// ── Line item mutations (org-scoped via section → budget → orgId) ────────────

type LineItemData = {
  name?: string;
  qty?: number;
  unit?: string;
  unitCost?: number;
  markupPct?: number;
  costCatalogItemId?: string | null;
};

export async function updateLineItem(
  orgId: string,
  id: string,
  data: LineItemData,
) {
  await db.budgetLineItem.findFirstOrThrow({
    where: { id, section: { budget: { orgId } } },
  });
  return db.budgetLineItem.update({ where: { id }, data });
}

export async function createLineItem(
  orgId: string,
  sectionId: string,
  data: LineItemData & { name: string },
) {
  const section = await db.budgetSection.findFirstOrThrow({
    where: { id: sectionId, budget: { orgId } },
    include: { _count: { select: { items: true } } },
  });
  return db.budgetLineItem.create({
    data: { sectionId, order: section._count.items, ...data },
  });
}

export async function deleteLineItem(orgId: string, id: string) {
  await db.budgetLineItem.findFirstOrThrow({
    where: { id, section: { budget: { orgId } } },
  });
  return db.budgetLineItem.delete({ where: { id } });
}

// ── Section mutations ────────────────────────────────────────────────────────

export async function createSection(
  orgId: string,
  budgetId: string,
  name: string,
) {
  const budget = await db.budget.findFirstOrThrow({
    where: { id: budgetId, orgId },
    include: { _count: { select: { sections: true } } },
  });
  return db.budgetSection.create({
    data: { budgetId, name, order: budget._count.sections },
  });
}

export async function deleteSection(orgId: string, id: string) {
  await db.budgetSection.findFirstOrThrow({
    where: { id, budget: { orgId } },
  });
  return db.budgetSection.delete({ where: { id } });
}
