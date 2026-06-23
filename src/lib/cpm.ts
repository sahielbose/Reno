/**
 * Critical Path Method (CPM) - forward/backward pass over a task network with
 * FS/SS/FF/SF dependencies + lag. Pure and unit-tested. Day units are integers.
 */
export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface CpmTask {
  id: string;
  durationDays: number;
}

export interface CpmDependency {
  predecessorId: string;
  successorId: string;
  type?: DependencyType;
  lagDays?: number;
}

export interface CpmNode {
  id: string;
  durationDays: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalFloat: number;
  isCritical: boolean;
}

export interface CpmResult {
  nodes: Map<string, CpmNode>;
  projectDuration: number;
}

/** Topological order via Kahn's algorithm (ignores edges that form cycles). */
function topoOrder(ids: string[], edges: CpmDependency[]): string[] {
  const indegree = new Map<string, number>(ids.map((id) => [id, 0]));
  const adj = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of edges) {
    if (!adj.has(e.predecessorId) || !indegree.has(e.successorId)) continue;
    adj.get(e.predecessorId)!.push(e.successorId);
    indegree.set(e.successorId, (indegree.get(e.successorId) ?? 0) + 1);
  }
  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  // Any leftover (cyclic) nodes are appended so they still get scheduled.
  for (const id of ids) if (!order.includes(id)) order.push(id);
  return order;
}

export function computeCpm(
  tasks: CpmTask[],
  dependencies: CpmDependency[],
): CpmResult {
  const dur = new Map(tasks.map((t) => [t.id, Math.max(0, t.durationDays)]));
  const ids = tasks.map((t) => t.id);
  const preds = new Map<string, CpmDependency[]>(ids.map((id) => [id, []]));
  const succs = new Map<string, CpmDependency[]>(ids.map((id) => [id, []]));
  for (const d of dependencies) {
    if (!dur.has(d.predecessorId) || !dur.has(d.successorId)) continue;
    preds.get(d.successorId)!.push(d);
    succs.get(d.predecessorId)!.push(d);
  }

  const order = topoOrder(ids, dependencies);
  const ES = new Map<string, number>();
  const EF = new Map<string, number>();

  // Forward pass
  for (const id of order) {
    const d = dur.get(id)!;
    let es = 0;
    for (const dep of preds.get(id) ?? []) {
      const pES = ES.get(dep.predecessorId) ?? 0;
      const pEF = EF.get(dep.predecessorId) ?? 0;
      const lag = dep.lagDays ?? 0;
      switch (dep.type ?? "FS") {
        case "FS":
          es = Math.max(es, pEF + lag);
          break;
        case "SS":
          es = Math.max(es, pES + lag);
          break;
        case "FF":
          es = Math.max(es, pEF + lag - d);
          break;
        case "SF":
          es = Math.max(es, pES + lag - d);
          break;
      }
    }
    ES.set(id, es);
    EF.set(id, es + d);
  }

  const projectDuration = Math.max(0, ...ids.map((id) => EF.get(id) ?? 0));

  // Backward pass
  const LF = new Map<string, number>();
  const LS = new Map<string, number>();
  for (const id of [...order].reverse()) {
    const d = dur.get(id)!;
    const outgoing = succs.get(id) ?? [];
    let lf = outgoing.length === 0 ? projectDuration : Infinity;
    for (const dep of outgoing) {
      const sLS = LS.get(dep.successorId) ?? projectDuration;
      const sLF = LF.get(dep.successorId) ?? projectDuration;
      const lag = dep.lagDays ?? 0;
      switch (dep.type ?? "FS") {
        case "FS":
          lf = Math.min(lf, sLS - lag);
          break;
        case "SS":
          lf = Math.min(lf, sLS - lag + d);
          break;
        case "FF":
          lf = Math.min(lf, sLF - lag);
          break;
        case "SF":
          lf = Math.min(lf, sLF - lag + d);
          break;
      }
    }
    if (!Number.isFinite(lf)) lf = projectDuration;
    LF.set(id, lf);
    LS.set(id, lf - d);
  }

  const nodes = new Map<string, CpmNode>();
  for (const id of ids) {
    const es = ES.get(id) ?? 0;
    const ef = EF.get(id) ?? 0;
    const ls = LS.get(id) ?? 0;
    const lf = LF.get(id) ?? 0;
    const totalFloat = ls - es;
    nodes.set(id, {
      id,
      durationDays: dur.get(id)!,
      earlyStart: es,
      earlyFinish: ef,
      lateStart: ls,
      lateFinish: lf,
      totalFloat,
      isCritical: totalFloat <= 0,
    });
  }

  return { nodes, projectDuration };
}
