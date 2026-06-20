import { BackLink } from "@/components/app/shell/page-header";
import { ProjectTabs } from "@/components/app/project/project-tabs";

export default async function ProjectHubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <BackLink href="/app/projects" label="All projects" />
      <h1 className="font-display text-[1.6rem] font-semibold">Project {id}</h1>
      <p className="text-text-2 mt-1 mb-5 text-sm">
        Project hub — full detail arrives in Phase 8.
      </p>
      <ProjectTabs projectId={id} />
      {children}
    </div>
  );
}
