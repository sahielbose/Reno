import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge / Pill — ported from the prototype's `.pill` status chips. Color
 * variants map to Reno's status palette; `dot` adds the leading ● marker the
 * prototype uses on live statuses.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-[0.72rem] font-bold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-[#eef1f6] text-text-2",
        brand: "bg-brand-100 text-brand",
        amber: "bg-amber-soft text-warn",
        ok: "bg-ok-soft text-ok",
        danger: "bg-danger-soft text-danger",
        info: "bg-[#e0f2fe] text-[#0369a1]",
        purple: "bg-[#f3e8ff] text-[#7e22ce]",
      },
      size: {
        default: "px-[0.6rem] py-1",
        sm: "px-2 py-0.5 text-[0.66rem]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span aria-hidden className="text-[0.7em] leading-none">
          ●
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
