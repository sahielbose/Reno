"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Download } from "lucide-react";
import { toast } from "sonner";

import type { ProposalStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RenoMark } from "@/components/brand/logo";
import { generateProposalAction } from "@/server/actions/proposal";

export type ProposalData = {
  id: string;
  number: string;
  status: ProposalStatus;
  total: number;
  scope: string;
  sections: { name: string; total: number }[];
  orgName: string;
  clientName: string;
  projectName: string;
  signedBy: string | null;
  signedAt: string | null;
};

const STATUS: Record<
  ProposalStatus,
  { variant: "neutral" | "info" | "ok" | "danger"; label: string; dot: boolean }
> = {
  DRAFT: { variant: "neutral", label: "Draft", dot: false },
  SENT: { variant: "info", label: "Sent", dot: true },
  VIEWED: { variant: "info", label: "Viewed", dot: true },
  SIGNED: { variant: "ok", label: "Signed", dot: true },
  DECLINED: { variant: "danger", label: "Declined", dot: true },
};

export function ProposalView({
  projectId,
  proposal,
}: {
  projectId: string;
  proposal: ProposalData | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const result = await generateProposalAction(projectId);
      if (result.ok) {
        toast.success("Proposal generated from budget");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!proposal) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 border-dashed py-16 text-center">
        <span className="rounded-reno bg-brand-100 text-brand grid size-12 place-items-center">
          <Sparkles className="size-6" />
        </span>
        <p className="font-display text-lg font-semibold">No proposal yet</p>
        <p className="text-text-2 max-w-sm text-sm">
          Generate a branded proposal from this project&apos;s budget — the
          numbers carry straight over.
        </p>
        <Button variant="dark" onClick={generate} disabled={pending}>
          <Sparkles className="size-4" /> Generate from budget
        </Button>
      </Card>
    );
  }

  const status = STATUS[proposal.status];
  const signed = proposal.status === "SIGNED";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant} dot={status.dot}>
          {status.label}
        </Badge>
        <div className="flex-1" />
        {!signed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={generate}
            disabled={pending}
          >
            <Sparkles className="size-4" /> Regenerate
          </Button>
        )}
        <ButtonLink
          href={`/app/projects/${projectId}/proposal/pdf`}
          target="_blank"
          variant="outline"
          size="sm"
        >
          <Download className="size-4" /> Download PDF
        </ButtonLink>
      </div>

      <Card className="max-w-3xl overflow-hidden p-0">
        <div className="border-line flex items-start justify-between border-b px-8 py-6">
          <div className="flex items-center gap-3">
            <RenoMark className="size-9" />
            <div>
              <div className="font-semibold">{proposal.orgName}</div>
              <div className="text-text-3 text-sm">
                Proposal {proposal.number} · for {proposal.clientName}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[1.5rem] font-bold">
              {formatCurrency(proposal.total)}
            </div>
            <div className="text-text-3 text-[0.66rem]">Total</div>
          </div>
        </div>

        <div className="px-8 py-4">
          {proposal.sections.map((s, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-[#f1f3f8] py-2.5 text-[0.95rem] last:border-0"
            >
              <span>{s.name}</span>
              <span className="font-mono font-semibold">
                {formatCurrency(s.total)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-paper text-text-2 px-8 py-5 text-sm leading-relaxed">
          <span className="text-foreground font-semibold">Scope of work. </span>
          {proposal.scope}
        </div>

        <div className="border-line flex items-center justify-between border-t px-8 py-5">
          {signed ? (
            <div className="rounded-reno bg-ok-soft border border-[#bbf7d0] p-3.5 text-sm text-[#166534]">
              <b>✓ Signed</b> by {proposal.signedBy} · {proposal.signedAt}
              <div className="mono mt-0.5 text-[0.78rem]">
                Audit: SHA-256 verified · sealed PDF on record
              </div>
            </div>
          ) : (
            <span className="text-text-3 text-sm">
              Awaiting client signature
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
