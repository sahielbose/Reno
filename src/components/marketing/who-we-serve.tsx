import { Section, SectionHeading } from "@/components/marketing/section";

const TRADES = [
  {
    icon: "🏠",
    title: "Home builders",
    copy: "New construction, lot to keys.",
  },
  { icon: "🛠️", title: "Remodelers", copy: "Kitchens, baths, ADUs." },
  { icon: "🏚️", title: "Roofers", copy: "Tear-offs and repairs." },
  { icon: "🏗️", title: "Commercial", copy: "TIs and ground-up." },
] as const;

/** "Who we serve" — trades grid (`#serve`). */
export function WhoWeServe() {
  return (
    <Section id="serve" tight>
      <SectionHeading title="Made for every trade">
        Residential, commercial, and the specialty trades in between.
      </SectionHeading>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRADES.map((trade) => (
          <li
            key={trade.title}
            className="border-line hover:shadow-card rounded-[12px] border bg-white p-[18px] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
          >
            <div
              aria-hidden="true"
              className="bg-brand-100 text-brand mb-[0.7rem] grid h-[38px] w-[38px] place-items-center rounded-[10px] text-[1.1rem]"
            >
              {trade.icon}
            </div>
            <h4 className="text-[1rem]">{trade.title}</h4>
            <p className="text-text-2 mt-[0.35rem] text-[0.86rem]">
              {trade.copy}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
