import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

type Project = {
  emoji: string;
  name: string;
  status: string;
  dot: string;
};

const PROJECTS: Project[] = [
  { emoji: "🍳", name: "Maple St. Kitchen", status: "Active", dot: "bg-ok" },
  { emoji: "🏠", name: "Oakwood ADU", status: "Active", dot: "bg-ok" },
  { emoji: "🔨", name: "Ridgeline Roof", status: "Bidding", dot: "bg-amber" },
  { emoji: "📐", name: "Beacon Hill 2nd", status: "Planning", dot: "bg-brand" },
];

/** AI feature section — "Nothing slips through the cracks". */
export function FeatureAI() {
  return (
    <Section id="f-ai">
      <SectionHeading
        title="Nothing slips through the cracks"
        cta={
          <ButtonLink href="/app/assistant" variant="dark">
            Try the assistant →
          </ButtonLink>
        }
      >
        Every project, invoice, and deadline is watched for you. Ask about any
        job and get an answer — with the receipts — in seconds.
      </SectionHeading>

      <Frame color="blue">
        <div className="grid min-h-[290px] grid-cols-[200px_1fr]">
          {/* Projects list */}
          <div className="border-line bg-paper border-r p-3.5">
            <div className="text-[0.92rem] font-bold">
              Projects
              <span className="text-text-3 block text-[0.72rem] font-medium">
                4 active
              </span>
            </div>

            <ul>
              {PROJECTS.map((p) => (
                <li
                  key={p.name}
                  className="mt-2 flex items-center gap-[0.6rem] rounded-[9px] px-[0.4rem] py-[0.55rem]"
                >
                  <div
                    className="bg-brand-100 grid size-[30px] flex-none place-items-center rounded-[7px]"
                    aria-hidden="true"
                  >
                    {p.emoji}
                  </div>
                  <div>
                    <div className="text-[0.82rem] leading-[1.2] font-semibold">
                      {p.name}
                    </div>
                    <div className="text-text-3 flex items-center text-[0.7rem]">
                      <span
                        className={`mr-1 inline-block size-[7px] rounded-full ${p.dot}`}
                        aria-hidden="true"
                      />
                      {p.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat thread */}
          <div className="flex flex-col p-[18px]">
            {/* User bubble */}
            <div className="mb-3.5 flex justify-end gap-[0.55rem]">
              <div className="bg-brand max-w-[80%] rounded-[13px] rounded-br-[4px] px-[0.9rem] py-[0.7rem] text-[0.9rem] leading-[1.45] text-white">
                Did the deposit come in on the Maple Street kitchen yet?
              </div>
            </div>

            {/* Assistant reply */}
            <div className="mb-3.5 flex gap-[0.55rem]">
              <div
                className="bg-ink grid size-[26px] flex-none place-items-center rounded-[7px] text-[0.7rem] font-bold text-white"
                aria-hidden="true"
              >
                R
              </div>
              <div className="border-line bg-paper max-w-[80%] rounded-[13px] border px-[0.9rem] py-[0.7rem] text-[0.9rem] leading-[1.45]">
                Not yet. <b>Invoice #3 for $7,500</b> went out Mar 3 and is
                still <span className="text-danger">unpaid</span>. The build
                starts <b>Mar 28</b> — worth a nudge.
                {/* Embedded invoice mini-card */}
                <div className="border-line mt-[0.6rem] rounded-[10px] border px-[0.8rem] py-[0.7rem] text-[0.82rem]">
                  <div className="text-text-3 flex justify-between text-[0.7rem]">
                    <span>INV-003</span>
                    <span className="bg-danger-soft text-danger rounded-[6px] px-[0.5rem] py-[0.18rem] text-[0.66rem] font-bold">
                      UNPAID
                    </span>
                  </div>
                  <div className="mt-[0.3rem] font-semibold">
                    Maple Street Kitchen — Deposit
                  </div>
                  <div className="mono font-bold">$7,500.00</div>
                </div>
              </div>
            </div>

            {/* Ask input */}
            <div className="border-line mt-auto flex items-center gap-2 rounded-[11px] border py-2 pr-2 pl-[0.9rem]">
              <input
                className="flex-1 border-none text-[0.88rem] outline-none disabled:bg-transparent"
                placeholder="Ask anything about your projects…"
                disabled
                aria-label="Ask anything about your projects"
              />
              <div
                className="bg-brand grid size-[32px] place-items-center rounded-[8px] text-white"
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
