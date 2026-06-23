"use server";

import { revalidatePath } from "next/cache";

import { getOrgContext } from "@/lib/auth";
import * as repo from "@/server/repositories/notification";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function markNotificationReadAction(
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.markRead(orgId, id);
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update the notification." };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.markAllRead(orgId);
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update notifications." };
  }
}
