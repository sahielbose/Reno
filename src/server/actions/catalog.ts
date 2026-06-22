"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getOrgContext, requirePermission, ForbiddenError } from "@/lib/auth";
import {
  costCatalogItemInputSchema,
  type CostCatalogItemInput,
} from "@/server/schemas/catalog";
import * as catalog from "@/server/repositories/catalog";
import * as budget from "@/server/repositories/budget";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function toMessage(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Invalid input";
  if (e instanceof ForbiddenError) return e.message;
  if (
    e &&
    typeof e === "object" &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  ) {
    return "That code already exists.";
  }
  return "Something went wrong. Please try again.";
}

export async function createCatalogItemAction(
  input: CostCatalogItemInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = costCatalogItemInputSchema.parse(input);
    const item = await catalog.createCatalogItem(orgId, data);
    revalidatePath("/app/catalog");
    return { ok: true, data: { id: item.id } };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function updateCatalogItemAction(
  id: string,
  input: CostCatalogItemInput,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const data = costCatalogItemInputSchema.parse(input);
    await catalog.updateCatalogItem(orgId, id, data);
    revalidatePath("/app/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function deleteCatalogItemAction(
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId, role } = await getOrgContext();
    requirePermission(role, "contact.delete");
    await catalog.deleteCatalogItem(orgId, id);
    revalidatePath("/app/catalog");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

/** Insert a catalog item into a project's budget section (linked line). */
export async function insertCatalogItemAction(
  projectId: string,
  sectionId: string,
  catalogItemId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const line = await budget.insertCatalogItem(
      orgId,
      sectionId,
      catalogItemId,
    );
    revalidatePath(`/app/projects/${projectId}/budget`);
    return { ok: true, data: { id: line.id } };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}
