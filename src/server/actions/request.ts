"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import { requireSession } from "@/lib/auth";
import * as repo from "@/server/repositories/request";
import { logActivity } from "@/server/repositories/activity";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const requestInputSchema = z.object({
  type: z.enum(["RFI", "CHANGE_ORDER", "LIEN_WAIVER", "OTHER"]).default("RFI"),
  subject: z.string().trim().min(1, "Subject is required"),
  body: z.string().trim().min(1, "Add a message"),
});
export type RequestInput = z.infer<typeof requestInputSchema>;

function toMessage(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Invalid input";
  return "Something went wrong. Please try again.";
}

function revalidate(projectId: string) {
  revalidatePath(`/app/projects/${projectId}/requests`);
}

export async function createRequestAction(
  projectId: string,
  input: RequestInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    const data = requestInputSchema.parse(input);
    const request = await repo.createRequest(session.org.id, projectId, {
      ...data,
      authorName: session.user.name,
    });
    await logActivity(session.org.id, "opened", {
      projectId,
      actorId: session.user.id,
      target: `${request.number}`,
    });
    revalidate(projectId);
    return { ok: true, data: { id: request.id } };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function replyToRequestAction(
  projectId: string,
  requestId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    if (!body.trim()) return { ok: false, error: "Write a reply first." };
    await repo.addRequestMessage(
      session.org.id,
      requestId,
      session.user.name,
      body.trim(),
    );
    revalidate(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function resolveRequestAction(
  projectId: string,
  requestId: string,
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await repo.updateRequestStatus(session.org.id, requestId, "RESOLVED");
    revalidate(projectId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}
