import { OpType } from "./op";

/** 줄 끝 표식: `//@cmp`, `//@swap-root` 처럼 쓴다 */
const MARKER = /\s*\/\/@([\w-]+)\s*$/;

export type TracedCode = {
  /** 표식을 지운, 화면에 보여줄 코드 */
  code: string;
  /** 줄 번호(1부터) → 표식 이름 */
  labels: ReadonlyMap<number, string>;
  /** 표식 이름 → 줄 번호. 없으면 오류 (오타를 모듈 로드 시점에 잡는다) */
  line: (label: string) => number;
};

/**
 * 줄 하이라이트용 설명 코드를 정의한다.
 * 알고리즘은 연산을 기록할 때 `code.line("cmp")` 같은 줄 번호를 함께 넘긴다.
 */
export function defineCode(source: string): TracedCode {
  const labels = new Map<number, string>();
  const lineOf = new Map<string, number>();
  const lines = source.split("\n").map((text, index) => {
    const match = text.match(MARKER);
    if (!match) return text;
    const label = match[1];
    if (lineOf.has(label)) throw new Error(`설명 코드에 표식 "${label}"이 두 번 있습니다.`);
    lineOf.set(label, index + 1);
    labels.set(index + 1, label);
    return text.slice(0, match.index).trimEnd();
  });

  return {
    code: lines.join("\n"),
    labels,
    line(label) {
      const line = lineOf.get(label);
      if (line === undefined) throw new Error(`설명 코드에 표식 "${label}"이 없습니다.`);
      return line;
    },
  };
}

/** 표식 이름 접두어로 그 줄에서 일어나야 할 연산 종류를 정한다 */
export function opTypeOfLabel(label: string): OpType | undefined {
  if (label.startsWith("cmp")) return OpType.Compare;
  if (label.startsWith("swap")) return OpType.Swap;
  if (label.startsWith("move")) return OpType.Move;
  if (label.startsWith("read")) return OpType.Mark;
  return undefined;
}
