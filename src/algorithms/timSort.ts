import { SortStep, ArrayItem } from "@/types/sort";

const MIN_MERGE = 32;

function minRunLength(n: number): number {
  let r = 0;
  while (n >= MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}

export function timSortSteps(arr: ArrayItem[]): SortStep[] {
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

  function merge(l: number, m: number, r: number) {
    const len1 = m - l + 1;
    const len2 = r - m;
    const leftArr = a.slice(l, m + 1);
    const rightArr = a.slice(m + 1, r + 1);

    let i = 0,
      j = 0,
      k = l;
    const tempResult: ArrayItem[] = [];

    while (i < len1 && j < len2) {
      steps.push({ array: [...a], compare: [l + i, m + 1 + j] });
      if (leftArr[i].value <= rightArr[j].value) {
        tempResult.push(leftArr[i]);
        i++;
      } else {
        tempResult.push(rightArr[j]);
        j++;
      }
    }
    while (i < len1) {
      tempResult.push(leftArr[i]);
      i++;
    }
    while (j < len2) {
      tempResult.push(rightArr[j]);
      j++;
    }

    // Update 'a' using find-and-swap
    for (let idx = 0; idx < tempResult.length; idx++) {
      const targetItem = tempResult[idx];
      const currentIdx = a.findIndex((item) => item.id === targetItem.id);
      if (currentIdx !== -1 && currentIdx !== l + idx) {
        [a[l + idx], a[currentIdx]] = [a[currentIdx], a[l + idx]];
        steps.push({ array: [...a], swap: [l + idx, currentIdx] });
      }
    }
  }

  const minRun = minRunLength(n);

  for (let i = 0; i < n; i += minRun) {
    insertionSort(i, Math.min(i + minRun - 1, n - 1));
  }

  for (let size = minRun; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) {
        merge(left, mid, right);
      }
    }
  }

  return steps;
}
