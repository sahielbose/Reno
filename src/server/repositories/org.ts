import { db } from "@/lib/db";

/**
 * Organization repository. The org context is resolved per request in Phase 6;
 * these helpers fetch org + membership data.
 */
export function getOrg(orgId: string) {
  return db.organization.findUnique({ where: { id: orgId } });
}

export function getOrgBySlug(slug: string) {
  return db.organization.findUnique({ where: { slug } });
}

export function listOrgsForUser(userId: string) {
  return db.organization.findMany({
    where: { memberships: { some: { userId } } },
    orderBy: { name: "asc" },
  });
}

export function getMembership(userId: string, orgId: string) {
  return db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
}

export function listMembers(orgId: string) {
  return db.membership.findMany({
    where: { orgId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}
