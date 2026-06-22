import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProjectSummary } from "@/server/services/project-financials";

type ActivityItem = {
  id: string;
  verb: string;
  target: string | null;
  createdAt: Date;
  actor: { name: string | null } | null;
};

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Project hub Overview tab — financial summary alongside recent activity. */
export function ProjectOverview({
  summary,
  activity,
}: {
  summary: ProjectSummary;
  activity: ActivityItem[];
}) {
  const { financials, project } = summary;

  const rows: { label: string; value: string; valueClassName?: string }[] = [
    {
      label: "Contract value",
      value: formatCurrency(financials.contractValue),
    },
    { label: "Billed to date", value: formatCurrency(financials.billed) },
    { label: "Collected", value: formatCurrency(financials.collected) },
    { label: "Costs out", value: formatCurrency(financials.costsOut) },
    {
      label: "Est. profit",
      value: formatCurrency(financials.profit),
      valueClassName: "text-ok",
    },
    {
      label: "Progress",
      value: project.targetEndDate
        ? `${financials.progress}% · finish ${formatDate(
            project.targetEndDate,
            {
              withYear: true,
            },
          )}`
        : `${financials.progress}%`,
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Project summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <dl className="divide-line divide-y">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 px-5 py-3"
              >
                <dt className="text-text-2 text-sm">{row.label}</dt>
                <dd
                  className={`mono text-sm font-semibold ${row.valueClassName ?? ""}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length ? (
            <ul className="flex flex-col gap-4">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className="bg-brand mt-1.5 size-2 shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="text-sm">
                      {capitalize(item.verb)}
                      {item.target ? ` ${item.target}` : ""}
                    </p>
                    <p className="text-text-3 mt-0.5 text-xs">
                      {formatDate(item.createdAt, { withYear: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-3 text-sm">No activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
