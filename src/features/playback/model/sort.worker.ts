/// <reference lib="webworker" />
import { executeSortJob, type SortJob } from "./sortJob";

/**
 * 정렬 연산 로그를 메인 스레드 밖에서 계산한다.
 * (보고보고 정렬처럼 수백만 연산을 만드는 경우에도 화면이 멈추지 않게)
 */
self.onmessage = (event: MessageEvent<SortJob>) => {
  try {
    const result = executeSortJob(event.data);
    // 연산 로그 버퍼는 복사하지 않고 소유권만 넘긴다
    (self as unknown as DedicatedWorkerGlobalScope).postMessage({ ok: true, result }, [result.ops.buffer]);
  } catch (error) {
    self.postMessage({ ok: false, error: String(error) });
  }
};
