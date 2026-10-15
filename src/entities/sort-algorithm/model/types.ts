import type { ArrayItem } from "@/shared/model";
import type { Tracer } from "./tracer";

export type AlgorithmCategory = "standard" | "linear" | "special" | "fun";

/**
 * 구조 보기 형태.
 * - heap: 배열 자체가 arity진 힙. 정렬이 진행되며 뒤쪽부터 힙에서 빠진다.
 *   heapEndLabel 줄이 실행될 때마다 힙 크기가 하나씩 줄어든다.
 * - bst: 입력 순서대로 이진 검색 트리에 넣은 뒤(같은 값은 오른쪽) 중위 순회 순서로 배치.
 */
export type AlgorithmStructure =
  | { kind: "heap"; arity: 2 | 3; heapEndLabel: string }
  | { kind: "bst" }
  /** 트리 모양 (배열 밖에서 만드는 트리) */
  | { kind: "splay" | "cartesian" | "tournament" }
  /** 칸 모양 (더미·버킷·값·자릿수) */
  | { kind: "piles" | "buckets" | "counting" | "radix" };

export type SortOptions = {
  /** 셸 정렬 간격 수열 (비어 있으면 n/2, n/4, ...) */
  shellGaps?: number[];
  /** 버킷 정렬 버킷 수 */
  bucketCount?: number;
};

export type SortResult = {
  /** 연산 로그 [type, a, b, line, ...] (워커에서 복사 없이 넘길 수 있도록 Int32Array) */
  ops: Int32Array;
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
  /** 막대 대신 구조(트리 등)로도 보여줄 수 있으면 그 형태 */
  structure?: AlgorithmStructure;
  /** 기록할 연산을 tracer에 남긴다. 한도 초과로 중단하면 true 반환. */
  sort: (t: Tracer, options: SortOptions) => boolean | void;
};
