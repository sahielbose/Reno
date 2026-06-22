import { getAccessToken } from "@/server/repositories/token";
import { getProposal } from "@/server/repositories/proposal";
import { getProjectBudget } from "@/server/repositories/budget";
import { getOrg } from "@/server/repositories/org";
import { toNumber } from "@/lib/format";
import {
  buildBudgetSnapshot,
  type ProposalSnapshot,
} from "@/server/services/proposal-from-budget";
import {
  SignerView,
  type SignerProposal,
} from "@/components/app/esign/signer-view";

export const dynamic = "force-dynamic";

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="text-text-2 mt-2">{body}</p>
    </div>
  );
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const access = await getAccessToken(token);

  if (!access || access.kind !== "SIGN") {
    return (
      <Notice
        title="Invalid link"
        body="This signing link is invalid or has been revoked."
      />
    );
  }

  const orgId = access.orgId;
  const [proposal, org] = await Promise.all([
    getProposal(orgId, access.targetId),
    getOrg(orgId),
  ]);
  if (!proposal) {
    return <Notice title="Not found" body="This agreement no longer exists." />;
  }

  const alreadySigned = !!access.usedAt || proposal.status === "SIGNED";
  const expired = !!access.expiresAt && access.expiresAt < new Date();
  if (expired && !alreadySigned) {
    return (
      <Notice
        title="Link expired"
        body="This signing link has expired. Ask the contractor to resend it."
      />
    );
  }

  let snapshot = proposal.snapshot as unknown as ProposalSnapshot | null;
  if (!snapshot) {
    const budget = await getProjectBudget(orgId, proposal.projectId);
    snapshot = budget
      ? buildBudgetSnapshot(budget, proposal.createdAt)
      : { sections: [], total: 0, generatedAt: "" };
  }

  const data: SignerProposal = {
    orgName: org?.name ?? "Reno",
    number: proposal.number ?? "PRO",
    clientName: proposal.project.client?.name ?? "Client",
    projectName: proposal.project.name,
    total: toNumber(proposal.total ?? snapshot.total),
    sections: snapshot.sections.map((s) => ({ name: s.name, total: s.total })),
    scope: proposal.scope ?? "Scope of work generated from the project budget.",
  };

  return (
    <SignerView token={token} proposal={data} alreadySigned={alreadySigned} />
  );
}
