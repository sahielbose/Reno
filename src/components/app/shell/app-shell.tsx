"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Session } from "@/lib/auth/provider";
import { Sidebar } from "@/components/app/shell/sidebar";
import { Topbar } from "@/components/app/shell/topbar";

/** The authenticated app frame: a sticky dark sidebar on desktop, a slide-in
 *  drawer on mobile, and the topbar + scrolling main column. */
export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-paper min-h-screen md:grid md:grid-cols-[236px_1fr]">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen md:block">
        <Sidebar session={session} />
      </div>

      {/* Mobile drawer + overlay */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "bg-ink/50 fixed inset-0 z-40 backdrop-blur-[2px] transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[236px] transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar session={session} onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-7 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
