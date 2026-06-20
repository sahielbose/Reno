"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Sidebar footer user card. Real session/sign-out wires in with auth
 *  (Phase 6 dev provider → Phase 18 Clerk). */
export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left transition-colors hover:bg-white/[0.07]"
          />
        }
      >
        <span className="bg-amber grid size-[30px] flex-none place-items-center rounded-full text-[0.72rem] font-bold text-[#3a2a00]">
          NR
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.82rem] font-semibold text-white">
            Nolan R.
          </span>
          <span className="block truncate text-[0.68rem] text-white/50">
            nolan@apexbuild.co
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Nolan Rossi</DropdownMenuLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
