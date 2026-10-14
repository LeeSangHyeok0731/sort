import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { pairwiseNetworkSort } from "./pairwiseNetworkSort";

describeSortAlgorithm(pairwiseNetworkSort);

describe("pairwiseNetworkSort", () => {
  it("2의 거듭제곱이 아닌 모든 길이(1~40)를 정렬한다", () => {
    for (let n = 1; n <= 40; n++) expectSortsCorrectly(pairwiseNetworkSort, randomValues(n, 100, n + 800));
  });

  it("16개 입력에서 비교기는 63개다 (알려진 페어와이즈 네트워크 크기)", () => {
    const { ops } = runSort(pairwiseNetworkSort, toItems(Array.from({ length: 16 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(63);
  });

  it("비교 횟수는 입력 순서와 무관하다", () => {
    const a = runSort(pairwiseNetworkSort, toItems(Array.from({ length: 37 }, (_, i) => i)));
    const b = runSort(pairwiseNetworkSort, toItems(Array.from({ length: 37 }, (_, i) => 37 - i)));
    expect(countOps(a.ops, OpType.Compare)).toBe(countOps(b.ops, OpType.Compare));
  });
});
