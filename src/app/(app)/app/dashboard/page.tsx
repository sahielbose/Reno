import { getOrgContext } from "@/lib/auth";
import { getDashboardStats } from "@/server/services/project-financials";
import { PageHeader } from "@/components/app/shell/page-header";
import { ButtonLink } from "@/components/ui/button";
import { DashboardView } from "@/components/app/dashboard/dashboard-view";

export default async function DashboardPage() {
  const { orgId } = await getOrgContext();
  const stats = await getDashboardStats(orgId);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what needs your attention."
      >
        <ButtonLink href="/app/assistant" variant="dark" size="sm">
          Ask the assistant
        </ButtonLink>
      </PageHeader>
      <DashboardView stats={stats} />
    </>
  );
}
