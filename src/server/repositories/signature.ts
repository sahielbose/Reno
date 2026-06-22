import type { Prisma, SignatureDocType } from "@prisma/client";

import { db } from "@/lib/db";

export function createSignature(input: {
  orgId: string;
  documentType: SignatureDocType;
  documentId: string;
  signerName: string;
  signerEmail?: string | null;
  ip?: string | null;
  imageData?: string | null;
  auditTrail?: unknown;
}) {
  return db.signature.create({
    data: {
      orgId: input.orgId,
      documentType: input.documentType,
      documentId: input.documentId,
      signerName: input.signerName,
      signerEmail: input.signerEmail ?? null,
      ip: input.ip ?? null,
      imageData: input.imageData ?? null,
      auditTrail: (input.auditTrail ?? undefined) as Prisma.InputJsonValue,
    },
  });
}

export function getSignatureFor(
  documentType: SignatureDocType,
  documentId: string,
) {
  return db.signature.findFirst({
    where: { documentType, documentId },
    orderBy: { signedAt: "desc" },
  });
}
