"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import SignaturePadLib from "signature_pad";

import { cn } from "@/lib/utils";

export type SignaturePadHandle = {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
};

/** Canvas signature capture (signature_pad) with DPR-aware sizing. */
export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { className?: string }
>(function SignaturePad({ className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePadLib(canvas, {
      penColor: "#0E1726",
      minWidth: 1,
      maxWidth: 2.6,
    });
    padRef.current = pad;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const data = pad.toData();
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (data.length) pad.fromData(data);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    clear: () => padRef.current?.clear(),
    isEmpty: () => padRef.current?.isEmpty() ?? true,
    toDataURL: () => padRef.current?.toDataURL("image/png") ?? "",
  }));

  return (
    <canvas
      ref={canvasRef}
      aria-label="Signature pad"
      className={cn(
        "border-line-2 bg-paper block h-[150px] w-full touch-none rounded-[11px] border-[1.5px] border-dashed",
        className,
      )}
    />
  );
});
