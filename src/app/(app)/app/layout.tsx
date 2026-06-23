import { getSession } from "@/lib/auth";
import {
  listNotifications,
  unreadCount as countUnread,
} from "@/server/repositories/notification";
import { AppShell } from "@/components/app/shell/app-shell";

// Authed, per-org pages are always rendered on demand (never statically).
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return (
      <div className="bg-paper grid min-h-screen place-items-center p-6 text-center">
        <div className="max-w-sm space-y-2">
          <h1 className="font-display text-xl font-semibold">
            No active session
          </h1>
          <p className="text-text-2 text-sm">
            Run{" "}
            <code className="mono bg-line rounded px-1.5 py-0.5">
              pnpm db:seed
            </code>{" "}
            to set up the demo organization, then reload.
          </p>
        </div>
      </div>
    );
  }

  const orgId = session.org.id;
  const [notifs, unread] = await Promise.all([
    listNotifications(orgId),
    countUnread(orgId),
  ]);
  const notifications = notifs.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    read: n.readAt != null,
  }));

  return (
    <AppShell
      session={session}
      notifications={notifications}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  );
}
