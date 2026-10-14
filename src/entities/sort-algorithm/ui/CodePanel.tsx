"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
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
  [OpType.Compare]: "bg-amber-400/20 border-amber-400",
  [OpType.Swap]: "bg-rose-400/20 border-rose-400",
  [OpType.Move]: "bg-rose-400/20 border-rose-400",
  [OpType.Mark]: "bg-sky-400/20 border-sky-400",
};

/**
 * 히트맵을 몇 단계로 나눈다. 단계로 끊어야 최댓값이 조금 바뀔 때마다
 * 모든 줄이 다시 그려지지 않는다 (고배속 재생 성능).
 */
const HEAT_LEVELS = 8;
const HEAT_STYLE = Array.from({ length: HEAT_LEVELS + 1 }, (_, level) =>
  level === 0 ? undefined : { backgroundColor: `rgba(99, 102, 241, ${0.05 + (0.25 * level) / HEAT_LEVELS})` }
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
      <span className="w-8 shrink-0 text-right pr-2 text-white/15 select-none">{lineNo}</span>
      <span className="w-10 shrink-0 text-right pr-3 text-[10px] tabular-nums text-indigo-300/70 select-none">
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  /** 스크롤 위치·높이와 줄 위치를 캐시해 매 프레임 레이아웃을 강제로 계산하지 않는다 */
  const viewport = useRef({ top: 0, height: 0 });
  const rowBoxes = useRef<Array<{ top: number; height: number }>>([]);

  const lines = useMemo(
    () => Prism.highlight(algorithm.code, Prism.languages.javascript, "javascript").split("\n"),
    [algorithm.code]
  );

  let maxHits = 1;
  for (const h of lineHits ?? []) if (h > maxHits) maxHits = h;
  const activeLabel = algorithm.codeLabels.get(activeLine);
  const activeType = activeLabel ? opTypeOfLabel(activeLabel) : undefined;

  useEffect(() => {
    const container = scrollRef.current;
    const code = codeRef.current;
    if (!container || !code) return;
    const update = () => {
      viewport.current = { top: container.scrollTop, height: container.clientHeight };
    };
    // 줄 위치는 패널 폭이 바뀌어 줄바꿈이 달라질 때만 다시 잰다
    const measureRows = () => {
      rowBoxes.current = Array.from(code.children, (row) => {
        const el = row as HTMLElement;
        return { top: el.offsetTop, height: el.offsetHeight };
      });
      update();
    };
    update();
    const observer = new ResizeObserver(measureRows);
    observer.observe(container);
    observer.observe(code);
    container.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", update);
    };
  }, []);

  // 현재 줄이 보이는 영역 밖이면 그 줄이 가운데 오도록 패널 안에서만 스크롤
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || activeLine === 0) return;
    const row = rowBoxes.current[activeLine - 1];
    if (!row) return;
    const { top, height } = viewport.current;
    if (row.top < top || row.top + row.height > top + height) {
      container.scrollTop = Math.max(0, row.top - height / 2 + row.height / 2);
    }
  }, [activeLine]);

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
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5">
        <span className="text-[11px] font-mono text-white/40 truncate">{algorithm.id}Sort.js</span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={copy}
            className="text-[11px] font-bold px-2 py-1 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            {copied ? "복사됨 ✓" : "복사"}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.15)_transparent]"
      >
        <pre className="text-[12px] font-mono" style={{ lineHeight: `${ROW_HEIGHT}px`, paddingTop: PADDING_Y, paddingBottom: PADDING_Y }}>
          {/* language-* 클래스를 붙이면 Prism 자동 하이라이트가 React가 그린 줄 구조를 덮어쓴다 */}
          <code ref={codeRef} className="block">
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
