import * as React from "react";

import { cn } from "@/lib/utils";

/** Label - ported from the prototype's `.fld label`. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-text-2 block text-[0.78rem] font-semibold select-none peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
