import { getOrgContext, can } from "@/lib/auth";
import { listCatalog } from "@/server/repositories/catalog";
import { toNumber } from "@/lib/format";
import { PageHeader } from "@/components/app/shell/page-header";
import { CatalogView } from "@/components/app/catalog/catalog-view";

export default async function CatalogPage() {
  const { orgId, role } = await getOrgContext();
  const rows = await listCatalog(orgId);
  const items = rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    unit: r.unit,
    defaultUnitCost: toNumber(r.defaultUnitCost),
  }));

  return (
    <>
      <PageHeader
        title="Cost catalog"
        subtitle="Reusable cost codes behind every budget, bill, and PO."
      />
      <CatalogView items={items} canDelete={can(role, "contact.delete")} />
    </>
  );
}
