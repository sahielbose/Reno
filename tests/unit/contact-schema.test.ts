import { describe, it, expect } from "vitest";

import { contactInputSchema } from "@/server/schemas/contact";

describe("contactInputSchema", () => {
  it("accepts a minimal valid contact and applies defaults", () => {
    const result = contactInputSchema.safeParse({ name: "Dana Whitfield" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("CLIENT");
      expect(result.data.tags).toEqual([]);
    }
  });

  it("requires a non-empty (trimmed) name", () => {
    expect(contactInputSchema.safeParse({ name: "" }).success).toBe(false);
    expect(contactInputSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects an invalid email but allows an empty one", () => {
    expect(
      contactInputSchema.safeParse({ name: "D", email: "not-an-email" })
        .success,
    ).toBe(false);
    expect(contactInputSchema.safeParse({ name: "D", email: "" }).success).toBe(
      true,
    );
    expect(
      contactInputSchema.safeParse({ name: "D", email: "a@b.com" }).success,
    ).toBe(true);
  });

  it("validates the contact type enum", () => {
    expect(
      contactInputSchema.safeParse({ name: "D", type: "SUB" }).success,
    ).toBe(true);
    expect(
      contactInputSchema.safeParse({ name: "D", type: "NOPE" }).success,
    ).toBe(false);
  });

  it("keeps provided tags", () => {
    const result = contactInputSchema.safeParse({
      name: "TileWorks",
      type: "VENDOR",
      tags: ["preferred", "tile"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(["preferred", "tile"]);
  });
});
