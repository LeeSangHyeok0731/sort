import { describe, expect, it } from "vitest";
import { getAlgorithm, runSort } from "@/entities/sort-algorithm/core";
import type { ArrayItem } from "@/shared/model";
import { runSortsInBackground, SortCancelled } from "./runInBackground";
import { executeSortJob } from "./sortJob";

const input: ArrayItem[] = [5, 3, 8, 1, 9, 2].map((value, id) => ({ id, value }));

describe("executeSortJob", () => {
  it("알고리즘 id로 찾아 runSort와 같은 결과를 낸다", () => {
    const result = executeSortJob({ algorithmId: "merge", input, options: {} });
    expect(result).toEqual(runSort(getAlgorithm("merge"), input));
  });

  it("옵션을 그대로 전달한다", () => {
    const a = executeSortJob({ algorithmId: "bucket", input, options: { bucketCount: 1 } });
    const b = executeSortJob({ algorithmId: "bucket", input, options: { bucketCount: 6 } });
    expect(a.ops).not.toEqual(b.ops);
  });

  it("없는 알고리즘이면 오류", () => {
    expect(() => executeSortJob({ algorithmId: "nope", input, options: {} })).toThrow(/nope/);
  });
});

describe("runSortsInBackground (워커가 없는 환경)", () => {
  it("작업 순서대로 결과를 돌려준다", async () => {
    const results = await runSortsInBackground([
      { algorithmId: "bubble", input, options: {} },
      { algorithmId: "heap", input, options: {} },
    ]).promise;
    expect(results.map((r) => r.final.map((x) => x.value))).toEqual([
      [1, 2, 3, 5, 8, 9],
      [1, 2, 3, 5, 8, 9],
    ]);
  });

  it("취소하면 SortCancelled로 거부된다", async () => {
    const job = runSortsInBackground([{ algorithmId: "bubble", input, options: {} }]);
    job.cancel();
    await expect(job.promise).rejects.toBeInstanceOf(SortCancelled);
  });
});
