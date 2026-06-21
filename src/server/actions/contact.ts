"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { getOrgContext, requirePermission, ForbiddenError } from "@/lib/auth";
import {
  contactInputSchema,
  type ContactInput,
} from "@/server/schemas/contact";
import * as repo from "@/server/repositories/contact";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function toMessage(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Invalid input";
  if (e instanceof ForbiddenError) return e.message;
  return "Something went wrong. Please try again.";
}

export async function createContactAction(
  input: ContactInput,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const data = contactInputSchema.parse(input);
    const contact = await repo.createContact(orgId, data);
    revalidatePath("/app/contacts");
    return { ok: true, id: contact.id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function updateContactAction(
  id: string,
  input: ContactInput,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    const data = contactInputSchema.parse(input);
    const contact = await repo.updateContact(orgId, id, data);
    revalidatePath("/app/contacts");
    revalidatePath(`/app/contacts/${id}`);
    return { ok: true, id: contact.id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  try {
    const { orgId, role } = await getOrgContext();
    requirePermission(role, "contact.delete");
    await repo.deleteContact(orgId, id);
    revalidatePath("/app/contacts");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: toMessage(e) };
  }
}
