"use client";

import { useState } from "react";

import type { ContactWithProjects } from "@/server/repositories/contact";
import { ContactsTable } from "@/components/app/contacts/contacts-table";
import { ContactDrawer } from "@/components/app/contacts/contact-drawer";
import { ContactFormDialog } from "@/components/app/contacts/contact-form-dialog";

/**
 * Stateful parent for the Contacts module. Owns the selected contact, the
 * detail drawer, and the create/edit form, and wires them to the table.
 */
export function ContactsView({
  contacts,
  canDelete,
}: {
  contacts: ContactWithProjects[];
  canDelete: boolean;
}) {
  const [selected, setSelected] = useState<ContactWithProjects | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formContact, setFormContact] = useState<ContactWithProjects | null>(
    null,
  );

  function openDetail(contact: ContactWithProjects) {
    setSelected(contact);
    setDrawerOpen(true);
  }

  function openCreate() {
    setFormContact(null);
    setFormOpen(true);
  }

  function openEdit(contact: ContactWithProjects) {
    setDrawerOpen(false);
    setFormContact(contact);
    setFormOpen(true);
  }

  return (
    <>
      <ContactsTable
        contacts={contacts}
        onSelect={openDetail}
        onAdd={openCreate}
      />
      <ContactDrawer
        contact={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onEdit={openEdit}
        canDelete={canDelete}
      />
      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={formContact}
      />
    </>
  );
}
