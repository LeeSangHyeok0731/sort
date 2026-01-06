import { SortStep, ArrayItem } from "@/types/sort";

export function mergeSortSteps(arr: ArrayItem[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];

  function merge(l: number, m: number, r: number) {
    const temp = a.slice(l, r + 1);
    let i = 0;
    let j = m - l + 1;
    let k = l;

    const n1 = m - l + 1;
    const n2 = r - l + 1;

    const sortedTemp = [];
    let ti = 0,
      tj = m - l + 1;

    while (ti < n1 && tj < n2) {
      steps.push({ array: [...a], compare: [l + ti, l + tj] });
      if (temp[ti].value <= temp[tj].value) {
        sortedTemp.push(temp[ti++]);
      } else {
        sortedTemp.push(temp[tj++]);
      }
    }
    while (ti < n1) sortedTemp.push(temp[ti++]);
    while (tj < n2) sortedTemp.push(temp[tj++]);

    // Now, instead of just overwriting, we find where the item is and swap it
    // to preserve uniqueness and IDs
    for (let x = 0; x < sortedTemp.length; x++) {
      const targetItem = sortedTemp[x];
      // Find where this item is CURRENTLY in our working array 'a'
      const currentIdx = a.findIndex((item) => item.id === targetItem.id);
      if (currentIdx !== -1 && currentIdx !== l + x) {
        [a[l + x], a[currentIdx]] = [a[currentIdx], a[l + x]];
        steps.push({ array: [...a], swap: [l + x, currentIdx] });
      }
    }
  }

  function sort(l: number, r: number) {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      sort(l, m);
      sort(m + 1, r);
      merge(l, m, r);
    }
  }

  sort(0, a.length - 1);
  return steps;
}
