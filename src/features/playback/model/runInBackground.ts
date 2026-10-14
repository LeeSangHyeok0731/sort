import type { SortResult } from "@/entities/sort-algorithm/core";
import { executeSortJob, type SortJob } from "./sortJob";

export type BackgroundSort = {
  /** 모든 작업의 결과 (작업 순서대로). 취소되면 거부된다. */
  promise: Promise<SortResult[]>;
  /** 진행 중인 계산을 멈춘다 (워커 종료) */
  cancel: () => void;
};

export class SortCancelled extends Error {
  constructor() {
    super("정렬 계산이 취소되었습니다.");
    this.name = "SortCancelled";
  }
}

type WorkerReply = { ok: true; result: SortResult } | { ok: false; error: string };

/**
 * 작업마다 Web Worker를 하나씩 띄워 병렬로 계산한다.
 * 워커를 쓸 수 없는 환경(테스트 등)에서는 같은 계산을 즉시 실행한다.
 */
export function runSortsInBackground(jobs: readonly SortJob[]): BackgroundSort {
  if (typeof Worker === "undefined") {
    let cancelled = false;
    const promise = Promise.resolve().then(() => {
      if (cancelled) throw new SortCancelled();
      return jobs.map(executeSortJob);
    });
    return { promise, cancel: () => (cancelled = true) };
  }

  const workers: Worker[] = [];
  let rejectAll: (reason: unknown) => void = () => {};

  const promise = new Promise<SortResult[]>((resolve, reject) => {
    rejectAll = reject;
    const results: SortResult[] = new Array(jobs.length);
    let remaining = jobs.length;
    if (remaining === 0) resolve([]);

    jobs.forEach((job, index) => {
      // { type: "module" } 옵션을 붙이면 Turbopack 프로덕션 빌드가 워커를 번들하지 않고
      // .ts 원본을 그대로 복사해 브라우저에서 실행되지 않는다 (개발 서버에서는 동작해 놓치기 쉬움)
      const worker = new Worker(new URL("./sort.worker.ts", import.meta.url));
      workers.push(worker);
      worker.onmessage = (event: MessageEvent<WorkerReply>) => {
        worker.terminate();
        if (!event.data.ok) {
          reject(new Error(event.data.error));
          return;
        }
        results[index] = event.data.result;
        if (--remaining === 0) resolve(results);
      };
      worker.onerror = (event) => {
        worker.terminate();
        reject(new Error(event.message || "정렬 워커 오류"));
      };
      worker.postMessage(job);
    });
  });

  return {
    promise,
    cancel: () => {
      workers.forEach((w) => w.terminate());
      rejectAll(new SortCancelled());
    },
  };
}
