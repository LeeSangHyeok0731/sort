import { describe, expect, it } from "vitest";
import { ALGORITHMS, getAlgorithm, runSort, opCount, readOp } from "@/entities/sort-algorithm";
import type { ArrayItem } from "@/shared/model";
import { bstProgress, buildBst, heapLayout, heapParent, heapSizeFromHits, placedPrefix } from "./structure";

const items = (values: number[]): ArrayItem[] => values.map((value, id) => ({ id, value }));

describe("힙 배치", () => {
  it("이진 힙: 부모 = ⌊(i-1)/2⌋, 깊이와 가로 위치", () => {
    expect([1, 2, 3, 4, 5, 6].map((i) => heapParent(i, 2))).toEqual([0, 0, 1, 1, 2, 2]);
    const layout = heapLayout(7, 2);
    expect(layout.map((p) => p.depth)).toEqual([0, 1, 1, 2, 2, 2, 2]);
    expect(layout[0].x).toBeCloseTo(0.5);
    expect(layout[1].x).toBeCloseTo(0.25);
    expect(layout[6].x).toBeCloseTo(7 / 8);
  });

  it("3진 힙: 부모 = ⌊(i-1)/3⌋, 한 층에 3^d개", () => {
    expect([1, 2, 3, 4].map((i) => heapParent(i, 3))).toEqual([0, 0, 0, 1]);
    const layout = heapLayout(13, 3);
    expect(layout.filter((p) => p.depth === 2)).toHaveLength(9);
    expect(layout[0].x).toBeCloseTo(0.5);
  });

  it("자식은 항상 부모보다 한 층 아래", () => {
    const layout = heapLayout(100, 2);
    for (let i = 1; i < 100; i++) expect(layout[i].depth).toBe(layout[heapParent(i, 2)].depth + 1);
  });
});

describe("힙 크기", () => {
  it("루트를 뒤로 보낸 횟수만큼 힙이 줄어든다", () => {
    const heap = getAlgorithm("heap");
    const line = [...heap.codeLabels].find(([, l]) => l === "swap-root")![0];
    const hits: number[] = [];
    expect(heapSizeFromHits(10, hits, heap.codeLabels, "swap-root")).toBe(10);
    hits[line] = 3;
    expect(heapSizeFromHits(10, hits, heap.codeLabels, "swap-root")).toBe(7);
  });

  it("힙 구조를 쓰는 알고리즘은 모두 그 표식을 설명 코드에 가지고 있다", () => {
    for (const a of ALGORITHMS) {
      if (a.structure?.kind !== "heap") continue;
      expect([...a.codeLabels.values()], a.id).toContain(a.structure.heapEndLabel);
    }
  });

  it("실제 힙 정렬을 끝까지 재생하면 힙 크기가 1이 된다", () => {
    const heap = getAlgorithm("heap");
    const input = items([5, 2, 9, 1, 7, 3]);
    const { ops } = runSort(heap, input);
    const hits: number[] = [];
    for (let k = 0; k < opCount(ops); k++) {
      const { line } = readOp(ops, k);
      hits[line] = (hits[line] ?? 0) + 1;
    }
    expect(heapSizeFromHits(input.length, hits, heap.codeLabels, "swap-root")).toBe(1);
  });
});

describe("이진 검색 트리", () => {
  it("입력 순서대로 넣고 같은 값은 오른쪽", () => {
    const bst = buildBst([5, 3, 8, 3, 9]);
    expect(bst.root).toBe(0);
    expect(bst.left[0]).toBe(1); // 3
    expect(bst.right[0]).toBe(2); // 8
    expect(bst.right[1]).toBe(3); // 같은 값 3은 오른쪽
    expect(bst.right[2]).toBe(4); // 9
    expect([...bst.depth]).toEqual([0, 1, 1, 2, 2]);
  });

  it("중위 순회 순위가 안정 정렬 순서와 같다", () => {
    const values = [4, 1, 4, 0, 2, 4, 1];
    const bst = buildBst(values);
    const byRank = [...values.keys()].sort((a, b) => bst.rank[a] - bst.rank[b]);
    const stable = [...values.keys()].sort((a, b) => values[a] - values[b] || a - b);
    expect(byRank).toEqual(stable);
  });

  it("정렬된 입력은 오른쪽으로 한 줄 (깊이 n-1)", () => {
    const bst = buildBst([1, 2, 3, 4, 5]);
    expect(bst.maxDepth).toBe(4);
  });

  it("1,000개 정렬된 입력도 재귀 없이 만든다", () => {
    const bst = buildBst(Array.from({ length: 1000 }, (_, i) => i));
    expect(bst.maxDepth).toBe(999);
  });
});

describe("트리 정렬 진행 상태", () => {
  it("비교 중이면 그 원소를 넣는 중이고, 앞 원소들은 이미 트리에 있다", () => {
    expect(bstProgress(5, 7, { tone: "compare", indices: [3, 1] })).toEqual({
      phase: "build",
      inserted: 3,
      inserting: 3,
      comparing: 1,
    });
  });

  it("시작 전에는 루트만, 이동 단계와 끝에서는 전부", () => {
    expect(bstProgress(5, 0, null)).toMatchObject({ phase: "build", inserted: 1 });
    expect(bstProgress(5, 20, { tone: "change", indices: [0] })).toMatchObject({ phase: "arrange", inserted: 5 });
    expect(bstProgress(5, 30, null)).toMatchObject({ phase: "done", inserted: 5 });
  });

  it("실제 트리 정렬 연산과 맞물린다: 비교 연산의 첫 인덱스가 넣는 중인 원소", () => {
    const tree = getAlgorithm("tree");
    const { ops } = runSort(tree, items([5, 3, 8, 1]));
    const first = readOp(ops, 0);
    expect([first.a, first.b]).toEqual([1, 0]); // 3을 루트 5와 비교
  });
});

describe("배치된 개수", () => {
  it("앞에서부터 목표 순서와 같은 원소 수", () => {
    const current = items([1, 2, 9, 3]);
    expect(placedPrefix(current, [0, 1, 3, 2])).toBe(2);
    expect(placedPrefix(current, [0, 1, 2, 3])).toBe(4);
  });
});
