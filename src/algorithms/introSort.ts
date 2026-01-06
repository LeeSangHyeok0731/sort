import { SortStep, ArrayItem } from "@/types/sort";

export function introSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  const n = a.length;

  function insertionSort(left: number, right: number) {
    for (let i = left + 1; i <= right; i++) {
      let j = i;
      while (j > left) {
        steps.push({ array: [...a], compare: [j - 1, j] });
        if (a[j].value < a[j - 1].value) {
          [a[j], a[j - 1]] = [a[j - 1], a[j]];
          steps.push({ array: [...a], swap: [j, j - 1] });
          j--;
        } else {
          break;
        }
      }
    }
  }

  function heapify(size: number, i: number, offset: number) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < size) {
      steps.push({ array: [...a], compare: [offset + l, offset + largest] });
      if (a[offset + l].value > a[offset + largest].value) {
        largest = l;
      }
    }

    if (r < size) {
      steps.push({ array: [...a], compare: [offset + r, offset + largest] });
      if (a[offset + r].value > a[offset + largest].value) {
        largest = r;
      }
    }

    if (largest !== i) {
      [a[offset + i], a[offset + largest]] = [
        a[offset + largest],
        a[offset + i],
      ];
      steps.push({ array: [...a], swap: [offset + i, offset + largest] });
      heapify(size, largest, offset);
    }
  }

  function heapSort(left: number, right: number) {
    const size = right - left + 1;
    for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
      heapify(size, i, left);
    }
    for (let i = size - 1; i > 0; i--) {
      [a[left], a[left + i]] = [a[left + i], a[left]];
      steps.push({ array: [...a], swap: [left, left + i] });
      heapify(i, 0, left);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = a[high].value;
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: [...a], compare: [j, high] });
      if (a[j].value < pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ array: [...a], swap: [i, j] });
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    steps.push({ array: [...a], swap: [i + 1, high] });
    return i + 1;
  }

  function introSortRecursive(low: number, high: number, depthLimit: number) {
    const size = high - low + 1;
    if (size < 16) {
      insertionSort(low, high);
      return;
    }
    if (depthLimit === 0) {
      heapSort(low, high);
      return;
    }
    const p = partition(low, high);
    introSortRecursive(low, p - 1, depthLimit - 1);
    introSortRecursive(p + 1, high, depthLimit - 1);
  }

  const depthLimit = 2 * Math.floor(Math.log2(n || 1));
  introSortRecursive(0, n - 1, depthLimit);

  steps.push({ array: [...a] });
  return steps;
}
