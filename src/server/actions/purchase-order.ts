"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PurchaseOrderStatus } from "@prisma/client";

import { getOrgContext } from "@/lib/auth";
import { logActivity } from "@/server/repositories/activity";
import * as repo from "@/server/repositories/purchase-order";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const poSchema = z.object({
  vendorId: z.string().nullish(),
  lineItems: z
    .array(
      z.object({
        description: z.string().trim().min(1),
        qty: z.coerce.number().finite().min(0),
        unitCost: z.coerce.number().finite().min(0),
        costCatalogItemId: z.string().nullish(),
      }),
    )
    .min(1, "Add at least one line"),
});

function revalidate(projectId: string) {
  revalidatePath("/app/purchase-orders");
  revalidatePath(`/app/projects/${projectId}/invoices`);
}

export async function createPurchaseOrderAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = poSchema.parse(input);
    const po = await repo.createPurchaseOrder(orgId, projectId, {
      vendorId: data.vendorId ?? null,
      lineItems: data.lineItems,
    });
    await logActivity(orgId, "created PO", { projectId, target: po.number });
    revalidate(projectId);
    return { ok: true, data: { id: po.id } };
  } catch {
    return { ok: false, error: "Couldn't create the purchase order." };
  }
}

export async function updatePOStatusAction(
  projectId: string,
  id: string,
  status: PurchaseOrderStatus,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.updatePOStatus(orgId, id, status);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the purchase order." };
  }
}

export async function deletePurchaseOrderAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deletePurchaseOrder(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the purchase order." };
  }
}
