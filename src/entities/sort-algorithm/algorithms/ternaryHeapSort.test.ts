import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { ternaryHeapSort } from "./ternaryHeapSort";

describeSortAlgorithm(ternaryHeapSort);

describe("ternaryHeapSort", () => {
  it("이동 없이 비교와 교환만 사용한다", () => {
    const { ops } = runSort(ternaryHeapSort, toItems(randomValues(300, 9999, 44)));
    expect(countOps(ops, OpType.Move)).toBe(0);
  });

  it("자식 수가 1·2·3개인 경계 크기들을 정렬한다", () => {
    for (let n = 2; n <= 40; n++) expectSortsCorrectly(ternaryHeapSort, randomValues(n, 50, n + 500));
  });
});
