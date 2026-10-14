import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { oddEvenMergeSort } from "./oddEvenMergeSort";

describeSortAlgorithm(oddEvenMergeSort);

describe("oddEvenMergeSort", () => {
  it("2의 거듭제곱이 아닌 모든 길이(1~40)를 정렬한다", () => {
    for (let n = 1; n <= 40; n++) {
      expectSortsCorrectly(oddEvenMergeSort, randomValues(n, 100, n + 50));
    }
  });

  it("비교 횟수는 입력 순서와 무관하다 (정렬 네트워크)", () => {
    const a = runSort(oddEvenMergeSort, toItems(Array.from({ length: 37 }, (_, i) => i)));
    const b = runSort(oddEvenMergeSort, toItems(Array.from({ length: 37 }, (_, i) => 37 - i)));
    expect(countOps(a.ops, OpType.Compare)).toBe(countOps(b.ops, OpType.Compare));
  });
});
