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

/** 비교 모드(트랙 2개)까지 기다림 없이 시작할 수 있도록 쉬는 워커를 이만큼 남겨 둔다 */
const MAX_IDLE_WORKERS = 2;
const idleWorkers: Worker[] = [];

function createWorker(): Worker {
  // { type: "module" } 옵션을 붙이면 Turbopack 프로덕션 빌드가 워커를 번들하지 않고
  // .ts 원본을 그대로 복사해 브라우저에서 실행되지 않는다 (개발 서버에서는 동작해 놓치기 쉬움)
  return new Worker(new URL("./sort.worker.ts", import.meta.url));
}

function acquireWorker(): Worker {
  return idleWorkers.pop() ?? createWorker();
}

/** 계산을 마친 워커는 종료하지 않고 다음 계산에 다시 쓴다 */
function releaseWorker(worker: Worker) {
  worker.onmessage = null;
  worker.onerror = null;
  if (idleWorkers.length < MAX_IDLE_WORKERS) idleWorkers.push(worker);
  else worker.terminate();
}

/**
 * 첫 재생 전에 워커를 미리 띄워 둔다.
 * 워커 기동(스크립트 로드·초기화)은 수십 ms가 걸려, 작은 배열에서는 계산보다 오래 걸린다.
 */
export function prewarmSortWorkers() {
  if (typeof Worker === "undefined") return;
  while (idleWorkers.length < MAX_IDLE_WORKERS) idleWorkers.push(createWorker());
}

/**
 * 작업마다 Web Worker를 하나씩 맡겨 병렬로 계산한다. 쉬는 워커가 있으면 다시 쓴다.
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

  const busy = new Set<Worker>();
  let rejectAll: (reason: unknown) => void = () => {};

  const promise = new Promise<SortResult[]>((resolve, reject) => {
    rejectAll = reject;
    const results: SortResult[] = new Array(jobs.length);
    let remaining = jobs.length;
    if (remaining === 0) resolve([]);

    jobs.forEach((job, index) => {
      const worker = acquireWorker();
      busy.add(worker);
      worker.onmessage = (event: MessageEvent<WorkerReply>) => {
        busy.delete(worker);
        releaseWorker(worker);
        if (!event.data.ok) {
          reject(new Error(event.data.error));
          return;
        }
        results[index] = event.data.result;
        if (--remaining === 0) resolve(results);
      };
      worker.onerror = (event) => {
        // 스크립트 로드 실패처럼 워커 자체가 망가졌을 수 있으니 다시 쓰지 않는다
        busy.delete(worker);
        worker.terminate();
        reject(new Error(event.message || "정렬 워커 오류"));
      };
      worker.postMessage(job);
    });
  });

  return {
    promise,
    cancel: () => {
      // 계산 중인 워커는 멈출 방법이 종료뿐이다. 다음 재생이 기다리지 않게 빈자리를 채워 둔다
      busy.forEach((w) => w.terminate());
      busy.clear();
      prewarmSortWorkers();
      rejectAll(new SortCancelled());
    },
  };
}
