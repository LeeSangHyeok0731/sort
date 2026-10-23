"use client";

import { memo, useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import { cn } from "@/shared/lib";
import { opTypeOfLabel } from "../model/code-lines";
import { OpType } from "../model/op";
import type { SortAlgorithm } from "../model/types";

type Props = {
  algorithm: SortAlgorithm;
  /** 현재 연산을 만든 줄 (0이면 없음) */
  activeLine?: number;
  /** 줄별 실행 횟수 (인덱스 = 줄 번호) */
  lineHits?: readonly number[];
  className?: string;
};

/** 현재 줄 강조 색: 막대 색과 맞춘다 (비교 = 노랑, 교환·이동 = 빨강, 읽기 = 파랑) */
const ACTIVE_CLASS: Record<OpType, string> = {
  [OpType.Compare]: "bg-amber-100 border-amber-500",
  [OpType.Swap]: "bg-red-100 border-red-500",
  [OpType.Move]: "bg-red-100 border-red-500",
  [OpType.Mark]: "bg-sky-100 border-sky-500",
};

/**
 * 히트맵을 몇 단계로 나눈다. 단계로 끊어야 최댓값이 조금 바뀔 때마다
 * 모든 줄이 다시 그려지지 않는다 (고배속 재생 성능).
 */
const HEAT_LEVELS = 8;
const HEAT_STYLE = Array.from({ length: HEAT_LEVELS + 1 }, (_, level) =>
  // slot-1(#2563eb)과 같은 색
  level === 0 ? undefined : { backgroundColor: `rgba(37, 99, 235, ${0.03 + (0.15 * level) / HEAT_LEVELS})` }
);

/** 한 줄의 최소 높이(px). 긴 줄은 줄바꿈되어 더 높아질 수 있다 */
const ROW_HEIGHT = 20;
const PADDING_Y = 8;

function formatHits(n: number) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

type LineProps = {
  html: string;
  lineNo: number;
  hitsText: string;
  heat: number;
  activeClass: string | null;
};

/** 한 줄. props가 같으면 다시 그리지 않는다 */
const CodeLine = memo(function CodeLine({ html, lineNo, hitsText, heat, activeClass }: LineProps) {
  return (
    <div
      className={cn("flex border-l-2 pr-3", activeClass ?? "border-transparent")}
      style={{ minHeight: ROW_HEIGHT, ...(activeClass ? undefined : HEAT_STYLE[heat]) }}
    >
      <span className="w-8 shrink-0 text-right pr-2 text-faint select-none">{lineNo}</span>
      <span className="w-10 shrink-0 text-right pr-3 text-[10px] tabular-nums text-slot-1 select-none">
        {hitsText}
      </span>
      {/* 패널보다 긴 줄은 가로 스크롤 대신 줄바꿈 (들여쓰기는 유지) */}
      <span
        className="min-w-0 flex-1 whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: html || " " }}
      />
    </div>
  );
});

export default function CodePanel({ algorithm, activeLine = 0, lineHits, className }: Props) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(
    () => Prism.highlight(algorithm.code, Prism.languages.javascript, "javascript").split("\n"),
    [algorithm.code]
  );

  let maxHits = 1;
  for (const h of lineHits ?? []) if (h > maxHits) maxHits = h;
  const activeLabel = algorithm.codeLabels.get(activeLine);
  const activeType = activeLabel ? opTypeOfLabel(activeLabel) : undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(algorithm.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없으면 조용히 무시
    }
  };

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-line">
        <span className="text-[11px] font-mono text-muted truncate">{algorithm.id}Sort.js</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={copy}
            className="text-[11px] font-bold px-2 py-1 rounded-md border border-line text-muted hover:text-foreground hover:bg-subtle transition-all"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgb(0_0_0/0.15)_transparent]"
      >
        <pre className="text-[12px] font-mono text-foreground" style={{ lineHeight: `${ROW_HEIGHT}px`, paddingTop: PADDING_Y, paddingBottom: PADDING_Y }}>
          {/* language-* 클래스를 붙이면 Prism 자동 하이라이트가 React가 그린 줄 구조를 덮어쓴다 */}
          <code className="block">
            {lines.map((html, i) => {
              const lineNo = i + 1;
              const hits = lineHits?.[lineNo] ?? 0;
              return (
                <CodeLine
                  key={i}
                  html={html}
                  lineNo={lineNo}
                  hitsText={hits > 0 ? formatHits(hits) : ""}
                  heat={hits > 0 ? Math.max(1, Math.round((HEAT_LEVELS * hits) / maxHits)) : 0}
                  activeClass={lineNo === activeLine && activeType !== undefined ? ACTIVE_CLASS[activeType] : null}
                />
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
