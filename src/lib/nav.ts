import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Receipt,
  BookOpen,
  ShoppingCart,
  Gavel,
  CalendarDays,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  heading?: string;
  items: NavItem[];
};

/** Primary app navigation — mirrors the prototype sidebar, extended so every
 *  destination in the route map is reachable from the skeleton. */
export const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { label: "Projects", href: "/app/projects", icon: FolderKanban },
      { label: "Contacts", href: "/app/contacts", icon: Users },
    ],
  },
  {
    heading: "Money",
    items: [
      { label: "Proposals", href: "/app/proposals", icon: FileText },
      { label: "Invoices", href: "/app/invoices", icon: Receipt },
      { label: "Cost catalog", href: "/app/catalog", icon: BookOpen },
      {
        label: "Purchase orders",
        href: "/app/purchase-orders",
        icon: ShoppingCart,
      },
      { label: "Bid requests", href: "/app/bids", icon: Gavel },
    ],
  },
  {
    heading: "Plan",
    items: [
      { label: "Schedule", href: "/app/schedule", icon: CalendarDays },
      { label: "AI assistant", href: "/app/assistant", icon: Sparkles },
    ],
  },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/app/settings",
  icon: Settings,
};

/** Flattened list of every nav destination (used for active-route matching). */
export const allNavItems: NavItem[] = [
  ...navSections.flatMap((s) => s.items),
  settingsNavItem,
];
