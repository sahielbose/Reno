import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  HardHat,
  ReceiptText,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import type {
  DashboardStats,
  ProjectSummary,
} from "@/server/services/project-financials";
import { ProjectStatusBadge } from "@/components/app/project/project-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/** One stat card: icon tile, label, big mono value, small delta line. */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "danger" | "ok";
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <span
          aria-hidden
          className="bg-brand-100 text-brand rounded-reno flex size-10 shrink-0 items-center justify-center"
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="text-text-2 text-sm">{label}</div>
          <div className="mono mt-0.5 text-[1.6rem] leading-tight font-semibold">
            {value}
          </div>
          <div
            className={cn(
              "mt-0.5 text-[0.8rem]",
              tone === "danger"
                ? "text-danger"
                : tone === "ok"
                  ? "text-ok"
                  : "text-text-3",
            )}
          >
            {sub}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** The home dashboard: stat grid, active-projects table, and assistant card. */
export function DashboardView({ stats }: { stats: DashboardStats }) {
  const activeSummaries = stats.summaries.filter(
    (s: ProjectSummary) => s.project.status === "ACTIVE",
  );

  const insight =
    stats.overdueAmount > 0
      ? `${formatCurrency(stats.overdueAmount)} across ${stats.overdueCount} invoice${
          stats.overdueCount === 1 ? "" : "s"
        } is past due - worth a nudge to keep cash flowing.`
      : stats.activeCount > 0
        ? `${stats.activeCount} project${
            stats.activeCount === 1 ? "" : "s"
          } in flight and nothing overdue. Cash collection is on track.`
        : "No active jobs yet. Win a bid to get the first project moving.";

  return (
    <div className="flex flex-col gap-6">
      {/* 1) Stat grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Active projects"
          value={String(stats.activeCount)}
          sub={`${stats.inBuildCount} in build phase`}
        />
        <StatCard
          icon={TriangleAlert}
          label="Overdue invoices"
          value={formatCurrency(stats.overdueAmount)}
          sub={`${stats.overdueCount} overdue`}
          tone="danger"
        />
        <StatCard
          icon={ReceiptText}
          label="Open bids"
          value={formatCurrency(stats.pipeline)}
          sub={`${stats.pipelineCount} in pipeline`}
        />
        <StatCard
          icon={Wallet}
          label="Collected"
          value={formatCurrency(stats.collected)}
          sub="to date"
          tone="ok"
        />
      </div>

      {/* 2) Two-column area */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* LEFT - active projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active projects</CardTitle>
            <Link
              href="/app/projects"
              className="text-brand focus-visible:ring-brand/50 inline-flex items-center gap-1 rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </CardHeader>

          {activeSummaries.length === 0 ? (
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <span
                aria-hidden
                className="bg-paper text-text-3 rounded-reno flex size-12 items-center justify-center"
              >
                <HardHat className="size-6" />
              </span>
              <div>
                <p className="text-foreground font-semibold">
                  No active projects
                </p>
                <p className="text-text-3 mt-1 text-[0.85rem]">
                  Move a planning job into build to see it tracked here.
                </p>
              </div>
              <ButtonLink href="/app/projects" variant="primary" size="sm">
                Browse projects
              </ButtonLink>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSummaries.map((s) => (
                  <TableRow key={s.project.id} className="hover:bg-paper">
                    <TableCell>
                      <Link
                        href={`/app/projects/${s.project.id}`}
                        className="focus-visible:ring-brand/50 -mx-1 -my-0.5 flex items-center gap-3 rounded-sm px-1 py-0.5 outline-none focus-visible:ring-2"
                      >
                        {s.project.icon ? (
                          <span
                            className="text-[1.15rem] leading-none"
                            aria-hidden
                          >
                            {s.project.icon}
                          </span>
                        ) : null}
                        <span className="text-foreground min-w-0 truncate font-semibold">
                          {s.project.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-2">
                      {s.project.client?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={s.project.status} />
                    </TableCell>
                    <TableCell className="mono text-right">
                      {s.financials.progress}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* RIGHT - assistant */}
        <Card>
          <CardHeader>
            <CardTitle>From the assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="bg-brand rounded-reno font-display flex size-9 shrink-0 items-center justify-center text-base font-bold text-white"
              >
                R
              </span>
              <p className="text-text-2 text-[0.9rem] leading-relaxed">
                {insight}
              </p>
            </div>

            <dl className="border-line flex flex-col gap-2 border-t pt-4">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-2 text-sm">Open bids</dt>
                <dd className="mono text-foreground text-sm font-semibold">
                  {formatCurrency(stats.pipeline)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-2 text-sm">Active projects</dt>
                <dd className="mono text-foreground text-sm font-semibold">
                  {stats.activeCount}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-2 text-sm">Collected to date</dt>
                <dd className="mono text-foreground text-sm font-semibold">
                  {formatCurrency(stats.collected)}
                </dd>
              </div>
            </dl>

            <ButtonLink href="/app/assistant" variant="dark" size="sm">
              Open assistant
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
