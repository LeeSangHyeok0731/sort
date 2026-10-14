import { describe, expect, it } from "vitest";
import { randomValues, toItems } from "../testing/sortSuite";
import { opTypeOfLabel } from "./code-lines";
import { opCount, readOp } from "./op";
import { ALGORITHMS } from "./registry";
import { runSort } from "./run";

const TRACED = ALGORITHMS.filter((a) => a.codeLabels);

/** 표식이 모두 한 번 이상 실행되도록 다양한 입력 (정렬됨·역순·중복·무작위) */
const INPUTS: number[][] = [
  [5, 1, 4, 2, 8, 0, 2, 9, 3, 3, 7],
  Array.from({ length: 20 }, (_, i) => 20 - i),
  Array.from({ length: 12 }, (_, i) => i),
  ...[3, 8, 17, 33, 64].map((n, seed) => randomValues(n, 6, seed + 70)),
  ...[5, 16, 40].map((n, seed) => randomValues(n, 9999, seed + 80)),
];

describe("코드 줄 하이라이트", () => {
  it("1차 지원 대상 12종이 모두 줄 정보를 가진다", () => {
    expect(TRACED.map((a) => a.id).sort()).toEqual(
      ["binaryInsertion", "bubble", "cocktail", "comb", "cycle", "gnome", "heap", "insertion", "merge", "quick", "selection", "shell"].sort()
    );
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
      const used = new Set<string>();
      for (const values of INPUTS) {
        const { ops } = runSort(algorithm, toItems(values));
        for (let k = 0; k < opCount(ops); k++) {
          const op = readOp(ops, k);
          const label = labels.get(op.line);
          expect(label, `연산 #${k} (종류 ${op.type})에 줄 표식이 없음`).toBeDefined();
          expect(opTypeOfLabel(label!), `줄 ${op.line} "${label}"`).toBe(op.type);
          used.add(label!);
        }
      }
      // 한 번도 실행되지 않는 표식은 코드와 구현이 어긋났다는 신호
      expect([...used].sort()).toEqual([...labels.values()].sort());
    });
  });
});
