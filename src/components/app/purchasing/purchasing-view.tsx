"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { Plus, Receipt, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  createPurchaseOrderAction,
  deletePurchaseOrderAction,
  updatePOStatusAction,
} from "@/server/actions/purchase-order";
import {
  createVendorBillAction,
  deleteVendorBillAction,
  updateBillStatusAction,
} from "@/server/actions/vendor-bill";

export type POLine = { description: string; qty: number; unitCost: number };

export type PORow = {
  id: string;
  number: string;
  projectId: string;
  projectName: string;
  vendorName: string | null;
  status: "DRAFT" | "SENT" | "SIGNED" | "ORDERED" | "DELIVERED";
  total: number;
  lineCount: number;
};

export type BillRow = {
  id: string;
  number: string | null;
  projectId: string;
  projectName: string;
  vendorName: string | null;
  poNumber: string | null;
  amount: number;
  status: "DRAFT" | "RECEIVED" | "SCHEDULED" | "PAID";
  dueDate: string | null;
};

type POStatus = PORow["status"];
type BillStatus = BillRow["status"];

const PO_STATUSES: POStatus[] = [
  "DRAFT",
  "SENT",
  "SIGNED",
  "ORDERED",
  "DELIVERED",
];

const BILL_STATUSES: BillStatus[] = ["DRAFT", "RECEIVED", "SCHEDULED", "PAID"];

const PO_STATUS_VARIANT: Record<
  POStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  DRAFT: "neutral",
  SENT: "info",
  SIGNED: "brand",
  ORDERED: "info",
  DELIVERED: "ok",
};

const BILL_STATUS_VARIANT: Record<
  BillStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  DRAFT: "neutral",
  RECEIVED: "info",
  SCHEDULED: "amber",
  PAID: "ok",
};

const STATUS_LABEL: Record<POStatus | BillStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  SIGNED: "Signed",
  ORDERED: "Ordered",
  DELIVERED: "Delivered",
  RECEIVED: "Received",
  SCHEDULED: "Scheduled",
  PAID: "Paid",
};

