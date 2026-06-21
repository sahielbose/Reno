import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading, Frame } from "@/components/marketing/section";

type FileRow = {
  icon: "PDF" | "IMG";
  name: string;
  badge: React.ComponentProps<typeof Badge>["variant"];
  badgeLabel: string;
  meta: string;
};

const FILES: FileRow[] = [
  {
    icon: "PDF",
    name: "Floor Plan — L1.pdf",
    badge: "brand",
    badgeLabel: "Plan",
    meta: "Mar 18",
  },
  {
    icon: "PDF",
    name: "Building Permit.pdf",
    badge: "amber",
    badgeLabel: "Permit",
    meta: "Approved",
  },
  {
    icon: "PDF",
    name: "COI — Summit.pdf",
    badge: "info",
    badgeLabel: "Insurance",
    meta: "Dec 2026",
  },
  {
    icon: "IMG",
    name: "Demo Photos",
    badge: "purple",
    badgeLabel: "Photo",
    meta: "6 photos",
  },
  {
    icon: "PDF",
    name: "Framing Contract",
    badge: "ok",
    badgeLabel: "Contract",
    meta: "Signed",
  },
];

/**
 * Files + RFI feature section — a two-column product mock inside a dark device
 * frame. LEFT: the project Files list; RIGHT: a resolved RFI thread.
 */
export function FeatureFilesRfi() {
  return (
    <Section tight>
      <SectionHeading
        title="All your project knowledge. One place, not six."
        cta={
          <ButtonLink href="/app/projects/p1/documents" variant="dark">
            See how it works →
          </ButtonLink>
        }
      >
        Plans, permits, photos, contracts — all attached to the job. Requests go
        out, answers come back, and everything stays on the record.
      </SectionHeading>

      <Frame color="dark">
        <div className="grid grid-cols-[200px_1fr] bg-white">
          {/* LEFT — Files list */}
          <div className="border-line border-r p-3.5">
            <div className="text-[0.9rem] font-bold">
              Files
              <span className="text-text-3 block text-[0.7rem] font-medium">
                5 files
              </span>
            </div>
            <ul>
              {FILES.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center gap-2 rounded-lg px-[0.3rem] py-2"
                >
                  <span
                    aria-hidden
                    className="border-line bg-paper text-text-3 grid h-[30px] w-[26px] flex-none place-items-center rounded-[5px] border text-[0.55rem]"
                  >
                    {file.icon}
                  </span>
                  <div>
                    <div className="text-[0.78rem] leading-[1.15] font-semibold">
                      {file.name}
                    </div>
                    <div className="text-text-3 flex items-center text-[0.66rem]">
                      <Badge
                        variant={file.badge}
                        className="mr-[0.3rem] rounded-[5px] px-[0.4rem] py-[0.1rem] text-[0.6rem]"
                      >
                        {file.badgeLabel}
                      </Badge>
                      {file.meta}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — RFI thread */}
          <div className="p-[18px]">
            <div className="flex items-center justify-between">
              <span className="mono text-text-3 text-[0.7rem]">RFI-003</span>
              <Badge
                variant="ok"
                className="rounded-md px-[0.55rem] py-[0.18rem] text-[0.66rem]"
              >
                Responded
              </Badge>
            </div>
            <h4 className="mx-0 mt-[0.3rem] mb-4 text-[1rem]">
              Electrical panel location
            </h4>

            <div className="mb-[0.8rem] flex gap-[0.6rem]">
              <span
                aria-hidden
                className="border-line bg-paper grid h-7 w-7 flex-none place-items-center rounded-full border text-[0.66rem] font-bold"
              >
                SP
              </span>
              <p className="border-line bg-paper rounded-[11px] border px-[0.8rem] py-[0.6rem] text-[0.84rem]">
                Plans show two possible spots on page 4. Which one — need it
                before rough-in tomorrow.
              </p>
            </div>

            <div className="mb-[0.8rem] flex flex-row-reverse gap-[0.6rem]">
              <span
                aria-hidden
                className="bg-brand grid h-7 w-7 flex-none place-items-center rounded-full text-[0.66rem] font-bold text-white"
              >
                You
              </span>
              <p className="border-amber bg-amber-soft rounded-[11px] border px-[0.8rem] py-[0.6rem] text-[0.84rem]">
                Utility closet, NE corner. Confirm with your inspector first.
              </p>
            </div>

            <p className="text-ok mt-2 text-center text-[0.72rem]">
              ✓ Resolved · Mar 19 at 3:42 PM
            </p>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
