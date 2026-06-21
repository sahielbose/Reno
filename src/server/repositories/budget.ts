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
