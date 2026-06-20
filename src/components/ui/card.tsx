import * as React from "react";

import { cn } from "@/lib/utils";

/** Card — the prototype's `.card` (white surface, hairline border, soft shadow). */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-reno border-line bg-card text-card-foreground shadow-card-sm border",
        className,
      )}
      {...props}
    />
  );
}

/** CardHeader — the `.ch2` row: title left, action right, hairline below. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "border-line flex items-center justify-between gap-3 border-b px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-[1.05rem] font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-text-2 text-sm", className)}
      {...props}
    />
  );
}

/** CardContent — the `.cb` body padding. */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-5", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "border-line flex items-center gap-3 border-t px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
