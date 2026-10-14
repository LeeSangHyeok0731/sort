import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, randomValues, toItems } from "../testing/sortSuite";
import { treeSort } from "./treeSort";

describeSortAlgorithm(treeSort);

describe("treeSort", () => {
  it("정렬된 큰 입력(편향 트리)에서도 스택 오버플로 없이 정렬한다", () => {
    expectSortsCorrectly(treeSort, Array.from({ length: 1000 }, (_, i) => i));
  });

  it("트리 구성 후 한 번에 배치하므로 교환은 쓰지 않는다", () => {
    const { ops } = runSort(treeSort, toItems(randomValues(50, 9999, 14)));
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
