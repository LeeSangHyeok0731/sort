import { describe, it } from "vitest";
import { describeSortAlgorithm, expectSortsCorrectly, randomValues } from "../testing/sortSuite";
import { bucketSort } from "./bucketSort";

describeSortAlgorithm(bucketSort);
describeSortAlgorithm(bucketSort, { options: { bucketCount: 1 } });
describeSortAlgorithm(bucketSort, { options: { bucketCount: 20 } });

describe("bucketSort", () => {
  it("버킷 수가 원소 수보다 많아도 정렬한다", () => {
    expectSortsCorrectly(bucketSort, [3, 1, 2], { bucketCount: 20 });
  });

  it("버킷 수가 0 이하이면 1개로 취급한다", () => {
    expectSortsCorrectly(bucketSort, randomValues(30, 100, 8), { bucketCount: 0 });
  });
});
