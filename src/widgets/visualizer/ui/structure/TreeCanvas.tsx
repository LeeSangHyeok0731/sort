"use client";

import { useEffect, useRef, useState } from "react";
import { BAR_TONE_COLORS } from "@/entities/array";

export type NodeTone = keyof typeof BAR_TONE_COLORS;

export type DrawNode = {
  /** 가로 위치 0~1 */
  x: number;
  /** 층 (0 = 루트) */
  depth: number;
  /** 부모 노드의 인덱스 (nodes 배열 기준), 루트는 -1 */
  parent: number;
  label: string;
  tone: NodeTone;
  /** 그리지 않음 (아직 트리에 없는 노드) */
  hidden?: boolean;
  /** 점선 테두리 (들어갈 자리를 미리 보여 주는 노드) */
  ghost?: boolean;
  /** 흐리게 (힙에서 빠져 정렬이 끝난 노드 등) */
  faded?: boolean;
};

type Props = {
  nodes: readonly DrawNode[];
  maxDepth: number;
  /** 가장 넓은 층의 칸 수 (노드 크기를 정한다) */
  columns: number;
};

const LABEL_MIN_RADIUS = 9;
const MAX_RADIUS = 15;
const MIN_PADDING = 10;

/** 트리를 canvas에 그린다 (노드 1,000개까지 프레임마다 다시 그려도 가볍게) */
export default function TreeCanvas({ nodes, maxDepth, columns }: Props) {
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
    const px = (node: DrawNode) => pad + node.x * innerW;
    const py = (node: DrawNode) => pad + (maxDepth > 0 ? node.depth * levelH : innerH / 2);

    // 1) 간선
    ctx.lineWidth = Math.max(0.5, Math.min(1.5, radius / 6));
    for (const node of nodes) {
      if (node.hidden || node.parent < 0) continue;
      const parent = nodes[node.parent];
      if (!parent || parent.hidden) continue;
      ctx.globalAlpha = node.faded || node.ghost ? 0.15 : 0.35;
      ctx.strokeStyle = "#a5b4fc";
      ctx.setLineDash(node.ghost ? [3, 3] : []);
      ctx.beginPath();
      ctx.moveTo(px(parent), py(parent));
      ctx.lineTo(px(node), py(node));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2) 노드
    const showLabels = radius >= LABEL_MIN_RADIUS;
    ctx.font = `600 ${Math.round(radius * 0.85)}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const node of nodes) {
      if (node.hidden) continue;
      const [bottom, top] = BAR_TONE_COLORS[node.tone];
      const x = px(node);
      const y = py(node);
      ctx.globalAlpha = node.faded ? 0.45 : 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (node.ghost) {
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = Math.max(1, radius / 6);
        ctx.strokeStyle = top;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        const gradient = ctx.createLinearGradient(x, y + radius, x, y - radius);
        gradient.addColorStop(0, bottom);
        gradient.addColorStop(1, top);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      if (showLabels) {
        ctx.globalAlpha = node.ghost ? 0.8 : 1;
        ctx.fillStyle = node.ghost ? top : "#0f172a";
        ctx.fillText(node.label, x, y + 0.5);
      }
    }
    ctx.globalAlpha = 1;
  }, [nodes, maxDepth, columns, size]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
