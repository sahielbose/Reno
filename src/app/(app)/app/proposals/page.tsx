import Link from "next/link";
import type { ProposalStatus } from "@prisma/client";

import { getOrgContext } from "@/lib/auth";
import { listProposals } from "@/server/repositories/proposal";
import { toNumber, formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/app/shell/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoon } from "@/components/app/shell/coming-soon";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const STATUS: Record<
  ProposalStatus,
  { variant: "neutral" | "info" | "ok" | "danger"; label: string; dot: boolean }
> = {
  DRAFT: { variant: "neutral", label: "Draft", dot: false },
  SENT: { variant: "info", label: "Sent", dot: true },
  VIEWED: { variant: "info", label: "Viewed", dot: true },
  SIGNED: { variant: "ok", label: "Signed", dot: true },
  DECLINED: { variant: "danger", label: "Declined", dot: true },
};

export default async function ProposalsPage() {
  const { orgId } = await getOrgContext();
  const proposals = await listProposals(orgId);

  return (
    <>
      <PageHeader
        title="Proposals"
        subtitle="Branded agreements out for signature."
      />
      {proposals.length === 0 ? (
        <ComingSoon
          title="No proposals yet"
          note="Generate a proposal from any project's budget."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proposal</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => {
                const s = STATUS[p.status];
                return (
                  <TableRow key={p.id} className="hover:bg-paper">
                    <TableCell className="mono font-medium">
                      <Link
                        href={`/app/projects/${p.projectId}/proposal`}
                        className="hover:text-brand"
                      >
                        {p.number ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{p.project.name}</TableCell>
                    <TableCell>{p.project.client?.name ?? "—"}</TableCell>
                    <TableCell className="mono text-right">
                      {p.total ? formatCurrency(toNumber(p.total)) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.variant} dot={s.dot}>
                        {s.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
