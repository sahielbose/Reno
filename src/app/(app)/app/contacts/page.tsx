import { getOrgContext, can } from "@/lib/auth";
import { listContactsWithProjects } from "@/server/repositories/contact";
import { PageHeader } from "@/components/app/shell/page-header";
import { ContactsView } from "@/components/app/contacts/contacts-view";

export default async function ContactsPage() {
  const { orgId, role } = await getOrgContext();
  const contacts = await listContactsWithProjects(orgId);

  return (
    <>
      <PageHeader title="Contacts" subtitle="Clients, subs, and vendors." />
      <ContactsView
        contacts={contacts}
        canDelete={can(role, "contact.delete")}
      />
    </>
  );
}
