"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import type { ContactType } from "@prisma/client";

import { type ContactWithProjects } from "@/server/repositories/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ContactTypeBadge,
  CONTACT_TYPES,
  CONTACT_TYPE_LABEL,
} from "@/components/app/contacts/contact-badge";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Contacts table with a toolbar: type filter pills, a name/company/email
 * search box, and an "Add contact" action. Rows are clickable and surface the
 * selected contact to the parent for the detail drawer.
 */
export function ContactsTable({
  contacts,
  onSelect,
  onAdd,
}: {
  contacts: ContactWithProjects[];
  onSelect: (c: ContactWithProjects) => void;
  onAdd: () => void;
}) {
  const [typeFilter, setTypeFilter] = useState<null | ContactType>(null);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [contacts, typeFilter, search]);

  const pillBase =
    "rounded-full px-3 py-1 text-[0.8rem] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2";
  const pillClass = (active: boolean) =>
    cn(
      pillBase,
      active
        ? "bg-ink text-white"
        : "text-text-2 border-line border hover:bg-paper",
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={typeFilter === null}
          onClick={() => setTypeFilter(null)}
          className={pillClass(typeFilter === null)}
        >
          All
        </button>
        {CONTACT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={typeFilter === t}
            onClick={() => setTypeFilter(t)}
            className={pillClass(typeFilter === t)}
          >
            {CONTACT_TYPE_LABEL[t]}
          </button>
        ))}

        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts…"
          aria-label="Search contacts"
          className="w-full sm:w-56"
        />

        <Button variant="primary" onClick={onAdd} className="ml-auto">
          + Add contact
        </Button>
      </div>

      <Card>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <Users className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No contacts match.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((c) => (
                <TableRow
                  key={c.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => onSelect(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(c);
                    }
                  }}
                  className="hover:bg-paper focus-visible:bg-paper cursor-pointer outline-none"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-brand-100 text-brand grid size-[30px] place-items-center rounded-full text-xs font-bold"
                      >
                        {initials(c.name)}
                      </span>
                      <span className="font-bold">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ContactTypeBadge type={c.type} />
                  </TableCell>
                  <TableCell className="text-text-2">
                    {c.company ?? "-"}
                  </TableCell>
                  <TableCell className="text-text-2">
                    {c.email ?? "-"}
                  </TableCell>
                  <TableCell className="text-text-2 mono">
                    {c.phone ?? "-"}
                  </TableCell>
                  <TableCell className="mono text-right">
                    {c.clientProjects.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
