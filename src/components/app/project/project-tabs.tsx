"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS: [slug: string, label: string][] = [
  ["overview", "Overview"],
  ["takeoff", "Plans & takeoffs"],
  ["budget", "Budget"],
  ["proposal", "Proposal"],
  ["schedule", "Schedule"],
  ["documents", "Documents"],
  ["requests", "Requests"],
  ["invoices", "Invoices"],
];

/** Tabbed navigation across a project's modules (the prototype's hub tabs). */
export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <div className="border-line mb-6 flex gap-0.5 overflow-x-auto border-b">
      {TABS.map(([slug, label]) => {
        const href = `/app/projects/${projectId}/${slug}`;
        const active = pathname === href;
        return (
          <Link
            key={slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-[0.7rem] text-[0.9rem] font-semibold whitespace-nowrap transition-colors",
              active
                ? "border-brand text-brand"
                : "text-text-2 hover:text-ink border-transparent",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
