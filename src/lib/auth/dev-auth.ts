import { cookies } from "next/headers";

import { db } from "@/lib/db";
import type { AuthProvider, Session, SessionOrg } from "@/lib/auth/provider";

export const DEV_SESSION_COOKIE = "reno_dev_session";
const DEV_DEFAULT_EMAIL = "nolan@apexbuild.co";

type CookiePayload = { userId?: string; orgId?: string };

function toSessionOrg(o: {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
}): SessionOrg {
  return { id: o.id, name: o.name, slug: o.slug, primaryColor: o.primaryColor };
}

async function readCookie(): Promise<CookiePayload> {
  const raw = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CookiePayload;
  } catch {
    return {};
  }
}

/**
 * Local dev auth: resolves a session from the seeded data. The active user
 * defaults to the seeded owner; the active org is remembered in a cookie so the
 * org switcher works. Replaced by Clerk in Phase 18 behind the same interface.
 */
export const devAuthProvider: AuthProvider = {
  async getSession(): Promise<Session | null> {
    const { userId, orgId } = await readCookie();

    const user =
      (userId ? await db.user.findUnique({ where: { id: userId } }) : null) ??
      (await db.user.findFirst({ where: { email: DEV_DEFAULT_EMAIL } })) ??
      (await db.user.findFirst({ orderBy: { createdAt: "asc" } }));
    if (!user) return null;

    const memberships = await db.membership.findMany({
      where: { userId: user.id },
      include: { org: true },
      orderBy: { createdAt: "asc" },
    });
    if (memberships.length === 0) return null;

    const active =
      (orgId ? memberships.find((m) => m.orgId === orgId) : null) ??
      memberships[0];

    return {
      user: {
        id: user.id,
        name: user.name ?? user.email,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      org: toSessionOrg(active.org),
      role: active.role,
      orgs: memberships.map((m) => toSessionOrg(m.org)),
    };
  },

  async setActiveOrg(orgId: string): Promise<void> {
    const session = await devAuthProvider.getSession();
    if (!session) return;
    // Only switch to an org the user actually belongs to.
    if (!session.orgs.some((o) => o.id === orgId)) return;
    (await cookies()).set(
      DEV_SESSION_COOKIE,
      JSON.stringify({ userId: session.user.id, orgId }),
      { httpOnly: true, sameSite: "lax", path: "/" },
    );
  },
};
