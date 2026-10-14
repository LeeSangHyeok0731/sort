import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function quantumBogoSort(arr) {
  // 양자 난수로 한 번 섞는다
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; //@swap
  }
  // 다세계 해석: 가능한 모든 섞임이 각자의 우주에서 일어났다.
  // 정렬되지 않은 우주는 파괴한다. 살아남은 우주의 배열은 정렬돼 있다.
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) destroyUniverse(); //@cmp
  }
  return arr;
}

function destroyUniverse() {
  throw new Error("💥 이 우주는 정렬에 실패했습니다");
}`);

const L = { swap: CODE.line("swap"), cmp: CODE.line("cmp") };

export const quantumBogoSort: SortAlgorithm = {
  id: "quantumBogo",
  name: "퀀텀 보고 정렬",
  category: "fun",
  desc: "한 번 섞고, 실패하면 이 우주를 파괴",
  complexity: { best: "O(n)", average: "O(n)", worst: "O(n)", space: "O(1)" },
  stable: false,
  note: "다세계 해석에 따르면 정렬된 우주 하나는 반드시 살아남아요. 이 우주는 아마 아닐 겁니다.",
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    const n = t.length;
    for (let i = n - 1; i > 0; i--) {
      t.swap(i, Math.floor(Math.random() * (i + 1)), L.swap);
    }
    for (let i = 0; i < n - 1; i++) {
      // 정렬되지 않은 우주는 파괴된다 💥 (= 미완료)
      if (t.cmp(i, i + 1, L.cmp) > 0) return true;
    }
  },
};
