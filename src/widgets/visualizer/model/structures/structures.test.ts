import { describe, expect, it } from "vitest";
import { applyOp, getAlgorithm, opCount, OpType, readOp, runSort, type Op } from "@/entities/sort-algorithm";
import type { ArrayItem } from "@/shared/model";
import { cartesianPrefix, cartesianQueueAfter, insertionPath, NIL, splayAfter, stableRanks, tournamentAfter } from "./trees";
import { bucketRule, countingRule, fillBins, patiencePiles, pileFor, radixPass, radixPasses, radixRule } from "./bins";

const items = (values: readonly number[]): ArrayItem[] => values.map((value, id) => ({ id, value }));

function randomValues(n: number, max: number, seed: number) {
  let s = seed;
  return Array.from({ length: n }, () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s % max;
  });
}

const CASES = [
  [5, 3, 8, 1, 9, 2, 7],
  [1, 2, 3, 4, 5, 6],
  [6, 5, 4, 3, 2, 1],
  [3, 3, 1, 3, 2, 1, 2],
  randomValues(60, 30, 7),
  randomValues(80, 1000, 11),
];

/** 알고리즘 연산 중 그 표식 줄의 연산만 */
function opsWithLabel(id: string, values: readonly number[], label: string, options = {}) {
  const algorithm = getAlgorithm(id);
  const { ops } = runSort(algorithm, items(values), options);
  const all: Array<Op & { label: string | undefined; index: number }> = [];
  for (let k = 0; k < opCount(ops); k++) {
    const op = readOp(ops, k);
    all.push({ ...op, label: algorithm.codeLabels.get(op.line), index: k });
  }
  return { all, picked: all.filter((op) => op.label === label) };
}

describe("스플레이 트리", () => {
  it("i를 넣을 때의 비교 순서 = 앞 원소들로 만든 스플레이 트리에서의 삽입 경로", () => {
    for (const values of CASES) {
      const { picked } = opsWithLabel("splay", values, "cmp");
      for (let i = 1; i < values.length; i++) {
        const compared = picked.filter((op) => op.a === i).map((op) => op.b);
        expect(compared, `${values} / ${i}`).toEqual(insertionPath(splayAfter(values, i), values, i));
      }
    }
  });

  it("넣은 원소가 루트가 되고, 중위 순회는 안정 정렬 순서", () => {
    const values = [4, 1, 4, 0, 2, 4, 1];
    for (let count = 1; count <= values.length; count++) {
      const tree = splayAfter(values, count);
      expect(tree.root).toBe(count - 1);
      const order: number[] = [];
      const stack: number[] = [];
      for (let cur = tree.root; cur !== NIL || stack.length > 0; ) {
        while (cur !== NIL) {
          stack.push(cur);
          cur = tree.left[cur];
        }
        const x = stack.pop()!;
        order.push(x);
        cur = tree.right[x];
      }
      const ranks = stableRanks(values.slice(0, count));
      expect(order.map((x) => ranks[x])).toEqual(order.map((_, r) => r));
      for (const x of order) if (tree.parent[x] !== NIL) expect(tree.depth[x]).toBe(tree.depth[tree.parent[x]] + 1);
    }
  });
});

describe("카테시안 트리", () => {
  it("최소 힙 성질 + 중위 순회 = 원래 순서", () => {
    for (const values of CASES) {
      const tree = cartesianPrefix(values, values.length);
      const order: number[] = [];
      const stack: number[] = [];
      for (let cur = tree.root; cur !== NIL || stack.length > 0; ) {
        while (cur !== NIL) {
          stack.push(cur);
          cur = tree.left[cur];
        }
        const x = stack.pop()!;
        order.push(x);
        cur = tree.right[x];
      }
      expect(order).toEqual(values.map((_, i) => i));
      values.forEach((v, i) => {
        if (tree.parent[i] !== NIL) expect(values[tree.parent[i]]).toBeLessThanOrEqual(v);
      });
    }
  });

  it("꺼내기 단계의 다음 비교 = 실제로 기록된 다음 비교", () => {
    for (const values of CASES) {
      const { picked } = opsWithLabel("cartesian", values, "cmp-heap");
      for (let k = 0; k <= picked.length; k++) {
        const { next } = cartesianQueueAfter(values, k);
        expect(next, `${values} / ${k}`).toEqual(k < picked.length ? [picked[k].a, picked[k].b] : null);
      }
      const end = cartesianQueueAfter(values, picked.length);
      expect(end.popped).toEqual([...stableRanks(values)].map((_, r) => [...stableRanks(values)].indexOf(r)));
    }
  });
});

