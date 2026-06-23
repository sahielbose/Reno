import { db } from "@/lib/db";

export function listNotifications(orgId: string, take = 30) {
  return db.notification.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function unreadCount(orgId: string) {
  return db.notification.count({ where: { orgId, readAt: null } });
}

export async function markRead(orgId: string, id: string) {
  await db.notification.findFirstOrThrow({ where: { id, orgId } });
  return db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}

export function markAllRead(orgId: string) {
  return db.notification.updateMany({
    where: { orgId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function createNotification(
  orgId: string,
  input: { kind: string; title?: string; body?: string; projectId?: string },
) {
  return db.notification.create({
    data: {
      orgId,
      kind: input.kind,
      title: input.title ?? null,
      body: input.body ?? null,
      projectId: input.projectId ?? null,
    },
  });
}
