import { describe, expect, it } from "vitest";
import { ALGORITHMS } from "./registry";
import { searchAlgorithms } from "./search";

const ids = (query: string) => searchAlgorithms(query).map((a) => a.id);

describe("searchAlgorithms", () => {
  it("빈 검색어는 결과가 없다", () => {
    expect(ids("")).toEqual([]);
    expect(ids("   ")).toEqual([]);
  });

  it("이름의 일부로 찾는다", () => {
    expect(ids("퀵")).toEqual(expect.arrayContaining(["quick", "quick3", "dualPivot", "hoareQuick"]));
  });

  it("공백·대소문자·하이픈을 무시한다", () => {
    expect(ids("3way")).toContain("quick3");
    expect(ids("PDQ")).toContain("pdq");
    expect(ids("힙정렬")).toEqual(expect.arrayContaining(["heap", "ternaryHeap", "bottomUpHeap", "weakHeap"]));
  });

  it("영문 id로도 찾는다", () => {
    expect(ids("smooth")).toEqual(["smooth"]);
  });

  it("이름에서 맞은 것이 설명에서만 맞은 것보다 앞에 온다", () => {
    const result = ids("병합");
    const firstDescOnly = result.findIndex((id) => !ALGORITHMS.find((a) => a.id === id)!.name.includes("병합"));
    const lastByName = result.map((id) => ALGORITHMS.find((a) => a.id === id)!.name.includes("병합")).lastIndexOf(true);
    if (firstDescOnly !== -1) expect(lastByName).toBeLessThan(firstDescOnly);
  });

  it("없는 이름은 빈 결과", () => {
    expect(ids("존재하지않는정렬")).toEqual([]);
  });

  it("모든 알고리즘 id가 서로 다르다", () => {
    expect(new Set(ALGORITHMS.map((a) => a.id)).size).toBe(ALGORITHMS.length);
  });
});
