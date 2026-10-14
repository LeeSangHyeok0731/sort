import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { strandSort } from "./strandSort";

describeSortAlgorithm(strandSort);

describe("strandSort", () => {
  it("정렬된 입력은 가닥 하나로 끝난다 (n-1 비교, 이동 없음)", () => {
    const { ops } = runSort(strandSort, toItems(Array.from({ length: 100 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(99);
    expect(countOps(ops, OpType.Move)).toBe(0);
  });
});
