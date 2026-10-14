import { describe, expect, it } from "vitest";
import { randomValues, toItems } from "../testing/sortSuite";
import { opTypeOfLabel } from "./code-lines";
import { opCount, readOp } from "./op";
import { ALGORITHMS } from "./registry";
import { runSort } from "./run";
import type { SortAlgorithm } from "./types";

const TRACED = ALGORITHMS.filter((a) => a.codeLabels.size > 0);

const sorted = (n: number) => Array.from({ length: n }, (_, i) => i);
const reversed = (n: number) => Array.from({ length: n }, (_, i) => n - i);

/** 표식이 모두 한 번 이상 실행되도록 다양한 입력 (정렬됨·역순·중복·무작위·큰 패턴) */
const INPUTS: number[][] = [
  [5, 1, 4, 2, 8, 0, 2, 9, 3, 3, 7],
  reversed(20),
  sorted(12),
  ...[3, 8, 17, 33, 64].map((n, seed) => randomValues(n, 6, seed + 70)),
  ...[5, 16, 40].map((n, seed) => randomValues(n, 9999, seed + 80)),
  // 큰 입력: 하이브리드 알고리즘의 분기(삽입 정렬 전환, 힙 정렬 전환, 블록 병합 등)
  sorted(300),
  reversed(300),
  randomValues(300, 9999, 90),
  randomValues(300, 4, 91),
  [...sorted(150), ...reversed(150)],
  Array(200).fill(7),
];

/** 재미있는 정렬은 무작위·폭발적이라 작은 입력만 */
const SMALL_INPUTS: number[][] = [[3, 1, 2], [4, 3, 2, 1], [2, 1, 2, 1], [1, 2, 3], [2, 1]];

/**
 * 특별한 입력에서만 실행되는 표식. "모든 표식이 실행된다" 검사에서 제외한다.
 * (구현에는 있어야 하지만 일반적인 테스트 입력으로는 거의 닿지 않는 안전장치)
 */
const RARE_LABELS: Record<string, string[]> = {
  // 나쁜 분할이 log n번 반복될 때만 힙 정렬로 전환
  pdq: ["cmp-heap-left", "cmp-heap-right", "swap-heap-down", "swap-heap-root"],
};

function inputsFor(algorithm: SortAlgorithm) {
  return algorithm.category === "fun" ? SMALL_INPUTS : INPUTS;
}

describe("코드 줄 하이라이트", () => {
  it("모든 알고리즘이 줄 정보를 가진다", () => {
    expect(TRACED).toHaveLength(ALGORITHMS.length);
  });

  describe.each(TRACED.map((a) => [a.id, a] as const))("%s", (_, algorithm) => {
    const labels = algorithm.codeLabels!;
    const lineCount = algorithm.code.split("\n").length;

    it("모든 표식이 코드 범위 안의 줄이고 종류를 알 수 있다", () => {
      for (const [line, label] of labels) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(lineCount);
        expect(opTypeOfLabel(label), label).toBeDefined();
      }
    });

    it("기록한 모든 연산에 줄이 있고, 그 줄의 표식 종류가 연산 종류와 같다", () => {
      // 연산이 수십만 개일 수 있어 expect는 루프 밖에서 한 번만 호출한다
      const used = new Set<string>();
      let firstProblem: string | null = null;
      for (const values of inputsFor(algorithm)) {
        const { ops } = runSort(algorithm, toItems(values));
        for (let k = 0; k < opCount(ops) && !firstProblem; k++) {
          const op = readOp(ops, k);
          const label = labels.get(op.line);
          if (label === undefined) firstProblem = `연산 #${k} (종류 ${op.type})에 줄 표식이 없음 (줄 ${op.line})`;
          else if (opTypeOfLabel(label) !== op.type)
            firstProblem = `줄 ${op.line} "${label}"에서 종류 ${op.type} 연산이 기록됨`;
          else used.add(label);
        }
      }
      expect(firstProblem).toBeNull();
      // 한 번도 실행되지 않는 표식은 코드와 구현이 어긋났다는 신호
      const rare = new Set(RARE_LABELS[algorithm.id] ?? []);
      const expected = [...labels.values()].filter((l) => !rare.has(l)).sort();
      expect([...used].filter((l) => !rare.has(l)).sort()).toEqual(expected);
    });
  });
});
