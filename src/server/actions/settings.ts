"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getOrgContext, hasRole } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(10, "That doesn't look like a valid key.")
    .refine((k) => k.startsWith("sk-ant-"), {
      message: "Anthropic keys start with 'sk-ant-'.",
    }),
  model: z.string().trim().optional(),
});

/** Save the org's Anthropic key (Settings -> AI). Admin/Owner only. */
export async function saveAiKeyAction(input: {
  apiKey: string;
  model?: string;
}): Promise<ActionResult> {
  try {
    const { orgId, role } = await getOrgContext();
    if (!hasRole(role, "ADMIN")) {
      return { ok: false, error: "Only an admin can change AI settings." };
    }
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid.",
      };
    }
    await db.organization.update({
      where: { id: orgId },
      data: {
        aiApiKey: parsed.data.apiKey,
        aiModel: parsed.data.model?.trim() || null,
      },
    });
    revalidatePath("/app/settings");
    revalidatePath("/app/assistant");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save the key." };
  }
}

/** Remove the org's saved key (falls back to env key or demo mode). */
export async function disconnectAiAction(): Promise<ActionResult> {
  try {
    const { orgId, role } = await getOrgContext();
    if (!hasRole(role, "ADMIN")) {
      return { ok: false, error: "Only an admin can change AI settings." };
    }
    await db.organization.update({
      where: { id: orgId },
      data: { aiApiKey: null, aiModel: null },
    });
    revalidatePath("/app/settings");
    revalidatePath("/app/assistant");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't disconnect." };
  }
}
