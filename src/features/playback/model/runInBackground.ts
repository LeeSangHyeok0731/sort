import type { SortResult } from "@/entities/sort-algorithm/core";
import { executeSortJob, type SortJob } from "./sortJob";

export type BackgroundSort = {
  /** 모든 작업의 결과 (작업 순서대로). 취소되거나 작업 하나라도 실패하면 거부된다. */
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
/** 쉬는 동안 오류를 낸 워커 (스크립트 로드 실패 등). 다음 계산에 맡기지 않는다 */
const brokenWorkers = new WeakSet<Worker>();

/** 쉬는 워커의 오류 처리: 계산을 맡지 않은 때 난 오류는 받을 곳이 없으므로 표시만 해 둔다 */
function watchIdle(worker: Worker) {
  worker.onerror = () => brokenWorkers.add(worker);
}

function createWorker(): Worker {
  // { type: "module" } 옵션을 붙이면 Turbopack 프로덕션 빌드가 워커를 번들하지 않고
  // .ts 원본을 그대로 복사해 브라우저에서 실행되지 않는다 (개발 서버에서는 동작해 놓치기 쉬움)
  const worker = new Worker(new URL("./sort.worker.ts", import.meta.url));
  watchIdle(worker);
  return worker;
}

function acquireWorker(): Worker {
  for (let worker = idleWorkers.pop(); worker; worker = idleWorkers.pop()) {
    if (!brokenWorkers.has(worker)) return worker;
    worker.terminate();
  }
  return createWorker();
}

/** 계산을 마친 워커는 종료하지 않고 다음 계산에 다시 쓴다 */
function releaseWorker(worker: Worker) {
  worker.onmessage = null;
  watchIdle(worker);
  if (idleWorkers.length < MAX_IDLE_WORKERS) idleWorkers.push(worker);
  else worker.terminate();
}

/** 계산을 맡은 워커를 버린다. 이후 메시지·오류는 받지 않는다 */
function discardWorker(worker: Worker) {
  worker.onmessage = null;
  worker.onerror = null;
  worker.terminate();
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
 * 작업 하나가 실패하면 나머지 결과는 버리므로, 아직 계산 중인 워커도 종료한다.
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
  let settled = false;
  let rejectAll: (reason: unknown) => void = () => {};

  /**
   * 묶음을 실패로 끝낸다. 계산 중인 워커는 멈출 방법이 종료뿐이다.
   * 워커를 종료했으면(lost) 다음 재생이 기다리지 않게 빈자리를 채워 둔다.
   */
  const abort = (reason: unknown, lost = false) => {
    if (settled) return;
    settled = true;
    if (busy.size > 0) lost = true;
    busy.forEach(discardWorker);
    busy.clear();
    if (lost) prewarmSortWorkers();
    rejectAll(reason);
  };

  const promise = new Promise<SortResult[]>((resolve, reject) => {
    rejectAll = reject;
    const results: SortResult[] = new Array(jobs.length);
    let remaining = jobs.length;
    if (remaining === 0) {
      settled = true;
      resolve([]);
    }

    jobs.forEach((job, index) => {
      const worker = acquireWorker();
      busy.add(worker);
      worker.onmessage = (event: MessageEvent<WorkerReply>) => {
        busy.delete(worker);
        releaseWorker(worker);
        if (!event.data.ok) {
          abort(new Error(event.data.error));
          return;
        }
        results[index] = event.data.result;
        if (--remaining === 0 && !settled) {
          settled = true;
          resolve(results);
        }
      };
      worker.onerror = (event) => {
        // 스크립트 로드 실패처럼 워커 자체가 망가졌을 수 있으니 다시 쓰지 않는다
        busy.delete(worker);
        discardWorker(worker);
        abort(new Error(event.message || "정렬 워커 오류"), true);
      };
      worker.postMessage(job);
    });
  });

  return {
    promise,
    cancel: () => abort(new SortCancelled()),
  };
}
