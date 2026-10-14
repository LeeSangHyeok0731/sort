"use client";

import { useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { cn } from "@/shared/lib";
import type { SortAlgorithm } from "../model/types";

type Props = {
  algorithms: readonly SortAlgorithm[];
};

const TAB_ACTIVE = ["bg-indigo-600 text-white", "bg-pink-600 text-white"];

export default function CodeViewer({ algorithms }: Props) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = algorithms[Math.min(tab, algorithms.length - 1)];

  const lines = useMemo(
    () => Prism.highlight(current.code, Prism.languages.javascript, "javascript").split("\n"),
    [current.code]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없으면 조용히 무시
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {algorithms.length > 1 ? (
          <div className="flex gap-1 p-1 bg-black/20 rounded-xl" role="tablist">
            {algorithms.map((a, i) => (
              <button
                key={`${a.id}-${i}`}
                type="button"
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  tab === i ? TAB_ACTIVE[i] : "text-white/40 hover:text-white/70"
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-mono text-white/40">{current.id}Sort.js</span>
        )}
        <button
          type="button"
          onClick={copy}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          {copied ? "복사됨 ✓" : "코드 복사"}
        </button>
      </div>

      <pre className="overflow-x-auto custom-scrollbar rounded-2xl bg-black/30 p-4 text-[13px] md:text-sm leading-relaxed font-mono">
        <code className="language-javascript">
          {lines.map((html, i) => (
            <div key={i} className="flex gap-5">
              <span className="w-6 shrink-0 text-right text-white/15 select-none">{i + 1}</span>
              <span className="whitespace-pre" dangerouslySetInnerHTML={{ __html: html || " " }} />
            </div>
          ))}
        </code>
      </pre>
      <p className="text-[11px] text-white/30">
        설명용 코드입니다. 시각화는 같은 알고리즘을 비교·교환·이동 연산으로 기록한 버전으로 동작합니다.
      </p>
    </div>
  );
}
