"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { VendorBillStatus } from "@prisma/client";

import { getOrgContext } from "@/lib/auth";
import { logActivity } from "@/server/repositories/activity";
import * as repo from "@/server/repositories/vendor-bill";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const billSchema = z.object({
  vendorId: z.string().nullish(),
  poId: z.string().nullish(),
  number: z.string().trim().nullish(),
  amount: z.coerce.number().finite().min(0),
  dueDate: z.string().nullish(),
});

function revalidate(projectId: string) {
  revalidatePath("/app/purchase-orders");
  revalidatePath(`/app/projects/${projectId}/invoices`);
  revalidatePath("/app");
}

export async function createVendorBillAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = billSchema.parse(input);
    const bill = await repo.createVendorBill(orgId, projectId, {
      vendorId: data.vendorId ?? null,
      poId: data.poId ?? null,
      number: data.number ?? null,
      amount: data.amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });
    await logActivity(orgId, "recorded vendor bill", { projectId });
    revalidate(projectId);
    return { ok: true, data: { id: bill.id } };
  } catch {
    return { ok: false, error: "Couldn't record the bill." };
  }
}

export async function updateBillStatusAction(
  projectId: string,
  id: string,
  status: VendorBillStatus,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.updateBillStatus(orgId, id, status);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the bill." };
  }
}

export async function deleteVendorBillAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteVendorBill(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the bill." };
  }
}
