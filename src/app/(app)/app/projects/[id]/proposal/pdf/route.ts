import { getOrgContext } from "@/lib/auth";
import { getProjectProposal } from "@/server/repositories/proposal";
import { getProjectBudget } from "@/server/repositories/budget";
import { getOrg } from "@/server/repositories/org";
import { buildProposalPdf } from "@/lib/pdf/proposal-pdf";
import {
  buildBudgetSnapshot,
  type ProposalSnapshot,
} from "@/server/services/proposal-from-budget";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const [proposal, org] = await Promise.all([
    getProjectProposal(orgId, id),
    getOrg(orgId),
  ]);

  if (!proposal) {
    return new Response("No proposal to export", { status: 404 });
  }

  let snapshot = proposal.snapshot as unknown as ProposalSnapshot | null;
  if (!snapshot) {
    const budget = await getProjectBudget(orgId, id);
    snapshot = budget
      ? buildBudgetSnapshot(budget, proposal.createdAt)
      : { sections: [], total: 0, generatedAt: "" };
  }
  const pdf = await buildProposalPdf({
    orgName: org?.name ?? "Reno",
    number: proposal.number ?? "PRO",
    clientName: proposal.project.client?.name ?? "Client",
    projectName: proposal.project.name,
    total: Number(proposal.total ?? snapshot.total),
    scope: proposal.scope ?? "",
    snapshot,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${proposal.number ?? "proposal"}.pdf"`,
    },
  });
}
