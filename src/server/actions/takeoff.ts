"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth";
import { ensureProjectBudget } from "@/server/repositories/budget";
import * as repo from "@/server/repositories/takeoff";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const takeoffInputSchema = z.object({
  kind: z.enum(["AREA", "LENGTH", "COUNT"]),
  label: z.string().trim().min(1),
  value: z.coerce.number().finite().min(0),
  unit: z.string().trim().min(1),
  geometry: z.unknown().optional(),
});

export async function createTakeoffAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = takeoffInputSchema.parse(input);
    const takeoff = await repo.createTakeoff(orgId, projectId, data);
    revalidatePath(`/app/projects/${projectId}/takeoff`);
    return { ok: true, data: { id: takeoff.id } };
  } catch {
    return { ok: false, error: "Couldn't save the takeoff." };
  }
}

export async function deleteTakeoffAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteTakeoff(orgId, id);
    revalidatePath(`/app/projects/${projectId}/takeoff`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the takeoff." };
  }
}

/** Push a measured quantity into the budget as a linked line item. */
export async function pushTakeoffToBudgetAction(
  projectId: string,
  takeoffId: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const takeoff = await db.takeoff.findFirst({
      where: { id: takeoffId, orgId, projectId },
    });
    if (!takeoff) return { ok: false, error: "Takeoff not found." };

    const existing = await db.budgetLineItem.findUnique({
      where: { takeoffId },
    });
    if (existing) return { ok: false, error: "Already pushed to the budget." };

    const budget = await ensureProjectBudget(orgId, projectId);
    const existing2 = budget.sections.find((s) => s.name === "Takeoffs");
    let sectionId: string;
    let order: number;
    if (existing2) {
      sectionId = existing2.id;
      order = existing2.items.length;
    } else {
      const created = await db.budgetSection.create({
        data: {
          budgetId: budget.id,
          name: "Takeoffs",
          order: budget.sections.length,
        },
      });
      sectionId = created.id;
      order = 0;
    }
    await db.budgetLineItem.create({
      data: {
        sectionId,
        takeoffId: takeoff.id,
        name: takeoff.label,
        qty: takeoff.value,
        unit: takeoff.unit,
        unitCost: 0,
        order,
      },
    });

    revalidatePath(`/app/projects/${projectId}/budget`);
    revalidatePath(`/app/projects/${projectId}/takeoff`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't push to the budget." };
  }
}
