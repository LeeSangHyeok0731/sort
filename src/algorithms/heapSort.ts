import { SortStep, ArrayItem } from "@/types/sort";

export function heapSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function heapify(n: number, i: number) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n) {
      steps.push({ array: [...a], compare: [l, largest] });
      if (a[l].value > a[largest].value) largest = l;
    }

    if (r < n) {
      steps.push({ array: [...a], compare: [r, largest] });
      if (a[r].value > a[largest].value) largest = r;
    }

    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({ array: [...a], swap: [i, largest] });
      heapify(n, largest);
    }
  }

  // Build heap
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
    heapify(a.length, i);
  }

  // Extract elements
  for (let i = a.length - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    steps.push({ array: [...a], swap: [0, i] });
    heapify(i, 0);
  }

  return steps;
}
