"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { Gavel, Hammer, Plus, Trophy } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  awardBidAction,
  createBidRequestAction,
  deleteBidRequestAction,
  recordBidResponseAction,
} from "@/server/actions/bid-request";

export type BidResponseRow = {
  id: string;
  subName: string | null;
  amount: number | null;
  notes: string | null;
  status: "INVITED" | "SUBMITTED" | "DECLINED";
};

export type BidRow = {
  id: string;
  projectId: string;
  projectName: string;
  scope: string;
  status: "OPEN" | "CLOSED" | "AWARDED";
  responses: BidResponseRow[];
};

type BidStatus = BidRow["status"];
type ResponseStatus = BidResponseRow["status"];

/** Shared control classes - matches the Input look for the native select & textarea. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const BID_STATUS_VARIANT: Record<
  BidStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  OPEN: "amber",
  CLOSED: "neutral",
  AWARDED: "ok",
};

const BID_STATUS_LABEL: Record<BidStatus, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  AWARDED: "Awarded",
};

const RESPONSE_STATUS_VARIANT: Record<
  ResponseStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  INVITED: "neutral",
  SUBMITTED: "info",
  DECLINED: "neutral",
};

const RESPONSE_STATUS_LABEL: Record<ResponseStatus, string> = {
  INVITED: "Invited",
  SUBMITTED: "Submitted",
  DECLINED: "Declined",
};

/**
 * Bid Requests hub. Opens a scope to subcontractors, collects their bids in a
 * per-request responses table (flagging the lowest amount), and awards the job
 * to a chosen response. Creating a request, recording bids, awarding, and
 * deleting all run through the bid-request server actions inside transitions.
 */
