import type { ArrayItem } from "@/shared/model";
import { MAX_OPS, OpBudgetExceeded, Tracer } from "./tracer";
import type { SortAlgorithm, SortOptions, SortResult } from "./types";

export function runSort(
  algorithm: Pick<SortAlgorithm, "sort">,
  input: readonly ArrayItem[],
  options: SortOptions = {},
  { maxOps = MAX_OPS }: { maxOps?: number } = {}
): SortResult {
  const t = new Tracer(input, maxOps);
  let truncated: boolean;
  try {
    truncated = algorithm.sort(t, options) === true;
  } catch (e) {
    if (!(e instanceof OpBudgetExceeded)) throw e;
    truncated = true;
  }
  // 일반 배열(원소당 8바이트 + 증가 여유분) → Int32Array(원소당 4바이트)로 압축
  return { ops: Int32Array.from(t.ops), final: t.snapshot(), truncated };
}
