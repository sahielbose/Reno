"use server";

import { revalidatePath } from "next/cache";

import { getOrgContext } from "@/lib/auth";
import { getProjectBudget } from "@/server/repositories/budget";
import { getProject } from "@/server/repositories/project";
import { getOrg } from "@/server/repositories/org";
import {
  buildBudgetSnapshot,
  generateScope,
} from "@/server/services/proposal-from-budget";
import * as repo from "@/server/repositories/proposal";
import { logActivity } from "@/server/repositories/activity";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Snapshot the project's current budget into a (re)generated proposal. */
export async function generateProposalAction(
  projectId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId, userId } = await getOrgContext();
    const [budget, project, org] = await Promise.all([
      getProjectBudget(orgId, projectId),
      getProject(orgId, projectId),
      getOrg(orgId),
    ]);
    if (!budget || budget.sections.length === 0) {
      return { ok: false, error: "Add budget line items before generating." };
    }
    const snapshot = buildBudgetSnapshot(budget, new Date());
    const scope = generateScope(
      org?.name ?? "The contractor",
      project?.address ?? null,
      snapshot,
    );
    const proposal = await repo.generateProposal(
      orgId,
      projectId,
      snapshot,
      scope,
      snapshot.total,
    );
    await logActivity(orgId, "generated", {
      projectId,
      actorId: userId,
      target: `Proposal ${proposal.number}`,
    });
    revalidatePath(`/app/projects/${projectId}/proposal`);
    revalidatePath("/app/proposals");
    return { ok: true, data: { id: proposal.id } };
  } catch {
    return { ok: false, error: "Couldn't generate the proposal." };
  }
}
