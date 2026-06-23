import { PageHeader } from "@/components/app/shell/page-header";
import { getOrgContext } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import { listInvoices } from "@/server/repositories/invoice";
import { InvoicesTable } from "@/components/app/invoices/invoices-table";

export default async function InvoicesPage() {
  const { orgId } = await getOrgContext();
  const rows = await listInvoices(orgId);
  const invoices = rows.map((inv) => {
    const amount = toNumber(inv.amount);
    const paid = inv.payments.reduce((s, p) => s + toNumber(p.amount), 0);
    return {
      id: inv.id,
      number: inv.number,
      projectId: inv.projectId,
      projectName: inv.project.name,
      status: inv.status,
      amount,
      paid,
      balance: Math.round((amount - paid) * 100) / 100,
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    };
  });

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Client finances, synced to your books."
      />
      <InvoicesTable invoices={invoices} />
    </>
  );
}
