import type { TokenKind } from "@prisma/client";

import { db } from "@/lib/db";

export function createAccessToken(input: {
  orgId: string;
  token: string;
  kind: TokenKind;
  targetType: string;
  targetId: string;
  email?: string | null;
  expiresAt?: Date | null;
}) {
  return db.accessToken.create({ data: input });
}

/** Resolve a token (public - no org scope; the token carries its own orgId). */
export function getAccessToken(token: string) {
  return db.accessToken.findUnique({ where: { token } });
}

export function markTokenUsed(id: string) {
  return db.accessToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
