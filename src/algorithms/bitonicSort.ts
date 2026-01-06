import { SortStep, ArrayItem } from "@/types/sort";

/**
 * Bitonic Sort implementation for arbitrary N.
 * Note: Bitonic sort is ideally suited for N as a power of 2.
 * For arbitrary N, we use a slightly modified recursive split.
 */
export function bitonicSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const n = a.length;

  if (n <= 1) return [{ array: [...a] }];

  function compareAndSwap(i: number, j: number, dir: boolean) {
    if (i >= n || j >= n) return;

    steps.push({ array: [...a], compare: [i, j] });

    // dir true: ascending, dir false: descending
    if ((dir && a[i].value > a[j].value) || (!dir && a[i].value < a[j].value)) {
      [a[i], a[j]] = [a[j], a[i]];
      steps.push({ array: [...a], swap: [i, j] });
    }
  }

  function bitonicMerge(low: number, cnt: number, dir: boolean) {
    if (cnt > 1) {
      // Find the greatest power of 2 less than cnt
      let k = 1;
      while (k < cnt) k <<= 1;
      k >>= 1;

      for (let i = low; i < low + cnt - k; i++) {
        compareAndSwap(i, i + k, dir);
      }
      bitonicMerge(low, k, dir);
      bitonicMerge(low + k, cnt - k, dir);
    }
  }

  function bitonicSortRecursive(low: number, cnt: number, dir: boolean) {
    if (cnt > 1) {
      const mid = Math.floor(cnt / 2);

      // Build bitonic sequence
      // Sort first half in one direction, second half in opposite
      bitonicSortRecursive(low, mid, !dir);
      bitonicSortRecursive(low + mid, cnt - mid, dir);

      // Merge the whole sequence in target direction
      bitonicMerge(low, cnt, dir);
    }
  }

  // Sort the entire array in ascending order
  bitonicSortRecursive(0, n, true);

  // Final state
  steps.push({ array: [...a] });
  return steps;
}
