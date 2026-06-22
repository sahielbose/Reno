import { describe, it, expect } from "vitest";

import { generateToken } from "@/lib/tokens";

describe("generateToken", () => {
  it("produces unique, URL-safe tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(24);
  });

  it("has enough entropy to be unguessable (no collisions in a batch)", () => {
    const tokens = new Set(Array.from({ length: 500 }, () => generateToken()));
    expect(tokens.size).toBe(500);
  });
});
