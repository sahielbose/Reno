"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { DependencyType } from "@prisma/client";

import { getOrgContext } from "@/lib/auth";
import * as repo from "@/server/repositories/schedule";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const DAY = 1000 * 60 * 60 * 24;

function spanDays(start?: string | null, end?: string | null): number {
  if (!start || !end) return 1;
  return Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / DAY));
}

const taskSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  percentComplete: z.coerce.number().int().min(0).max(100).optional(),
});

function revalidate(projectId: string) {
  revalidatePath(`/app/projects/${projectId}/schedule`);
}

export async function createScheduleTaskAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = taskSchema.parse(input);
    const task = await repo.createScheduleTask(orgId, projectId, {
      name: data.name,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      durationDays: spanDays(data.startDate, data.endDate),
      percentComplete: data.percentComplete ?? 0,
    });
    revalidate(projectId);
    return { ok: true, data: { id: task.id } };
  } catch {
    return { ok: false, error: "Couldn't add the task." };
  }
}

export async function updateScheduleTaskAction(
  projectId: string,
  id: string,
  patch: {
    name?: string;
    startDate?: string | null;
    endDate?: string | null;
    percentComplete?: number;
  },
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const start = patch.startDate ? new Date(patch.startDate) : undefined;
    const end = patch.endDate ? new Date(patch.endDate) : undefined;
    await repo.updateScheduleTask(orgId, id, {
      name: patch.name,
      startDate: start,
      endDate: end,
      durationDays:
        patch.startDate && patch.endDate
          ? spanDays(patch.startDate, patch.endDate)
          : undefined,
      percentComplete:
        patch.percentComplete != null
          ? Math.max(0, Math.min(100, Math.round(patch.percentComplete)))
          : undefined,
    });
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the task." };
  }
}

export async function deleteScheduleTaskAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteScheduleTask(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the task." };
  }
}

export async function linkTasksAction(
  projectId: string,
  predecessorId: string,
  successorId: string,
  type: DependencyType = "FS",
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.linkTasks(orgId, predecessorId, successorId, type);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't link the tasks." };
  }
}

export async function unlinkTasksAction(
  projectId: string,
  dependencyId: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.unlinkTasks(orgId, dependencyId);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't unlink the tasks." };
  }
}
