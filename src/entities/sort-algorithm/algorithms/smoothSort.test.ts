import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { heapSort } from "./heapSort";
import { smoothSort } from "./smoothSort";

describeSortAlgorithm(smoothSort);

describe("smoothSort", () => {
  it("길이 1~80을 모두 정렬한다 (레오나르도 힙 경계 케이스)", () => {
    for (let n = 1; n <= 80; n++) {
      expectSortsCorrectly(smoothSort, randomValues(n, 1000, n + 300));
      expectSortsCorrectly(smoothSort, randomValues(n, 3, n + 400));
    }
  });

  it("정렬된 입력에서는 교환 없이 O(n)에 가깝게 끝난다 (힙 정렬과 대비)", () => {
    const smooth = runSort(smoothSort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    const heap = runSort(heapSort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    expect(countOps(smooth.ops, OpType.Swap)).toBe(0);
    expect(countOps(smooth.ops, OpType.Compare)).toBeLessThan(5 * 1000);
    expect(countOps(heap.ops, OpType.Compare)).toBeGreaterThan(countOps(smooth.ops, OpType.Compare) * 2);
  });

  it("큰 무작위 입력을 정렬한다", () => {
    expectSortsCorrectly(smoothSort, randomValues(1000, 9999, 25));
  });
});
