import type { ContactType } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const MAP: Record<
  ContactType,
  { variant: "brand" | "amber" | "neutral" | "info"; label: string }
> = {
  CLIENT: { variant: "brand", label: "Client" },
  SUB: { variant: "amber", label: "Sub" },
  VENDOR: { variant: "neutral", label: "Vendor" },
  CREW: { variant: "info", label: "Crew" },
};

export function ContactTypeBadge({ type }: { type: ContactType }) {
  const { variant, label } = MAP[type];
  return <Badge variant={variant}>{label}</Badge>;
}

export const CONTACT_TYPES: ContactType[] = ["CLIENT", "SUB", "VENDOR", "CREW"];
export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  CLIENT: "Clients",
  SUB: "Subs",
  VENDOR: "Vendors",
  CREW: "Crew",
};
