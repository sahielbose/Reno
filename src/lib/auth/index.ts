import "server-only";

import { devAuthProvider } from "@/lib/auth/dev-auth";
import type { AuthProvider, Session, OrgContext } from "@/lib/auth/provider";

export type {
  Session,
  SessionUser,
  SessionOrg,
  OrgContext,
  Role,
} from "@/lib/auth/provider";
export * from "@/lib/auth/roles";

/**
 * The active auth provider. Cookie-based dev auth in development; for
 * production implement AuthProvider over Clerk and gate on CLERK_SECRET_KEY
 * here (see GO_LIVE.md). Tenancy/roles resolution is unchanged either way.
 */
export function getAuthProvider(): AuthProvider {
  return devAuthProvider;
}

export function getSession(): Promise<Session | null> {
  return getAuthProvider().getSession();
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("No active session - sign in to continue.");
  }
  return session;
}

/**
 * The tenant context for the current request. Every repository call is scoped
 * by `orgId` from here - client-supplied org ids are never trusted.
 */
export async function getOrgContext(): Promise<OrgContext> {
  const session = await requireSession();
  return {
    orgId: session.org.id,
    userId: session.user.id,
    role: session.role,
  };
}
