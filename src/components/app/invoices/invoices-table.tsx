"use client";

import * as React from "react";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

export type OrgInvoiceRow = {
  id: string;
  number: string;
  projectId: string;
  projectName: string;
  status: "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE";
  amount: number;
  paid: number;
  balance: number;
  dueDate: string | null;
};

type InvoiceStatus = OrgInvoiceRow["status"];

const STATUS_VARIANT: Record<
  InvoiceStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  DRAFT: "neutral",
  SENT: "info",
  VIEWED: "info",
  PAID: "ok",
  OVERDUE: "danger",
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PAID: "Paid",
  OVERDUE: "Overdue",
};

/** Sort weight: OVERDUE + SENT first, PAID last. Lower sorts earlier. */
const STATUS_RANK: Record<InvoiceStatus, number> = {
  OVERDUE: 0,
  SENT: 1,
  VIEWED: 2,
  DRAFT: 3,
  PAID: 4,
};

/**
 * Org-wide invoices roll-up. A read-only table of every invoice across all
 * projects, sorted by urgency (overdue + sent first, paid last) then number,
 * with a totals footer for billed / collected / outstanding. Creation happens
 * per-project, so this view only reads and navigates.
 */
export function InvoicesTable({ invoices }: { invoices: OrgInvoiceRow[] }) {
  const rows = React.useMemo(
    () =>
      [...invoices].sort((a, b) => {
        const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (rank !== 0) return rank;
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      }),
    [invoices],
  );

  const totals = React.useMemo(
    () =>
      invoices.reduce(
        (acc, inv) => {
          acc.billed += inv.amount;
          acc.collected += inv.paid;
          acc.outstanding += inv.balance;
          return acc;
        },
        { billed: 0, collected: 0, outstanding: 0 },
      ),
    [invoices],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>

      {rows.length === 0 ? (
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">No invoices yet.</p>
            <p className="text-text-3 text-sm">
              Create invoices from inside each project.
            </p>
          </div>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-semibold tabular-nums">
                  {inv.number}
                </TableCell>
                <TableCell>
                  <ButtonLink
                    variant="ghost"
                    size="sm"
                    href={`/app/projects/${inv.projectId}/invoices`}
                  >
                    {inv.projectName}
                  </ButtonLink>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={STATUS_VARIANT[inv.status]}
                    dot={inv.status === "OVERDUE"}
                  >
                    {STATUS_LABEL[inv.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(inv.amount)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(inv.paid)}
                </TableCell>
                <TableCell className="text-text-2 text-right font-mono font-semibold tabular-nums">
                  {formatCurrency(inv.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow className="border-line border-t-2">
              <TableCell
                colSpan={3}
                className="text-text-3 text-[0.72rem] font-bold tracking-[0.04em] uppercase"
              >
                Totals
              </TableCell>
              <TableCell className="text-right font-mono font-bold tabular-nums">
                <span className="text-text-3 block text-[0.62rem] font-bold tracking-wide uppercase">
                  Billed
                </span>
                {formatCurrency(totals.billed)}
              </TableCell>
              <TableCell className="text-ok text-right font-mono font-bold tabular-nums">
                <span className="text-text-3 block text-[0.62rem] font-bold tracking-wide uppercase">
                  Collected
                </span>
                {formatCurrency(totals.collected)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold tabular-nums">
                <span className="text-text-3 block text-[0.62rem] font-bold tracking-wide uppercase">
                  Outstanding
                </span>
                {formatCurrency(totals.outstanding)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </Card>
  );
}
