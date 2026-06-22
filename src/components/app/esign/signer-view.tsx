"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RenoMark } from "@/components/brand/logo";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/app/esign/signature-pad";
import { submitSignatureAction } from "@/server/actions/esign";

export type SignerProposal = {
  orgName: string;
  number: string;
  clientName: string;
  projectName: string;
  total: number;
  sections: { name: string; total: number }[];
  scope: string;
};

export function SignerView({
  token,
  proposal,
  alreadySigned,
}: {
  token: string;
  proposal: SignerProposal;
  alreadySigned: boolean;
}) {
  const padRef = useRef<SignaturePadHandle>(null);
  const [name, setName] = useState(proposal.clientName);
  const [done, setDone] = useState(alreadySigned);
  const [pending, startTransition] = useTransition();

  function sign() {
    if (!name.trim()) return toast.error("Enter your full name");
    if (padRef.current?.isEmpty()) return toast.error("Draw a signature first");
    const imageData = padRef.current?.toDataURL() ?? "";
    startTransition(async () => {
      const result = await submitSignatureAction(token, name, imageData);
      if (result.ok) {
        setDone(true);
        toast.success("Agreement signed");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <CheckCircle2 className="text-ok mx-auto size-14" />
        <h1 className="font-display mt-4 text-2xl font-semibold">All signed</h1>
        <p className="text-text-2 mt-2">
          Thanks, {name.split(" ")[0]} — your agreement for{" "}
          <b>{proposal.projectName}</b> is on the record. {proposal.orgName} has
          been notified.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-reno-lg border-line shadow-card overflow-hidden border bg-white">
        <div className="border-line flex items-center gap-3 border-b px-7 py-5">
          <RenoMark className="size-9" />
          <div className="flex-1">
            <div className="font-display font-semibold">{proposal.orgName}</div>
            <div className="text-text-3 text-sm">
              Client Agreement · {proposal.number}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg font-bold">
              {formatCurrency(proposal.total)}
            </div>
          </div>
        </div>

        <div className="px-7 py-5">
          <p className="text-text-2 mb-1 text-center text-[0.8rem] font-semibold tracking-wide uppercase">
            Client Agreement
          </p>
          <p className="text-text-3 mb-4 text-center text-sm">
            {proposal.projectName} · {proposal.orgName}
          </p>
          <div className="rounded-reno border-line mb-4 border">
            {proposal.sections.map((s, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-[#f1f3f8] px-4 py-2 text-sm last:border-0"
              >
                <span>{s.name}</span>
                <span className="font-mono">{formatCurrency(s.total)}</span>
              </div>
            ))}
          </div>
          <p className="text-text-2 mb-6 text-sm leading-relaxed">
            {proposal.scope}
          </p>

          <Field label="Full name" htmlFor="signer-name">
            <Input
              id="signer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </Field>

          <p className="text-text-2 mt-4 mb-1.5 text-[0.78rem] font-semibold">
            Signature
          </p>
          <SignaturePad ref={padRef} />
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => padRef.current?.clear()}
            >
              Clear
            </Button>
            <Button variant="primary" onClick={sign} disabled={pending}>
              Sign agreement
            </Button>
          </div>
        </div>
      </div>
      <p className="text-text-3 mt-4 text-center text-xs">
        Signing is recorded with a timestamp and audit trail. No account needed.
      </p>
    </div>
  );
}
