import { getOrgContext } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import { listInvoices } from "@/server/repositories/invoice";
import { getProjectFinancials } from "@/server/services/project-financials";
import { InvoicesPanel } from "@/components/app/invoices/invoices-panel";

export default async function ProjectInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const [rows, summary] = await Promise.all([
    listInvoices(orgId, id),
    getProjectFinancials(orgId, id),
  ]);

  const invoices = rows.map((inv) => {
    const amount = toNumber(inv.amount);
    const paid = inv.payments.reduce((s, p) => s + toNumber(p.amount), 0);
    return {
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount,
      paid,
      balance: Math.round((amount - paid) * 100) / 100,
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
      lineItems: inv.lineItems.map((l) => ({
        description: l.description,
        amount: toNumber(l.amount),
      })),
    };
  });

  return (
    <InvoicesPanel
      projectId={id}
      contractValue={summary?.financials.contractValue ?? 0}
      invoices={invoices}
    />
  );
}
