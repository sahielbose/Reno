import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

/** Marketing feature section for the in-browser takeoff tool. */
export function FeatureTakeoff() {
  return (
    <Section tight>
      <SectionHeading
        title="Measure right on your blueprints"
        cta={
          <ButtonLink href="/app/projects/p1/takeoff" variant="dark">
            Open the takeoff tool →
          </ButtonLink>
        }
      >
        Upload a plan, set the scale, and pull takeoffs in the browser — areas,
        lengths, and counts that drop straight into your budget.
      </SectionHeading>

      <Frame color="dark">
        <div>
          {/* Toolbar */}
          <div className="border-line text-text-2 flex items-center gap-2 border-b px-3 py-2 text-[0.78rem]">
            <div className="flex gap-[0.3rem]">
              <span className="border-ink bg-ink rounded-[7px] border px-[0.6rem] py-[0.32rem] text-[0.74rem] font-semibold text-white">
                Takeoff
              </span>
              <span className="border-line text-text-2 rounded-[7px] border px-[0.6rem] py-[0.32rem] text-[0.74rem] font-semibold">
                Markup
              </span>
            </div>
            <div className="bg-line h-[18px] w-px" />
            <div className="flex gap-[0.3rem]">
              <span className="border-line text-text-2 rounded-[7px] border px-[0.6rem] py-[0.32rem] text-[0.74rem] font-semibold">
                ▢ Area
              </span>
              <span className="border-line text-text-2 rounded-[7px] border px-[0.6rem] py-[0.32rem] text-[0.74rem] font-semibold">
                ／ Length
              </span>
              <span className="border-line text-text-2 rounded-[7px] border px-[0.6rem] py-[0.32rem] text-[0.74rem] font-semibold">
                • Count
              </span>
            </div>
            <div className="mono ml-auto text-[0.72rem]">
              Scale 1/4&quot; = 1&apos;-0&quot;
            </div>
          </div>

          {/* Blueprint plan area */}
          <div
            className="relative h-[300px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(30,71,216,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(30,71,216,.05) 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <svg
              viewBox="0 0 760 300"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <g stroke="#1b2740" strokeWidth="2" fill="none" opacity=".85">
                <rect x="40" y="40" width="240" height="150" />
                <rect x="40" y="40" width="120" height="80" />
                <rect x="320" y="40" width="180" height="220" />
                <rect x="540" y="40" width="180" height="120" />
                <rect x="540" y="180" width="180" height="80" />
              </g>
              <text
                x="60"
                y="75"
                fontSize="11"
                fill="#1b2740"
                fontFamily="monospace"
              >
                KITCHEN
              </text>
              <text
                x="340"
                y="60"
                fontSize="11"
                fill="#1b2740"
                fontFamily="monospace"
              >
                DINING
              </text>
              <text
                x="560"
                y="60"
                fontSize="11"
                fill="#1b2740"
                fontFamily="monospace"
              >
                LIVING
              </text>
              <rect
                x="320"
                y="40"
                width="180"
                height="220"
                fill="rgba(30,71,216,.18)"
                stroke="#1E47D8"
                strokeWidth="2"
              />
              <rect
                x="408"
                y="142"
                width="60"
                height="20"
                rx="4"
                fill="#0E1726"
              />
              <text
                x="438"
                y="156"
                fontSize="11"
                fill="#fff"
                fontFamily="monospace"
                textAnchor="middle"
              >
                182 SF
              </text>
            </svg>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
