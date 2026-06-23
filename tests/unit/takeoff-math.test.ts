import { describe, it, expect } from "vitest";

import {
  calibrate,
  polygonAreaSqFt,
  polylineLengthFt,
  rectAreaSqFt,
} from "@/lib/takeoff-math";

describe("takeoff-math", () => {
  it("rect area scales by ftPerPx squared", () => {
    expect(rectAreaSqFt(100, 100, 0.1)).toBeCloseTo(100);
    expect(rectAreaSqFt(-50, 20, 1)).toBeCloseTo(1000); // absolute
  });

  it("polyline length sums segments in feet", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(polylineLengthFt(pts, 0.5)).toBeCloseTo(10);
  });

  it("polygon area via shoelace", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonAreaSqFt(square, 1)).toBeCloseTo(100);
  });

  it("calibrate derives ftPerPx from a reference line", () => {
    expect(calibrate(200, 20)).toBeCloseTo(0.1);
    expect(calibrate(0, 20)).toBe(0);
  });
});
