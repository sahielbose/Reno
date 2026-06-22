"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getOrgContext, requirePermission, ForbiddenError } from "@/lib/auth";
import {
  projectInputSchema,
  type ProjectInput,
} from "@/server/schemas/project";
import * as repo from "@/server/repositories/project";
import { logActivity } from "@/server/repositories/activity";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function toMessage(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Invalid input";
  if (e instanceof ForbiddenError) return e.message;
  return "Something went wrong. Please try again.";
}

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult> {
  try {
    const { orgId, userId } = await getOrgContext();
    const data = projectInputSchema.parse(input);
    const project = await repo.createProject(orgId, data);
    await logActivity(orgId, "created", {
      projectId: project.id,
      actorId: userId,
      target: project.name,
    });
    revalidatePath("/app/projects");
    revalidatePath("/app/dashboard");
    return { ok: true, id: project.id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function updateProjectAction(
  id: string,
  input: Partial<ProjectInput>,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.updateProject(orgId, id, input);
    revalidatePath("/app/projects");
    revalidatePath(`/app/projects/${id}`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    const { orgId, role } = await getOrgContext();
    requirePermission(role, "project.delete");
    await repo.deleteProject(orgId, id);
    revalidatePath("/app/projects");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}
