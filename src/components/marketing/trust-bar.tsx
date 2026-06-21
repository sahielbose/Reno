const LOGOS = [
  "NORTHGATE",
  "MERIDIAN BUILD",
  "CEDARLINE",
  "IRONWOOD GC",
  "PACIFIC RIDGE",
  "SUMMIT & CO",
];

export function TrustBar() {
  return (
    <section className="bg-ink px-5 pt-2.5 pb-[60px] text-center text-white">
      <p className="mb-6 text-[0.72rem] tracking-[0.18em] text-[rgba(255,255,255,.4)] uppercase">
        Trusted by contractors across the country
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-x-[52px] gap-y-[34px] opacity-60">
        {LOGOS.map((name) => (
          <li
            key={name}
            className="font-display text-[1.05rem] font-bold tracking-[0.04em]"
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}
