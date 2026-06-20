"use client";

import { Menu, Search, Bell, Plus } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="border-line sticky top-0 z-20 flex items-center gap-4 border-b bg-white/85 px-4 py-3.5 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="border-line text-text-2 hover:bg-paper grid size-[38px] place-items-center rounded-[10px] border bg-white md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="border-line bg-paper text-text-3 flex max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border px-3 py-2">
        <Search className="size-4 flex-none" />
        <input
          placeholder="Search projects, contacts, invoices…"
          className="text-foreground placeholder:text-text-3 min-w-0 flex-1 bg-transparent text-sm outline-none"
          aria-label="Search"
        />
      </div>

      <div className="flex-1" />

      <ButtonLink href="/app/projects" size="sm">
        <Plus className="size-4" />
        <span className="hidden sm:inline">New project</span>
      </ButtonLink>

      <button
        type="button"
        aria-label="Notifications"
        className="border-line text-text-2 hover:bg-paper grid size-[38px] flex-none place-items-center rounded-[10px] border bg-white"
      >
        <Bell className="size-[18px]" />
      </button>
    </header>
  );
}
