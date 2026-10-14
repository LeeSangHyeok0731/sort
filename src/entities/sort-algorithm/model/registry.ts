import { binaryInsertionSort } from "../algorithms/binaryInsertionSort";
import { bitonicSort } from "../algorithms/bitonicSort";
import { bogoSort } from "../algorithms/bogoSort";
import { bozoSort } from "../algorithms/bozoSort";
import { bubbleSort } from "../algorithms/bubbleSort";
import { bucketSort } from "../algorithms/bucketSort";
import { circleSort } from "../algorithms/circleSort";
import { cocktailSort } from "../algorithms/cocktailSort";
import { combSort } from "../algorithms/combSort";
import { countingSort } from "../algorithms/countingSort";
import { cycleSort } from "../algorithms/cycleSort";
import { dualPivotQuickSort } from "../algorithms/dualPivotQuickSort";
import { gnomeSort } from "../algorithms/gnomeSort";
import { heapSort } from "../algorithms/heapSort";
import { insertionSort } from "../algorithms/insertionSort";
import { introSort } from "../algorithms/introSort";
import { mergeSort } from "../algorithms/mergeSort";
import { miracleSort } from "../algorithms/miracleSort";
import { msdRadixSort } from "../algorithms/msdRadixSort";
import { oddEvenMergeSort } from "../algorithms/oddEvenMergeSort";
import { oddEvenSort } from "../algorithms/oddEvenSort";
import { pancakeSort } from "../algorithms/pancakeSort";
import { quickSort } from "../algorithms/quickSort";
import { radixSort } from "../algorithms/radixSort";
import { selectionSort } from "../algorithms/selectionSort";
import { shellSort } from "../algorithms/shellSort";
import { slowSort } from "../algorithms/slowSort";
import { smoothSort } from "../algorithms/smoothSort";
import { stoogeSort } from "../algorithms/stoogeSort";
import { threeWayQuickSort } from "../algorithms/threeWayQuickSort";
import { timSort } from "../algorithms/timSort";
import { treeSort } from "../algorithms/treeSort";
import type { AlgorithmCategory, SortAlgorithm } from "./types";

/** 새 알고리즘은 여기 한 곳에만 추가하면 된다. 분류 안에서는 이 순서대로 표시된다. */
export const ALGORITHMS = [
  // 기본 정렬
  bubbleSort,
  selectionSort,
  insertionSort,
  binaryInsertionSort,
  quickSort,
  threeWayQuickSort,
  dualPivotQuickSort,
  mergeSort,
  heapSort,
  shellSort,
  cycleSort,
  // 비교 없는 정렬
  countingSort,
  radixSort,
  msdRadixSort,
  bucketSort,
  // 특이한 정렬
  timSort,
  introSort,
  smoothSort,
  combSort,
  cocktailSort,
  gnomeSort,
  oddEvenSort,
  pancakeSort,
  bitonicSort,
  oddEvenMergeSort,
  circleSort,
  treeSort,
  // 재미있는 정렬
  bogoSort,
  bozoSort,
  stoogeSort,
  slowSort,
  miracleSort,
] as const satisfies readonly SortAlgorithm[];

export type AlgorithmId = (typeof ALGORITHMS)[number]["id"];

export const DEFAULT_ALGORITHM_ID: AlgorithmId = "bubble";

export const CATEGORIES: ReadonlyArray<{ id: AlgorithmCategory; name: string }> = [
  { id: "standard", name: "기본 정렬" },
  { id: "linear", name: "비교 없는 정렬" },
  { id: "special", name: "특이한 정렬" },
  { id: "fun", name: "재미있는 정렬" },
];

const byId = new Map<string, SortAlgorithm>(ALGORITHMS.map((a) => [a.id, a]));

export function isAlgorithmId(id: string | null | undefined): id is AlgorithmId {
  return id != null && byId.has(id);
}

export function getAlgorithm(id: AlgorithmId): SortAlgorithm {
  return byId.get(id)!;
}
