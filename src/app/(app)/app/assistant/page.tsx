import { PageHeader } from "@/components/app/shell/page-header";
import { getOrgContext } from "@/lib/auth";
import { getThread, listThreads } from "@/server/repositories/ai";
import { AssistantChat } from "@/components/app/assistant/assistant-chat";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "What's overdue?",
  "Summarize my active projects",
  "Where's the schedule risk?",
  "Draft a proposal",
];

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { orgId } = await getOrgContext();
  const sp = await searchParams;
  const t = typeof sp.t === "string" ? sp.t : undefined;

  const threadsRaw = await listThreads(orgId);
  const threads = threadsRaw.map((x) => ({
    id: x.id,
    title: x.title ?? "Conversation",
  }));

  const selected = t ? await getThread(orgId, t) : (threadsRaw[0] ?? null);
  const initialThread = selected
    ? {
        id: selected.id,
        title: selected.title ?? "Conversation",
        messages: selected.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      }
    : null;

  return (
    <>
      <PageHeader
        title="AI assistant"
        subtitle="Ask about any project, invoice, or deadline."
      />
      <AssistantChat
        threads={threads}
        initialThread={initialThread}
        suggestions={SUGGESTIONS}
      />
    </>
  );
}
