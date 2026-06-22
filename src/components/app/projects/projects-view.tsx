"use client";

import { useState } from "react";

import type { ProjectSummary } from "@/server/services/project-financials";
import { ProjectsTable } from "@/components/app/projects/projects-table";
import { NewProjectDialog } from "@/components/app/projects/new-project-dialog";

export function ProjectsView({
  summaries,
  clients,
}: {
  summaries: ProjectSummary[];
  clients: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ProjectsTable summaries={summaries} onAdd={() => setOpen(true)} />
      <NewProjectDialog open={open} onOpenChange={setOpen} clients={clients} />
    </>
  );
}
