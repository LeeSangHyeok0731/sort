import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { weakHeapSort } from "./weakHeapSort";

describeSortAlgorithm(weakHeapSort);

describe("weakHeapSort", () => {
  it("길이 1~80을 모두 정렬한다", () => {
    for (let n = 1; n <= 80; n++) {
      expectSortsCorrectly(weakHeapSort, randomValues(n, 1000, n + 600));
      expectSortsCorrectly(weakHeapSort, randomValues(n, 3, n + 700));
    }
  });

  it("비교 횟수는 n⌈log2 n⌉ 이하다", () => {
    const { ops } = runSort(weakHeapSort, toItems(randomValues(1000, 9999, 46)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(1000 * 10);
  });
});
