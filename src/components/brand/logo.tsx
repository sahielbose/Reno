import { cn } from "@/lib/utils";

/** The Reno "R" mark — a rounded square with the wordmark glyph. `fill` controls
 *  the tile color (brand by default; pass white-on-dark via props). */
export function RenoMark({
  className,
  tile = "var(--color-brand)",
  glyph = "#ffffff",
}: {
  className?: string;
  tile?: string;
  glyph?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="Reno"
    >
      <rect width="32" height="32" rx="8" fill={tile} />
      <path
        d="M9 23V9h7.2c2.5 0 4.3 1.6 4.3 4.1 0 1.9-1.1 3.3-2.8 3.8L21 23h-3.3l-3-5.4H12V23H9zm3-7.8h3.6c1.1 0 1.8-.6 1.8-1.6s-.7-1.6-1.8-1.6H12v3.2z"
        fill={glyph}
      />
    </svg>
  );
}

/** Mark + "Reno" wordmark lockup. */
export function RenoWordmark({
  className,
  tile,
  glyph,
  textClassName,
}: {
  className?: string;
  tile?: string;
  glyph?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <RenoMark className="size-[30px]" tile={tile} glyph={glyph} />
      <span
        className={cn(
          "font-display text-[1.2rem] font-bold tracking-tight",
          textClassName,
        )}
      >
        Reno
      </span>
    </span>
  );
}
