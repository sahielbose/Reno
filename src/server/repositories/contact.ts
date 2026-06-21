import type { ContactType, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { ContactInput } from "@/server/schemas/contact";

/** All queries are scoped by `orgId` so data never leaks across tenants. */
export function listContacts(
  orgId: string,
  opts?: { type?: ContactType; search?: string },
) {
  const where: Prisma.ContactWhereInput = { orgId };
  if (opts?.type) where.type = opts.type;
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search, mode: "insensitive" } },
      { company: { contains: opts.search, mode: "insensitive" } },
      { email: { contains: opts.search, mode: "insensitive" } },
    ];
  }
  return db.contact.findMany({ where, orderBy: { name: "asc" } });
}

export function getContact(orgId: string, id: string) {
  return db.contact.findFirst({ where: { id, orgId } });
}

export function getContactWithProjects(orgId: string, id: string) {
  return db.contact.findFirst({
    where: { id, orgId },
    include: { clientProjects: { orderBy: { createdAt: "desc" } } },
  });
}

function toData(input: ContactInput) {
  return {
    name: input.name,
    type: input.type,
    company: input.company || null,
    email: input.email || null,
    phone: input.phone || null,
    address: input.address || null,
    notes: input.notes || null,
    tags: input.tags ?? [],
  };
}

export function createContact(orgId: string, input: ContactInput) {
  return db.contact.create({ data: { orgId, ...toData(input) } });
}

export async function updateContact(
  orgId: string,
  id: string,
  input: ContactInput,
) {
  // Ensure the contact belongs to the org before mutating.
  await db.contact.findFirstOrThrow({ where: { id, orgId } });
  return db.contact.update({ where: { id }, data: toData(input) });
}

export async function deleteContact(orgId: string, id: string) {
  await db.contact.findFirstOrThrow({ where: { id, orgId } });
  return db.contact.delete({ where: { id } });
}

export function countContactsByType(orgId: string) {
  return db.contact.groupBy({
    by: ["type"],
    where: { orgId },
    _count: { _all: true },
  });
}
