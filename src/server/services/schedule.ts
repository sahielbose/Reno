import { computeCpm, type CpmDependency } from "@/lib/cpm";
import type { ScheduleTaskWithDeps } from "@/server/repositories/schedule";

export interface GanttTask {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  durationDays: number;
  percentComplete: number;
  isCritical: boolean;
  /** Predecessor task ids (for dependency arrows). */
  dependsOn: string[];
  /** 0-based day offset from the project start (CPM early start). */
  earlyStart: number;
}

export interface ScheduleView {
  tasks: GanttTask[];
  rangeStart: string | null;
  rangeEnd: string | null;
  projectDuration: number;
  criticalCount: number;
}

const DAY = 1000 * 60 * 60 * 24;

/** Run CPM over the schedule and produce a Gantt-ready, critical-path view. */
export function buildSchedule(rows: ScheduleTaskWithDeps[]): ScheduleView {
  const cpmTasks = rows.map((t) => ({
    id: t.id,
    durationDays: Math.max(1, t.durationDays),
  }));
  // Each task's `successors` are TaskDependency rows where it is the predecessor.
  const deps: CpmDependency[] = rows.flatMap((t) =>
    t.successors.map((d) => ({
      predecessorId: d.predecessorId,
      successorId: d.successorId,
      type: d.type,
      lagDays: d.lagDays,
    })),
  );

  const { nodes, projectDuration } = computeCpm(cpmTasks, deps);

  const starts = rows
    .map((t) => t.startDate?.getTime())
    .filter((n): n is number => typeof n === "number");
  const ends = rows
    .map((t) => t.endDate?.getTime())
    .filter((n): n is number => typeof n === "number");
  const rangeStart = starts.length ? new Date(Math.min(...starts)) : null;
  const rangeEnd = ends.length ? new Date(Math.max(...ends)) : null;

  const tasks: GanttTask[] = rows.map((t) => {
    const node = nodes.get(t.id);
    return {
      id: t.id,
      name: t.name,
      start: t.startDate ? t.startDate.toISOString() : null,
      end: t.endDate ? t.endDate.toISOString() : null,
      durationDays: t.durationDays,
      percentComplete: t.percentComplete,
      isCritical: node?.isCritical ?? false,
      dependsOn: t.predecessors.map((d) => d.predecessorId),
      earlyStart: node?.earlyStart ?? 0,
    };
  });

  return {
    tasks,
    rangeStart: rangeStart ? rangeStart.toISOString() : null,
    rangeEnd: rangeEnd ? rangeEnd.toISOString() : null,
    projectDuration,
    criticalCount: tasks.filter((t) => t.isCritical).length,
  };
}

/** Inclusive whole-day span between two ISO dates (min 1). */
export function daySpan(startIso: string, endIso: string): number {
  return Math.max(
    1,
    Math.round((Date.parse(endIso) - Date.parse(startIso)) / DAY),
  );
}
