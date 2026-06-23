"use server";

import { revalidatePath } from "next/cache";
import type { DocumentKind } from "@prisma/client";

import { getOrgContext } from "@/lib/auth";
import { getStorage } from "@/lib/storage/local";
import { generateToken } from "@/lib/tokens";
import * as repo from "@/server/repositories/document";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const MAX_BYTES = 25 * 1024 * 1024;

export async function uploadDocumentAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId, userId } = await getOrgContext();
    const file = formData.get("file");
    const kind = (formData.get("kind") as DocumentKind | null) ?? "OTHER";
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose a file to upload." };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: "File is too large (25MB max)." };
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${orgId}/${projectId}/${generateToken()}-${safeName}`;
    await getStorage().put(key, buf, file.type);

    const doc = await repo.createDocument({
      orgId,
      projectId,
      name: file.name,
      kind,
      fileKey: key,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      uploadedById: userId,
    });
    revalidatePath(`/app/projects/${projectId}/documents`);
    return { ok: true, data: { id: doc.id } };
  } catch {
    return { ok: false, error: "Upload failed. Please try again." };
  }
}

export async function deleteDocumentAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const doc = await repo.getDocument(orgId, id);
    if (doc) await getStorage().delete(doc.fileKey);
    await repo.deleteDocument(orgId, id);
    revalidatePath(`/app/projects/${projectId}/documents`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the file." };
  }
}
