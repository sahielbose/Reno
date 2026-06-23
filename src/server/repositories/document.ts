import type { DocumentKind } from "@prisma/client";

import { db } from "@/lib/db";

export function listDocuments(orgId: string, projectId: string) {
  return db.document.findMany({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
  });
}

export function getDocument(orgId: string, id: string) {
  return db.document.findFirst({ where: { id, orgId } });
}

export function createDocument(input: {
  orgId: string;
  projectId: string;
  name: string;
  kind: DocumentKind;
  fileKey: string;
  contentType?: string;
  size?: number;
  uploadedById?: string;
}) {
  return db.document.create({ data: input });
}

export async function deleteDocument(orgId: string, id: string) {
  await db.document.findFirstOrThrow({ where: { id, orgId } });
  return db.document.delete({ where: { id } });
}
