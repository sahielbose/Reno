import { notFound } from "next/navigation";

import { getOrgContext } from "@/lib/auth";
import { getProject } from "@/server/repositories/project";
import { BackLink } from "@/components/app/shell/page-header";
import { ProjectTabs } from "@/components/app/project/project-tabs";
import { ProjectStatusBadge } from "@/components/app/project/project-status-badge";

export default async function ProjectHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const project = await getProject(orgId, id);
  if (!project) notFound();

  return (
    <div>
      <BackLink href="/app/projects" label="All projects" />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display flex items-center gap-2 text-[1.6rem] font-semibold">
            {project.icon && <span aria-hidden>{project.icon}</span>}
            {project.name}
          </h1>
          <div className="text-text-2 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {project.client && <span>👤 {project.client.name}</span>}
            {project.address && <span>📍 {project.address}</span>}
            {project.trade && <span>🔨 {project.trade}</span>}
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
      </div>
      <ProjectTabs projectId={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
