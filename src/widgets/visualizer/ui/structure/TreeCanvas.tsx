"use client";

import { useEffect, useRef, useState } from "react";
import { PALETTE } from "@/shared/config";
import { easeInOut, orbitPosition, type Point } from "../../model/orbit";
import type { DrawNode } from "../../model/structures/scene";

type Props = {
  nodes: readonly DrawNode[];
  maxDepth: number;
  /** 가장 넓은 층의 칸 수 (노드 크기를 정한다) */
  columns: number;
  /** 원소가 자리를 옮길 때 원을 그리며 이동하는 시간. 0이면 바로 이동 */
  moveDurationMs: number;
};

type Motion = { from: Point; to: Point; start: number; duration: number };

const LABEL_MIN_RADIUS = 9;
const MAX_RADIUS = 15;
const MIN_PADDING = 10;
/** 한 번에 이만큼보다 많이 움직이면(진행바를 크게 옮긴 경우 등) 애니메이션 없이 바로 이동 */
const MAX_ANIMATED_MOVES = 24;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 트리를 canvas에 그린다 (노드 1,000개까지 프레임마다 다시 그려도 가볍게).
 * 간선은 트리의 "자리"를 잇는 선이라 고정이고, 자리를 바꾼 원소만 두 자리의 한가운데를 중심으로 반원을 그리며 이동한다.
 */
export default function TreeCanvas({ nodes, maxDepth, columns, moveDurationMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  /** 원소 id → 지금 목표 자리 (픽셀) */
  const targetsRef = useRef(new Map<number, Point>());
  /** 원소 id → 진행 중인 이동 */
  const motionsRef = useRef(new Map<number, Motion>());
  const sizeRef = useRef(size);
  const frameRef = useRef(0);

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

    // 노드 크기를 먼저 어림한 뒤, 가장자리 노드가 잘리지 않도록 그만큼 여백을 둔다
    const roughLevelH = maxDepth > 0 ? size.height / (maxDepth + 1) : size.height;
    const radius = Math.max(
      1.5,
      Math.min(MAX_RADIUS, (size.width / Math.max(1, columns)) * 0.42, roughLevelH * 0.38)
    );
    const pad = Math.max(MIN_PADDING, radius + 4);
    const innerW = size.width - pad * 2;
    const innerH = size.height - pad * 2;
    const levelH = maxDepth > 0 ? innerH / maxDepth : innerH;
    const slots: Point[] = nodes.map((node) => ({
      x: pad + node.x * innerW,
      y: pad + (maxDepth > 0 ? node.depth * levelH : innerH / 2),
    }));

    // ── 이동 애니메이션 준비 ──
    const now = performance.now();
    const motions = motionsRef.current;
    const prevTargets = targetsRef.current;
    const sameSize = sizeRef.current.width === size.width && sizeRef.current.height === size.height;
    sizeRef.current = size;

    /** 지금 화면에 보이는 위치 (이동 중이면 그 중간 지점) */
    const shownAt = (key: number, fallback: Point, time: number): Point => {
      const motion = motions.get(key);
      if (!motion) return prevTargets.get(key) ?? fallback;
      const t = Math.min(1, (time - motion.start) / motion.duration);
      return orbitPosition(motion.from, motion.to, easeInOut(t));
    };

    const nextTargets = new Map<number, Point>();
    const moved: Array<{ key: number; to: Point }> = [];
    nodes.forEach((node, i) => {
      if (node.hidden) return;
      nextTargets.set(node.key, slots[i]);
      const prev = prevTargets.get(node.key);
      if (prev && (Math.abs(prev.x - slots[i].x) > 0.5 || Math.abs(prev.y - slots[i].y) > 0.5)) {
        moved.push({ key: node.key, to: slots[i] });
      }
    });

    const animate =
      moveDurationMs > 0 && sameSize && moved.length > 0 && moved.length <= MAX_ANIMATED_MOVES && !prefersReducedMotion();
    if (animate) {
      for (const { key, to } of moved) {
        const from = shownAt(key, to, now);
        motions.set(key, { from, to, start: now, duration: moveDurationMs });
      }
    } else if (moved.length > 0 || !sameSize) {
      motions.clear();
    }
    for (const key of [...motions.keys()]) if (!nextTargets.has(key)) motions.delete(key);
    targetsRef.current = nextTargets;

    // ── 그리기 ──
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    const showLabels = radius >= LABEL_MIN_RADIUS;

    const drawNode = (node: DrawNode, at: Point) => {
      const color = PALETTE.tone[node.tone];
      ctx.globalAlpha = node.faded ? 0.45 : 1;
      ctx.beginPath();
      ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
      if (node.ghost) {
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = Math.max(1, radius / 6);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (showLabels) {
        ctx.globalAlpha = node.ghost ? 0.8 : 1;
        ctx.fillStyle = node.ghost ? color : PALETTE.foreground;
        ctx.fillText(node.label, at.x, at.y + 0.5);
      }
    };

    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);

      // 1) 간선: 자리끼리 잇는 선이라 원소가 이동해도 그대로
      ctx.lineWidth = Math.max(0.5, Math.min(1.5, radius / 6));
      ctx.strokeStyle = PALETTE.lineStrong;
      nodes.forEach((node, i) => {
        if (node.hidden || node.parent < 0) return;
        const parent = nodes[node.parent];
        if (!parent || parent.hidden) return;
        ctx.globalAlpha = node.faded || node.ghost ? 0.5 : 1;
        ctx.setLineDash(node.ghost ? [3, 3] : []);
        ctx.beginPath();
        ctx.moveTo(slots[node.parent].x, slots[node.parent].y);
        ctx.lineTo(slots[i].x, slots[i].y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 2) 노드: 이동 중인 노드는 다른 노드 위에 보이도록 마지막에
      ctx.font = `600 ${Math.round(radius * 0.85)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const moving: Array<[DrawNode, Point]> = [];
      nodes.forEach((node, i) => {
        if (node.hidden) return;
        const motion = motions.get(node.key);
        if (!motion) {
          drawNode(node, slots[i]);
          return;
        }
        const t = Math.min(1, (time - motion.start) / motion.duration);
        moving.push([node, orbitPosition(motion.from, motion.to, easeInOut(t))]);
        if (t >= 1) motions.delete(node.key);
      });
      for (const [node, at] of moving) drawNode(node, at);
      ctx.globalAlpha = 1;

      if (motions.size > 0) frameRef.current = requestAnimationFrame(draw);
    };

    cancelAnimationFrame(frameRef.current);
    draw(now);
    return () => cancelAnimationFrame(frameRef.current);
  }, [nodes, maxDepth, columns, size, moveDurationMs]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
