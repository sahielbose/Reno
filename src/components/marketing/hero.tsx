import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

type Step = {
  k: string;
  v: string;
  s: string;
  state?: "done" | "active";
};

const STEPS: Step[] = [
  { k: "Budget", v: "$48,200", s: "6 sections", state: "done" },
  { k: "Proposal", v: "Signed", s: "Mar 18", state: "done" },
  { k: "Invoiced", v: "$18,400", s: "2 of 4 draws", state: "active" },
  { k: "Costs out", v: "$11,950", s: "3 bills" },
  { k: "Schedule", v: "61%", s: "finish Jun 14" },
];

/** Marketing hero - the dark top of the landing page plus the "spine" card. */
export function Hero() {
  return (
    <header className="bg-ink relative overflow-hidden px-5 pt-[165px] pb-20 text-center text-white">
      {/* Blueprint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",
          backgroundSize: "46px 46px",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 28%,#000 30%,transparent 78%)",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 28%,#000 30%,transparent 78%)",
        }}
      />
      {/* Brand glow */}
      <div
        aria-hidden
        className="absolute top-[-180px] left-1/2 h-[760px] w-[760px] -translate-x-1/2 blur-[20px]"
        style={{
          background:
            "radial-gradient(circle,rgba(30,71,216,.55),transparent 62%)",
        }}
      />
      {/* Amber glow */}
      <div
        aria-hidden
        className="absolute top-[120px] left-[78%] h-[420px] w-[420px] blur-[20px]"
        style={{
          background:
            "radial-gradient(circle,rgba(245,165,36,.3),transparent 62%)",
        }}
      />

      <div className="relative mx-auto max-w-[920px]">
        <span className="mb-[1.4rem] inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-[0.85rem] py-[0.4rem] text-[0.82rem] font-semibold">
          <span className="bg-amber font-display grid h-[17px] w-[17px] place-items-center rounded-[4px] text-[0.7rem] font-extrabold text-[#1a1300]">
            R
          </span>
          The operating system for builders
        </span>

        <h1 className="text-[clamp(2.6rem,6.2vw,4.5rem)] font-bold tracking-[-0.035em]">
          Run every job from
          <br />
          first bid to{" "}
          <span className="bg-brand rounded-[0.12em] [box-decoration-break:clone] px-[0.18em] [-webkit-box-decoration-break:clone]">
            final build
          </span>
          .
        </h1>

        <p className="mx-auto mt-[1.3rem] mb-8 max-w-[560px] text-[1.2rem] text-white/[0.78]">
          Estimate, win, schedule, and get paid - one place for the whole job,
          so you stop stitching together spreadsheets, texts, and sticky notes.
        </p>

        <div className="flex flex-wrap justify-center gap-[0.7rem]">
          <ButtonLink href="/app/dashboard" variant="primary">
            Get started <ArrowRight aria-hidden />
          </ButtonLink>
          <ButtonLink href="/app/projects/p1" variant="ghostOnDark">
            Open a live project
          </ButtonLink>
        </div>

        {/* Spine card */}
        <div className="relative mx-auto mt-[60px] max-w-[980px]">
          <div className="rounded-reno-lg shadow-card-lg border border-white/[0.12] bg-white/[0.04] p-[22px] backdrop-blur-[6px]">
            <div className="mb-[18px] flex items-center justify-between px-1 text-[0.92rem] font-semibold">
              <div className="text-left">
                Maple Street Kitchen Remodel{" "}
                <span className="font-normal text-white/45">
                  · one job, start to finish
                </span>
              </div>
              <span className="rounded-full border border-[rgba(22,163,74,.35)] bg-[rgba(22,163,74,.18)] px-[0.7rem] py-[0.3rem] text-[0.74rem] text-[#7ee2a8]">
                ● On track
              </span>
            </div>

            <div className="relative grid grid-cols-5 gap-2.5">
              {/* Rail */}
              <div
                aria-hidden
                className="absolute top-[26px] right-[8%] left-[8%] h-0.5 bg-white/[0.14]"
              />
              {STEPS.map((step) => (
                <div
                  key={step.k}
                  className="relative rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-3.5 text-left"
                >
                  <div
                    aria-hidden
                    className={`border-ink mb-[30px] h-[13px] w-[13px] rounded-full border-[3px] ${
                      step.state === "done"
                        ? "bg-ok"
                        : step.state === "active"
                          ? "bg-amber"
                          : "bg-brand"
                    }`}
                  />
                  <div className="text-[0.72rem] font-semibold tracking-[0.06em] text-white/55 uppercase">
                    {step.k}
                  </div>
                  <div className="mono mt-[3px] text-[1.05rem] font-bold">
                    {step.v}
                  </div>
                  <div className="mt-0.5 text-[0.78rem] text-white/60">
                    {step.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
