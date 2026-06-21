import Link from "next/link";
import {
  Users,
  Calculator,
  Ruler,
  BookOpen,
  Send,
  FileText,
  PenLine,
  CalendarRange,
  MessageSquare,
  FolderOpen,
  DoorOpen,
  Sparkles,
  Receipt,
  ClipboardList,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Section, SectionHeading } from "@/components/marketing/section";

type Feature = {
  title: string;
  desc: string;
  href: string;
  Icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: "Construction CRM",
    desc: "Clients, subs, and crew in one address book with a live history.",
    href: "/app/contacts",
    Icon: Users,
  },
  {
    title: "Budget builder",
    desc: "Section-by-section cost breakdown with per-line margin and live totals.",
    href: "/app/projects/p1/budget",
    Icon: Calculator,
  },
  {
    title: "Takeoffs",
    desc: "Measure plans in the browser and feed quantities into your budget.",
    href: "/app/projects/p1/takeoff",
    Icon: Ruler,
  },
  {
    title: "Cost catalog",
    desc: "Reusable cost codes behind every budget, bill, and PO.",
    href: "/app/catalog",
    Icon: BookOpen,
  },
  {
    title: "Bid requests",
    desc: "Send one scope to every sub and compare pricing side by side.",
    href: "/app/bids",
    Icon: Send,
  },
  {
    title: "Proposals",
    desc: "Generate branded proposals from your budget; clients sign in the browser.",
    href: "/app/projects/p1/proposal",
    Icon: FileText,
  },
  {
    title: "E-signatures",
    desc: "Built-in signing on proposals and agreements — no third-party tool.",
    href: "/app/projects/p1/proposal",
    Icon: PenLine,
  },
  {
    title: "Scheduling",
    desc: "Gantt chart with critical-path analysis so you know what's on deck.",
    href: "/app/projects/p1/schedule",
    Icon: CalendarRange,
  },
  {
    title: "Requests",
    desc: "RFIs, lien waivers, and change orders tracked with full history.",
    href: "/app/projects/p1/requests",
    Icon: MessageSquare,
  },
  {
    title: "Files & documents",
    desc: "Plans, permits, and photos organized by project.",
    href: "/app/projects/p1/documents",
    Icon: FolderOpen,
  },
  {
    title: "Client & sub portals",
    desc: "A passwordless portal where clients sign and pay.",
    href: "/app/projects/p1/proposal",
    Icon: DoorOpen,
  },
  {
    title: "AI assistant",
    desc: "Ask about any project, draft messages, surface insights.",
    href: "/app/assistant",
    Icon: Sparkles,
  },
  {
    title: "Client finances",
    desc: "Issue progress invoices tied to your project and collect.",
    href: "/app/invoices",
    Icon: Receipt,
  },
  {
    title: "Purchase orders",
    desc: "Send POs for signature and track ordered vs delivered.",
    href: "/app/purchase-orders",
    Icon: ClipboardList,
  },
  {
    title: "Vendor finances",
    desc: "Track vendor bills and pay your vendors, synced to your books.",
    href: "/app/purchase-orders",
    Icon: Wallet,
  },
];

/** All-features grid (`#allfeat` / `.grid3` / `.aff`). */
export function FeatureGrid() {
  return (
    <Section id="allfeat" tight>
      <SectionHeading title="Built to work together — useful on its own">
        Start with what you need today. Add the rest as your operation grows.
      </SectionHeading>

      <ul className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ title, desc, href, Icon }) => (
          <li key={title}>
            <Link
              href={href}
              className="border-line hover:shadow-card block h-full rounded-[12px] border bg-white p-[18px] transition-all duration-150 hover:-translate-y-0.5"
            >
              <span className="bg-brand-100 text-brand mb-[0.7rem] grid h-[38px] w-[38px] place-items-center rounded-[10px]">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <h4 className="text-[1rem]">{title}</h4>
              <p className="text-text-2 mt-[0.35rem] text-[0.86rem]">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
