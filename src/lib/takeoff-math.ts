/**
 * Pure geometry → real-world measurement helpers for plan takeoffs.
 * `ftPerPx` is the calibrated scale: real-world feet per on-screen pixel.
 */
export interface Pt {
  x: number;
  y: number;
}

export function distancePx(a: Pt, b: Pt): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Length of a polyline (sum of segments) in feet. */
export function polylineLengthFt(points: Pt[], ftPerPx: number): number {
  let px = 0;
  for (let i = 1; i < points.length; i++)
    px += distancePx(points[i - 1], points[i]);
  return px * ftPerPx;
}

/** Shoelace polygon area (absolute) in pixels². */
export function polygonAreaPx(points: Pt[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/** Polygon area in square feet. */
export function polygonAreaSqFt(points: Pt[], ftPerPx: number): number {
  return polygonAreaPx(points) * ftPerPx * ftPerPx;
}

/** Rectangle (drag box) area in square feet. */
export function rectAreaSqFt(
  widthPx: number,
  heightPx: number,
  ftPerPx: number,
): number {
  return Math.abs(widthPx * heightPx) * ftPerPx * ftPerPx;
}

/** Derive ftPerPx from a drawn reference segment of known real length. */
export function calibrate(referencePx: number, realFeet: number): number {
  if (referencePx <= 0) return 0;
  return realFeet / referencePx;
}
