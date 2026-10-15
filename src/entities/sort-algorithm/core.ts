/**
 * UI 없는 공개 API. Web Worker처럼 React·CSS를 불러오면 안 되는 곳에서 쓴다.
 * (index.ts는 이 모듈과 UI 컴포넌트를 함께 내보낸다)
 */
export {
  ALGORITHMS,
  CATEGORIES,
  DEFAULT_ALGORITHM_ID,
  getAlgorithm,
  isAlgorithmId,
  type AlgorithmId,
} from "./model/registry";
export { applyOp, opCount, OpType, OP_STRIDE, readOp, revertOp, type Op, type OpLog } from "./model/op";
export { runSort } from "./model/run";
export { searchAlgorithms } from "./model/search";
export type {
  AlgorithmCategory,
  AlgorithmStructure,
  Complexity,
  SortAlgorithm,
  SortOptions,
  SortResult,
} from "./model/types";
