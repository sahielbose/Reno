"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getOrgContext } from "@/lib/auth";
import {
  budgetLineItemPatchSchema,
  budgetSectionInputSchema,
} from "@/server/schemas/budget";
import * as repo from "@/server/repositories/budget";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function toMessage(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Invalid input";
  return "Couldn't save. Please try again.";
}

function revalidateProject(projectId: string) {
  revalidatePath(`/app/projects/${projectId}/budget`);
  revalidatePath(`/app/projects/${projectId}/overview`);
}

export async function updateLineItemAction(
  projectId: string,
  lineItemId: string,
  patch: unknown,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const data = budgetLineItemPatchSchema.parse(patch);
    await repo.updateLineItem(orgId, lineItemId, data);
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function addLineItemAction(
  projectId: string,
  sectionId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const item = await repo.createLineItem(orgId, sectionId, {
      name: "New item",
      qty: 1,
      unit: "EA",
      unitCost: 0,
    });
    revalidateProject(projectId);
    return { ok: true, data: { id: item.id } };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function deleteLineItemAction(
  projectId: string,
  lineItemId: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteLineItem(orgId, lineItemId);
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function addSectionAction(
  projectId: string,
  budgetId: string,
  name: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const parsed = budgetSectionInputSchema.parse({ name });
    const section = await repo.createSection(orgId, budgetId, parsed.name);
    revalidateProject(projectId);
    return { ok: true, data: { id: section.id } };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function deleteSectionAction(
  projectId: string,
  sectionId: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteSection(orgId, sectionId);
    revalidateProject(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}
