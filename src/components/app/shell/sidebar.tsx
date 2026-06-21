"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Session } from "@/lib/auth/provider";
import { navSections, settingsNavItem, type NavItem } from "@/lib/nav";
import { RenoWordmark } from "@/components/brand/logo";
import { OrgSwitcher } from "@/components/app/shell/org-switcher";
import { UserMenu } from "@/components/app/shell/user-menu";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mb-0.5 flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[0.9rem] font-medium transition-colors",
        active
          ? "bg-brand text-white"
          : "text-white/70 hover:bg-white/[0.07] hover:text-white",
      )}
    >
      <Icon className="size-[18px] flex-none" />
      {item.label}
    </Link>
  );
}

export function Sidebar({
  session,
  onNavigate,
}: {
  session: Session;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="bg-ink flex h-full flex-col px-3.5 py-4 text-white">
      <Link
        href="/"
        className="px-1.5 pt-1.5 pb-5"
        aria-label="Reno home"
        onClick={onNavigate}
      >
        <RenoWordmark tile="#ffffff" glyph="var(--color-brand)" />
      </Link>

      <OrgSwitcher org={session.org} orgs={session.orgs} />

      <nav className="flex-1 overflow-y-auto">
        {navSections.map((section, i) => (
          <div key={section.heading ?? i}>
            {section.heading && (
              <div className="px-2.5 pt-4 pb-1.5 text-[0.66rem] font-bold tracking-[0.1em] text-white/35 uppercase">
                {section.heading}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-3">
        <NavLink
          item={settingsNavItem}
          active={isActive(pathname, settingsNavItem.href)}
          onNavigate={onNavigate}
        />
        <UserMenu user={session.user} role={session.role} />
      </div>
    </aside>
  );
}
