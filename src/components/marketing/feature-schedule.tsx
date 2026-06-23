import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

const TOTAL_DAYS = 30;
const TODAY = 13;

const TASKS: { name: string; start: number; days: number; crit: boolean }[] = [
  { name: "Site prep", start: 0, days: 3, crit: true },
  { name: "Demolition", start: 3, days: 4, crit: true },
  { name: "Rough plumbing", start: 7, days: 5, crit: true },
  { name: "Rough electrical", start: 7, days: 4, crit: false },
  { name: "Cabinets", start: 12, days: 6, crit: true },
  { name: "Countertops", start: 18, days: 3, crit: true },
  { name: "Finishes", start: 21, days: 5, crit: true },
];

const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6"];

export function FeatureSchedule() {
  return (
    <Section tight>
      <SectionHeading
        title="See the critical path before it slips"
        cta={
          <ButtonLink href="/app/projects/p1/schedule" variant="dark">
            Build a schedule →
          </ButtonLink>
        }
      >
        Lay out tasks, link dependencies, and Reno computes the critical path
        automatically - so you know which delays actually push your finish date.
      </SectionHeading>

      <Frame color="green">
        <div className="bg-white p-4">
          {/* header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[0.92rem] font-bold">
              Schedule · Maple Street Kitchen
            </div>
            <div className="border-line flex overflow-hidden rounded-lg border text-[0.74rem]">
              <span className="bg-ink px-2.5 py-[0.3rem] font-semibold text-white">
                Gantt
              </span>
              <span className="text-text-2 px-2.5 py-[0.3rem] font-semibold">
                Calendar
              </span>
            </div>
          </div>

          {/* gantt */}
          <div className="border-line relative overflow-hidden rounded-[10px] border bg-white">
            {/* week header */}
            <div className="border-line text-text-3 grid grid-cols-[120px_repeat(6,1fr)] border-b text-[0.66rem]">
              <div className="px-2 py-[0.4rem]" />
              {WEEKS.map((w) => (
                <div key={w} className="border-line border-l px-2 py-[0.4rem]">
                  {w}
                </div>
              ))}
            </div>

            {/* task rows */}
            {TASKS.map((t) => (
              <div
                key={t.name}
                className="grid h-[34px] grid-cols-[120px_1fr] items-center border-b border-[#f1f3f8]"
              >
                <div className="text-text-2 pl-[0.7rem] text-[0.76rem]">
                  {t.name}
                </div>
                <div className="relative h-full">
                  <div
                    className="absolute top-2 h-[18px] rounded-[6px]"
                    style={{
                      left: `${(t.start / TOTAL_DAYS) * 100}%`,
                      width: `${(t.days / TOTAL_DAYS) * 100}%`,
                      background: t.crit ? "var(--color-brand)" : "#3f7d63",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* today marker */}
            <div
              aria-hidden
              className="bg-amber absolute top-0 bottom-0 z-[3] w-0.5"
              style={{
                left: `calc(120px + (100% - 120px)*${TODAY / TOTAL_DAYS})`,
              }}
            >
              <span className="bg-amber absolute top-[-2px] left-[-15px] rounded-[5px] px-[0.35rem] py-[0.1rem] text-[0.6rem] font-bold text-[#3a2a00]">
                Today
              </span>
            </div>

            {/* footer */}
            <div className="border-line text-text-3 flex justify-between border-t px-[0.7rem] py-2 text-[0.7rem]">
              <span>7 tasks · 4 dependencies</span>
              <span>Finish Jun 14</span>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
