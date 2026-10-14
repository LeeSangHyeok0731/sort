import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { splaySort } from "./splaySort";

describeSortAlgorithm(splaySort);

describe("splaySort", () => {
  it("정렬된 입력은 매번 루트 바로 옆에 붙어 비교가 O(n)이다", () => {
    const { ops } = runSort(splaySort, toItems(Array.from({ length: 1000 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBeLessThanOrEqual(2 * 1000);
  });

  it("편향된 입력에서도 스택 오버플로 없이 정렬한다", () => {
    expectSortsCorrectly(splaySort, Array.from({ length: 1000 }, (_, i) => 1000 - i));
    expectSortsCorrectly(splaySort, randomValues(1000, 9999, 64));
  });
});
