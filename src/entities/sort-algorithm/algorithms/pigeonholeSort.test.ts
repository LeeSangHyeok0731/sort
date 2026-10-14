import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, randomValues, toItems } from "../testing/sortSuite";
import { pigeonholeSort } from "./pigeonholeSort";

describeSortAlgorithm(pigeonholeSort);

describe("pigeonholeSort", () => {
  it("값을 비교하지 않고 원소마다 한 번씩만 읽는다", () => {
    const { ops } = runSort(pigeonholeSort, toItems(randomValues(80, 30, 47)));
    expect(countOps(ops, OpType.Compare)).toBe(0);
    expect(countOps(ops, OpType.Mark)).toBe(80);
  });
});
