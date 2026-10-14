import { ALGORITHMS } from "./registry";
import type { SortAlgorithm } from "./types";

/** 공백·대소문자·하이픈 차이를 무시하고 비교하기 위한 정규화 */
function normalize(text: string) {
  return text.toLowerCase().replace(/[\s\-_·]/g, "");
}

/**
 * 이름·설명·id에 검색어가 포함된 알고리즘을 찾는다.
 * 이름에서 맞은 것을 설명에서만 맞은 것보다 앞에 둔다.
 */
export function searchAlgorithms(query: string): SortAlgorithm[] {
  const q = normalize(query);
  if (!q) return [];
  const byName: SortAlgorithm[] = [];
  const byOther: SortAlgorithm[] = [];
  for (const algorithm of ALGORITHMS) {
    if (normalize(algorithm.name).includes(q) || normalize(algorithm.id).includes(q)) {
      byName.push(algorithm);
    } else if (normalize(algorithm.desc).includes(q)) {
      byOther.push(algorithm);
    }
  }
  return [...byName, ...byOther];
}
