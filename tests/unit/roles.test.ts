import { describe, it, expect } from "vitest";

import {
  hasRole,
  can,
  requireRole,
  requirePermission,
  ForbiddenError,
} from "@/lib/auth/roles";

describe("role hierarchy", () => {
  it("OWNER ⊇ ADMIN ⊇ MEMBER", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("OWNER", "MEMBER")).toBe(true);
    expect(hasRole("ADMIN", "MEMBER")).toBe(true);
    expect(hasRole("ADMIN", "OWNER")).toBe(false);
    expect(hasRole("MEMBER", "ADMIN")).toBe(false);
    expect(hasRole("MEMBER", "MEMBER")).toBe(true);
  });
});

describe("permissions", () => {
  it("only owners manage billing", () => {
    expect(can("OWNER", "org.manageBilling")).toBe(true);
    expect(can("ADMIN", "org.manageBilling")).toBe(false);
    expect(can("MEMBER", "org.manageBilling")).toBe(false);
  });

  it("admins manage team and delete projects; members cannot", () => {
    expect(can("ADMIN", "org.manageTeam")).toBe(true);
    expect(can("ADMIN", "project.delete")).toBe(true);
    expect(can("MEMBER", "project.delete")).toBe(false);
  });
});

describe("guards", () => {
  it("requireRole throws ForbiddenError below the minimum", () => {
    expect(() => requireRole("MEMBER", "ADMIN")).toThrow(ForbiddenError);
    expect(() => requireRole("ADMIN", "ADMIN")).not.toThrow();
  });

  it("requirePermission throws when lacking the permission", () => {
    expect(() => requirePermission("MEMBER", "org.manageBilling")).toThrow(
      ForbiddenError,
    );
    expect(() => requirePermission("OWNER", "org.manageBilling")).not.toThrow();
  });
});
