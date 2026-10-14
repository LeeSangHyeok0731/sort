import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { oddEvenSort } from "./oddEvenSort";

describeSortAlgorithm(oddEvenSort);

describe("oddEvenSort", () => {
  it("정렬된 입력은 한 라운드(홀수+짝수 패스)로 끝낸다", () => {
    const { ops } = runSort(oddEvenSort, toItems(Array.from({ length: 10 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(9);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
