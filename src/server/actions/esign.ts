"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth";
import { generateToken } from "@/lib/tokens";
import { getMailer } from "@/lib/email/outbox";
import {
  createAccessToken,
  getAccessToken,
  markTokenUsed,
} from "@/server/repositories/token";
import { createSignature } from "@/server/repositories/signature";
import {
  getProposal,
  updateProposalStatus,
} from "@/server/repositories/proposal";
import { logActivity } from "@/server/repositories/activity";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/** Create a signer token for a proposal, mark it Sent, and "email" the link. */
export async function sendForSignatureAction(
  projectId: string,
  proposalId: string,
): Promise<ActionResult<{ token: string; url: string }>> {
  try {
    const { orgId, userId } = await getOrgContext();
    const proposal = await getProposal(orgId, proposalId);
    if (!proposal) return { ok: false, error: "Proposal not found." };

    // Use an existing signer recipient, or create one from the client.
    let recipient = proposal.recipients.find((r) => r.role === "SIGNER");
    if (!recipient) {
      recipient = await db.recipient.create({
        data: {
          proposalId,
          name: proposal.project.client?.name ?? "Client",
          email: proposal.project.client?.email ?? null,
          role: "SIGNER",
        },
      });
    }

    const token = generateToken();
    await createAccessToken({
      orgId,
      token,
      kind: "SIGN",
      targetType: "PROPOSAL",
      targetId: proposalId,
      email: recipient.email,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    await updateProposalStatus(orgId, proposalId, "SENT", {
      sentAt: new Date(),
    });

    const url = `${APP_URL}/sign/${token}`;
    if (recipient.email) {
      await getMailer().send({
        to: recipient.email,
        subject: `Please review and sign — ${proposal.project.name}`,
        body: `Hi ${recipient.name}, your proposal is ready to sign: ${url}`,
      });
    }
    await logActivity(orgId, "sent for signature", {
      projectId,
      actorId: userId,
      target: `Proposal ${proposal.number}`,
    });

    revalidatePath(`/app/projects/${projectId}/proposal`);
    return { ok: true, data: { token, url: `/sign/${token}` } };
  } catch {
    return { ok: false, error: "Couldn't send for signature." };
  }
}

/** PUBLIC: submit a signature from the passwordless signer page. */
export async function submitSignatureAction(
  token: string,
  signerName: string,
  imageData: string,
): Promise<ActionResult> {
  try {
    const access = await getAccessToken(token);
    if (
      !access ||
      access.kind !== "SIGN" ||
      access.usedAt ||
      (access.expiresAt && access.expiresAt < new Date())
    ) {
      return { ok: false, error: "This signing link is no longer valid." };
    }
    if (!signerName.trim() || !imageData) {
      return { ok: false, error: "Enter your name and draw a signature." };
    }

    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await createSignature({
      orgId: access.orgId,
      documentType: "PROPOSAL",
      documentId: access.targetId,
      signerName: signerName.trim(),
      signerEmail: access.email,
      ip,
      imageData,
      auditTrail: {
        signedAt: new Date().toISOString(),
        ip,
        method: "passwordless-token",
      },
    });

    await markTokenUsed(access.id);
    await updateProposalStatus(access.orgId, access.targetId, "SIGNED", {
      signedAt: new Date(),
    });

    // Notification hook (stub — Inngest/Resend in Phase 19).
    const proposal = await db.proposal.findUnique({
      where: { id: access.targetId },
    });
    await db.notification.create({
      data: {
        orgId: access.orgId,
        kind: "proposal_signed",
        title: "Proposal signed",
        body: `${signerName.trim()} signed proposal ${proposal?.number ?? ""}`.trim(),
        projectId: proposal?.projectId,
      },
    });
    if (proposal) {
      await logActivity(access.orgId, "signed", {
        projectId: proposal.projectId,
        target: `Proposal ${proposal.number}`,
      });
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't record the signature." };
  }
}
