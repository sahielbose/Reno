import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

/** Budget -> Proposal feature section: budget card on the left generates a
 * branded, ready-to-sign proposal on the right. */
export function FeatureBudgetProposal() {
  return (
    <Section tight>
      <SectionHeading
        title="From cost breakdown to signed proposal — in one click"
        cta={
          <ButtonLink href="/app/projects/p1/budget" variant="dark">
            Start a budget →
          </ButtonLink>
        }
      >
        Build the budget line by line, hit generate, and your client gets a
        branded proposal ready to sign. No copy-paste, no reformatting.
      </SectionHeading>

      <Frame color="amber">
        <div className="bg-paper grid grid-cols-2 gap-3.5 p-3.5">
          {/* LEFT — budget card */}
          <div className="border-line overflow-hidden rounded-xl border bg-white text-[0.8rem]">
            <div className="border-line flex items-center justify-between border-b px-[0.85rem] py-[0.7rem]">
              <div>
                <span className="mono text-text-3 text-[0.68rem]">BUD-004</span>
                <div className="font-bold">Maple Street Kitchen</div>
              </div>
              <div className="mono font-bold">$48,200</div>
            </div>

            {/* header row */}
            <div className="border-line mono text-text-3 grid grid-cols-[24px_1fr_38px_40px_60px] items-center gap-1.5 border-b px-[0.85rem] py-[0.42rem] text-[0.62rem]">
              <span>#</span>
              <span>Name</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Unit</span>
              <span className="text-right">Total</span>
            </div>

            {/* Demolition */}
            <div className="bg-paper grid grid-cols-[1fr_auto] gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem] font-bold">
              <span>Demolition</span>
              <span className="mono">$3,200</span>
            </div>
            <div className="mono grid grid-cols-[24px_1fr_38px_40px_60px] items-center gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem]">
              <span>1.1</span>
              <span>Demo &amp; disposal</span>
              <span className="text-right">1</span>
              <span className="text-right">LS</span>
              <span className="text-right">$3,200</span>
            </div>

            {/* Cabinetry */}
            <div className="bg-paper grid grid-cols-[1fr_auto] gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem] font-bold">
              <span>Cabinetry</span>
              <span className="mono">$13,560</span>
            </div>
            <div className="mono grid grid-cols-[24px_1fr_38px_40px_60px] items-center gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem]">
              <span>2.1</span>
              <span>Custom cabinets</span>
              <span className="text-right">18</span>
              <span className="text-right">LF</span>
              <span className="text-right">$9,360</span>
            </div>
            <div className="mono grid grid-cols-[24px_1fr_38px_40px_60px] items-center gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem]">
              <span>2.2</span>
              <span>Island</span>
              <span className="text-right">1</span>
              <span className="text-right">EA</span>
              <span className="text-right">$4,200</span>
            </div>

            {/* Countertops */}
            <div className="bg-paper grid grid-cols-[1fr_auto] gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem] font-bold">
              <span>Countertops</span>
              <span className="mono">$5,890</span>
            </div>
            <div className="mono grid grid-cols-[24px_1fr_38px_40px_60px] items-center gap-1.5 px-[0.85rem] py-[0.42rem] text-[0.72rem]">
              <span>3.1</span>
              <span>Quartz slab</span>
              <span className="text-right">62</span>
              <span className="text-right">SF</span>
              <span className="text-right">$5,890</span>
            </div>

            <div className="border-line border-t p-[0.6rem]">
              <div className="bg-ok rounded-lg py-2 text-center text-[0.82rem] font-semibold text-white">
                ✓ Generated
              </div>
            </div>
          </div>

          {/* RIGHT — proposal card */}
          <div className="border-line overflow-hidden rounded-xl border bg-white text-[0.8rem]">
            <div className="border-line flex items-center justify-between border-b px-[0.85rem] py-[0.7rem]">
              <div className="flex items-center gap-[0.4rem]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <rect width="32" height="32" rx="7" fill="#1E47D8" />
                  <path
                    d="M9 23V9h7.2c2.5 0 4.3 1.6 4.3 4.1 0 1.9-1.1 3.3-2.8 3.8L21 23h-3.3l-3-5.4H12V23H9z"
                    fill="#fff"
                  />
                </svg>
                <div>
                  <div className="text-[0.74rem] font-bold">Apex Build Co.</div>
                  <div className="mono text-text-3 text-[0.68rem]">
                    Proposal #8 · D. Whitfield
                  </div>
                </div>
              </div>
              <div className="mono font-bold">$48,200</div>
            </div>

            <div className="border-line flex justify-between border-b px-[0.85rem] py-2 text-[0.84rem]">
              <span>Demolition</span>
              <span className="mono font-semibold">$3,200</span>
            </div>
            <div className="border-line flex justify-between border-b px-[0.85rem] py-2 text-[0.84rem]">
              <span>Cabinetry</span>
              <span className="mono font-semibold">$13,560</span>
            </div>
            <div className="border-line flex justify-between border-b px-[0.85rem] py-2 text-[0.84rem]">
              <span>Countertops</span>
              <span className="mono font-semibold">$5,890</span>
            </div>
            <div className="border-line flex justify-between border-b px-[0.85rem] py-2 text-[0.84rem]">
              <span>Plumbing</span>
              <span className="mono font-semibold">$5,600</span>
            </div>
            <div className="border-line flex justify-between border-b px-[0.85rem] py-2 text-[0.84rem]">
              <span>Electrical</span>
              <span className="mono font-semibold">$4,800</span>
            </div>

            <div className="border-line flex items-center justify-between border-t p-[0.6rem]">
              <span className="inline-flex rounded-full bg-[#e0f2fe] px-[0.6rem] py-1 text-[0.72rem] font-bold text-[#0369a1]">
                Sent
              </span>
              <span className="text-text-3 text-[0.74rem]">
                Awaiting signature…
              </span>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
