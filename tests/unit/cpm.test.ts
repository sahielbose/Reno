import { describe, it, expect } from "vitest";

import { computeCpm } from "@/lib/cpm";

describe("computeCpm", () => {
  it("schedules a simple FS chain on the critical path", () => {
    const { nodes, projectDuration } = computeCpm(
      [
        { id: "a", durationDays: 2 },
        { id: "b", durationDays: 3 },
        { id: "c", durationDays: 1 },
      ],
      [
        { predecessorId: "a", successorId: "b" },
        { predecessorId: "b", successorId: "c" },
      ],
    );
    expect(projectDuration).toBe(6);
    expect(nodes.get("a")!.earlyStart).toBe(0);
    expect(nodes.get("b")!.earlyStart).toBe(2);
    expect(nodes.get("c")!.earlyFinish).toBe(6);
    expect([...nodes.values()].every((n) => n.isCritical)).toBe(true);
  });

  it("gives float to the shorter of two parallel predecessors", () => {
    const { nodes, projectDuration } = computeCpm(
      [
        { id: "a", durationDays: 2 },
        { id: "b", durationDays: 5 },
        { id: "c", durationDays: 1 },
      ],
      [
        { predecessorId: "a", successorId: "c" },
        { predecessorId: "b", successorId: "c" },
      ],
    );
    expect(projectDuration).toBe(6);
    expect(nodes.get("c")!.earlyStart).toBe(5);
    expect(nodes.get("a")!.totalFloat).toBe(3); // 2-day task can slip 3 days
    expect(nodes.get("a")!.isCritical).toBe(false);
    expect(nodes.get("b")!.isCritical).toBe(true);
    expect(nodes.get("c")!.isCritical).toBe(true);
  });

  it("honors lag on a finish-to-start dependency", () => {
    const { nodes } = computeCpm(
      [
        { id: "a", durationDays: 2 },
        { id: "b", durationDays: 2 },
      ],
      [{ predecessorId: "a", successorId: "b", type: "FS", lagDays: 3 }],
    );
    expect(nodes.get("b")!.earlyStart).toBe(5); // 2 + 3 lag
  });
});
