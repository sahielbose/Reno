import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

const include = {
  project: { select: { id: true, name: true } },
  responses: {
    orderBy: { createdAt: "asc" as const },
    include: { sub: { select: { id: true, name: true } } },
  },
} satisfies Prisma.BidRequestInclude;

export function listBidRequests(orgId: string, projectId?: string) {
  return db.bidRequest.findMany({
    where: { orgId, ...(projectId ? { projectId } : {}) },
    orderBy: { createdAt: "desc" },
    include,
  });
}

export async function createBidRequest(
  orgId: string,
  projectId: string,
  scope: string,
  subIds: string[] = [],
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  return db.bidRequest.create({
    data: {
      orgId,
      projectId,
      scope,
      responses: {
        create: subIds.map((subId) => ({ subId, status: "INVITED" as const })),
      },
    },
    include,
  });
}

export async function recordBidResponse(
  orgId: string,
  bidRequestId: string,
  input: {
    subId?: string | null;
    amount?: number | null;
    notes?: string | null;
  },
) {
  await db.bidRequest.findFirstOrThrow({ where: { id: bidRequestId, orgId } });
  return db.bidResponse.create({
    data: {
      bidRequestId,
      subId: input.subId ?? null,
      amount: input.amount ?? null,
      notes: input.notes ?? null,
      status: "SUBMITTED",
    },
  });
}

/** Award a bid: close the request and mark non-winning responses declined. */
export async function awardBid(
  orgId: string,
  bidRequestId: string,
  responseId: string,
) {
  const req = await db.bidRequest.findFirstOrThrow({
    where: { id: bidRequestId, orgId },
    include: { responses: true },
  });
  await db.$transaction([
    db.bidRequest.update({
      where: { id: bidRequestId },
      data: { status: "AWARDED" },
    }),
    ...req.responses.map((r) =>
      db.bidResponse.update({
        where: { id: r.id },
        data: { status: r.id === responseId ? "SUBMITTED" : "DECLINED" },
      }),
    ),
  ]);
}

export async function deleteBidRequest(orgId: string, id: string) {
  await db.bidRequest.findFirstOrThrow({ where: { id, orgId } });
  return db.bidRequest.delete({ where: { id } });
}
