import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { cocktailSort } from "./cocktailSort";

describeSortAlgorithm(cocktailSort);

describe("cocktailSort", () => {
  it("정렬된 입력은 한 번의 정방향 패스로 끝낸다", () => {
    const { ops } = runSort(cocktailSort, toItems(Array.from({ length: 30 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(29);
  });
});
