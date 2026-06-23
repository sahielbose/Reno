import type { Prisma, VendorBillStatus } from "@prisma/client";

import { db } from "@/lib/db";

const include = {
  vendor: { select: { id: true, name: true } },
  po: { select: { id: true, number: true } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.VendorBillInclude;

export function listVendorBills(orgId: string, projectId?: string) {
  return db.vendorBill.findMany({
    where: { orgId, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "desc" },
    include,
  });
}

export async function createVendorBill(
  orgId: string,
  projectId: string,
  input: {
    vendorId?: string | null;
    poId?: string | null;
    number?: string | null;
    amount: number;
    dueDate?: Date | null;
  },
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  return db.vendorBill.create({
    data: {
      orgId,
      projectId,
      vendorId: input.vendorId ?? null,
      poId: input.poId ?? null,
      number: input.number ?? null,
      amount: input.amount,
      dueDate: input.dueDate ?? null,
    },
    include,
  });
}

export async function updateBillStatus(
  orgId: string,
  id: string,
  status: VendorBillStatus,
) {
  await db.vendorBill.findFirstOrThrow({ where: { id, orgId } });
  return db.vendorBill.update({ where: { id }, data: { status } });
}

export async function deleteVendorBill(orgId: string, id: string) {
  await db.vendorBill.findFirstOrThrow({ where: { id, orgId } });
  return db.vendorBill.delete({ where: { id } });
}
