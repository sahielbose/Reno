import type { AIRole } from "@prisma/client";

import { db } from "@/lib/db";

export function listThreads(orgId: string) {
  return db.aIThread.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export function getThread(orgId: string, id: string) {
  return db.aIThread.findFirst({
    where: { id, orgId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export function createThread(orgId: string, title: string, projectId?: string) {
  return db.aIThread.create({
    data: { orgId, title, projectId: projectId ?? null },
  });
}

export function addMessage(threadId: string, role: AIRole, content: string) {
  return db.aIMessage.create({ data: { threadId, role, content } });
}

export async function deleteThread(orgId: string, id: string) {
  await db.aIThread.findFirstOrThrow({ where: { id, orgId } });
  return db.aIThread.delete({ where: { id } });
}
