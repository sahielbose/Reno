import type { Prisma, TakeoffKind } from "@prisma/client";

import { db } from "@/lib/db";

export function listTakeoffs(orgId: string, projectId: string) {
  return db.takeoff.findMany({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
    include: { budgetLineItem: { select: { id: true } } },
  });
}

export function createTakeoff(
  orgId: string,
  projectId: string,
  input: {
    kind: TakeoffKind;
    label: string;
    value: number;
    unit: string;
    geometry?: unknown;
  },
) {
  return db.takeoff.create({
    data: {
      orgId,
      projectId,
      kind: input.kind,
      label: input.label,
      value: input.value,
      unit: input.unit,
      geometry: (input.geometry ?? undefined) as Prisma.InputJsonValue,
    },
  });
}

export async function deleteTakeoff(orgId: string, id: string) {
  await db.takeoff.findFirstOrThrow({ where: { id, orgId } });
  return db.takeoff.delete({ where: { id } });
}
