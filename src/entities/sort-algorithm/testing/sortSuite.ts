import { describe, expect, it } from "vitest";
import type { ArrayItem } from "@/shared/model";
import { applyOp, opCount, OP_STRIDE, readOp } from "../model/op";
import { runSort } from "../model/run";
import type { SortAlgorithm, SortOptions } from "../model/types";

/** 테스트 재현성을 위한 시드 기반 난수 (mulberry32) */
export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function toItems(values: number[]): ArrayItem[] {
  return values.map((value, id) => ({ id, value }));
}

export function randomValues(size: number, max: number, seed: number) {
  const rand = seededRandom(seed);
  return Array.from({ length: size }, () => Math.floor(rand() * max));
}

/** 정렬 결과·id 보존·연산 재생·(안정 정렬이면) 안정성을 모두 검증한다. */
export function expectSortsCorrectly(
  algorithm: SortAlgorithm,
  values: number[],
  options: SortOptions = {}
) {
  const input = toItems(values);
  const result = runSort(algorithm, input, options);

  expect(result.truncated).toBe(false);

  const expected = [...values].sort((x, y) => x - y);
  expect(result.final.map((x) => x.value)).toEqual(expected);

  expect(result.final.map((x) => x.id).sort((x, y) => x - y)).toEqual(
    input.map((x) => x.id)
  );

  // 연산 로그를 처음부터 재생하면 같은 최종 배열이 나와야 한다
  // (연산 수가 수십만 개일 수 있어 expect는 루프 밖에서 한 번만 호출한다)
  const replay = [...input];
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < values.length;
  let firstBadOp = -1;
  for (let k = 0; k < opCount(result.ops); k++) {
    const op = readOp(result.ops, k);
    if (firstBadOp < 0 && !(inRange(op.a) && inRange(op.b))) firstBadOp = k;
    applyOp(replay, op.type, op.a, op.b);
  }
  expect(firstBadOp, "범위를 벗어난 인덱스를 가진 연산").toBe(-1);
  expect(replay).toEqual(result.final);

  if (algorithm.stable) {
    for (let i = 1; i < result.final.length; i++) {
      const prev = result.final[i - 1];
      const cur = result.final[i];
      if (prev.value === cur.value) expect(prev.id).toBeLessThan(cur.id);
    }
  }

  return result;
}

type SuiteConfig = {
  /** 테스트할 배열의 최대 크기 (보고 정렬처럼 느린 알고리즘용) */
  maxSize?: number;
  options?: SortOptions;
};

const FIXED_CASES: Array<[string, number[]]> = [
  ["원소 2개 (역순)", [2, 1]],
  ["원소 2개 (정순)", [1, 2]],
  ["이미 정렬된 배열", [1, 2, 3, 4, 5, 6, 7]],
  ["역순 배열", [9, 8, 7, 6, 5, 4, 3, 2, 1]],
  ["중복 값과 0이 섞인 배열", [3, 0, 3, 1, 0, 2, 3, 1]],
  ["모든 값이 같은 배열", [4, 4, 4, 4, 4]],
];

const RANDOM_SIZES = [3, 5, 6, 13, 16, 17, 33, 64, 100, 200];

/** 모든 알고리즘이 공통으로 통과해야 하는 테스트 묶음 */
export function describeSortAlgorithm(
  algorithm: SortAlgorithm,
  { maxSize = Infinity, options = {} }: SuiteConfig = {}
) {
  describe(`${algorithm.name} (${algorithm.id}) 공통 동작`, () => {
    it("빈 배열과 원소 1개는 연산 없이 그대로 둔다", () => {
      const empty = runSort(algorithm, [], options);
      expect(empty.final).toEqual([]);
      expect(empty.ops).toHaveLength(0);
      const single = runSort(algorithm, toItems([7]), options);
      expect(single.final).toEqual(toItems([7]));
      expect(single.ops).toHaveLength(0);
    });

    for (const [title, values] of FIXED_CASES) {
      if (values.length > maxSize) continue;
      it(title, () => {
        expectSortsCorrectly(algorithm, values, options);
      });
    }

    it("무작위 배열 여러 크기", () => {
      RANDOM_SIZES.filter((n) => n <= maxSize).forEach((size, seed) => {
        expectSortsCorrectly(algorithm, randomValues(size, size, seed + 1), options);
        expectSortsCorrectly(algorithm, randomValues(size, 9999, seed + 100), options);
      });
    });
  });
}

/** 연산 로그에서 특정 종류의 연산 개수를 센다. */
export function countOps(ops: ArrayLike<number>, type: number) {
  let count = 0;
  for (let k = 0; k < ops.length; k += OP_STRIDE) if (ops[k] === type) count++;
  return count;
}
