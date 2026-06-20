import * as React from "react";

import { cn } from "@/lib/utils";

/** Input — ported from the prototype's `.fld input` (hairline border, brand
 *  focus ring, 9px radius). */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
        "placeholder:text-text-3",
        "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
