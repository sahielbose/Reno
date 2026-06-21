/** Shared display formatters. Money is whole-dollar by default (matching the
 *  prototype's `fmt`); pass `{ cents: true }` for cents. */

type Numeric = number | string | { toString(): string };

export function toNumber(value: Numeric): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function formatCurrency(
  value: Numeric,
  opts?: { cents?: boolean },
): string {
  const n = toNumber(value);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  });
}

export function formatNumber(value: Numeric): string {
  return toNumber(value).toLocaleString("en-US");
}

export function formatDate(
  date: Date | string | null | undefined,
  opts?: { withYear?: boolean },
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(opts?.withYear ? { year: "numeric" } : {}),
  });
}

/** Two-letter initials from a name. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
