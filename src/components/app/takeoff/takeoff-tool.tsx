"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Ruler,
  Square,
  Hash,
  Trash2,
  ArrowRight,
  Crosshair,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  calibrate,
  polylineLengthFt,
  rectAreaSqFt,
  type Pt,
} from "@/lib/takeoff-math";
import {
  createTakeoffAction,
  deleteTakeoffAction,
  pushTakeoffToBudgetAction,
} from "@/server/actions/takeoff";

type Tool = "AREA" | "LENGTH" | "COUNT";

export type TakeoffRow = {
  id: string;
  kind: Tool;
  label: string;
  value: number;
  unit: string;
  inBudget: boolean;
};

const W = 760;
const H = 460;
const UNIT: Record<Tool, string> = { AREA: "SF", LENGTH: "LF", COUNT: "EA" };

const TOOLS: { key: Tool; label: string; icon: typeof Square }[] = [
  { key: "AREA", label: "Area", icon: Square },
  { key: "LENGTH", label: "Length", icon: Ruler },
  { key: "COUNT", label: "Count", icon: Hash },
];

/** Draws a sample blueprint so the tool is usable without an uploaded plan. */
function drawPlan(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#0e1726";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(120,150,230,0.18)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(150,180,255,0.85)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(70, 60, 620, 340);
  ctx.beginPath();
  ctx.moveTo(70, 250);
  ctx.lineTo(430, 250);
  ctx.moveTo(430, 60);
  ctx.lineTo(430, 400);
  ctx.stroke();
  ctx.fillStyle = "rgba(150,180,255,0.6)";
  ctx.font = "13px ui-monospace, monospace";
  ctx.fillText("KITCHEN", 200, 160);
  ctx.fillText("DINING", 520, 160);
  ctx.fillText("HALL", 230, 330);
}

