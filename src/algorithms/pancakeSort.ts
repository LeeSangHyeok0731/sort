import { SortStep, ArrayItem } from "@/types/sort";

export function pancakeSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let n = a.length;

  function flip(idx: number) {
    let start = 0;
    const indicesToHighlight = Array.from({ length: idx + 1 }, (_, i) => i);
    while (start < idx) {
      [a[start], a[idx]] = [a[idx], a[start]];
      steps.push({ array: [...a], swap: [start, idx] });
      start++;
      idx--;
    }
  }

  for (let currSize = n; currSize > 1; currSize--) {
    let maxIdx = 0;
    for (let i = 1; i < currSize; i++) {
      steps.push({ array: [...a], compare: [i, maxIdx] });
      if (a[i].value > a[maxIdx].value) {
        maxIdx = i;
      }
    }

    if (maxIdx !== currSize - 1) {
      if (maxIdx !== 0) {
        flip(maxIdx);
      }
      flip(currSize - 1);
    }
  }

  steps.push({ array: [...a] });
  return steps;
}
