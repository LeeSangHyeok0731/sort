import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { circleSort } from "./circleSort";

describeSortAlgorithm(circleSort);

describe("circleSort", () => {
  it("정렬된 입력은 교환 없이 한 바퀴만 돈다", () => {
    const { ops } = runSort(circleSort, toItems(Array.from({ length: 64 }, (_, i) => i)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
    // 한 바퀴 비교 수: 각 재귀 단계마다 약 n/2번, 깊이 log2(64)=6
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(64 * 6);
  });

  it("홀수 길이 구간의 가운데 원소도 처리한다", () => {
    for (const n of [3, 5, 7, 9, 11, 13]) expectSortsCorrectly(circleSort, randomValues(n, 50, n));
  });
});
