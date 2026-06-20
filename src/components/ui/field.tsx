import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Field — a labelled form control wrapper (the prototype's `.fld`). Pairs a
 * Label with any control and renders an optional hint or validation error.
 * Used across the app's forms (contacts, budgets, settings, …).
 */
function Field({
  label,
  htmlFor,
  description,
  error,
  required,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="text-danger ml-0.5" aria-hidden>
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-danger text-xs font-medium">{error}</p>
      ) : description ? (
        <p className="text-text-3 text-xs">{description}</p>
      ) : null}
    </div>
  );
}

export { Field };
