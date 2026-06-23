"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProjectSummary } from "@/server/services/project-financials";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABEL,
  ProjectStatusBadge,
} from "@/components/app/project/project-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProjectStatus = ProjectSummary["project"]["status"];

export function ProjectsTable({
  summaries,
  onAdd,
}: {
  summaries: ProjectSummary[];
  onAdd: () => void;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<null | ProjectStatus>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return summaries.filter((s) => {
      if (statusFilter && s.project.status !== statusFilter) return false;
      if (!q) return true;
      const name = s.project.name.toLowerCase();
      const address = (s.project.address ?? "").toLowerCase();
      return name.includes(q) || address.includes(q);
    });
  }, [summaries, statusFilter, query]);

  const pillBase =
    "rounded-full px-[0.9rem] py-[0.4rem] text-[0.85rem] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter(null)}
          aria-pressed={statusFilter === null}
          className={cn(
            pillBase,
            statusFilter === null
              ? "bg-ink text-white"
              : "border-line text-text-2 border",
          )}
        >
          All
        </button>
        {PROJECT_STATUSES.map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={active}
              className={cn(
                pillBase,
                active ? "bg-ink text-white" : "border-line text-text-2 border",
              )}
            >
              {PROJECT_STATUS_LABEL[status]}
            </button>
          );
        })}

        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          aria-label="Search projects"
          className="ml-3 w-56"
        />

        <Button variant="primary" onClick={onAdd} className="ml-auto">
          + New project
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Contract</TableHead>
              <TableHead className="text-right">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-text-2 text-[0.95rem] font-medium">
                    No projects match your filters.
                  </p>
                  <p className="text-text-3 mt-1 text-[0.85rem]">
                    Clear the search or status filter, or add a new project to
                    get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const href = `/app/projects/${s.project.id}`;
                const go = () => router.push(href);
                return (
                  <TableRow
                    key={s.project.id}
                    role="button"
                    tabIndex={0}
                    onClick={go}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        go();
                      }
                    }}
                    className="hover:bg-paper cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {s.project.icon ? (
                          <span
                            className="text-[1.15rem] leading-none"
                            aria-hidden
                          >
                            {s.project.icon}
                          </span>
                        ) : null}
                        <div className="min-w-0">
                          <div className="text-foreground font-semibold">
                            {s.project.name}
                          </div>
                          {s.project.address ? (
                            <div className="text-text-3 truncate text-[0.8rem]">
                              {s.project.address}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-2">
                      {s.project.client?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-text-2">
                      {s.project.trade ?? "-"}
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={s.project.status} />
                    </TableCell>
                    <TableCell className="mono text-right">
                      {formatCurrency(s.financials.contractValue)}
                    </TableCell>
                    <TableCell className="mono text-right">
                      {s.financials.progress}%
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