describe("토너먼트", () => {
  it("다음 경기 = 실제로 기록된 다음 비교, 끝나면 우승 순서가 안정 정렬 순서", () => {
    for (const values of CASES) {
      const { picked } = opsWithLabel("tournament", values, "cmp-match");
      for (let k = 0; k <= picked.length; k++) {
        const { next } = tournamentAfter(values, k);
        expect(next, `${values} / ${k}`).toEqual(k < picked.length ? [picked[k].a, picked[k].b] : null);
      }
      const ranks = stableRanks(values);
      const end = tournamentAfter(values, picked.length);
      expect(end.removed.map((x) => ranks[x])).toEqual(values.map((_, r) => r));
    }
  });
});

describe("페이션스 더미", () => {
  it("i를 놓을 때 비교한 카드는 모두 앞 원소 더미의 맨 위 카드", () => {
    for (const values of CASES) {
      const { picked } = opsWithLabel("patience", values, "cmp-pile");
      for (let i = 1; i < values.length; i++) {
        const piles = patiencePiles(values, i);
        const tops = new Set(piles.map((p) => p[p.length - 1]));
        for (const op of picked.filter((o) => o.b === i)) expect(tops.has(op.a)).toBe(true);
        expect(pileFor(values, piles, i)).toBeLessThanOrEqual(piles.length);
      }
    }
  });

  it("각 더미는 위로 갈수록 작거나 같다", () => {
    for (const pile of patiencePiles(randomValues(100, 50, 3), 100)) {
      for (let k = 1; k < pile.length; k++) expect(pile[k]).toBeGreaterThan(pile[k - 1]);
    }
  });
});

/** 연산을 처음부터 재생하며 표식이 바뀌는 순간의 배열을 넘겨준다 */
function replay(id: string, values: readonly number[], options: object, onOp: (arr: ArrayItem[], op: Op & { label?: string }) => void) {
  const algorithm = getAlgorithm(id);
  const { ops } = runSort(algorithm, items(values), options);
  const arr = items(values);
  for (let k = 0; k < opCount(ops); k++) {
    const op = readOp(ops, k);
    onOp(arr, { ...op, label: algorithm.codeLabels.get(op.line) });
    applyOp(arr, op.type as OpType, op.a, op.b);
  }
  return arr;
}

const ids = (list: readonly ArrayItem[]) => list.map((item) => item.id);

describe("칸 (버킷·계수·기수)", () => {
  it("버킷: 옮기는 동안 언제나 '지금 배열을 칸에 담아 이어 붙인 순서'가 배치 목표", () => {
    for (const values of CASES) {
      for (const bucketCount of [undefined, 1, 3, 10]) {
        const rule = bucketRule(values, bucketCount);
        const target = ids(fillBins(items(values), values.length, rule).flat());
        replay("bucket", values, { bucketCount }, (arr, op) => {
          if (op.label === "move") expect(ids(fillBins(arr, arr.length, rule).flat())).toEqual(target);
          // 삽입 정렬은 한 버킷 안에서만
          if (op.label === "cmp") expect(rule.of(arr[op.a].value)).toBe(rule.of(arr[op.b].value));
        });
      }
    }
  });

  it("계수: 칸 번호는 값 순서를 지키고 칸 수는 상한을 넘지 않는다", () => {
    const rule = countingRule([3, 100, 7, 55]);
    expect(rule.k).toBeLessThanOrEqual(40);
    expect(rule.of(3)).toBe(0);
    expect(rule.of(100)).toBe(rule.k - 1);
    const small = countingRule([2, 5, 3]);
    expect(small.labels).toEqual(["2", "3", "4", "5"]);
  });

  it("기수: 읽은 횟수로 자릿수를 알고, 자릿수마다 지금 배열을 칸에 담은 순서가 배치 목표", () => {
    for (const values of CASES) {
      const n = values.length;
      const passes = radixPasses(Math.max(...values));
      let reads = 0;
      const final = replay("radix", values, {}, (arr, op) => {
        if (op.label === "read") reads++;
        if (op.label === "move") {
          const pass = radixPass(n, reads, passes);
          expect(reads).toBe((pass + 1) * n);
          const target = ids(fillBins(arr, n, radixRule(pass)).flat());
          const after = arr.slice();
          applyOp(after, op.type as OpType, op.a, op.b);
          expect(ids(fillBins(after, n, radixRule(pass)).flat())).toEqual(target);
        }
      });
      expect(final.map((x) => x.value)).toEqual([...values].sort((a, b) => a - b));
      expect(radixPass(n, passes * n, passes)).toBe(passes - 1);
    }
  });
});
