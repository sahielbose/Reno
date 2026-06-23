"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createInvoiceAction,
  createProgressInvoiceAction,
  deleteInvoiceAction,
  recordPaymentAction,
  sendInvoiceAction,
} from "@/server/actions/invoice";

export type InvoiceLine = { description: string; amount: number };

export type InvoiceRow = {
  id: string;
  number: string;
  status: "DRAFT" | "SENT" | "VIEWED" | "PAID" | "OVERDUE";
  amount: number;
  paid: number;
  balance: number;
  dueDate: string | null;
  createdAt: string;
  lineItems: InvoiceLine[];
};

type InvoiceStatus = InvoiceRow["status"];

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

/**
 * Project Invoices tab. Shows a billed/collected/outstanding summary strip, a
 * "New invoice" dialog with a progress-billing / manual-line toggle, and a
 * table of invoices with send, record-payment, and delete controls. All
 * mutations run through the invoice server actions inside transitions.
 */
export function InvoicesPanel({
  projectId,
  contractValue,
  invoices,
}: {
  projectId: string;
  contractValue: number;
  invoices: InvoiceRow[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const totals = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        acc.billed += inv.amount;
        acc.collected += inv.paid;
        acc.outstanding += inv.balance;
        return acc;
      },
      { billed: 0, collected: 0, outstanding: 0 },
    );
  }, [invoices]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Invoices</h1>
          <p className="text-text-2 text-sm">
            Bill progress draws or itemized line invoices for this project.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          New invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat label="Billed" value={totals.billed} />
        <SummaryStat label="Collected" value={totals.collected} />
        <SummaryStat
          label="Outstanding"
          value={totals.outstanding}
          accent={totals.outstanding > 0}
        />
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <FileText className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No invoices yet - bill a progress draw or add line items.
            </p>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              New invoice
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <InvoiceRowItem
                  key={invoice.id}
                  projectId={projectId}
                  invoice={invoice}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <NewInvoiceDialog
        projectId={projectId}
        contractValue={contractValue}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-text-3 text-[0.72rem] font-bold tracking-wide uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-[1.5rem] font-bold tabular-nums",
          accent ? "text-amber" : "text-foreground",
        )}
      >
        {formatCurrency(value)}
      </p>
    </Card>
  );
}

