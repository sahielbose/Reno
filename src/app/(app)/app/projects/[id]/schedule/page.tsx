import { getOrgContext } from "@/lib/auth";
import { listScheduleTasks } from "@/server/repositories/schedule";
import { buildSchedule } from "@/server/services/schedule";
import { ScheduleBoard } from "@/components/app/schedule/schedule-board";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const rows = await listScheduleTasks(orgId, id);
  const view = buildSchedule(rows);

  return <ScheduleBoard projectId={id} view={view} />;
}
