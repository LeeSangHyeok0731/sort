import { describe, expect, it } from "vitest";
import { defineCode, opTypeOfLabel } from "./code-lines";
import { OpType } from "./op";

const source = `function f(arr) {
  if (arr[0] > arr[1]) { //@cmp
    swap(arr, 0, 1); //@swap-first
  }
  return arr;   //@read
}`;

describe("defineCode", () => {
  it("표식을 지운 코드를 만든다", () => {
    const code = defineCode(source);
    expect(code.code).not.toContain("//@");
    expect(code.code.split("\n")[1]).toBe("  if (arr[0] > arr[1]) {");
    expect(code.code.split("\n")[4]).toBe("  return arr;");
  });

  it("표식 이름으로 1부터 시작하는 줄 번호를 찾는다", () => {
    const code = defineCode(source);
    expect(code.line("cmp")).toBe(2);
    expect(code.line("swap-first")).toBe(3);
    expect(code.labels.get(5)).toBe("read");
    expect(code.labels.get(1)).toBeUndefined();
  });

  it("없는 표식을 찾으면 바로 오류", () => {
    expect(() => defineCode(source).line("nope")).toThrow(/nope/);
  });

  it("같은 표식이 두 번 있으면 오류", () => {
    expect(() => defineCode("a //@cmp\nb //@cmp")).toThrow(/cmp/);
  });
});

describe("opTypeOfLabel", () => {
  it("표식 접두어로 연산 종류를 정한다", () => {
    expect(opTypeOfLabel("cmp-left")).toBe(OpType.Compare);
    expect(opTypeOfLabel("swap")).toBe(OpType.Swap);
    expect(opTypeOfLabel("move")).toBe(OpType.Move);
    expect(opTypeOfLabel("read-digit")).toBe(OpType.Mark);
    expect(opTypeOfLabel("other")).toBeUndefined();
  });
});
