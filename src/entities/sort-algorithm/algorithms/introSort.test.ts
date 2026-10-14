import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, expectSortsCorrectly, toItems } from "../testing/sortSuite";
import { introSort } from "./introSort";

describeSortAlgorithm(introSort);

describe("introSort", () => {
  it("정렬된 큰 입력에서 깊이 한도로 힙 정렬로 전환해도 정렬한다", () => {
    expectSortsCorrectly(introSort, Array.from({ length: 1000 }, (_, i) => i));
  });

  it("작은 구간(16 미만)은 삽입 정렬만 사용한다", () => {
    const { ops } = runSort(introSort, toItems(Array.from({ length: 15 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(14);
  });
});
