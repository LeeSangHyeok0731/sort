import { SortStep, ArrayItem } from "@/types/sort";

export function bogoSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const MAX_ITERATIONS = 5000; // Safety limit
  let iterations = 0;

  function isSorted(arr: ArrayItem[]): boolean {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].value > arr[i + 1].value) return false;
    }
    return true;
  }

  function shuffle(arr: ArrayItem[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  while (!isSorted(a) && iterations < MAX_ITERATIONS) {
    shuffle(a);
    steps.push({
      array: [...a],
      swap: Array.from({ length: a.length }, (_, i) => i),
    });
    iterations++;
  }

  steps.push({ array: [...a] });
  return steps;
}
