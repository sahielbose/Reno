"use client";

import * as React from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarRange, GitBranch, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createScheduleTaskAction,
  deleteScheduleTaskAction,
  linkTasksAction,
  updateScheduleTaskAction,
} from "@/server/actions/schedule";
import type { ScheduleView, GanttTask } from "@/server/services/schedule";

const DAY = 86_400_000;

/** Shared control classes — matches the Input look for native selects. */
const controlClass = cn(
  "border-line text-foreground flex w-full rounded-[9px] border bg-white px-[0.8rem] py-[0.6rem] text-[0.92rem] transition-colors outline-none",
  "placeholder:text-text-3",
  "focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/** Geometry for one Gantt bar, as left/width percentages of the track. */
type BarGeometry = { leftPct: number; widthPct: number };

/**
 * Resolve every task's bar position. When the view has a real date window we
 * place each dated task by its start/end; otherwise we fall back to laying
 * tasks out on a synthetic day axis using CPM `earlyStart` + `durationDays`.
 */
function useGanttLayout(view: ScheduleView): {
  totalDays: number;
  geometry: Map<string, BarGeometry>;
  dated: boolean;
} {
  return useMemo(() => {
    const t0 = view.rangeStart ? Date.parse(view.rangeStart) : NaN;
    const t1 = view.rangeEnd ? Date.parse(view.rangeEnd) : NaN;
    const dated = Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0;

    const geometry = new Map<string, BarGeometry>();

    if (dated) {
      const span = t1 - t0;
      const totalDays = Math.max(1, Math.round(span / DAY));
      for (const task of view.tasks) {
        if (!task.start || !task.end) continue;
        const s = Date.parse(task.start);
        const e = Date.parse(task.end);
        if (!Number.isFinite(s) || !Number.isFinite(e)) continue;
        const leftPct = ((s - t0) / span) * 100;
        const widthPct = Math.max(2, ((e - s) / span) * 100);
        geometry.set(task.id, {
          leftPct: Math.max(0, Math.min(100, leftPct)),
          widthPct: Math.min(100, widthPct),
        });
      }
      return { totalDays, geometry, dated };
    }

    // Fallback: synthetic day axis from earlyStart + durationDays.
    const totalDays = Math.max(
      1,
      ...view.tasks.map((t) => t.earlyStart + Math.max(1, t.durationDays)),
    );
    for (const task of view.tasks) {
      const dur = Math.max(1, task.durationDays);
      geometry.set(task.id, {
        leftPct: (task.earlyStart / totalDays) * 100,
        widthPct: Math.max(2, (dur / totalDays) * 100),
      });
    }
    return { totalDays, geometry, dated };
  }, [view]);
}

/**
 * ScheduleBoard — the project Schedule panel: a critical-path Gantt chart over
 * the project's task window, plus an editable task list with inline progress,
 * dependency linking, and an add-task dialog. All mutations run through the
 * schedule server actions inside transitions.
 */
export function ScheduleBoard({
  projectId,
  view,
}: {
  projectId: string;
  view: ScheduleView;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const { totalDays, geometry, dated } = useGanttLayout(view);
  const tasks = view.tasks;

  // Faint week gridlines across the track (only meaningful with a date window).
  const weekLines = useMemo(() => {
    if (!dated || totalDays <= 7) return [] as number[];
    const lines: number[] = [];
    for (let d = 7; d < totalDays; d += 7) {
      lines.push((d / totalDays) * 100);
    }
    return lines;
  }, [dated, totalDays]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Schedule</h1>
          <p className="text-text-2 text-sm">
            <span className="font-mono tabular-nums">
              {view.projectDuration}
            </span>{" "}
            working days ·{" "}
            <span className="font-mono tabular-nums">{view.criticalCount}</span>{" "}
            on critical path
          </p>
        </div>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          + Add task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <CalendarRange className="text-text-3 size-8" aria-hidden="true" />
            <p className="text-text-2 text-sm font-medium">
              No tasks yet — add the first to build your schedule.
            </p>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              + Add task
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gantt</CardTitle>
              <div className="flex items-center gap-4 text-[0.78rem]">
                <span className="text-text-2 inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="bg-brand size-3 rounded-full"
                  />
                  On track
                </span>
                <span className="text-text-2 inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full bg-[#F5A524]"
                  />
                  Critical path
                </span>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="flex flex-col">
                  {tasks.map((task) => (
                    <GanttRow
                      key={task.id}
                      task={task}
                      geometry={geometry.get(task.id)}
                      weekLines={weekLines}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks</CardTitle>
              <span className="text-text-3 font-mono text-xs tabular-nums">
                {tasks.length}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-0">
              <ul className="divide-line divide-y" aria-label="Schedule tasks">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    projectId={projectId}
                    task={task}
                    others={tasks.filter((t) => t.id !== task.id)}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      <AddTaskDialog
        projectId={projectId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}

function GanttRow({
  task,
  geometry,
  weekLines,
}: {
  task: GanttTask;
  geometry: BarGeometry | undefined;
  weekLines: number[];
}) {
  const dur = Math.max(1, task.durationDays);
  const pct = Math.max(0, Math.min(100, task.percentComplete));
  const placed = geometry != null;

  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-3 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-sm font-medium" title={task.name}>
          {task.name}
        </span>
        {task.isCritical && (
          <Badge
            variant="amber"
            size="sm"
            className="shrink-0"
            title="On the critical path"
          >
            Critical
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-paper border-line relative h-[22px] flex-1 overflow-hidden rounded-full border">
          {weekLines.map((left, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="bg-line absolute inset-y-0 w-px"
              style={{ left: `${left}%` }}
            />
          ))}
          {placed ? (
            <div
              className={cn(
                "absolute inset-y-0 flex items-center overflow-hidden rounded-full",
                task.isCritical
                  ? "bg-[#F5A524] ring-2 ring-[#F5A524]/40"
                  : "bg-brand",
              )}
              style={{
                left: `${geometry.leftPct}%`,
                width: `${geometry.widthPct}%`,
              }}
              role="img"
              aria-label={`${task.name}: ${dur} day${dur === 1 ? "" : "s"}, ${pct}% complete${
                task.isCritical ? ", critical path" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-black/20"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <span className="text-text-3 absolute inset-0 flex items-center px-3 text-xs">
              No dates
            </span>
          )}
        </div>
        <span className="text-text-3 w-10 shrink-0 text-right font-mono text-xs tabular-nums">
          {dur}d
        </span>
      </div>
    </div>
  );
}

function TaskRow({
  projectId,
  task,
  others,
}: {
  projectId: string;
  task: GanttTask;
  others: GanttTask[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pct, setPct] = useState(
    Math.max(0, Math.min(100, task.percentComplete)),
  );

  // Keep the local slider in sync if the server revalidates with a new value.
  useEffect(() => {
    setPct(Math.max(0, Math.min(100, task.percentComplete)));
  }, [task.percentComplete]);

  const dur = Math.max(1, task.durationDays);
  const depCount = task.dependsOn.length;

  const commitPct = (value: number) => {
    if (value === task.percentComplete) return;
    startTransition(async () => {
      const result = await updateScheduleTaskAction(projectId, task.id, {
        percentComplete: value,
      });
      if (result.ok) {
        toast.success("Progress updated");
      } else {
        toast.error(result.error);
        setPct(Math.max(0, Math.min(100, task.percentComplete)));
      }
    });
  };

  const remove = () => {
    if (!window.confirm(`Delete "${task.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteScheduleTaskAction(projectId, task.id);
      if (result.ok) {
        toast.success("Task deleted");
      } else {
        toast.error(result.error);
      }
    });
  };

  const addPredecessor = (predecessorId: string) => {
    if (!predecessorId) return;
    startTransition(async () => {
      const result = await linkTasksAction(projectId, predecessorId, task.id);
      if (result.ok) {
        toast.success("Dependency added");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <li className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium" title={task.name}>
            {task.name}
          </span>
          {task.isCritical && (
            <Badge variant="amber" size="sm">
              Critical
            </Badge>
          )}
          {depCount > 0 && (
            <span className="text-text-3 inline-flex items-center gap-1 text-xs">
              <GitBranch className="size-3" aria-hidden="true" />
              after {depCount} task{depCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <p className="text-text-3 mt-0.5 text-xs">
          {task.start || task.end ? (
            <span className="font-mono tabular-nums">
              {formatDate(task.start)} – {formatDate(task.end)}
            </span>
          ) : (
            "No dates"
          )}
          <span className="text-line mx-2">·</span>
          <span className="font-mono tabular-nums">{dur}d</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`pct-${task.id}`}>
          Percent complete for {task.name}
        </label>
        <input
          id={`pct-${task.id}`}
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          disabled={isPending}
          onChange={(e) => setPct(Number(e.target.value))}
          onPointerUp={() => commitPct(pct)}
          onKeyUp={() => commitPct(pct)}
          onBlur={() => commitPct(pct)}
          className="accent-brand w-28 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-text-2 w-10 text-right font-mono text-xs tabular-nums">
          {pct}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        {others.length > 0 && (
          <>
            <label className="sr-only" htmlFor={`pred-${task.id}`}>
              Add predecessor for {task.name}
            </label>
            <select
              id={`pred-${task.id}`}
              className={cn(controlClass, "w-44 py-[0.4rem] text-[0.82rem]")}
              value=""
              disabled={isPending}
              onChange={(e) => {
                addPredecessor(e.target.value);
                e.currentTarget.value = "";
              }}
            >
              <option value="">Add predecessor…</option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={remove}
          disabled={isPending}
          aria-label={`Delete ${task.name}`}
          title="Delete task"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

function AddTaskDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [percent, setPercent] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setName("");
      setStart("");
      setEnd("");
      setPercent("0");
      setError(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    if (start && end && Date.parse(end) < Date.parse(start)) {
      setError("End date can't be before the start date");
      return;
    }
    setError(null);

    const raw = Number(percent);
    const percentComplete = Number.isFinite(raw)
      ? Math.max(0, Math.min(100, Math.round(raw)))
      : 0;

    startTransition(async () => {
      const result = await createScheduleTaskAction(projectId, {
        name: trimmed,
        startDate: start || null,
        endDate: end || null,
        percentComplete,
      });
      if (result.ok) {
        toast.success("Task added");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Name"
            htmlFor="task-name"
            required
            error={error && !name.trim() ? error : undefined}
          >
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pour foundation"
              autoFocus
              aria-invalid={error && !name.trim() ? true : undefined}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start" htmlFor="task-start">
              <Input
                id="task-start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field
              label="End"
              htmlFor="task-end"
              error={error && name.trim() && start && end ? error : undefined}
            >
              <Input
                id="task-end"
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Percent complete"
            htmlFor="task-percent"
            description="0–100"
          >
            <Input
              id="task-percent"
              type="number"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </Field>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" variant="primary" disabled={isPending}>
              Add task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
