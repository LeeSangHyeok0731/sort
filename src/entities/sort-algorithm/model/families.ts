import type { AlgorithmId } from "./registry";

export type AlgorithmFamily =
  | "exchange"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap"
  | "tree"
  | "distribution"
  | "network"
  | "hybrid"
  | "fun";

/** 선택 사이드바의 폴더 구성. 순서대로 보여준다. */
export const FAMILIES: ReadonlyArray<{ id: AlgorithmFamily; name: string; ids: readonly AlgorithmId[] }> = [
  { id: "exchange", name: "교환 정렬", ids: ["bubble", "cocktail", "comb", "gnome", "oddEven", "exchange", "circle"] },
  { id: "selection", name: "선택 정렬", ids: ["selection", "doubleSelection", "cycle", "pancake"] },
  { id: "insertion", name: "삽입 정렬", ids: ["insertion", "binaryInsertion", "shell", "mergeInsertion"] },
  { id: "merge", name: "병합 정렬", ids: ["merge", "bottomUpMerge", "naturalMerge", "strand", "patience"] },
  { id: "quick", name: "퀵 정렬", ids: ["quick", "quick3", "hoareQuick", "dualPivot"] },
  { id: "heap", name: "힙 정렬", ids: ["heap", "ternaryHeap", "bottomUpHeap", "weakHeap", "smooth"] },
  { id: "tree", name: "트리 정렬", ids: ["tree", "splay", "cartesian", "tournament"] },
  {
    id: "distribution",
    name: "비교 없는 정렬",
    ids: ["counting", "radix", "msdRadix", "radixExchange", "bucket", "pigeonhole", "spread", "americanFlag", "flash"],
  },
  { id: "network", name: "정렬 네트워크", ids: ["bitonic", "oddEvenMerge", "pairwise"] },
  { id: "hybrid", name: "하이브리드", ids: ["tim", "intro", "pdq", "block", "grail"] },
  {
    id: "fun",
    name: "재미있는 정렬",
    ids: ["bogo", "bogobogo", "bozo", "quantumBogo", "miracle", "permutation", "stooge", "slow"],
  },
];

const familyOf = new Map<AlgorithmId, AlgorithmFamily>(
  FAMILIES.flatMap((f) => f.ids.map((id) => [id, f.id] as const))
);

export function getFamily(id: AlgorithmId): AlgorithmFamily {
  return familyOf.get(id)!;
}
