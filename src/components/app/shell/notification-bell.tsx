"use client";

import { useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/notification";

export type NotifItem = {
  id: string;
  kind: string;
  title: string | null;
  body: string | null;
  createdAt: string;
  read: boolean;
};

/** "proposal_signed" -> "Proposal signed". Used when a notification has no title. */
function humanizeKind(kind: string): string {
  const spaced = kind.replace(/_/g, " ").trim();
  if (!spaced) return "Notification";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Topbar notification bell. Shows an unread count badge on the trigger and a
 * dropdown listing notifications with per-row "mark read" on click and a
 * "Mark all read" header action. All mutations run through the notification
 * server actions inside a transition.
 */
export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotifItem[];
  unreadCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  const markOne = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const result = await markNotificationReadAction(id);
      if (!result.ok) toast.error(result.error);
    });
  };

  const markAll = () => {
    if (isPending || unreadCount === 0) return;
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) toast.error(result.error);
    });
  };

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            suppressHydrationWarning
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            className="border-line text-text-2 hover:bg-paper relative grid size-[38px] flex-none place-items-center rounded-[10px] border bg-white"
          />
        }
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="bg-brand absolute -top-1 -right-1 grid h-[16px] min-w-[16px] place-items-center rounded-full px-[3px] text-[0.6rem] leading-none font-semibold text-white"
          >
            {badgeLabel}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-line flex items-center justify-between gap-2 border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAll}
            disabled={unreadCount === 0 || isPending}
          >
            Mark all read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
            <BellOff className="text-text-3 size-7" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <ul
            className="max-h-[360px] overflow-auto"
            aria-label="Notifications"
          >
            {notifications.map((n) => {
              const heading = n.title ?? humanizeKind(n.kind);
              return (
                <li key={n.id} className="border-line border-b last:border-b-0">
                  <div
                    role={n.read ? undefined : "button"}
                    tabIndex={n.read ? undefined : 0}
                    aria-label={
                      n.read ? undefined : `Mark "${heading}" as read`
                    }
                    onClick={n.read ? undefined : () => markOne(n.id)}
                    onKeyDown={
                      n.read
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              markOne(n.id);
                            }
                          }
                    }
                    className={cn(
                      "flex gap-2.5 px-3 py-2.5 text-left outline-none",
                      !n.read &&
                        "hover:bg-paper focus-visible:bg-paper cursor-pointer",
                    )}
                  >
                    <span className="flex w-2 flex-none justify-center pt-1.5">
                      {!n.read && (
                        <span
                          aria-hidden="true"
                          className="bg-brand size-2 rounded-full"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm font-bold",
                            n.read && "text-text-2 font-semibold",
                          )}
                        >
                          {heading}
                        </p>
                        <span className="text-text-3 flex-none text-xs">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="text-text-2 mt-0.5 line-clamp-2 text-sm">
                          {n.body}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
