/**
 * Auth provider abstraction. Phases 1-17 use a local dev provider; Phase 18
 * swaps in Clerk behind this same interface - no app code changes.
 */
import type { Role } from "@prisma/client";

export type { Role };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface SessionOrg {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
}

export interface Session {
  user: SessionUser;
  org: SessionOrg;
  role: Role;
  /** All orgs this user belongs to (for the org switcher). */
  orgs: SessionOrg[];
}

/** Just the tenant + actor identity used to scope queries. */
export interface OrgContext {
  orgId: string;
  userId: string;
  role: Role;
}

export interface AuthProvider {
  getSession(): Promise<Session | null>;
  setActiveOrg(orgId: string): Promise<void>;
}