export function TakeoffTool({
  projectId,
  takeoffs,
}: {
  projectId: string;
  takeoffs: TakeoffRow[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("AREA");
  const [ftPerPx, setFtPerPx] = useState(0.045);
  const [calibrating, setCalibrating] = useState(false);
  const [pending, startTransition] = useTransition();

  // Active drawing state
  const drag = useRef<{ start: Pt; cur: Pt } | null>(null);
  const [points, setPoints] = useState<Pt[]>([]);
  const [measure, setMeasure] = useState<{
    kind: Tool;
    value: number;
    unit: string;
    geometry: unknown;
  } | null>(null);
  const [label, setLabel] = useState("");

  const redraw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawPlan(ctx);
    ctx.strokeStyle = "#F5A524";
    ctx.fillStyle = "rgba(245,165,36,0.18)";
    ctx.lineWidth = 2;

    if (drag.current) {
      const { start, cur } = drag.current;
      const x = Math.min(start.x, cur.x);
      const y = Math.min(start.y, cur.y);
      const w = Math.abs(cur.x - start.x);
      const h = Math.abs(cur.y - start.y);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    }
    if (points.length) {
      ctx.beginPath();
      points.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
      );
      ctx.stroke();
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#F5A524";
        ctx.fill();
      });
    }
  };

  useEffect(redraw);

  function at(e: React.MouseEvent): Pt {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  }

  function reset() {
    drag.current = null;
    setPoints([]);
    setMeasure(null);
    setLabel("");
  }

  function onDown(e: React.MouseEvent) {
    const p = at(e);
    if (tool === "AREA" || calibrating) {
      drag.current = { start: p, cur: p };
      redraw();
    } else if (tool === "COUNT") {
      const next = [...points, p];
      setPoints(next);
      setMeasure({
        kind: "COUNT",
        value: next.length,
        unit: "EA",
        geometry: next,
      });
    } else if (tool === "LENGTH") {
      const next = [...points, p];
      setPoints(next);
      setMeasure({
        kind: "LENGTH",
        value: round(polylineLengthFt(next, ftPerPx)),
        unit: "LF",
        geometry: next,
      });
    }
  }

  function onMove(e: React.MouseEvent) {
    if (!drag.current) return;
    drag.current = { ...drag.current, cur: at(e) };
    redraw();
  }

  function onUp() {
    if (!drag.current) return;
    const { start, cur } = drag.current;
    const w = cur.x - start.x;
    const h = cur.y - start.y;
    const distPx = Math.hypot(w, h);
    if (calibrating) {
      const feet = Number(
        window.prompt("Real length of this line, in feet?", "20"),
      );
      if (feet > 0 && distPx > 4) {
        setFtPerPx(calibrate(distPx, feet));
        toast.success("Scale calibrated");
      }
      setCalibrating(false);
      drag.current = null;
      redraw();
      return;
    }
    if (Math.abs(w) > 4 && Math.abs(h) > 4) {
      setMeasure({
        kind: "AREA",
        value: round(rectAreaSqFt(w, h, ftPerPx)),
        unit: "SF",
        geometry: { x: start.x, y: start.y, w, h },
      });
    }
    drag.current = null;
    redraw();
  }

  function save(pushToBudget: boolean) {
    if (!measure) return;
    const name = label.trim() || defaultLabel(measure.kind, takeoffs.length);
    startTransition(async () => {
      const res = await createTakeoffAction(projectId, {
        kind: measure.kind,
        label: name,
        value: measure.value,
        unit: measure.unit,
        geometry: measure.geometry,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (pushToBudget && res.data) {
        const pushed = await pushTakeoffToBudgetAction(projectId, res.data.id);
        if (!pushed.ok) toast.error(pushed.error);
      }
      toast.success(pushToBudget ? "Saved + added to budget" : "Takeoff saved");
      reset();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteTakeoffAction(projectId, id);
      if (!res.ok) toast.error(res.error);
    });
  }

  function push(id: string) {
    startTransition(async () => {
      const res = await pushTakeoffToBudgetAction(projectId, id);
      if (res.ok) toast.success("Added to budget");
      else toast.error(res.error);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="border-line rounded-reno flex overflow-hidden border">
            {TOOLS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTool(t.key);
                  reset();
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm",
                  tool === t.key
                    ? "bg-brand text-white"
                    : "text-text-2 hover:bg-paper",
                )}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            ))}
          </div>
          <Button
            variant={calibrating ? "primary" : "outline"}
            size="sm"
            onClick={() => {
              setCalibrating((c) => !c);
              reset();
            }}
          >
            <Crosshair className="size-4" />
            {calibrating ? "Draw a known line…" : "Calibrate scale"}
          </Button>
          <span className="text-text-3 ml-auto font-mono text-xs">
            1px ≈ {ftPerPx.toFixed(3)} ft
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onDoubleClick={reset}
          className="rounded-reno border-line w-full cursor-crosshair touch-none border"
          aria-label="Plan takeoff canvas"
        />
        <p className="text-text-3 mt-2 text-xs">
          {tool === "AREA" &&
            "Drag a box over a region to measure square footage."}
          {tool === "LENGTH" &&
            "Click points along a run; double-click to clear."}
          {tool === "COUNT" &&
            "Click to drop a marker on each fixture; double-click to clear."}
        </p>
      </div>

      <div className="space-y-4">
        {measure && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New takeoff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-mono text-2xl font-bold">
                {formatNumber(measure.value)}{" "}
                <span className="text-text-3 text-base">{measure.unit}</span>
              </div>
              <Field label="Label" htmlFor="tk-label">
                <Input
                  id="tk-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={defaultLabel(measure.kind, takeoffs.length)}
                />
              </Field>
              <div className="flex gap-2">
                <Button
                  variant="dark"
                  onClick={() => save(false)}
                  disabled={pending}
                >
                  Save
                </Button>
                <Button
                  variant="primary"
                  onClick={() => save(true)}
                  disabled={pending}
                >
                  Save + budget <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Takeoffs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {takeoffs.length === 0 && (
              <p className="text-text-3 text-sm">
                No takeoffs yet — measure on the plan to get started.
              </p>
            )}
            {takeoffs.map((t) => (
              <div
                key={t.id}
                className="border-line rounded-reno flex items-center gap-2 border px-3 py-2"
              >
                <Badge variant="neutral">{UNIT[t.kind]}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.label}</div>
                  <div className="text-text-3 font-mono text-xs">
                    {formatNumber(t.value)} {t.unit}
                  </div>
                </div>
                {t.inBudget ? (
                  <Badge variant="ok" dot>
                    In budget
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => push(t.id)}
                    disabled={pending}
                  >
                    Push
                  </Button>
                )}
                <button
                  onClick={() => remove(t.id)}
                  className="text-text-3 hover:text-danger"
                  aria-label="Delete takeoff"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function defaultLabel(kind: Tool, n: number) {
  const base = kind === "AREA" ? "Area" : kind === "LENGTH" ? "Run" : "Count";
  return `${base} ${n + 1}`;
}
