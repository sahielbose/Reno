"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrgContext } from "@/lib/auth";
import { logActivity } from "@/server/repositories/activity";
import * as repo from "@/server/repositories/bid-request";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const createSchema = z.object({
  scope: z.string().trim().min(1, "Describe the scope"),
  subIds: z.array(z.string()).optional(),
});

const responseSchema = z.object({
  subId: z.string().nullish(),
  amount: z.coerce.number().finite().min(0).nullish(),
  notes: z.string().trim().nullish(),
});

function revalidate(projectId: string) {
  revalidatePath("/app/bid-requests");
  revalidatePath(`/app/projects/${projectId}/invoices`);
}

export async function createBidRequestAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = createSchema.parse(input);
    const bid = await repo.createBidRequest(
      orgId,
      projectId,
      data.scope,
      data.subIds ?? [],
    );
    await logActivity(orgId, "opened bid request", { projectId });
    revalidate(projectId);
    return { ok: true, data: { id: bid.id } };
  } catch {
    return { ok: false, error: "Couldn't create the bid request." };
  }
}

export async function recordBidResponseAction(
  projectId: string,
  bidRequestId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const data = responseSchema.parse(input);
    await repo.recordBidResponse(orgId, bidRequestId, {
      subId: data.subId ?? null,
      amount: data.amount ?? null,
      notes: data.notes ?? null,
    });
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't record the bid." };
  }
}

export async function awardBidAction(
  projectId: string,
  bidRequestId: string,
  responseId: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.awardBid(orgId, bidRequestId, responseId);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't award the bid." };
  }
}

export async function deleteBidRequestAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteBidRequest(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the bid request." };
  }
}
