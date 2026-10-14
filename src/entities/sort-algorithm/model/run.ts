import type { ArrayItem } from "@/shared/model";
import { Tracer } from "./tracer";
import type { SortAlgorithm, SortOptions, SortResult } from "./types";

export function runSort(
  algorithm: Pick<SortAlgorithm, "sort">,
  input: readonly ArrayItem[],
  options: SortOptions = {}
): SortResult {
  const t = new Tracer(input);
  const truncated = algorithm.sort(t, options) === true;
  return { ops: t.ops, final: t.snapshot(), truncated };
}
