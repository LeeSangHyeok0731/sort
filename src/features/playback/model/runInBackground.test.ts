import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

/** 이 id로 작업을 보내면 가짜 워커가 onerror를 낸다 */
const CRASH = "__crash__";

/** 메시지를 받으면 같은 계산을 비동기로 돌려주는 가짜 워커 */
class FakeWorker {
  static created: FakeWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  terminated = false;
  constructor() {
    FakeWorker.created.push(this);
  }
  postMessage(job: Parameters<typeof executeSortJob>[0]) {
    queueMicrotask(() => {
      if (this.terminated) return;
      // 스크립트 로드 실패처럼 워커 자체가 망가진 경우를 흉내 낸다
      if (job.algorithmId === CRASH) {
        this.onerror?.({ message: "워커 스크립트를 불러오지 못함" });
        return;
      }
      try {
        this.onmessage?.({ data: { ok: true, result: executeSortJob(job) } });
      } catch (error) {
        this.onmessage?.({ data: { ok: false, error: String(error) } });
      }
    });
  }
  terminate() {
    this.terminated = true;
  }
}

describe("runSortsInBackground (워커 재사용)", () => {
  const job = { algorithmId: "bubble", input, options: {} };
  let pool: typeof import("./runInBackground");

  beforeEach(async () => {
    FakeWorker.created = [];
    vi.stubGlobal("Worker", FakeWorker);
    vi.resetModules(); // 모듈에 남은 쉬는 워커를 비운다
    pool = await import("./runInBackground");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("미리 띄운 워커로 계산하고, 끝난 워커를 다음 계산에 다시 쓴다", async () => {
    pool.prewarmSortWorkers();
    expect(FakeWorker.created).toHaveLength(2);

    await pool.runSortsInBackground([job, job]).promise;
    const results = await pool.runSortsInBackground([job, job]).promise;
    expect(results.map((r) => r.final.map((x) => x.value))).toEqual([
      [1, 2, 3, 5, 8, 9],
      [1, 2, 3, 5, 8, 9],
    ]);
    expect(FakeWorker.created).toHaveLength(2);
    expect(FakeWorker.created.some((w) => w.terminated)).toBe(false);
  });

  it("미리 띄우기는 여러 번 불러도 쉬는 워커를 2개까지만 둔다", () => {
    pool.prewarmSortWorkers();
    pool.prewarmSortWorkers();
    expect(FakeWorker.created).toHaveLength(2);
  });

  it("취소하면 계산 중인 워커만 종료하고 빈자리를 새 워커로 채운다", async () => {
    pool.prewarmSortWorkers();
    const running = pool.runSortsInBackground([job]);
    running.cancel();
    await expect(running.promise).rejects.toBeInstanceOf(pool.SortCancelled);

    expect(FakeWorker.created.filter((w) => w.terminated)).toHaveLength(1);
    expect(FakeWorker.created).toHaveLength(3);

    await pool.runSortsInBackground([job, job]).promise;
    expect(FakeWorker.created).toHaveLength(3);
  });

  it("오류를 낸 계산도 거부되고, 워커는 다시 쓴다", async () => {
    await expect(
      pool.runSortsInBackground([{ algorithmId: "nope", input, options: {} }]).promise
    ).rejects.toThrow(/nope/);
    await pool.runSortsInBackground([job]).promise;
    expect(FakeWorker.created).toHaveLength(1);
  });

  it("작업 하나가 실패하면 같은 묶음의 계산 중인 워커를 종료하고 빈자리를 채운다", async () => {
    const running = pool.runSortsInBackground([{ algorithmId: "nope", input, options: {} }, job]);
    await expect(running.promise).rejects.toThrow(/nope/);

    const [failedWorker, otherWorker] = FakeWorker.created;
    expect(failedWorker.terminated).toBe(false); // 오류를 보고한 워커는 멀쩡하니 다시 쓴다
    expect(otherWorker.terminated).toBe(true);
    expect(FakeWorker.created).toHaveLength(3);

    await pool.runSortsInBackground([job, job]).promise;
    expect(FakeWorker.created).toHaveLength(3);
  });

  it("워커가 오류로 죽으면 거부되고, 그 워커는 버린 뒤 풀을 다시 채운다", async () => {
    const running = pool.runSortsInBackground([{ algorithmId: CRASH, input, options: {} }, job]);
    await expect(running.promise).rejects.toThrow("워커 스크립트를 불러오지 못함");

    expect(FakeWorker.created.slice(0, 2).every((w) => w.terminated)).toBe(true);
    expect(FakeWorker.created).toHaveLength(4);

    await pool.runSortsInBackground([job, job]).promise;
    expect(FakeWorker.created).toHaveLength(4);
  });

  it("쉬는 동안 오류를 낸 워커에는 계산을 맡기지 않는다", async () => {
    pool.prewarmSortWorkers();
    FakeWorker.created.forEach((w) => w.onerror?.({ message: "로드 실패" }));

    const results = await pool.runSortsInBackground([job]).promise;
    expect(results[0].final.map((x) => x.value)).toEqual([1, 2, 3, 5, 8, 9]);
    expect(FakeWorker.created).toHaveLength(3);
    expect(FakeWorker.created.slice(0, 2).every((w) => w.terminated)).toBe(true);
  });
});