/** Shared control classes — matches the Input look for native selects. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** Compact inline status select styled as a pill-ish control for table rows. */
const statusSelectClass = cn(
  "border-line text-foreground rounded-full border bg-white py-[0.3rem] pr-7 pl-3 text-[0.78rem] font-semibold transition-colors outline-none",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type Project = { id: string; name: string };
type Vendor = { id: string; name: string };

/**
 * Vendor-side purchasing hub — Purchase Orders and Vendor Bills. PO numbers
 * and money carry forward from the cost catalog through to bills; both lists
 * support inline status changes and deletes, plus dialogs to create new
 * records. All mutations run inside transitions and surface errors via toast.
 */
export function PurchasingView({
  projects,
  vendors,
  pos,
  bills,
}: {
  projects: Project[];
  vendors: Vendor[];
  pos: PORow[];
  bills: BillRow[];
}) {
  const [poOpen, setPoOpen] = useState(false);
  const [billOpen, setBillOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Purchasing</h1>
        <p className="text-text-2 text-sm">
          Purchase orders and vendor bills across your projects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase orders</CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPoOpen(true)}
            disabled={projects.length === 0}
          >
            <Plus aria-hidden="true" /> New PO
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {pos.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="text-text-3 size-8" />}
              message="No purchase orders yet — issue one to a vendor."
              actionLabel="New PO"
              onAction={() => setPoOpen(true)}
              disabled={projects.length === 0}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Lines</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pos.map((po) => (
                  <POTableRow key={po.id} po={po} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor bills</CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setBillOpen(true)}
            disabled={projects.length === 0}
          >
            <Plus aria-hidden="true" /> New bill
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {bills.length === 0 ? (
            <EmptyState
              icon={<Receipt className="text-text-3 size-8" />}
              message="No vendor bills yet — record one against a PO or project."
              actionLabel="New bill"
              onAction={() => setBillOpen(true)}
              disabled={projects.length === 0}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <BillTableRow key={bill.id} bill={bill} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewPODialog
        open={poOpen}
        onOpenChange={setPoOpen}
        projects={projects}
        vendors={vendors}
      />
      <NewBillDialog
        open={billOpen}
        onOpenChange={setBillOpen}
        projects={projects}
        vendors={vendors}
      />
    </div>
  );
}

function EmptyState({
  icon,
  message,
  actionLabel,
  onAction,
  disabled,
}: {
  icon: React.ReactNode;
  message: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
      <span aria-hidden="true">{icon}</span>
      <p className="text-text-2 text-sm font-medium">{message}</p>
      <Button variant="outline" onClick={onAction} disabled={disabled}>
        <Plus aria-hidden="true" /> {actionLabel}
      </Button>
    </div>
  );
}

function POTableRow({ po }: { po: PORow }) {
  const [isPending, startTransition] = useTransition();

  const changeStatus = (status: POStatus) => {
    if (status === po.status || isPending) return;
    startTransition(async () => {
      const result = await updatePOStatusAction(po.projectId, po.id, status);
      if (result.ok) {
        toast.success(`PO ${po.number} marked ${STATUS_LABEL[status]}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const remove = () => {
    if (isPending) return;
    if (
      !window.confirm(
        `Delete purchase order ${po.number}? This can't be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deletePurchaseOrderAction(po.projectId, po.id);
      if (result.ok) {
        toast.success(`PO ${po.number} deleted`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <TableRow className={cn(isPending && "opacity-60")}>
      <TableCell className="font-mono font-semibold tabular-nums">
        {po.number}
      </TableCell>
      <TableCell className="text-text-2">{po.projectName}</TableCell>
      <TableCell className="text-text-2">
        {po.vendorName ?? <span className="text-text-3">—</span>}
      </TableCell>
      <TableCell>
        <StatusSelect
          label={`Status for PO ${po.number}`}
          value={po.status}
          options={PO_STATUSES}
          variant={PO_STATUS_VARIANT[po.status]}
          disabled={isPending}
          onChange={changeStatus}
        />
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums">
        {po.lineCount}
      </TableCell>
      <TableCell className="text-right font-mono font-semibold tabular-nums">
        {formatCurrency(po.total)}
      </TableCell>
      <TableCell className="text-right">
        <DeleteButton
          label={`Delete PO ${po.number}`}
          onClick={remove}
          disabled={isPending}
        />
      </TableCell>
    </TableRow>
  );
}

function BillTableRow({ bill }: { bill: BillRow }) {
  const [isPending, startTransition] = useTransition();
  const billLabel = bill.number ?? "bill";

  const changeStatus = (status: BillStatus) => {
    if (status === bill.status || isPending) return;
    startTransition(async () => {
      const result = await updateBillStatusAction(
        bill.projectId,
        bill.id,
        status,
      );
      if (result.ok) {
        toast.success(`${billLabel} marked ${STATUS_LABEL[status]}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const remove = () => {
    if (isPending) return;
    if (!window.confirm(`Delete ${billLabel}? This can't be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteVendorBillAction(bill.projectId, bill.id);
      if (result.ok) {
        toast.success("Bill deleted");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <TableRow className={cn(isPending && "opacity-60")}>
      <TableCell className="font-mono font-semibold tabular-nums">
        {bill.number ?? <span className="text-text-3 font-sans">—</span>}
      </TableCell>
      <TableCell className="text-text-2">{bill.projectName}</TableCell>
      <TableCell className="text-text-2">
        {bill.vendorName ?? <span className="text-text-3">—</span>}
      </TableCell>
      <TableCell className="font-mono tabular-nums">
        {bill.poNumber ?? <span className="text-text-3 font-sans">—</span>}
      </TableCell>
      <TableCell className="text-right font-mono font-semibold tabular-nums">
        {formatCurrency(bill.amount)}
      </TableCell>
      <TableCell>
        <StatusSelect
          label={`Status for ${billLabel}`}
          value={bill.status}
          options={BILL_STATUSES}
          variant={BILL_STATUS_VARIANT[bill.status]}
          disabled={isPending}
          onChange={changeStatus}
        />
      </TableCell>
      <TableCell className="text-text-2 font-mono tabular-nums">
        {bill.dueDate ? (
          formatDate(bill.dueDate, { withYear: true })
        ) : (
          <span className="text-text-3 font-sans">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <DeleteButton
          label={`Delete ${billLabel}`}
          onClick={remove}
          disabled={isPending}
        />
      </TableCell>
    </TableRow>
  );
}

function StatusSelect<T extends POStatus | BillStatus>({
  label,
  value,
  options,
  variant,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  variant: React.ComponentProps<typeof Badge>["variant"];
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  const tone: Record<
    NonNullable<React.ComponentProps<typeof Badge>["variant"]>,
    string
  > = {
    neutral: "text-text-2",
    brand: "text-brand",
    amber: "text-warn",
    ok: "text-ok",
    danger: "text-danger",
    info: "text-[#0369a1]",
    purple: "text-[#7e22ce]",
  };
  return (
    <select
      aria-label={label}
      className={cn(statusSelectClass, variant && tone[variant])}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="text-foreground">
          {STATUS_LABEL[opt]}
        </option>
      ))}
    </select>
  );
}

function DeleteButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="text-text-3 hover:text-danger focus-visible:ring-danger/30 inline-flex rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
  );
}

function NewPODialog({
  open,
  onOpenChange,
  projects,
  vendors,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projects: Project[];
  vendors: Vendor[];
}) {
  const [projectId, setProjectId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [lines, setLines] = useState<POLine[]>([
    { description: "", qty: 1, unitCost: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? "");
      setVendorId("");
      setLines([{ description: "", qty: 1, unitCost: 0 }]);
      setError(null);
    }
  }, [open, projects]);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0),
    [lines],
  );

  const updateLine = (index: number, patch: Partial<POLine>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { description: "", qty: 1, unitCost: 0 }]);

  const removeLine = (index: number) =>
    setLines((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) {
      setError("Pick a project.");
      return;
    }
    const lineItems = lines
      .map((l) => ({ ...l, description: l.description.trim() }))
      .filter((l) => l.description.length > 0);
    if (lineItems.length === 0) {
      setError("Add at least one line with a description.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createPurchaseOrderAction(projectId, {
        vendorId: vendorId || null,
        lineItems,
      });
      if (result.ok) {
        toast.success("Purchase order created");
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
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>
            Issue a PO to a vendor for one of your projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project" htmlFor="po-project" required>
              <select
                id="po-project"
                className={controlClass}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vendor" htmlFor="po-vendor">
              <select
                id="po-vendor"
                className={controlClass}
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">No vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-2 text-xs font-bold tracking-wide uppercase">
                Line items
              </span>
              <button
                type="button"
                onClick={addLine}
                className="text-text-3 hover:text-brand inline-flex items-center gap-1 text-[0.8rem] font-medium"
              >
                <Plus className="size-3.5" aria-hidden="true" /> Add line
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Input
                    aria-label={`Line ${i + 1} description`}
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) =>
                      updateLine(i, { description: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    aria-label={`Line ${i + 1} quantity`}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Qty"
                    value={Number.isNaN(line.qty) ? "" : line.qty}
                    onChange={(e) =>
                      updateLine(i, {
                        qty: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-20 text-right font-mono tabular-nums"
                  />
                  <Input
                    aria-label={`Line ${i + 1} unit cost`}
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Cost"
                    value={Number.isNaN(line.unitCost) ? "" : line.unitCost}
                    onChange={(e) =>
                      updateLine(i, {
                        unitCost:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-24 text-right font-mono tabular-nums"
                  />
                  <button
                    type="button"
                    aria-label={`Remove line ${i + 1}`}
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                    className="text-text-3 hover:text-danger mt-2 inline-flex shrink-0 rounded-md p-1 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-line flex items-center justify-between border-t pt-2">
              <span className="text-text-2 text-sm font-medium">Total</span>
              <span className="font-mono text-base font-bold tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {error && <p className="text-danger text-xs font-medium">{error}</p>}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              Create PO
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewBillDialog({
  open,
  onOpenChange,
  projects,
  vendors,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projects: Project[];
  vendors: Vendor[];
}) {
  const [projectId, setProjectId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? "");
      setVendorId("");
      setNumber("");
      setAmount("");
      setDueDate("");
      setError(null);
    }
  }, [open, projects]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) {
      setError("Pick a project.");
      return;
    }
    const parsedAmount = Number(amount);
    if (
      amount.trim() === "" ||
      Number.isNaN(parsedAmount) ||
      parsedAmount < 0
    ) {
      setError("Enter a valid amount.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createVendorBillAction(projectId, {
        vendorId: vendorId || null,
        poId: null,
        number: number.trim() || null,
        amount: parsedAmount,
        dueDate: dueDate || null,
      });
      if (result.ok) {
        toast.success("Vendor bill recorded");
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
          <DialogTitle>New vendor bill</DialogTitle>
          <DialogDescription>
            Record a bill from a vendor against a project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project" htmlFor="bill-project" required>
              <select
                id="bill-project"
                className={controlClass}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vendor" htmlFor="bill-vendor">
              <select
                id="bill-vendor"
                className={controlClass}
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">No vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Amount"
              htmlFor="bill-amount"
              required
              error={error && amount.trim() === "" ? error : undefined}
            >
              <Input
                id="bill-amount"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono tabular-nums"
                aria-invalid={error && amount.trim() === "" ? true : undefined}
              />
            </Field>
            <Field label="Due date" htmlFor="bill-due">
              <Input
                id="bill-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Bill number"
            htmlFor="bill-number"
            description="Optional — the vendor's invoice number."
          >
            <Input
              id="bill-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="INV-1042"
            />
          </Field>

          {error && amount.trim() !== "" && (
            <p className="text-danger text-xs font-medium">{error}</p>
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
              Record bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
