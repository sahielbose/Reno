"use client";

import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Org switcher in the sidebar header. Static for now (dev org); real
 *  multi-org switching arrives with auth/tenancy in Phase 6. */
export function OrgSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="mb-4 flex w-full items-center gap-2.5 rounded-xl bg-white/5 p-2.5 text-left transition-colors hover:bg-white/10"
          />
        }
      >
        <span className="font-display bg-brand grid size-8 flex-none place-items-center rounded-lg text-sm font-bold text-white">
          A
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.86rem] font-semibold text-white">
            Apex Build Co.
          </span>
          <span className="block truncate text-[0.68rem] text-white/50">
            Free trial · 9 days
          </span>
        </span>
        <ChevronsUpDown className="size-4 flex-none text-white/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuItem>Apex Build Co.</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Create organization</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
