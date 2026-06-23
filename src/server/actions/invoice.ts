"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrgContext } from "@/lib/auth";
import { logActivity } from "@/server/repositories/activity";
import { getProjectFinancials } from "@/server/services/project-financials";
import * as repo from "@/server/repositories/invoice";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const lineSchema = z.object({
  description: z.string().trim().min(1),
  amount: z.coerce.number().finite(),
});

const invoiceSchema = z.object({
  lineItems: z.array(lineSchema).min(1, "Add at least one line"),
  dueDate: z.string().nullish(),
  send: z.boolean().optional(),
});

function revalidate(projectId: string) {
  revalidatePath(`/app/projects/${projectId}/invoices`);
  revalidatePath("/app/invoices");
  revalidatePath("/app");
}

export async function createInvoiceAction(
  projectId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const data = invoiceSchema.parse(input);
    const invoice = await repo.createInvoice(orgId, projectId, {
      lineItems: data.lineItems,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.send ? "SENT" : "DRAFT",
    });
    await logActivity(orgId, "created invoice", {
      projectId,
      target: invoice.number,
    });
    revalidate(projectId);
    return { ok: true, data: { id: invoice.id } };
  } catch {
    return { ok: false, error: "Couldn't create the invoice." };
  }
}

/** Bill a percentage of the project's contract value as one progress line. */
export async function createProgressInvoiceAction(
  projectId: string,
  percent: number,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { orgId } = await getOrgContext();
    const pct = Math.max(1, Math.min(100, Math.round(percent)));
    const summary = await getProjectFinancials(orgId, projectId);
    const contractValue = summary?.financials?.contractValue ?? 0;
    const amount = Math.round(((contractValue * pct) / 100) * 100) / 100;
    if (amount <= 0) {
      return { ok: false, error: "Set a budget before billing." };
    }
    const invoice = await repo.createInvoice(orgId, projectId, {
      lineItems: [
        { description: `Progress billing - ${pct}% of contract`, amount },
      ],
      status: "SENT",
    });
    await logActivity(orgId, "created invoice", {
      projectId,
      target: invoice.number,
    });
    revalidate(projectId);
    return { ok: true, data: { id: invoice.id } };
  } catch {
    return { ok: false, error: "Couldn't create the invoice." };
  }
}

export async function sendInvoiceAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.sendInvoice(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't send the invoice." };
  }
}

export async function recordPaymentAction(
  projectId: string,
  invoiceId: string,
  amount: number,
  method?: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    if (!(amount > 0)) return { ok: false, error: "Enter a payment amount." };
    await repo.addPayment(orgId, invoiceId, amount, method);
    await logActivity(orgId, "recorded payment", { projectId });
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't record the payment." };
  }
}

export async function deleteInvoiceAction(
  projectId: string,
  id: string,
): Promise<ActionResult> {
  try {
    const { orgId } = await getOrgContext();
    await repo.deleteInvoice(orgId, id);
    revalidate(projectId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete the invoice." };
  }
}
