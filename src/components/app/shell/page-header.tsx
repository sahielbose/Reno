import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Back / breadcrumb affordance - the prototype's `.bks` link. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-text-3 hover:text-brand mb-4 inline-flex items-center gap-1 text-sm transition-colors"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}

/** Standard page header - title, optional subtitle, and right-aligned actions.
 *  Mirrors the prototype's `.ph` block. */
export function PageHeader({
  title,
  subtitle,
  back,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div>
      {back && <BackLink href={back.href} label={back.label} />}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[1.7rem] font-semibold">{title}</h1>
          {subtitle && <p className="text-text-2 mt-1 text-sm">{subtitle}</p>}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
}
