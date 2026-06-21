import { db } from "@/lib/db";

/** Recent activity for a single project (newest first). */
export function recentProjectActivity(
  orgId: string,
  projectId: string,
  take = 6,
) {
  return db.activityLog.findMany({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: true },
  });
}

/** Recent activity across the whole org. */
export function recentOrgActivity(orgId: string, take = 8) {
  return db.activityLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: true },
  });
}

export async function logActivity(
  orgId: string,
  verb: string,
  opts?: { projectId?: string; actorId?: string; target?: string },
) {
  return db.activityLog.create({
    data: {
      orgId,
      verb,
      projectId: opts?.projectId,
      actorId: opts?.actorId,
      target: opts?.target,
    },
  });
}
