import type { Role } from "@prisma/client";

/** Role hierarchy: OWNER ⊇ ADMIN ⊇ MEMBER. */
const RANK: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/** True if `role` meets or exceeds `minimum`. */
export function hasRole(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

/** Capabilities gated by role. Owners/admins manage; members operate. */
export const PERMISSIONS = {
  "project.delete": "ADMIN",
  "org.manageBilling": "OWNER",
  "org.manageTeam": "ADMIN",
  "org.manageIntegrations": "ADMIN",
  "org.updateBranding": "ADMIN",
  "contact.delete": "ADMIN",
} as const satisfies Record<string, Role>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws ForbiddenError if `role` is below `minimum`. */
export function requireRole(role: Role, minimum: Role): void {
  if (!hasRole(role, minimum)) {
    throw new ForbiddenError(`Requires ${minimum} role`);
  }
}

/** Throws ForbiddenError if `role` lacks `permission`. */
export function requirePermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError();
  }
}
