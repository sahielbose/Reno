import type { RequestStatus, RequestType } from "@prisma/client";

import { db } from "@/lib/db";

export function listRequests(orgId: string, projectId: string) {
  return db.request.findMany({
    where: { orgId, projectId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export function getRequest(orgId: string, id: string) {
  return db.request.findFirst({
    where: { id, orgId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

const PREFIX: Record<RequestType, string> = {
  RFI: "RFI",
  CHANGE_ORDER: "CO",
  LIEN_WAIVER: "LW",
  OTHER: "REQ",
};

export async function createRequest(
  orgId: string,
  projectId: string,
  input: {
    type: RequestType;
    subject: string;
    body: string;
    authorName: string;
  },
) {
  await db.project.findFirstOrThrow({ where: { id: projectId, orgId } });
  const count = await db.request.count({ where: { orgId, type: input.type } });
  const number = `${PREFIX[input.type]}-${String(count + 1).padStart(3, "0")}`;
  return db.request.create({
    data: {
      orgId,
      projectId,
      type: input.type,
      subject: input.subject,
      number,
      messages: {
        create: [{ authorName: input.authorName, body: input.body }],
      },
    },
  });
}

export async function addRequestMessage(
  orgId: string,
  requestId: string,
  authorName: string,
  body: string,
) {
  await db.request.findFirstOrThrow({ where: { id: requestId, orgId } });
  await db.request.update({
    where: { id: requestId },
    data: { status: "RESPONDED" },
  });
  return db.requestMessage.create({
    data: { requestId, authorName, body },
  });
}

export async function updateRequestStatus(
  orgId: string,
  id: string,
  status: RequestStatus,
) {
  await db.request.findFirstOrThrow({ where: { id, orgId } });
  return db.request.update({ where: { id }, data: { status } });
}
