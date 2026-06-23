import { PageHeader } from "@/components/app/shell/page-header";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import { listPurchaseOrders } from "@/server/repositories/purchase-order";
import { listVendorBills } from "@/server/repositories/vendor-bill";
import { listContacts } from "@/server/repositories/contact";
import { PurchasingView } from "@/components/app/purchasing/purchasing-view";

export default async function PurchaseOrdersPage() {
  const { orgId } = await getOrgContext();
  const [poRows, billRows, vendors, projects] = await Promise.all([
    listPurchaseOrders(orgId),
    listVendorBills(orgId),
    listContacts(orgId, { type: "VENDOR" }),
    db.project.findMany({
      where: { orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const pos = poRows.map((po) => ({
    id: po.id,
    number: po.number,
    projectId: po.projectId,
    projectName: po.project.name,
    vendorName: po.vendor?.name ?? null,
    status: po.status,
    total: toNumber(po.total),
    lineCount: po.lineItems.length,
  }));
  const bills = billRows.map((b) => ({
    id: b.id,
    number: b.number,
    projectId: b.projectId,
    projectName: b.project.name,
    vendorName: b.vendor?.name ?? null,
    poNumber: b.po?.number ?? null,
    amount: toNumber(b.amount),
    status: b.status,
    dueDate: b.dueDate ? b.dueDate.toISOString() : null,
  }));

  return (
    <>
      <PageHeader
        title="Purchase orders"
        subtitle="Send POs and track ordered vs delivered."
      />
      <PurchasingView
        projects={projects}
        vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
        pos={pos}
        bills={bills}
      />
    </>
  );
}
