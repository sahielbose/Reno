import type { InvoiceStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

const include = {
  payments: true,
  lineItems: { orderBy: { order: "asc" as const } },
  project: { select: { id: true, name: true } },
} satisfies Prisma.InvoiceInclude;

export function listInvoices(orgId: string, projectId?: string) {
  return db.invoice.findMany({
    where: { orgId, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "desc" },
    include,
  });
}

export function getInvoice(orgId: string, id: string) {
  return db.invoice.findFirst({ where: { id, orgId }, include });
}

export async function createInvoice(
  orgId: string,
  projectId: string,
  input: {
    lineItems: { description: string; amount: number }[];
    dueDate?: Date | null;
    status?: InvoiceStatus;
  },
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  const count = await db.invoice.count({ where: { orgId } });
  const number = `INV-${String(count + 1).padStart(3, "0")}`;
  const amount = input.lineItems.reduce((s, l) => s + l.amount, 0);
  const status = input.status ?? "DRAFT";
  return db.invoice.create({
    data: {
      orgId,
      projectId,
      number,
      amount,
      status,
      dueDate: input.dueDate ?? null,
      issuedAt: status === "DRAFT" ? null : new Date(),
      lineItems: {
        create: input.lineItems.map((l, i) => ({
          description: l.description,
          amount: l.amount,
          order: i,
        })),
      },
    },
    include,
  });
}

export async function updateInvoiceStatus(
  orgId: string,
  id: string,
  status: InvoiceStatus,
) {
  await db.invoice.findFirstOrThrow({ where: { id, orgId } });
  return db.invoice.update({ where: { id }, data: { status } });
}

export async function sendInvoice(orgId: string, id: string) {
  await db.invoice.findFirstOrThrow({ where: { id, orgId } });
  return db.invoice.update({
    where: { id },
    data: { status: "SENT", issuedAt: new Date() },
  });
}

/** Record a payment and flip the invoice to PAID once fully covered. */
export async function addPayment(
  orgId: string,
  invoiceId: string,
  amount: number,
  method?: string,
) {
  const invoice = await db.invoice.findFirstOrThrow({
    where: { id: invoiceId, orgId },
    include: { payments: true },
  });
  await db.payment.create({
    data: { orgId, invoiceId, amount, method: method ?? null },
  });
  const paid =
    invoice.payments.reduce((s, p) => s + Number(p.amount), 0) + amount;
  if (paid + 0.001 >= Number(invoice.amount) && invoice.status !== "PAID") {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });
  }
}

export async function deleteInvoice(orgId: string, id: string) {
  await db.invoice.findFirstOrThrow({ where: { id, orgId } });
  return db.invoice.delete({ where: { id } });
}
