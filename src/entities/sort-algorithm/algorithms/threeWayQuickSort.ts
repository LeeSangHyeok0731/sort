import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const threeWayQuickSort: SortAlgorithm = {
  id: "quick3",
  name: "3-way 퀵 정렬",
  category: "standard",
  desc: "피벗보다 작음·같음·큼 세 구역으로 분할",
  complexity: {
    best: "O(n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
  },
  stable: false,
  code: ALGO_CODE.quick3,
  sort(t) {
    const stack: Array<[number, number]> = [[0, t.length - 1]];
    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;
      if (lo >= hi) continue;

      // 가운데 원소를 피벗으로 (정렬된 입력에서 최악을 피함)
      t.swap(lo, lo + Math.floor((hi - lo) / 2));

      // 불변식: [lo, lt) < 피벗, [lt, i) == 피벗, (gt, hi] > 피벗
      // 피벗과 같은 값이 항상 a[lt]에 있으므로 a[lt]와 비교한다
      let lt = lo;
      let gt = hi;
      let i = lo + 1;
      while (i <= gt) {
        const c = t.cmp(i, lt);
        if (c < 0) t.swap(lt++, i++);
        else if (c > 0) t.swap(i, gt--);
        else i++;
      }
      stack.push([gt + 1, hi], [lo, lt - 1]);
    }
  },
};
