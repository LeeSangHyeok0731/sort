import { SortStep, ArrayItem } from "@/types/sort";

export function quickSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function partition(low: number, high: number) {
    const pivot = a[high].value;
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...a],
        compare: [j, high],
      });
      if (a[j].value < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({
          array: [...a],
          swap: [i, j],
        });
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({
      array: [...a],
      swap: [i + 1, high],
    });
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  sort(0, a.length - 1);
  return steps;
}
