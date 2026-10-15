export type Point = { x: number; y: number };

/**
 * from → to 로 반원을 그리며 이동할 때 t(0~1) 시점의 위치.
 * 두 점의 한가운데를 중심으로 같은 방향(시계 방향)으로 반 바퀴 돈다.
 * 그래서 서로 자리를 바꾸는 두 노드는 같은 원 위에서 항상 정반대에 있어 부딪히지 않고 공전하듯 교환된다.
 */
export function orbitPosition(from: Point, to: Point, t: number): Point {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const radius = Math.hypot(from.x - cx, from.y - cy);
  if (radius === 0) return { x: from.x, y: from.y };
  const start = Math.atan2(from.y - cy, from.x - cx);
  const angle = start + Math.PI * t;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

/** 천천히 출발해 천천히 멈추는 곡선 */
export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
