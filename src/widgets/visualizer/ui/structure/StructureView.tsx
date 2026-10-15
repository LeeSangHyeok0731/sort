"use client";

import { useMemo } from "react";
import type { ArrayItem } from "@/shared/model";
import type { AlgorithmStructure, SortAlgorithm } from "@/entities/sort-algorithm";
import type { TrackView } from "@/features/playback";
import { cn } from "@/shared/lib";
import {
  bstProgress,
  buildBst,
  heapLayout,
  heapParent,
  heapSizeFromHits,
  placedPrefix,
} from "../../model/structure";
import TreeCanvas, { type DrawNode } from "./TreeCanvas";

type Props = {
  algorithm: SortAlgorithm & { structure: AlgorithmStructure };
  view: TrackView;
  /** 정렬 전 원래 배열 (트리 정렬은 입력 순서대로 트리를 만든다) */
  input: readonly ArrayItem[];
  /** 원소가 자리를 옮길 때 원을 그리며 이동하는 시간 (0이면 바로 이동) */
  moveDurationMs: number;
  className?: string;
};

/** 막대 대신 트리로 보여 준다. 힙은 배열 그대로, 트리 정렬은 입력으로 만든 이진 검색 트리. */
export default function StructureView({ algorithm, view, input, moveDurationMs, className }: Props) {
  const structure = algorithm.structure;
  const n = view.items.length;

  const heapPositions = useMemo(
    () => (structure.kind === "heap" ? heapLayout(n, structure.arity) : []),
    [structure, n]
  );
  const bst = useMemo(
    () => (structure.kind === "bst" ? buildBst(input.map((item) => item.value)) : null),
    [structure, input]
  );
  const inorderIds = useMemo(() => {
    if (!bst) return [];
    const ids = new Array<number>(input.length);
    input.forEach((item, i) => (ids[bst.rank[i]] = item.id));
    return ids;
  }, [bst, input]);

  const sortedDone = view.done && !view.truncated;
  const highlighted = new Map<number, DrawNode["tone"]>();
  if (view.highlight) for (const i of view.highlight.indices) highlighted.set(i, view.highlight.tone);

  let nodes: DrawNode[] = [];
  let maxDepth = 0;
  let columns = 1;
  let caption = "";

  if (structure.kind === "heap") {
    const heapSize = view.total === null ? n : heapSizeFromHits(n, view.lineHits, algorithm.codeLabels, structure.heapEndLabel);
    nodes = view.items.map((item, i) => {
      const inHeap = i < heapSize;
      return {
        key: item.id,
        x: heapPositions[i].x,
        depth: heapPositions[i].depth,
        parent: heapParent(i, structure.arity),
        label: String(item.value),
        tone: highlighted.get(i) ?? (sortedDone || !inHeap ? "done" : "idle"),
        faded: !inHeap && !sortedDone,
      };
    });
    maxDepth = heapPositions.length > 0 ? heapPositions[heapPositions.length - 1].depth : 0;
    columns = structure.arity ** maxDepth;
    caption = sortedDone ? "정렬 완료" : `힙 크기 ${heapSize} · 정렬된 부분 ${n - heapSize}`;
  } else if (bst) {
    const progress = bstProgress(n, view.cursor, view.highlight, view.done);
    const placed = progress.phase === "build" ? 0 : placedPrefix(view.items, inorderIds);
    // 배치 단계에서는 배열이 움직이므로 강조는 현재 위치 → 원소 id → 트리 노드로 바꾼다
    const nodeOfId = new Map(input.map((item, i) => [item.id, i]));
    const changedNode =
      progress.phase === "arrange" && view.highlight
        ? nodeOfId.get(view.items[view.highlight.indices[view.highlight.indices.length - 1]]?.id ?? -1)
        : undefined;

    nodes = input.map((item, i) => {
      const inTree = i < progress.inserted;
      let tone: DrawNode["tone"] = "idle";
      if (sortedDone || bst.rank[i] < placed) tone = "done";
      if (i === progress.comparing || i === progress.inserting) tone = "compare";
      if (i === changedNode) tone = "change";
      return {
        key: item.id,
        x: (bst.rank[i] + 0.5) / n,
        depth: bst.depth[i],
        parent: bst.parent[i],
        label: String(item.value),
        tone,
        hidden: !inTree && i !== progress.inserting,
        ghost: i === progress.inserting,
      };
    });
    maxDepth = bst.maxDepth;
    columns = n;
    caption =
      progress.phase === "build"
        ? `트리에 넣는 중 ${progress.inserted}/${n}`
        : progress.phase === "arrange"
          ? `중위 순회 순서로 배치 ${placed}/${n}`
          : "정렬 완료";
  }

  return (
    <div className={cn("relative w-full h-64 md:h-80 px-2 pt-2", className)} role="img" aria-label={`${algorithm.name} 트리 보기, ${caption}`}>
      <TreeCanvas nodes={nodes} maxDepth={maxDepth} columns={columns} moveDurationMs={moveDurationMs} />
      <span className="absolute top-2 right-3 text-[10px] font-mono text-white/40">{caption}</span>
    </div>
  );
}
