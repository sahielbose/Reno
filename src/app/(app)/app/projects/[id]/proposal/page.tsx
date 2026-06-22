import { getOrgContext } from "@/lib/auth";
import { getProjectProposal } from "@/server/repositories/proposal";
import { getProjectBudget } from "@/server/repositories/budget";
import { getOrg } from "@/server/repositories/org";
import { toNumber, formatDate } from "@/lib/format";
import {
  buildBudgetSnapshot,
  type ProposalSnapshot,
} from "@/server/services/proposal-from-budget";
import {
  ProposalView,
  type ProposalData,
} from "@/components/app/proposal/proposal-view";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await getOrgContext();
  const [proposal, org] = await Promise.all([
    getProjectProposal(orgId, id),
    getOrg(orgId),
  ]);

  let data: ProposalData | null = null;

  if (proposal) {
    // Use the immutable snapshot if present; otherwise build a preview from the
    // live budget (e.g. a proposal sent before snapshots were captured).
    let snapshot = proposal.snapshot as unknown as ProposalSnapshot | null;
    if (!snapshot) {
      const budget = await getProjectBudget(orgId, id);
      snapshot = budget
        ? buildBudgetSnapshot(budget, proposal.createdAt)
        : { sections: [], total: 0, generatedAt: "" };
    }

    data = {
      id: proposal.id,
      number: proposal.number ?? "PRO",
      status: proposal.status,
      total: toNumber(proposal.total ?? snapshot.total),
      scope:
        proposal.scope ?? "Scope of work generated from the project budget.",
      sections: snapshot.sections.map((s) => ({
        name: s.name,
        total: s.total,
      })),
      orgName: org?.name ?? "Reno",
      clientName: proposal.project.client?.name ?? "Client",
      projectName: proposal.project.name,
      signedBy: null,
      signedAt: proposal.signedAt
        ? formatDate(proposal.signedAt, { withYear: true })
        : null,
    };
  }

  return <ProposalView projectId={id} proposal={data} />;
}
