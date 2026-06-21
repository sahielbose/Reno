import type { Prisma, ProjectStatus } from "@prisma/client";

import { db } from "@/lib/db";
import type { ProjectInput } from "@/server/schemas/project";

export function listProjects(
  orgId: string,
  opts?: { status?: ProjectStatus; search?: string },
) {
  const where: Prisma.ProjectWhereInput = { orgId };
  if (opts?.status) where.status = opts.status;
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { address: { contains: opts.search, mode: "insensitive" } },
    ];
  }
  return db.project.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getProject(orgId: string, id: string) {
  return db.project.findFirst({
    where: { id, orgId },
    include: { client: true },
  });
}

export function createProject(orgId: string, input: ProjectInput) {
  return db.project.create({
    data: {
      orgId,
      name: input.name,
      clientId: input.clientId || null,
      address: input.address || null,
      trade: input.trade || null,
      status: input.status,
      icon: input.icon || null,
      startDate: input.startDate ?? null,
      targetEndDate: input.targetEndDate ?? null,
    },
  });
}

export async function updateProject(
  orgId: string,
  id: string,
  input: Partial<ProjectInput>,
) {
  await db.project.findFirstOrThrow({ where: { id, orgId } });
  return db.project.update({
    where: { id },
    data: {
      name: input.name,
      clientId: input.clientId,
      address: input.address,
      trade: input.trade,
      status: input.status,
      icon: input.icon,
      startDate: input.startDate,
      targetEndDate: input.targetEndDate,
    },
  });
}

export async function deleteProject(orgId: string, id: string) {
  await db.project.findFirstOrThrow({ where: { id, orgId } });
  return db.project.delete({ where: { id } });
}
