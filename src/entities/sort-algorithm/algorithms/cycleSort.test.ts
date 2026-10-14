import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { selectionSort } from "./selectionSort";
import { cycleSort } from "./cycleSort";

describeSortAlgorithm(cycleSort);

describe("cycleSort", () => {
  it("서로 다른 값이면 교환 수가 이론상 최소(n - 사이클 수)다", () => {
    // 무작위 순열과 그 사이클 수
    const values = randomValues(100, 1_000_000, 31);
    const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
    const seen = new Array(values.length).fill(false);
    let cycles = 0;
    for (let i = 0; i < values.length; i++) {
      if (seen[i]) continue;
      cycles++;
      for (let j = i; !seen[j]; j = order[j]) seen[j] = true;
    }
    const { ops } = runSort(cycleSort, toItems(values));
    expect(countOps(ops, OpType.Swap)).toBe(values.length - cycles);
  });

  it("선택 정렬보다 교환이 많지 않다", () => {
    const values = randomValues(150, 9999, 32);
    const cycle = runSort(cycleSort, toItems(values));
    const selection = runSort(selectionSort, toItems(values));
    expect(countOps(cycle.ops, OpType.Swap)).toBeLessThanOrEqual(countOps(selection.ops, OpType.Swap));
  });
});
