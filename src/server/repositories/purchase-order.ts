import type { Prisma, PurchaseOrderStatus } from "@prisma/client";

import { db } from "@/lib/db";

const include = {
  lineItems: { orderBy: { order: "asc" as const } },
  vendor: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  bills: { select: { id: true, amount: true, status: true } },
} satisfies Prisma.PurchaseOrderInclude;

export function listPurchaseOrders(orgId: string, projectId?: string) {
  return db.purchaseOrder.findMany({
    where: { orgId, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "desc" },
    include,
  });
}

export function getPurchaseOrder(orgId: string, id: string) {
  return db.purchaseOrder.findFirst({ where: { id, orgId }, include });
}

export async function createPurchaseOrder(
  orgId: string,
  projectId: string,
  input: {
    vendorId?: string | null;
    lineItems: {
      description: string;
      qty: number;
      unitCost: number;
      costCatalogItemId?: string | null;
    }[];
  },
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  const count = await db.purchaseOrder.count({ where: { orgId } });
  const number = `PO-${String(count + 1).padStart(3, "0")}`;
  const total = input.lineItems.reduce((s, l) => s + l.qty * l.unitCost, 0);
  return db.purchaseOrder.create({
    data: {
      orgId,
      projectId,
      number,
      total,
      vendorId: input.vendorId ?? null,
      lineItems: {
        create: input.lineItems.map((l, i) => ({
          description: l.description,
          qty: l.qty,
          unitCost: l.unitCost,
          costCatalogItemId: l.costCatalogItemId ?? null,
          order: i,
        })),
      },
    },
    include,
  });
}

export async function updatePOStatus(
  orgId: string,
  id: string,
  status: PurchaseOrderStatus,
) {
  await db.purchaseOrder.findFirstOrThrow({ where: { id, orgId } });
  return db.purchaseOrder.update({ where: { id }, data: { status } });
}

export async function deletePurchaseOrder(orgId: string, id: string) {
  await db.purchaseOrder.findFirstOrThrow({ where: { id, orgId } });
  return db.purchaseOrder.delete({ where: { id } });
}
