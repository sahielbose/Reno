"use server";

import { revalidatePath } from "next/cache";

import { getAuthProvider } from "@/lib/auth";

/** Switch the active organization (dev: sets a cookie). Re-renders the app. */
export async function switchOrgAction(orgId: string): Promise<void> {
  await getAuthProvider().setActiveOrg(orgId);
  revalidatePath("/app", "layout");
}
