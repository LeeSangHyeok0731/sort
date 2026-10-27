import { describe, expect, it } from "vitest";
import { FAMILIES, getFamily } from "./families";
import { ALGORITHMS } from "./registry";

describe("알고리즘 폴더", () => {
  it("모든 알고리즘이 정확히 한 폴더에 들어 있다 (빠지거나 겹치면 실패)", () => {
    const listed = FAMILIES.flatMap((f) => f.ids);
    expect([...listed].sort()).toEqual(ALGORITHMS.map((a) => a.id).sort());
  });

  it("폴더 id는 겹치지 않고 빈 폴더가 없다", () => {
    expect(new Set(FAMILIES.map((f) => f.id)).size).toBe(FAMILIES.length);
    for (const f of FAMILIES) expect(f.ids.length).toBeGreaterThan(0);
  });

  it("getFamily는 알고리즘이 든 폴더를 돌려준다", () => {
    expect(getFamily("bubble")).toBe("exchange");
    expect(getFamily("pancake")).toBe("selection");
    expect(getFamily("tim")).toBe("hybrid");
  });
});
