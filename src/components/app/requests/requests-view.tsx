"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Inbox, Send } from "lucide-react";
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
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createRequestAction,
  replyToRequestAction,
  resolveRequestAction,
} from "@/server/actions/request";

export type RequestMsg = {
  id: string;
  authorName: string;
  body: string;
  createdAt: Date;
};

export type RequestItem = {
  id: string;
  number: string | null;
  type: "RFI" | "CHANGE_ORDER" | "LIEN_WAIVER" | "OTHER";
  subject: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED";
  createdAt: Date;
  messages: RequestMsg[];
};

type RequestType = RequestItem["type"];
type RequestStatus = RequestItem["status"];

const TYPE_LABEL: Record<RequestType, string> = {
  RFI: "RFI",
  CHANGE_ORDER: "Change order",
  LIEN_WAIVER: "Lien waiver",
  OTHER: "Other",
};

const TYPE_ORDER: RequestType[] = [
  "RFI",
  "CHANGE_ORDER",
  "LIEN_WAIVER",
  "OTHER",
];

const STATUS_VARIANT: Record<
  RequestStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  OPEN: "amber",
  RESPONDED: "info",
  RESOLVED: "ok",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  OPEN: "Open",
  RESPONDED: "Responded",
  RESOLVED: "Resolved",
};

/** Shared control classes - matches the Input look for the select & textarea. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/**
 * Project Requests / RFI view. Lists each request as a card with a threaded
 * message log, an inline reply composer, and a "Mark resolved" control; a
 * "New request" dialog opens RFIs, change orders, and lien waivers. All
 * mutations go through the request server actions inside transitions.
 */
export function RequestsView({
  projectId,
  requests,
  currentUserName,
}: {
  projectId: string;
  requests: RequestItem[];
  currentUserName: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Requests</h1>
          <p className="text-text-2 text-sm">
            RFIs, change orders, and lien waivers for this project.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          + New request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <Inbox className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No requests yet - open an RFI, change order, or lien waiver.
            </p>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              + New request
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              projectId={projectId}
              request={request}
              currentUserName={currentUserName}
            />
          ))}
        </div>
      )}

      <CreateRequestDialog
        projectId={projectId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}

function RequestCard({
  projectId,
  request,
  currentUserName,
}: {
  projectId: string;
  request: RequestItem;
  currentUserName: string;
}) {
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();
  const resolved = request.status === "RESOLVED";

  const sendReply = () => {
    const text = reply.trim();
    if (!text || isPending) return;
    startTransition(async () => {
      const result = await replyToRequestAction(projectId, request.id, text);
      if (result.ok) {
        setReply("");
      } else {
        toast.error(result.error);
      }
    });
  };

  const markResolved = () => {
    if (isPending) return;
    startTransition(async () => {
      const result = await resolveRequestAction(projectId, request.id);
      if (!result.ok) {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {request.number && (
            <span className="text-text-3 mono text-sm">{request.number}</span>
          )}
          <span className="text-text-3 text-xs font-semibold tracking-wide uppercase">
            {TYPE_LABEL[request.type]}
          </span>
          <CardTitle className="truncate text-base font-bold">
            {request.subject}
          </CardTitle>
        </div>
        <Badge variant={STATUS_VARIANT[request.status]} dot={!resolved}>
          {STATUS_LABEL[request.status]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="flex flex-col gap-3" aria-label="Conversation">
          {request.messages.length === 0 ? (
            <li className="text-text-3 text-sm">No messages yet.</li>
          ) : (
            request.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                mine={message.authorName === currentUserName}
              />
            ))
          )}
        </ul>

        {resolved ? (
          <p className="text-text-3 border-line border-t pt-4 text-sm font-medium">
            ✓ Resolved
          </p>
        ) : (
          <div className="border-line flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              }}
              placeholder="Write a reply…"
              aria-label={`Reply to ${request.subject}`}
              disabled={isPending}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={sendReply}
                disabled={isPending || !reply.trim()}
              >
                <Send aria-hidden="true" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={markResolved}
                disabled={isPending}
              >
                Mark resolved
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: RequestMsg;
  mine: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-end gap-2",
        mine ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold",
          mine ? "bg-brand text-white" : "bg-brand-100 text-brand",
        )}
      >
        {initials(message.authorName)}
      </span>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          mine ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
            mine
              ? "bg-brand-100 text-foreground rounded-br-sm"
              : "bg-paper text-foreground border-line rounded-bl-sm border",
          )}
        >
          {message.body}
        </div>
        <span className="text-text-3 px-1 text-xs">
          <span className="font-medium">{message.authorName}</span>
          {" · "}
          {formatDate(message.createdAt)}
        </span>
      </div>
    </li>
  );
}

function CreateRequestDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [type, setType] = useState<RequestType>("RFI");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setType("RFI");
      setSubject("");
      setBody("");
      setError(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    if (!trimmedSubject) {
      setError("Subject is required");
      return;
    }
    if (!trimmedBody) {
      setError("Add a message");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createRequestAction(projectId, {
        type,
        subject: trimmedSubject,
        body: trimmedBody,
      });
      if (result.ok) {
        toast.success("Request created");
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
          <DialogTitle>New request</DialogTitle>
          <DialogDescription>
            Open an RFI, change order, or lien waiver on this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Type" htmlFor="request-type">
            <select
              id="request-type"
              className={controlClass}
              value={type}
              onChange={(e) => setType(e.target.value as RequestType)}
            >
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Subject"
            htmlFor="request-subject"
            required
            error={error && !subject.trim() ? error : undefined}
          >
            <Input
              id="request-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Clarify framing detail on north wall"
              autoFocus
              aria-invalid={error && !subject.trim() ? true : undefined}
            />
          </Field>

          <Field
            label="Message"
            htmlFor="request-body"
            required
            error={error && subject.trim() && !body.trim() ? error : undefined}
          >
            <textarea
              id="request-body"
              rows={4}
              className={cn(controlClass, "resize-y")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe what you need…"
              aria-invalid={
                error && subject.trim() && !body.trim() ? true : undefined
              }
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
              Create request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
