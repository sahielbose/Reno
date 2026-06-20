import { Hammer } from "lucide-react";

import { Card } from "@/components/ui/card";

/** Placeholder body for routes whose module ships in a later phase. Keeps the
 *  app skeleton fully navigable. */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-dashed py-16 text-center">
      <span className="rounded-reno bg-brand-100 text-brand grid size-12 place-items-center">
        <Hammer className="size-6" />
      </span>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="text-text-2 max-w-sm text-sm">
        {note ?? "This module is part of an upcoming build phase."}
      </p>
    </Card>
  );
}
