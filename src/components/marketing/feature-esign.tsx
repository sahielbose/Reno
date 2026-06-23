import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

/** Skeleton bar standing in for body copy in the document mock. */
function Skel({ width }: { width: string }) {
  return (
    <div
      aria-hidden
      className="bg-line my-[.4rem] h-[7px] rounded"
      style={{ width }}
    />
  );
}

/** Pill toggle recreated from the prototype's `.tg` visuals. */
function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative h-[17px] w-[30px] shrink-0 rounded-full ${
        on ? "bg-amber" : "bg-line-2"
      }`}
    >
      <span
        className={`absolute top-[2px] size-[13px] rounded-full bg-white ${
          on ? "right-[2px]" : "left-[2px]"
        }`}
      />
    </span>
  );
}

/** E-signature feature section: send proposals/agreements for signature. */
export function FeatureEsign() {
  return (
    <Section tight>
      <SectionHeading
        title="Get contracts signed in minutes, not days"
        cta={
          <ButtonLink href="/app/projects/p1/proposal" variant="dark">
            Send a contract →
          </ButtonLink>
        }
      >
        Add signers to any proposal or vendor agreement and send. They sign from
        any device - no account, no separate e-sign tool - straight to the
        record.
      </SectionHeading>

      <Frame color="violet">
        <div className="bg-paper grid grid-cols-[1fr_220px]">
          {/* Document panel */}
          <div className="border-line m-3.5 rounded-[11px] border bg-white p-[18px]">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="mono text-text-3 text-[.72rem]">
                Client Agreement · DOC-0014
              </span>
              <span className="bg-ink inline-flex shrink-0 items-center justify-center rounded-full px-[.9rem] py-[.5rem] text-[.85rem] font-semibold text-white">
                Send for signature
              </span>
            </div>

            <div className="text-text-2 text-center text-[.8rem] font-bold tracking-[.05em]">
              CLIENT AGREEMENT
            </div>
            <div className="text-text-3 mb-3.5 text-center text-[.7rem]">
              Maple Street Kitchen · Apex Build Co.
            </div>

            <div className="my-3 grid grid-cols-2 gap-2.5">
              <div className="border-line rounded-lg border px-[.7rem] py-2">
                <div className="text-text-3 text-[.62rem] uppercase">
                  Client
                </div>
                <div className="text-[.85rem] font-semibold">
                  Dana Whitfield
                </div>
              </div>
              <div className="border-line rounded-lg border px-[.7rem] py-2">
                <div className="text-text-3 text-[.62rem] uppercase">Total</div>
                <div className="mono text-[.85rem] font-semibold">$48,200</div>
              </div>
            </div>

            <Skel width="90%" />
            <Skel width="80%" />
            <Skel width="60%" />

            <div className="border-amber bg-amber-soft text-warn mt-3.5 rounded-lg border-[1.5px] border-dashed p-[.9rem] text-center text-[.78rem] font-semibold">
              Dana Whitfield - sign here
            </div>
          </div>

          {/* Recipients rail */}
          <div className="border-line border-l px-3.5 py-4">
            <div className="text-text-3 mb-2 text-[.62rem] tracking-[.08em] uppercase">
              Recipients
            </div>

            <ul>
              <li className="border-amber bg-amber-soft mb-2 flex items-center justify-between rounded-[9px] border px-[.7rem] py-[.55rem] text-[.8rem]">
                <div>
                  <div className="font-semibold">Dana Whitfield</div>
                  <div className="text-warn text-[.68rem]">Signature</div>
                </div>
                <Toggle on />
              </li>
              <li className="border-line mb-2 flex items-center justify-between rounded-[9px] border px-[.7rem] py-[.55rem] text-[.8rem]">
                <div>
                  <div className="font-semibold">M. Rivera</div>
                  <div className="text-text-3 text-[.68rem]">CC only</div>
                </div>
                <Toggle on={false} />
              </li>
            </ul>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
