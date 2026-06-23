"use client";

import type { Role, SessionUser } from "@/lib/auth/provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

/** Sidebar footer user card. Sign-out wires in with Clerk (Phase 18). */
export function UserMenu({ user, role }: { user: SessionUser; role: Role }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            suppressHydrationWarning
            className="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left transition-colors hover:bg-white/[0.07]"
          />
        }
      >
        <span className="bg-amber grid size-[30px] flex-none place-items-center rounded-full text-[0.72rem] font-bold text-[#3a2a00]">
          {initials(user.name)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.82rem] font-semibold text-white">
            {user.name}
          </span>
          <span className="block truncate text-[0.68rem] text-white/50">
            {user.email}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          {user.name}
          <span className="text-text-3 ml-1 font-normal">
            · {ROLE_LABEL[role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
