"use client";

import * as React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sendMessageAction, deleteThreadAction } from "@/server/actions/ai";

export type ChatMsg = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export type ThreadSummary = {
  id: string;
  title: string;
};

export type ThreadDetail = {
  id: string;
  title: string;
  messages: ChatMsg[];
};

type AssistantChatProps = {
  threads: ThreadSummary[];
  initialThread: ThreadDetail | null;
  suggestions: string[];
};

/**
 * Reno AI assistant chat surface. Two-column layout: a thread list on the left
 * and a live chat panel on the right. Messages render optimistically and send
 * through `sendMessageAction` inside a transition; new threads update the URL
 * via `router.replace` so the list + query param stay in sync.
 */
export function AssistantChat({
  threads,
  initialThread,
  suggestions,
}: AssistantChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialThread?.messages ?? [],
  );
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Keep local messages in sync when the routed thread changes.
  const threadKey = initialThread?.id ?? "__new__";
  const lastThreadKey = useRef(threadKey);
  if (lastThreadKey.current !== threadKey) {
    lastThreadKey.current = threadKey;
    setMessages(initialThread?.messages ?? []);
  }

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isPending]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || isPending) return;

    const optimisticId = `tmp-${messages.length}`;
    setMessages((prev) => [
      ...prev,
      { id: optimisticId, role: "USER", content: text },
    ]);
    setDraft("");

    const hadThread = Boolean(initialThread?.id);

    startTransition(async () => {
      const result = await sendMessageAction(initialThread?.id ?? null, text);
      if (result.ok && result.data) {
        const { threadId, answer } = result.data;
        setMessages((prev) => [
          ...prev,
          { id: `a-${prev.length}`, role: "ASSISTANT", content: answer },
        ]);
        if (!hadThread) {
          router.replace(`/app/assistant?t=${threadId}`);
        }
      } else {
        // Roll back the optimistic user message and restore the draft.
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setDraft(text);
        toast.error(
          (!result.ok && result.error) || "The assistant couldn't respond.",
        );
      }
    });
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  const deleteThread = (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteThreadAction(id);
      setDeletingId(null);
      if (result.ok) {
        toast.success("Conversation deleted");
        router.push("/app/assistant");
      } else {
        toast.error(result.error);
      }
    });
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[230px_1fr]">
      {/* LEFT — new chat + thread list */}
      <aside className="flex flex-col gap-3">
        <Button
          variant="primary"
          render={<Link href="/app/assistant" />}
          className="w-full"
        >
          <Plus aria-hidden="true" />
          New chat
        </Button>

        <nav aria-label="Conversations" className="flex flex-col gap-1">
          {threads.length === 0 ? (
            <p className="text-text-3 px-2 py-3 text-sm">
              No conversations yet.
            </p>
          ) : (
            threads.map((thread) => {
              const active = thread.id === initialThread?.id;
              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group/thread rounded-reno flex items-center gap-1 pr-1 transition-colors",
                    active
                      ? "bg-brand-100 text-brand"
                      : "text-text-2 hover:bg-paper",
                  )}
                >
                  <Link
                    href={`/app/assistant?t=${thread.id}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-reno focus-visible:ring-brand/40 min-w-0 flex-1 truncate px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2",
                      active ? "text-brand" : "text-text-2 hover:text-ink",
                    )}
                    title={thread.title}
                  >
                    {thread.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteThread(thread.id)}
                    disabled={isPending && deletingId === thread.id}
                    aria-label={`Delete conversation: ${thread.title}`}
                    className={cn(
                      "text-text-3 hover:text-danger focus-visible:ring-brand/40 grid size-7 flex-none place-items-center rounded-md opacity-0 transition-[opacity,color] outline-none group-hover/thread:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
                      active && "opacity-100",
                    )}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })
          )}
        </nav>
      </aside>

      {/* RIGHT — chat panel */}
      <Card className="flex min-h-[70vh] flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
        >
          {isEmpty && !isPending ? (
            <EmptyState suggestions={suggestions} onPick={send} />
          ) : (
            <ul className="mx-auto flex w-full max-w-2xl flex-col gap-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isPending && <ThinkingBubble />}
            </ul>
          )}
        </div>

        {/* COMPOSER */}
        <div className="border-line bg-card border-t px-4 py-3 sm:px-6">
          <div className="mx-auto flex w-full max-w-2xl items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposerKeyDown}
              disabled={isPending}
              rows={1}
              placeholder="Ask Reno about projects, invoices, deadlines…"
              aria-label="Message the assistant"
              className={cn(
                "border-line text-foreground max-h-40 min-h-[2.6rem] flex-1 resize-none rounded-[12px] border bg-white px-3 py-2 text-[0.92rem] leading-relaxed transition-colors outline-none",
                "placeholder:text-text-3",
                "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
            <Button
              variant="primary"
              size="default"
              onClick={() => send(draft)}
              disabled={isPending || !draft.trim()}
              aria-label="Send message"
            >
              <Send aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
          <p className="text-text-3 mx-auto mt-1.5 w-full max-w-2xl px-1 text-[0.7rem]">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </Card>
    </div>
  );
}

function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-5 py-10 text-center">
      <span className="bg-brand-100 text-brand grid size-12 place-items-center rounded-full">
        <Sparkles className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h2 className="font-display text-lg font-semibold">
          Ask Reno anything
        </h2>
        <p className="text-text-2 mx-auto max-w-md text-sm">
          Your assistant can see this org&apos;s projects, budgets, invoices,
          and deadlines. Start with a question below or type your own.
        </p>
      </div>
      {suggestions.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onPick(suggestion)}
                className="border-line text-text-2 hover:border-brand hover:text-brand focus-visible:ring-brand/40 rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMsg }) {
  const mine = message.role === "USER";
  return (
    <li
      className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
    >
      {!mine && (
        <span className="text-brand flex items-center gap-1 px-1 text-xs font-semibold">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Reno
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          mine
            ? "bg-brand rounded-br-sm text-white"
            : "bg-paper text-foreground border-line rounded-bl-sm border",
        )}
      >
        {message.content}
      </div>
    </li>
  );
}

function ThinkingBubble() {
  return (
    <li className="flex flex-col items-start gap-1" aria-live="polite">
      <span className="text-brand flex items-center gap-1 px-1 text-xs font-semibold">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Reno
      </span>
      <div className="bg-paper text-text-3 border-line flex items-center gap-1.5 rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm">
        <Sparkles className="size-3.5 animate-pulse" aria-hidden="true" />
        <span className="animate-pulse">thinking…</span>
      </div>
    </li>
  );
}
