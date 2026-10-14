import type { SortAlgorithm } from "../model/types";
import { ALGO_CODE } from "./code";

export const quantumBogoSort: SortAlgorithm = {
  id: "quantumBogo",
  name: "퀀텀 보고 정렬",
  category: "fun",
  desc: "한 번 섞고, 실패하면 이 우주를 파괴",
  complexity: { best: "O(n)", average: "O(n)", worst: "O(n)", space: "O(1)" },
  stable: false,
  note: "다세계 해석에 따르면 정렬된 우주 하나는 반드시 살아남아요. 이 우주는 아마 아닐 겁니다.",
  code: ALGO_CODE.quantumBogo,
  sort(t) {
    const n = t.length;
    for (let i = n - 1; i > 0; i--) {
      t.swap(i, Math.floor(Math.random() * (i + 1)));
    }
    for (let i = 0; i < n - 1; i++) {
      // 정렬되지 않은 우주는 파괴된다 💥 (= 미완료)
      if (t.cmp(i, i + 1) > 0) return true;
    }
  },
};
