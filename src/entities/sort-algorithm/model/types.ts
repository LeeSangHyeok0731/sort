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
  /** 화면에 보여줄 설명 코드 (defineCode로 만든다. 실제 기록 방식과 1:1로 같아야 한다) */
  code: string;
  /**
   * 설명 코드의 줄 번호 → 표식 이름.
   * 이 알고리즘이 기록하는 모든 연산에 그 연산을 만든 줄 번호가 붙는다 (줄 하이라이트).
   */
  codeLabels: ReadonlyMap<number, string>;
  /** 기록할 연산을 tracer에 남긴다. 한도 초과로 중단하면 true 반환. */
  sort: (t: Tracer, options: SortOptions) => boolean | void;
};
