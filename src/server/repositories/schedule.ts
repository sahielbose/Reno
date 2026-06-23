import type { DependencyType } from "@prisma/client";

import { db } from "@/lib/db";

export function listScheduleTasks(orgId: string, projectId: string) {
  return db.scheduleTask.findMany({
    where: { orgId, projectId },
    orderBy: { order: "asc" },
    include: { successors: true, predecessors: true },
  });
}

export type ScheduleTaskWithDeps = Awaited<
  ReturnType<typeof listScheduleTasks>
>[number];

export async function createScheduleTask(
  orgId: string,
  projectId: string,
  input: {
    name: string;
    startDate?: Date | null;
    endDate?: Date | null;
    durationDays: number;
    percentComplete?: number;
  },
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  const count = await db.scheduleTask.count({ where: { orgId, projectId } });
  return db.scheduleTask.create({
    data: {
      orgId,
      projectId,
      name: input.name,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      durationDays: input.durationDays,
      percentComplete: input.percentComplete ?? 0,
      order: count,
    },
  });
}

export async function updateScheduleTask(
  orgId: string,
  id: string,
  data: {
    name?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    durationDays?: number;
    percentComplete?: number;
  },
) {
  await db.scheduleTask.findFirstOrThrow({ where: { id, orgId } });
  return db.scheduleTask.update({ where: { id }, data });
}

export async function deleteScheduleTask(orgId: string, id: string) {
  await db.scheduleTask.findFirstOrThrow({ where: { id, orgId } });
  return db.scheduleTask.delete({ where: { id } });
}

export async function linkTasks(
  orgId: string,
  predecessorId: string,
  successorId: string,
  type: DependencyType = "FS",
  lagDays = 0,
) {
  if (predecessorId === successorId) throw new Error("self-link");
  const both = await db.scheduleTask.count({
    where: { orgId, id: { in: [predecessorId, successorId] } },
  });
  if (both !== 2) throw new Error("not in org");
  return db.taskDependency.create({
    data: { predecessorId, successorId, type, lagDays },
  });
}

export async function unlinkTasks(orgId: string, dependencyId: string) {
  const dep = await db.taskDependency.findUnique({
    where: { id: dependencyId },
    include: { predecessor: { select: { orgId: true } } },
  });
  if (!dep || dep.predecessor.orgId !== orgId) throw new Error("not found");
  return db.taskDependency.delete({ where: { id: dependencyId } });
}
