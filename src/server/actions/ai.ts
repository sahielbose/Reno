"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth";
import { resolveAIProvider } from "@/lib/ai";
import { buildAssistantContext } from "@/server/services/assistant";
import * as repo from "@/server/repositories/ai";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function sendMessageAction(
  threadId: string | null,
  content: string,
): Promise<ActionResult<{ threadId: string; answer: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const text = content.trim();
    if (!text) return { ok: false, error: "Type a message." };

    let id = threadId;
    if (id) {
      const existing = await repo.getThread(orgId, id);
      if (!existing) return { ok: false, error: "Conversation not found." };
    } else {
      const thread = await repo.createThread(
        orgId,
        text.slice(0, 48) + (text.length > 48 ? "…" : ""),
      );
      id = thread.id;
    }

    await repo.addMessage(id, "USER", text);

    const [ctx, thread, org] = await Promise.all([
      buildAssistantContext(orgId),
      repo.getThread(orgId, id),
      db.organization.findUnique({
        where: { id: orgId },
        select: { aiApiKey: true, aiModel: true },
      }),
    ]);
    const history = (thread?.messages ?? []).map((m) => ({
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
    }));

    const provider = resolveAIProvider({
      apiKey: org?.aiApiKey,
      model: org?.aiModel,
    });
    const answer = await provider.complete(history, ctx);
    await repo.addMessage(id, "ASSISTANT", answer);

    revalidatePath("/app/assistant");
    return { ok: true, data: { threadId: id, answer } };
  } catch {
    return { ok: false, error: "The assistant couldn't respond." };
  }
}

export async function deleteThreadAction(id: string): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteThread(orgId, id);
    revalidatePath("/app/assistant");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the conversation." };
  }
}