export function BidRequestsView({
  projects,
  subs,
  bids,
}: {
  projects: { id: string; name: string }[];
  subs: { id: string; name: string }[];
  bids: BidRow[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Bid requests</h1>
          <p className="text-text-2 text-sm">
            Invite subcontractors to bid a scope and award the job.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          disabled={projects.length === 0}
        >
          <Plus aria-hidden="true" />
          New bid request
        </Button>
      </div>

      {bids.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <Gavel className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No bid requests yet - invite subs to bid a scope.
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(true)}
              disabled={projects.length === 0}
            >
              <Plus aria-hidden="true" />
              New bid request
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} subs={subs} />
          ))}
        </div>
      )}

      <CreateBidRequestDialog
        projects={projects}
        subs={subs}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function BidCard({
  bid,
  subs,
}: {
  bid: BidRow;
  subs: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const awarded = bid.status === "AWARDED";

  // Lowest submitted, non-declined amount - used to flag the low bid.
  const lowestAmount = useMemo(() => {
    const amounts = bid.responses
      .filter((r) => r.status !== "DECLINED" && r.amount != null)
      .map((r) => r.amount as number);
    return amounts.length ? Math.min(...amounts) : null;
  }, [bid.responses]);

  const awardedResponse = useMemo(
    () =>
      awarded
        ? (bid.responses.find((r) => r.status === "SUBMITTED") ?? null)
        : null,
    [awarded, bid.responses],
  );

  const remove = () => {
    if (isPending) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this bid request? This can't be undone.")
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteBidRequestAction(bid.projectId, bid.id);
      if (result.ok) {
        toast.success("Bid request deleted");
      } else {
        toast.error(result.error);
      }
    });
  };

  const award = (responseId: string) => {
    if (isPending) return;
    startTransition(async () => {
      const result = await awardBidAction(bid.projectId, bid.id, responseId);
      if (result.ok) {
        toast.success("Bid awarded");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-text-3 text-xs font-semibold tracking-wide uppercase">
            {bid.projectName}
          </span>
          <CardTitle className="min-w-0 truncate text-base font-bold">
            {bid.scope}
          </CardTitle>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={BID_STATUS_VARIANT[bid.status]} dot={!awarded}>
            {BID_STATUS_LABEL[bid.status]}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={isPending}
          >
            Delete
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {awarded && awardedResponse && (
          <p className="bg-ok-soft text-ok rounded-reno flex items-center gap-2 px-3 py-2 text-sm font-medium">
            <Trophy className="size-4" aria-hidden="true" />
            Awarded to{" "}
            <span className="font-bold">
              {awardedResponse.subName ?? "Unnamed sub"}
            </span>
            {awardedResponse.amount != null && (
              <span className="font-mono tabular-nums">
                {formatCurrency(awardedResponse.amount)}
              </span>
            )}
          </p>
        )}

        {bid.responses.length === 0 ? (
          <p className="text-text-3 text-sm">
            No bids yet - record a response below as subs reply.
          </p>
        ) : (
          <div className="border-line rounded-reno overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Award</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bid.responses.map((response) => {
                  const isLow =
                    response.status !== "DECLINED" &&
                    response.amount != null &&
                    lowestAmount != null &&
                    response.amount === lowestAmount;
                  const isAwarded =
                    awarded && awardedResponse?.id === response.id;
                  const canAward = !awarded && response.status !== "DECLINED";

                  return (
                    <TableRow
                      key={response.id}
                      className={cn(isAwarded && "bg-ok-soft/40")}
                    >
                      <TableCell className="font-medium">
                        {response.subName ?? (
                          <span className="text-text-3">Unnamed sub</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        <span className="inline-flex items-center justify-end gap-2">
                          {response.amount != null ? (
                            formatCurrency(response.amount)
                          ) : (
                            <span className="text-text-3">-</span>
                          )}
                          {isLow && (
                            <Badge variant="amber" size="sm">
                              Low bid
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-text-2 max-w-[16rem] truncate whitespace-normal">
                        {response.notes ?? (
                          <span className="text-text-3">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={RESPONSE_STATUS_VARIANT[response.status]}
                        >
                          {RESPONSE_STATUS_LABEL[response.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isAwarded ? (
                          <span className="text-ok inline-flex items-center gap-1 text-xs font-semibold">
                            <Trophy className="size-3.5" aria-hidden="true" />
                            Awarded
                          </span>
                        ) : canAward ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => award(response.id)}
                            disabled={isPending}
                          >
                            Award
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <AddBidForm bid={bid} subs={subs} />
      </CardContent>
    </Card>
  );
}

function AddBidForm({
  bid,
  subs,
}: {
  bid: BidRow;
  subs: { id: string; name: string }[];
}) {
  const [subId, setSubId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const trimmedAmount = amount.trim();
    const parsedAmount = trimmedAmount === "" ? null : Number(trimmedAmount);
    if (parsedAmount != null && !Number.isFinite(parsedAmount)) {
      toast.error("Enter a valid amount");
      return;
    }
    const trimmedNotes = notes.trim();

    startTransition(async () => {
      const result = await recordBidResponseAction(bid.projectId, bid.id, {
        subId: subId || null,
        amount: parsedAmount,
        notes: trimmedNotes || null,
      });
      if (result.ok) {
        toast.success("Bid recorded");
        setSubId("");
        setAmount("");
        setNotes("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="border-line flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-end"
    >
      <div className="sm:w-44">
        <label
          htmlFor={`add-bid-sub-${bid.id}`}
          className="text-text-3 mb-1 block text-xs font-medium"
        >
          Sub
        </label>
        <select
          id={`add-bid-sub-${bid.id}`}
          className={controlClass}
          value={subId}
          onChange={(e) => setSubId(e.target.value)}
          disabled={isPending}
        >
          <option value="">Select sub…</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-36">
        <label
          htmlFor={`add-bid-amount-${bid.id}`}
          className="text-text-3 mb-1 block text-xs font-medium"
        >
          Amount
        </label>
        <Input
          id={`add-bid-amount-${bid.id}`}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="font-mono tabular-nums"
          disabled={isPending}
        />
      </div>

      <div className="flex-1">
        <label
          htmlFor={`add-bid-notes-${bid.id}`}
          className="text-text-3 mb-1 block text-xs font-medium"
        >
          Notes
        </label>
        <Input
          id={`add-bid-notes-${bid.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          disabled={isPending}
        />
      </div>

      <Button type="submit" variant="dark" size="sm" disabled={isPending}>
        <Hammer aria-hidden="true" />
        Add bid
      </Button>
    </form>
  );
}

function CreateBidRequestDialog({
  projects,
  subs,
  open,
  onOpenChange,
}: {
  projects: { id: string; name: string }[];
  subs: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [scope, setScope] = useState("");
  const [subIds, setSubIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? "");
      setScope("");
      setSubIds([]);
      setError(null);
    }
  }, [open, projects]);

  const toggleSub = (id: string) => {
    setSubIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) {
      setError("Select a project");
      return;
    }
    const trimmedScope = scope.trim();
    if (!trimmedScope) {
      setError("Describe the scope");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createBidRequestAction(projectId, {
        scope: trimmedScope,
        subIds,
      });
      if (result.ok) {
        toast.success("Bid request opened");
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
          <DialogTitle>New bid request</DialogTitle>
          <DialogDescription>
            Open a scope and invite subcontractors to bid.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Project"
            htmlFor="bid-project"
            required
            error={error && !projectId ? error : undefined}
          >
            <select
              id="bid-project"
              className={controlClass}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              aria-invalid={error && !projectId ? true : undefined}
            >
              <option value="" disabled>
                Select a project…
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Scope"
            htmlFor="bid-scope"
            required
            error={error && projectId && !scope.trim() ? error : undefined}
          >
            <textarea
              id="bid-scope"
              rows={3}
              className={cn(controlClass, "resize-y")}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Frame and drywall the second-floor addition…"
              autoFocus
              aria-invalid={
                error && projectId && !scope.trim() ? true : undefined
              }
            />
          </Field>

          <Field
            label="Invite subs"
            description={
              subs.length === 0
                ? "No subcontractors on file yet - you can record bids later."
                : "Pick subcontractors to invite to this bid."
            }
          >
            {subs.length > 0 && (
              <div className="border-line rounded-reno max-h-44 space-y-1 overflow-y-auto border p-2">
                {subs.map((s) => {
                  const checked = subIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="hover:bg-paper flex cursor-pointer items-center gap-2 rounded-[7px] px-2 py-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-brand size-4"
                        checked={checked}
                        onChange={() => toggleSub(s.id)}
                      />
                      <span className="truncate">{s.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
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
              Open bid request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
