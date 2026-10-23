"use client";

import { useMemo } from "react";
import type { ArrayItem } from "@/shared/model";
import type { AlgorithmStructure, SortAlgorithm, SortOptions } from "@/entities/sort-algorithm";
import type { TrackView } from "@/features/playback";
import { cn } from "@/shared/lib";
import { buildScene, createSceneCache } from "../../model/structures/scene";
import BinsCanvas from "./BinsCanvas";
import TreeCanvas from "./TreeCanvas";

type Props = {
  algorithm: SortAlgorithm & { structure: AlgorithmStructure };
  view: TrackView;
  /** 정렬 전 원래 배열 (트리·더미는 입력 순서대로 만든다) */
  input: readonly ArrayItem[];
  /** 그 슬롯의 정렬 옵션 (버킷 수 등) */
  options: SortOptions;
  /** 원소가 자리를 옮길 때 원을 그리며 이동하는 시간 (0이면 바로 이동) */
  moveDurationMs: number;
  className?: string;
};

/** 막대 대신 정렬이 쓰는 구조(트리·대진표·더미·칸)로 보여 준다 */
export default function StructureView({ algorithm, view, input, options, moveDurationMs, className }: Props) {
  const kind = algorithm.structure.kind;
  const bucketCount = options.bucketCount;
  const cache = useMemo(() => createSceneCache(input, kind, { bucketCount }), [input, kind, bucketCount]);
  const scene = buildScene(algorithm, view, input, cache);

  return (
    <div
      className={cn("relative w-full h-64 md:h-80 px-2 pt-2", className)}
      role="img"
      aria-label={`${algorithm.name} 구조 보기, ${scene.caption}`}
    >
      {scene.type === "tree" ? (
        <TreeCanvas nodes={scene.nodes} maxDepth={scene.maxDepth} columns={scene.columns} moveDurationMs={moveDurationMs} />
      ) : (
        <BinsCanvas columns={scene.columns} />
      )}
      <span className="absolute top-2 right-3 text-[10px] font-mono text-muted">{scene.caption}</span>
    </div>
  );
}
