import type { ProjectStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const MAP: Record<
  ProjectStatus,
  {
    variant: "neutral" | "amber" | "brand" | "ok";
    label: string;
    dot: boolean;
  }
> = {
  LEAD: { variant: "neutral", label: "Lead", dot: false },
  BIDDING: { variant: "amber", label: "Bidding", dot: true },
  PLANNING: { variant: "brand", label: "Planning", dot: true },
  ACTIVE: { variant: "ok", label: "Active", dot: true },
  CLOSED: { variant: "neutral", label: "Closed", dot: false },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { variant, label, dot } = MAP[status];
  return (
    <Badge variant={variant} dot={dot}>
      {label}
    </Badge>
  );
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  "LEAD",
  "BIDDING",
  "PLANNING",
  "ACTIVE",
  "CLOSED",
];
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  LEAD: "Lead",
  BIDDING: "Bidding",
  PLANNING: "Planning",
  ACTIVE: "Active",
  CLOSED: "Closed",
};
