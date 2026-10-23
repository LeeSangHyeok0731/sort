"use client";

import { useEffect, useRef, useState } from "react";
import { PALETTE } from "@/shared/config";
import type { DrawCard, DrawColumn } from "../../model/structures/scene";

type Props = { columns: readonly DrawColumn[] };

const PAD = 10;
const LABEL_H = 16;
const MAX_CARD_H = 18;
const MAX_CARD_W = 44;
const LABEL_MIN_CARD_H = 11;

/** 칸(더미·버킷·값·자릿수)마다 원소 카드를 아래에서부터 쌓아 그린다 */
export default function BinsCanvas({ columns }: Props) {
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
    if (columns.length === 0) return;

    const tallest = Math.max(1, ...columns.map((c) => c.cards.length));
    const slotW = (size.width - PAD * 2) / columns.length;
    const cardW = Math.max(1, Math.min(MAX_CARD_W, slotW * 0.8));
    const floor = size.height - PAD - LABEL_H;
    const cardH = Math.min(MAX_CARD_H, (floor - PAD) / tallest);
    const gap = cardH >= 6 ? 1.5 : 0;
    const showValues = cardH >= LABEL_MIN_CARD_H && cardW >= 18;
    const showColumnLabels = slotW >= 14;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const drawCard = (card: DrawCard, x: number, y: number) => {
      const color = PALETTE.tone[card.tone];
      const h = Math.max(1, cardH - gap);
      ctx.globalAlpha = card.faded ? 0.4 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, h, Math.min(4, h / 3));
      if (card.ghost) {
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
      if (showValues) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = card.ghost ? color : PALETTE.foreground;
        ctx.fillText(card.label, x + cardW / 2, y + h / 2 + 0.5);
      }
    };

    ctx.font = `600 ${Math.round(Math.min(11, cardH * 0.7))}px ui-monospace, monospace`;
    columns.forEach((column, c) => {
      const cx = PAD + slotW * (c + 0.5);
      const x = cx - cardW / 2;
      // 바닥과 칸 테두리
      ctx.globalAlpha = 1;
      ctx.strokeStyle = column.active ? PALETTE.tone.compare : PALETTE.lineStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 2, floor + 1);
      ctx.lineTo(x + cardW + 2, floor + 1);
      ctx.stroke();
      column.cards.forEach((card, k) => drawCard(card, x, floor - (k + 1) * cardH));
    });

    if (showColumnLabels) {
      ctx.globalAlpha = 1;
      ctx.font = `600 10px ui-monospace, monospace`;
      columns.forEach((column, c) => {
        ctx.fillStyle = column.active ? PALETTE.foreground : PALETTE.faint;
        ctx.fillText(column.label, PAD + slotW * (c + 0.5), floor + LABEL_H / 2 + 2);
      });
    }
    ctx.globalAlpha = 1;
  }, [columns, size]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
