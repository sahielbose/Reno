import { getOrgContext } from "@/lib/auth";
import { listProjectSummaries } from "@/server/services/project-financials";
import { listContacts } from "@/server/repositories/contact";
import { PageHeader } from "@/components/app/shell/page-header";
import { ProjectsView } from "@/components/app/projects/projects-view";

export default async function ProjectsPage() {
  const { orgId } = await getOrgContext();
  const [summaries, contacts] = await Promise.all([
    listProjectSummaries(orgId),
    listContacts(orgId, { type: "CLIENT" }),
  ]);
  const clients = contacts.map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={`${summaries.length} ${summaries.length === 1 ? "project" : "projects"}`}
      />
      <ProjectsView summaries={summaries} clients={clients} />
    </>
  );
}
