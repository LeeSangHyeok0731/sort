import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { msdRadixSort } from "./msdRadixSort";

describeSortAlgorithm(msdRadixSort);

describe("msdRadixSort", () => {
  it("값을 비교하지 않는다 (읽기와 이동만 사용)", () => {
    const { ops } = runSort(msdRadixSort, toItems(randomValues(100, 9999, 24)));
    expect(countOps(ops, OpType.Compare)).toBe(0);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });

  it("자릿수가 다른 값들이 섞여도 정렬한다", () => {
    expectSortsCorrectly(msdRadixSort, [5, 1000, 42, 9999, 0, 300, 7, 42]);
  });

  it("최상위 자릿수만 달라도 구간이 나뉘면 그 안은 다시 읽지 않는다", () => {
    // 각 값이 첫 자릿수에서 서로 다른 묶음에 들어가므로 한 번만 읽는다
    const { ops } = runSort(msdRadixSort, toItems([30, 10, 20]));
    expect(countOps(ops, OpType.Mark)).toBe(3);
  });
});
