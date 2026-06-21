import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";

/**
 * Invoice feature section — "Stop chasing checks".
 * Standalone green gradient invoice mock (the prototype's `.m-inv`, not wrapped
 * in a device Frame), ported faithfully to Tailwind utilities.
 */
export function FeatureInvoice() {
  return (
    <Section tight>
      <SectionHeading
        title="Stop chasing checks"
        cta={
          <ButtonLink href="/app/projects/p1/invoices" variant="dark">
            Get paid →
          </ButtonLink>
        }
      >
        Send an invoice, get paid online, and watch your books update
        themselves. From budget to reconciled payment — without touching your
        accounting software.
      </SectionHeading>

      {/* .m-inv */}
      <div
        className="mx-auto max-w-[600px] rounded-[13px] p-7 text-white"
        style={{ background: "linear-gradient(160deg,#11321f,#1d5e3a)" }}
      >
        {/* .t */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[0.68rem] tracking-[0.08em] text-white/55">
              INVOICE #3
            </div>
            <h4 className="mt-[0.2rem] text-[1.1rem]">
              Maple Street Kitchen Remodel
            </h4>
            <div className="text-[0.78rem] text-white/60">
              Dana Whitfield · Due Mar 28, 2026
            </div>
          </div>
          {/* .amt */}
          <div className="mono text-right text-[1.6rem] font-bold">
            $12,500
            <small className="block font-sans text-[0.66rem] font-normal text-white/55">
              Final payment
            </small>
          </div>
        </div>

        {/* .ls */}
        <div className="mt-5 mb-3.5 border-t border-white/[0.12] pt-3.5">
          {/* .ln */}
          <div className="flex justify-between py-[0.3rem] text-[0.86rem]">
            <span>Kitchen demo &amp; disposal</span>
            <span className="mono">$1,200</span>
          </div>
          <div className="flex justify-between py-[0.3rem] text-[0.86rem]">
            <span>Cabinet installation</span>
            <span className="mono">$6,800</span>
          </div>
          <div className="flex justify-between py-[0.3rem] text-[0.86rem]">
            <span>Countertop &amp; backsplash</span>
            <span className="mono">$4,500</span>
          </div>
          {/* .pb (full green progress bar) */}
          <div className="my-[0.6rem] h-[5px] rounded-full bg-white/15">
            <div className="h-full w-full rounded-full bg-[#5fd693]" />
          </div>
        </div>

        {/* .ft */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[rgba(95,214,147,0.18)] px-[0.7rem] py-[0.3rem] text-[0.74rem] font-bold text-[#bff3d2]">
            ✓ Paid
          </span>
          <span className="rounded-full bg-white/[0.12] px-[0.7rem] py-[0.3rem] text-[0.74rem] font-bold text-white/80">
            ⟳ Synced to accounting
          </span>
        </div>
      </div>
    </Section>
  );
}
