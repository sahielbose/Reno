import { toNumber } from "@/lib/format";
import { getOrgContext } from "@/lib/auth";
import { listTakeoffs } from "@/server/repositories/takeoff";
import { TakeoffTool } from "@/components/app/takeoff/takeoff-tool";

export default async function TakeoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const rows = await listTakeoffs(orgId, id);
  const takeoffs = rows.map((t) => ({
    id: t.id,
    kind: t.kind,
    label: t.label,
    value: toNumber(t.value),
    unit: t.unit,
    inBudget: Boolean(t.budgetLineItem),
  }));

  return <TakeoffTool projectId={id} takeoffs={takeoffs} />;
}
