import { describe, expect, it } from "vitest";
import { easeInOut, orbitPosition } from "./orbit";

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe("orbitPosition", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 100, y: 40 };
  const center = { x: 50, y: 20 };

  it("t=0이면 출발점, t=1이면 도착점", () => {
    expect(dist(orbitPosition(a, b, 0), a)).toBeLessThan(1e-9);
    expect(dist(orbitPosition(a, b, 1), b)).toBeLessThan(1e-9);
  });

  it("이동하는 내내 두 점의 한가운데를 중심으로 한 원 위에 있다", () => {
    const radius = dist(a, b) / 2;
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(dist(orbitPosition(a, b, t), center)).toBeCloseTo(radius);
    }
  });

  it("서로 자리를 바꾸는 두 노드는 같은 원 위에서 항상 정반대에 있다 (부딪히지 않고 공전)", () => {
    for (const t of [0, 0.3, 0.5, 0.8, 1]) {
      const p = orbitPosition(a, b, t);
      const q = orbitPosition(b, a, t);
      expect((p.x + q.x) / 2).toBeCloseTo(center.x);
      expect((p.y + q.y) / 2).toBeCloseTo(center.y);
    }
  });

  it("직선이 아니라 옆으로 돌아간다 (중간 지점이 두 점을 잇는 선에서 벗어남)", () => {
    const mid = orbitPosition(a, b, 0.5);
    expect(dist(mid, center)).toBeGreaterThan(10);
  });

  it("출발점과 도착점이 같으면 움직이지 않는다", () => {
    expect(orbitPosition(a, a, 0.5)).toEqual(a);
  });
});

describe("easeInOut", () => {
  it("0과 1은 고정, 가운데는 0.5, 단조 증가", () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
    expect(easeInOut(0.3)).toBeLessThan(easeInOut(0.6));
  });
});
