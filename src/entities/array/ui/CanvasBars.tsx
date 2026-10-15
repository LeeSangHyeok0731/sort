"use client";

import { useEffect, useRef, useState } from "react";
import type { ArrayItem } from "@/shared/model";
import type { BarHighlight, BarTone } from "./ArrayBars";

/** BAR_TONE_CLASS의 그라디언트와 같은 색 (아래 → 위) */
export const TONE_COLORS: Record<BarTone | "idle" | "done", [string, string]> = {
  idle: ["#4f46e5", "#818cf8"],
  compare: ["#f59e0b", "#fcd34d"],
  change: ["#f43f5e", "#fda4af"],
  read: ["#0ea5e9", "#7dd3fc"],
  done: ["#059669", "#34d399"],
};

type Props = {
  items: readonly ArrayItem[];
  highlight?: BarHighlight;
  done?: boolean;
};

/**
 * 막대가 많을 때(이동 애니메이션을 쓰지 않는 경우) DOM 대신 canvas에 그린다.
 * DOM 막대 1000개는 프레임마다 수백 ms가 걸리지만 canvas는 1ms 수준이다.
 */
export default function CanvasBars({ items, highlight, done = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || size.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    const gradients = new Map<keyof typeof TONE_COLORS, CanvasGradient>();
    const fillFor = (tone: keyof typeof TONE_COLORS) => {
      let g = gradients.get(tone);
      if (!g) {
        g = ctx.createLinearGradient(0, size.height, 0, 0);
        g.addColorStop(0, TONE_COLORS[tone][0]);
        g.addColorStop(1, TONE_COLORS[tone][1]);
        gradients.set(tone, g);
      }
      return g;
    };

    const n = items.length;
    const maxValue = Math.max(1, ...items.map((i) => i.value));
    const slot = size.width / n;
    const gap = slot > 4 ? 1 : 0;
    const highlighted = new Set(highlight?.indices ?? []);

    for (let i = 0; i < n; i++) {
      const h = Math.max(1.5, (items[i].value / maxValue) * size.height);
      const tone = highlighted.has(i) ? highlight!.tone : done ? "done" : "idle";
      ctx.globalAlpha = tone === "idle" || tone === "done" ? 0.85 : 1;
      ctx.fillStyle = fillFor(tone);
      ctx.fillRect(i * slot, size.height - h, Math.max(1, slot - gap), h);
    }

    // 강조된 막대는 아주 얇을 수 있으므로 위에 표시점을 찍어 눈에 띄게 한다
    ctx.globalAlpha = 1;
    for (const i of highlighted) {
      if (i >= n) continue;
      const h = Math.max(1.5, (items[i].value / maxValue) * size.height);
      ctx.fillStyle = TONE_COLORS[highlight!.tone][1];
      ctx.beginPath();
      ctx.arc((i + 0.5) * slot, size.height - h - 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [items, highlight, done, size]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}
