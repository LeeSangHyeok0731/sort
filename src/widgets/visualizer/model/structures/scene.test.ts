import { describe, expect, it } from "vitest";
import { ALGORITHMS, runSort, type AlgorithmStructure, type SortAlgorithm } from "@/entities/sort-algorithm";
import { Track, type TrackView } from "@/features/playback";
import type { ArrayItem } from "@/shared/model";
import { buildScene, createSceneCache, STRUCTURE_LABELS, structureLabel, type Scene } from "./scene";

const items = (values: readonly number[]): ArrayItem[] => values.map((value, id) => ({ id, value }));

function viewOf(track: Track): TrackView {
  return {
    items: [...track.array],
    highlight: track.done ? null : track.highlight(),
    stats: { ...track.stats },
    cursor: track.cursor,
    total: track.total,
    done: track.done,
    truncated: track.truncated,
    line: track.done ? 0 : track.line,
    lineHits: [...track.lineHits],
  };
}

const withStructure = ALGORITHMS.filter(
  (a): a is SortAlgorithm & { structure: AlgorithmStructure } => a.structure !== undefined
);

/** 재생하면서 매 단계 장면을 만든다 */
function scenes(algorithm: SortAlgorithm & { structure: AlgorithmStructure }, values: readonly number[], bucketCount?: number) {
  const input = items(values);
  const options = { bucketCount };
  const track = new Track(input, runSort(algorithm, input, options));
  const cache = createSceneCache(input, algorithm.structure.kind, options);
  const out: Scene[] = [buildScene(algorithm, viewOf(track), input, cache)];
  while (track.forward()) out.push(buildScene(algorithm, viewOf(track), input, cache));
  return out;
}

function checkScene(scene: Scene, n: number) {
  if (scene.type === "tree") {
    for (const node of scene.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(1);
      expect(node.depth).toBeGreaterThanOrEqual(0);
      expect(node.depth).toBeLessThanOrEqual(scene.maxDepth);
      expect(node.parent).toBeLessThan(scene.nodes.length);
    }
  } else {
    const cards = scene.columns.flatMap((c) => c.cards);
    expect(cards.filter((c) => !c.ghost).length).toBeLessThanOrEqual(n);
    expect(new Set(cards.map((c) => c.key)).size).toBe(cards.length);
  }
  expect(scene.caption).not.toBe("");
}

describe("구조 보기 장면", () => {
  it("구조를 쓰는 알고리즘은 진행 상태에 필요한 표식을 모두 가지고 있다", () => {
    for (const a of withStructure) {
      const labels = [...a.codeLabels.values()];
      for (const label of STRUCTURE_LABELS[a.structure.kind]) expect(labels, `${a.id}: ${label}`).toContain(label);
      expect(structureLabel(a.structure)).not.toBe("");
    }
  });

  it("모든 단계에서 장면이 만들어지고 끝나면 '정렬 완료'", () => {
    const inputs = [[5, 3, 8, 1, 9, 2, 7, 3], [42, 7, 130, 7, 99, 1, 256, 18, 64, 5], [2, 1], [1]];
    for (const a of withStructure) {
      for (const values of inputs) {
        const all = scenes(a, values);
        for (const scene of all) checkScene(scene, values.length);
        if (values.length > 1) expect(all[all.length - 1].caption, a.id).toBe("정렬 완료");
      }
    }
  });

  it("칸 보기: 담는 단계가 끝나면 모든 원소가 칸에 있다", () => {
    for (const id of ["bucket", "counting", "radix"]) {
      const a = withStructure.find((x) => x.id === id)!;
      const values = [42, 7, 130, 7, 99, 1, 256, 18, 64, 5];
      for (const bucketCount of [undefined, 1, 4]) {
        const all = scenes(a, values, bucketCount);
        const last = all[all.length - 1];
        expect(last.type).toBe("bins");
        if (last.type === "bins") expect(last.columns.flatMap((c) => c.cards)).toHaveLength(values.length);
      }
    }
  });

  it("스플레이 보기: 넣는 중인 원소는 점선 노드로 보인다", () => {
    const a = withStructure.find((x) => x.id === "splay")!;
    const ghosts = scenes(a, [5, 3, 8, 1, 9]).map((s) => (s.type === "tree" ? s.nodes.filter((n) => n.ghost).length : 0));
    expect(Math.max(...ghosts)).toBe(1);
  });
});
