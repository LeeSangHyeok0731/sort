import type { ArrayItem } from "@/shared/model";
import { getAlgorithm, isAlgorithmId, runSort, type SortOptions, type SortResult } from "@/entities/sort-algorithm/core";

/** 워커에 보내는 작업 (함수는 넘길 수 없으므로 알고리즘은 id로) */
export type SortJob = {
  algorithmId: string;
  input: readonly ArrayItem[];
  options: SortOptions;
};

/** 작업 하나를 실행한다. 워커와 워커가 없는 환경(대체 경로)이 함께 쓴다. */
export function executeSortJob(job: SortJob): SortResult {
  if (!isAlgorithmId(job.algorithmId)) throw new Error(`알 수 없는 알고리즘: ${job.algorithmId}`);
  return runSort(getAlgorithm(job.algorithmId), job.input, job.options);
}
