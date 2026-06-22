import { notFound } from "next/navigation";

import { getOrgContext } from "@/lib/auth";
import { getProjectFinancials } from "@/server/services/project-financials";
import { recentProjectActivity } from "@/server/repositories/activity";
import { ProjectOverview } from "@/components/app/project/project-overview";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const [summary, activity] = await Promise.all([
    getProjectFinancials(orgId, id),
    recentProjectActivity(orgId, id),
  ]);
  if (!summary) notFound();

  return <ProjectOverview summary={summary} activity={activity} />;
}
