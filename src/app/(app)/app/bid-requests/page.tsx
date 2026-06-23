import { PageHeader } from "@/components/app/shell/page-header";
import { db } from "@/lib/db";
import { getOrgContext } from "@/lib/auth";
import { toNumber } from "@/lib/format";
import { listBidRequests } from "@/server/repositories/bid-request";
import { listContacts } from "@/server/repositories/contact";
import { BidRequestsView } from "@/components/app/bidding/bid-requests-view";

export default async function BidRequestsPage() {
  const { orgId } = await getOrgContext();
  const [bidRows, subs, projects] = await Promise.all([
    listBidRequests(orgId),
    listContacts(orgId, { type: "SUB" }),
    db.project.findMany({
      where: { orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const bids = bidRows.map((b) => ({
    id: b.id,
    projectId: b.projectId,
    projectName: b.project.name,
    scope: b.scope,
    status: b.status,
    responses: b.responses.map((r) => ({
      id: r.id,
      subName: r.sub?.name ?? null,
      amount: r.amount != null ? toNumber(r.amount) : null,
      notes: r.notes,
      status: r.status,
    })),
  }));

  return (
    <>
      <PageHeader
        title="Bid requests"
        subtitle="Invite subs and compare bids side by side."
      />
      <BidRequestsView
        projects={projects}
        subs={subs.map((s) => ({ id: s.id, name: s.name }))}
        bids={bids}
      />
    </>
  );
}