function InvoiceRowItem({
  projectId,
  invoice,
}: {
  projectId: string;
  invoice: InvoiceRow;
}) {
  const [expanded, setExpanded] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const send = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = await sendInvoiceAction(projectId, invoice.id);
      if (result.ok) {
        toast.success(`${invoice.number} sent`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const remove = () => {
    if (isPending) return;
    if (
      !window.confirm(`Delete invoice ${invoice.number}? This can't be undone.`)
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteInvoiceAction(projectId, invoice.id);
      if (result.ok) {
        toast.success(`${invoice.number} deleted`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const hasLines = invoice.lineItems.length > 0;

  return (
    <>
      <TableRow>
        <TableCell className="px-2">
          {hasLines ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? "Hide line items" : "Show line items"}
              onClick={() => setExpanded((v) => !v)}
              className="text-text-3 hover:text-brand grid size-6 place-items-center rounded-[7px] transition"
            >
              {expanded ? (
                <ChevronDown className="size-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </TableCell>
        <TableCell className="font-mono font-semibold tabular-nums">
          {invoice.number}
        </TableCell>
        <TableCell>
          <Badge
            variant={STATUS_VARIANT[invoice.status]}
            dot={invoice.status === "OVERDUE"}
          >
            {STATUS_LABEL[invoice.status]}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {formatCurrency(invoice.amount)}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {formatCurrency(invoice.paid)}
        </TableCell>
        <TableCell
          className={cn(
            "text-right font-mono font-semibold tabular-nums",
            invoice.balance > 0 ? "text-foreground" : "text-text-3",
          )}
        >
          {formatCurrency(invoice.balance)}
        </TableCell>
        <TableCell className="text-text-2">
          {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1.5">
            {invoice.status === "DRAFT" && (
              <Button
                variant="outline"
                size="sm"
                onClick={send}
                disabled={isPending}
              >
                <Send aria-hidden="true" />
                Send
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPayOpen(true)}
              disabled={isPending || invoice.balance <= 0}
            >
              Record payment
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete invoice ${invoice.number}`}
              onClick={remove}
              disabled={isPending}
              className="text-text-3 hover:text-danger"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && hasLines && (
        <TableRow>
          <TableCell colSpan={8} className="bg-paper p-0">
            <ul className="divide-line divide-y px-5 py-1">
              {invoice.lineItems.map((line, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-text-2">{line.description}</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </TableCell>
        </TableRow>
      )}

      <RecordPaymentDialog
        projectId={projectId}
        invoice={invoice}
        open={payOpen}
        onOpenChange={setPayOpen}
      />
    </>
  );
}

type Mode = "progress" | "manual";

function NewInvoiceDialog({
  projectId,
  contractValue,
  open,
  onOpenChange,
}: {
  projectId: string;
  contractValue: number;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("progress");
  const [percent, setPercent] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", amount: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setMode("progress");
      setPercent("");
      setLines([{ description: "", amount: 0 }]);
      setDueDate("");
      setSendNow(false);
      setError(null);
    }
  }, [open]);

  const pctNum = percent === "" ? 0 : Number(percent);
  const progressPreview =
    Number.isFinite(pctNum) && pctNum > 0
      ? Math.round((contractValue * pctNum) / 100)
      : 0;

  const manualTotal = lines.reduce(
    (sum, l) => sum + (Number.isFinite(l.amount) ? l.amount : 0),
    0,
  );

  const setLine = (index: number, patch: Partial<InvoiceLine>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { description: "", amount: 0 }]);

  const removeLine = (index: number) =>
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (mode === "progress") {
      if (!(pctNum >= 1 && pctNum <= 100)) {
        setError("Enter a percent between 1 and 100.");
        return;
      }
      startTransition(async () => {
        const result = await createProgressInvoiceAction(
          projectId,
          Math.round(pctNum),
        );
        if (result.ok) {
          toast.success("Progress invoice created");
          onOpenChange(false);
        } else {
          toast.error(result.error);
        }
      });
      return;
    }

    const cleaned = lines
      .map((l) => ({ description: l.description.trim(), amount: l.amount }))
      .filter((l) => l.description !== "" || l.amount !== 0);

    if (cleaned.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    if (cleaned.some((l) => l.description === "")) {
      setError("Every line needs a description.");
      return;
    }
    if (cleaned.some((l) => !Number.isFinite(l.amount))) {
      setError("Enter a valid amount on each line.");
      return;
    }

    startTransition(async () => {
      const result = await createInvoiceAction(projectId, {
        lineItems: cleaned,
        dueDate: dueDate ? dueDate : null,
        send: sendNow,
      });
      if (result.ok) {
        toast.success(sendNow ? "Invoice created and sent" : "Invoice created");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
          <DialogDescription>
            Bill a percentage of the contract or itemize line by line.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="Invoice type"
          className="border-line bg-paper inline-flex gap-1 self-start rounded-full border p-1"
        >
          <ModeToggle
            active={mode === "progress"}
            onClick={() => setMode("progress")}
          >
            Progress billing
          </ModeToggle>
          <ModeToggle
            active={mode === "manual"}
            onClick={() => setMode("manual")}
          >
            Manual
          </ModeToggle>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "progress" ? (
            <div className="space-y-4">
              <Field
                label="Percent of contract"
                htmlFor="invoice-percent"
                required
                description="Contract value: a whole-dollar draw against the budget."
                error={error ?? undefined}
              >
                <Input
                  id="invoice-percent"
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  placeholder="25"
                  autoFocus
                  className="font-mono tabular-nums"
                  aria-invalid={error ? true : undefined}
                />
              </Field>

              <div className="rounded-reno border-line bg-paper flex items-center justify-between border px-4 py-3">
                <span className="text-text-2 text-sm">
                  {pctNum > 0 ? `${Math.round(pctNum)}% of ` : "Draw on "}
                  <span className="font-mono tabular-nums">
                    {formatCurrency(contractValue)}
                  </span>
                </span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatCurrency(progressPreview)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-text-3 flex items-center gap-2 text-[0.72rem] font-bold tracking-wide uppercase">
                  <span className="flex-1">Description</span>
                  <span className="w-28 text-right">Amount</span>
                  <span className="w-7" />
                </div>
                {lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      aria-label={`Line ${i + 1} description`}
                      value={line.description}
                      onChange={(e) =>
                        setLine(i, { description: e.target.value })
                      }
                      placeholder="Framing - north wall"
                      className="flex-1"
                    />
                    <Input
                      aria-label={`Line ${i + 1} amount`}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={Number.isNaN(line.amount) ? "" : line.amount}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setLine(i, {
                          amount: raw === "" ? 0 : Number(raw),
                        });
                      }}
                      placeholder="0"
                      className="w-28 text-right font-mono tabular-nums"
                    />
                    <button
                      type="button"
                      aria-label={`Remove line ${i + 1}`}
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      className="text-text-3 hover:text-danger grid size-7 shrink-0 place-items-center rounded-[7px] transition disabled:opacity-40"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLine}
                  className="text-text-3 hover:text-brand inline-flex items-center gap-1 text-[0.8rem] font-medium"
                >
                  <Plus className="size-3.5" aria-hidden="true" /> Add line
                </button>
              </div>

              <div className="rounded-reno border-line bg-paper flex items-center justify-between border px-4 py-3">
                <span className="text-text-2 text-sm">Invoice total</span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {formatCurrency(manualTotal)}
                </span>
              </div>

              <Field label="Due date" htmlFor="invoice-due">
                <Input
                  id="invoice-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="font-mono tabular-nums"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  className="accent-brand size-4"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                />
                <span className="text-text-2">Send now</span>
              </label>

              {error && (
                <p className="text-danger text-xs font-medium">{error}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              {mode === "progress"
                ? "Create draw"
                : sendNow
                  ? "Create & send"
                  : "Create invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ModeToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
        active ? "bg-brand text-white" : "text-text-2 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RecordPaymentDialog({
  projectId,
  invoice,
  open,
  onOpenChange,
}: {
  projectId: string;
  invoice: InvoiceRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setAmount(invoice.balance > 0 ? String(invoice.balance) : "");
      setMethod("");
      setError(null);
    }
  }, [open, invoice.balance]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = amount === "" ? NaN : Number(amount);
    if (!(value > 0)) {
      setError("Enter a payment amount.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await recordPaymentAction(
        projectId,
        invoice.id,
        value,
        method.trim() || undefined,
      );
      if (result.ok) {
        toast.success("Payment recorded");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Apply a payment to {invoice.number} (balance{" "}
            {formatCurrency(invoice.balance)}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Amount"
            htmlFor="payment-amount"
            required
            error={error ?? undefined}
          >
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="font-mono tabular-nums"
              aria-invalid={error ? true : undefined}
            />
          </Field>

          <Field label="Method" htmlFor="payment-method">
            <Input
              id="payment-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Check, ACH, card…"
            />
          </Field>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
