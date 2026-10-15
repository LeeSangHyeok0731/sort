import type { ArrayItem } from "@/shared/model";
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";
import { insertionSortRange } from "./insertionSort";

const CODE = defineCode(`function bucketSort(arr, bucketCount = Math.floor(Math.sqrt(arr.length))) {
  const n = arr.length;
  if (n < 2) return arr;
  const min = Math.min(...arr), max = Math.max(...arr);
  const k = Math.max(1, bucketCount);
  // 1) 값의 범위를 k칸으로 나눠 버킷에 담는다
  const buckets = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) {
    const x = arr[i]; //@read
    const b = Math.min(k - 1, Math.floor(((x - min) / (max - min || 1)) * k));
    buckets[b].push(x);
  }
  // 2) 버킷 순서대로 원소를 꺼내 제자리에 끼워 넣는다
  const order = buckets.flat();
  for (let p = 0; p < n; p++) {
    const from = arr.indexOf(order[p], p);
    arr.splice(p, 0, ...arr.splice(from, 1)); //@move
  }
  // 3) 각 버킷 구간을 삽입 정렬
  let start = 0;
  for (const bucket of buckets) {
    for (let i = start + 1; i < start + bucket.length; i++) {
      for (let j = i; j > start && arr[j - 1] > arr[j]; j--) { //@cmp
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]; //@swap
      }
    }
    start += bucket.length;
  }
  return arr;
}`);

const L = { read: CODE.line("read"), move: CODE.line("move"), cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const bucketSort: SortAlgorithm = {
  id: "bucket",
  name: "버킷 정렬",
  category: "linear",
  desc: "범위별 버킷에 담아 정렬",
  complexity: {
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n²)",
    space: "O(n + k)",
  },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  structure: { kind: "buckets" },
  sort(t, { bucketCount }) {
    const n = t.length;
    if (n < 2) return;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      min = Math.min(min, t.value(i));
      max = Math.max(max, t.value(i));
    }

    const k = Math.max(1, Math.floor(bucketCount ?? Math.sqrt(n)));
    const buckets: ArrayItem[][] = Array.from({ length: k }, () => []);
    for (let i = 0; i < n; i++) {
      t.mark(i, L.read);
      const b = Math.min(k - 1, Math.floor(((t.value(i) - min) / (max - min || 1)) * k));
      buckets[b].push(t.item(i));
    }

    t.arrange(0, buckets.flat(), L.move);
    let start = 0;
    for (const bucket of buckets) {
      insertionSortRange(t, start, start + bucket.length - 1, L);
      start += bucket.length;
    }
  },
};
