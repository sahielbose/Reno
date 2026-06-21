"use client";

import { useTransition } from "react";
import { ChevronsUpDown, Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SessionOrg } from "@/lib/auth/provider";
import { switchOrgAction } from "@/server/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Org switcher in the sidebar header — switches the active tenant (dev: cookie). */
export function OrgSwitcher({
  org,
  orgs,
}: {
  org: SessionOrg;
  orgs: SessionOrg[];
}) {
  const [pending, startTransition] = useTransition();

  function switchTo(orgId: string) {
    if (orgId === org.id) return;
    startTransition(() => {
      void switchOrgAction(orgId);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            disabled={pending}
            className="mb-4 flex w-full items-center gap-2.5 rounded-xl bg-white/5 p-2.5 text-left transition-colors hover:bg-white/10 disabled:opacity-60"
          />
        }
      >
        <span className="font-display bg-brand grid size-8 flex-none place-items-center rounded-lg text-sm font-bold text-white uppercase">
          {org.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[0.86rem] font-semibold text-white">
            {org.name}
          </span>
          <span className="block truncate text-[0.68rem] text-white/50">
            Free trial · 9 days
          </span>
        </span>
        <ChevronsUpDown className="size-4 flex-none text-white/50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onClick={() => switchTo(o.id)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="font-display bg-brand-100 text-brand grid size-5 flex-none place-items-center rounded text-[0.6rem] font-bold uppercase">
                {o.name.charAt(0)}
              </span>
              {o.name}
            </span>
            {o.id === org.id && <Check className="text-brand size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className={cn("text-text-2")}>
          <Plus className="size-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
