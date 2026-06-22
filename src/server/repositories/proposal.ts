import type { Prisma, ProposalStatus } from "@prisma/client";

import { db } from "@/lib/db";
import type { ProposalSnapshot } from "@/server/services/proposal-from-budget";

/** The project's current proposal (latest), with recipients. */
export function getProjectProposal(orgId: string, projectId: string) {
  return db.proposal.findFirst({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
    include: {
      recipients: true,
      project: { include: { client: true } },
    },
  });
}

export function getProposal(orgId: string, id: string) {
  return db.proposal.findFirst({
    where: { id, orgId },
    include: { recipients: true, project: { include: { client: true } } },
  });
}

export function listProposals(orgId: string) {
  return db.proposal.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: { project: { include: { client: true } } },
  });
}

/** Generate (or regenerate) a project's proposal from a budget snapshot. */
export async function generateProposal(
  orgId: string,
  projectId: string,
  snapshot: ProposalSnapshot,
  scope: string,
  total: number,
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  const budget = await db.budget.findFirst({ where: { orgId, projectId } });
  const existing = await db.proposal.findFirst({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
  });

  const data = {
    budgetId: budget?.id ?? null,
    snapshot: snapshot as unknown as Prisma.InputJsonValue,
    scope,
    total,
    status: "DRAFT" as ProposalStatus,
    signedAt: null,
    sentAt: null,
  };

  if (existing) {
    return db.proposal.update({ where: { id: existing.id }, data });
  }

  const count = await db.proposal.count({ where: { orgId } });
  const number = `PRO-${String(count + 1).padStart(3, "0")}`;
  return db.proposal.create({
    data: { orgId, projectId, number, ...data },
  });
}

export async function updateProposalStatus(
  orgId: string,
  id: string,
  status: ProposalStatus,
  extra?: { sentAt?: Date; signedAt?: Date },
) {
  await db.proposal.findFirstOrThrow({ where: { id, orgId } });
  return db.proposal.update({ where: { id }, data: { status, ...extra } });
}
