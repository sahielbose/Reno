"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { ContactTypeBadge } from "@/components/app/contacts/contact-badge";
import { formatDate, initials } from "@/lib/format";
import { deleteContactAction } from "@/server/actions/contact";
import { type ContactWithProjects } from "@/server/repositories/contact";

type ProjectStatus = ContactWithProjects["clientProjects"][number]["status"];

const STATUS_BADGE: Record<
  ProjectStatus,
  { variant: "neutral" | "info" | "amber" | "ok"; label: string }
> = {
  LEAD: { variant: "neutral", label: "Lead" },
  BIDDING: { variant: "amber", label: "Bidding" },
  PLANNING: { variant: "info", label: "Planning" },
  ACTIVE: { variant: "ok", label: "Active" },
  CLOSED: { variant: "neutral", label: "Closed" },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 py-2">
      <dt className="text-text-3 text-sm font-medium">{label}</dt>
      <dd className="text-foreground selection:bg-brand-100 text-sm [user-select:text]">
        {value}
      </dd>
    </div>
  );
}

/** Contact detail slide-over. Shows the contact's fields, tags, linked
 *  projects and a stub activity line, with Edit / Delete actions in the
 *  footer. Renders the Sheet closed when no contact is provided. */
export function ContactDrawer({
  contact,
  open,
  onOpenChange,
  onEdit,
  canDelete,
}: {
  contact: ContactWithProjects | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit: (c: ContactWithProjects) => void;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = React.useTransition();

  function handleDelete() {
    if (!contact) return;
    if (!window.confirm(`Delete ${contact.name}? This can't be undone.`)) {
      return;
    }
    const id = contact.id;
    startTransition(async () => {
      const result = await deleteContactAction(id);
      if (result.ok) {
        toast.success("Contact deleted");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Sheet open={open && !!contact} onOpenChange={onOpenChange}>
      <SheetContent>
        {contact && (
          <>
            <SheetHeader className="flex items-start gap-4 pr-12">
              <div
                aria-hidden
                className="bg-brand-100 text-brand grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold"
              >
                {initials(contact.name)}
              </div>
              <div className="min-w-0">
                <SheetTitle className="truncate">{contact.name}</SheetTitle>
                <SheetDescription className="mt-1 flex flex-wrap items-center gap-2">
                  <ContactTypeBadge type={contact.type} />
                  {contact.company && (
                    <span className="truncate">{contact.company}</span>
                  )}
                </SheetDescription>
              </div>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <dl className="divide-line divide-y">
                {contact.email && (
                  <DetailRow label="Email" value={contact.email} />
                )}
                {contact.phone && (
                  <DetailRow label="Phone" value={contact.phone} />
                )}
                {contact.address && (
                  <DetailRow label="Address" value={contact.address} />
                )}
                {contact.notes && (
                  <DetailRow label="Notes" value={contact.notes} />
                )}
              </dl>

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-paper text-text-2 rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <section>
                <h3 className="text-text-3 mb-3 text-xs font-semibold tracking-wide uppercase">
                  Linked projects
                </h3>
                {contact.clientProjects.length > 0 ? (
                  <ul className="space-y-1">
                    {contact.clientProjects.map((p) => {
                      const status = STATUS_BADGE[p.status];
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/app/projects/${p.id}`}
                            className="hover:bg-paper focus-visible:bg-paper flex items-center gap-3 rounded-[10px] px-2 py-2 text-sm transition-colors focus-visible:outline-none"
                          >
                            <span
                              aria-hidden
                              className="text-base leading-none"
                            >
                              {p.icon ?? "📁"}
                            </span>
                            <span className="text-foreground min-w-0 flex-1 truncate font-medium">
                              {p.name}
                            </span>
                            <Badge variant={status.variant} size="sm">
                              {status.label}
                            </Badge>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-text-3 text-sm">No linked projects yet.</p>
                )}
              </section>

              <section>
                <h3 className="text-text-3 mb-3 text-xs font-semibold tracking-wide uppercase">
                  Activity
                </h3>
                <p className="text-text-3 text-sm">
                  Added {formatDate(contact.createdAt, { withYear: true })}
                </p>
              </section>
            </SheetBody>

            <SheetFooter>
              {canDelete && (
                <Button
                  variant="destructive"
                  className="mr-auto"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Delete
                </Button>
              )}
              <Button variant="ghost" onClick={() => onEdit(contact)}>
                Edit
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
