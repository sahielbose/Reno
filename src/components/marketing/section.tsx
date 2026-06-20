import { cn } from "@/lib/utils";

/** A marketing page section (`.section` / `.wrap` in the prototype). */
export function Section({
  id,
  tight = false,
  className,
  children,
}: {
  id?: string;
  tight?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("px-5 py-[90px]", tight && "pt-0", className)}
    >
      <div className="mx-auto max-w-[1180px]">{children}</div>
    </section>
  );
}

/** Centered section heading with optional lede + CTA (`.fh`). */
export function SectionHeading({
  title,
  children,
  cta,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-[680px] text-center">
      <h2 className="text-[clamp(1.9rem,3.6vw,2.6rem)]">{title}</h2>
      {children && (
        <p className="text-text-2 mt-3.5 text-[1.1rem]">{children}</p>
      )}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

const FRAME_GRADIENT: Record<string, string> = {
  blue: "linear-gradient(150deg,#16204a,#1e47d8 140%)",
  dark: "linear-gradient(150deg,#0c1430,#26305a)",
  green: "linear-gradient(150deg,#0f2a1e,#1f7a4d 150%)",
  violet: "linear-gradient(150deg,#171436,#4536b8 150%)",
  amber: "linear-gradient(150deg,#3a2a07,#7a5410 150%)",
};

/** Gradient "device frame" that wraps a product mock (`.frame` + `.in`). */
export function Frame({
  color = "blue",
  className,
  children,
}: {
  color?: keyof typeof FRAME_GRADIENT;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-reno-lg shadow-card-lg mx-auto max-w-[920px] p-3.5",
        className,
      )}
      style={{ background: FRAME_GRADIENT[color] }}
    >
      <div className="overflow-hidden rounded-[13px] bg-white">{children}</div>
    </div>
  );
}
