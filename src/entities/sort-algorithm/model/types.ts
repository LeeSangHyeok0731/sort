import type { ArrayItem } from "@/shared/model";
import type { OpLog } from "./op";
import type { Tracer } from "./tracer";

export type AlgorithmCategory = "standard" | "linear" | "special" | "fun";

export type SortOptions = {
  /** 셸 정렬 간격 수열 (비어 있으면 n/2, n/4, ...) */
  shellGaps?: number[];
  /** 버킷 정렬 버킷 수 */
  bucketCount?: number;
};

export type SortResult = {
  ops: OpLog;
  final: ArrayItem[];
  /** 안전 한도 때문에 정렬을 끝내지 못했는지 (보고 정렬) */
  truncated: boolean;
};

export type Complexity = {
  best: string;
  average: string;
  worst: string;
  space: string;
};

export type SortAlgorithm = {
  id: string;
  name: string;
  category: AlgorithmCategory;
  desc: string;
  complexity: Complexity;
  stable: boolean;
  /** 정보 카드에 강조해 보여줄 주의 사항 (예: 큰 배열에서 끝나지 않음) */
  note?: string;
  /** 화면에 보여줄 설명용 코드 */
  code: string;
  /** 기록할 연산을 tracer에 남긴다. 한도 초과로 중단하면 true 반환. */
  sort: (t: Tracer, options: SortOptions) => boolean | void;
};
