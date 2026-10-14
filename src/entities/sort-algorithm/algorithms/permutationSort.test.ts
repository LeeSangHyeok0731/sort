import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, toItems } from "../testing/sortSuite";
import { permutationSort } from "./permutationSort";

describeSortAlgorithm(permutationSort, { maxSize: 7 });

describe("permutationSort", () => {
  it("n개면 많아야 n!개의 순열(교환 n!-1번) 안에 정렬된 순서를 찾는다", () => {
    const { ops } = expectSortsCorrectly(permutationSort, [5, 4, 3, 2, 1]);
    expect(countOps(ops, OpType.Swap)).toBeLessThanOrEqual(119);
  });

  it("결정적이다: 같은 입력이면 같은 과정", () => {
    const a = runSort(permutationSort, toItems([3, 1, 4, 1, 5, 9]));
    const b = runSort(permutationSort, toItems([3, 1, 4, 1, 5, 9]));
    expect(a.ops).toEqual(b.ops);
  });
});
