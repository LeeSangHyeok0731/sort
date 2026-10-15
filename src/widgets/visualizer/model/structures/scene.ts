/**
 * 재생 정보(TrackView)를 구조 보기 장면(트리 노드 또는 칸 카드)으로 바꾼다.
 * 정렬은 배열 연산만 기록하므로, 배열 밖의 구조는 같은 규칙으로 다시 계산해 그린다.
 */

import type { BarTone } from "@/entities/array";
import type { AlgorithmStructure, SortAlgorithm, SortOptions } from "@/entities/sort-algorithm";
import type { TrackView } from "@/features/playback";
import type { ArrayItem } from "@/shared/model";
import { bstProgress, buildBst, heapLayout, heapParent, heapSizeFromHits, placedPrefix } from "../structure";
import {
  bucketRule,
  countingRule,
  fillBins,
  patiencePiles,
  pileFor,
  radixPass,
  radixPasses,
  radixRule,
  type BinRule,
} from "./bins";
import {
  cartesianPrefix,
  cartesianQueueAfter,
  insertionPath,
  NIL,
  splayAfter,
  splayPeakDepth,
  stableRanks,
  tournamentAfter,
  type TreeShape,
} from "./trees";

export type NodeTone = BarTone | "idle" | "done";

export type DrawNode = {
  /** 노드에 담긴 원소의 고유 id. 같은 원소가 다른 자리로 가면 그 사이를 이동해 보여 준다 */
  key: number;
  /** 가로 위치 0~1 */
  x: number;
  /** 층 (0 = 루트) */
  depth: number;
  /** 부모 자리의 인덱스 (nodes 배열 기준), 루트는 -1 */
  parent: number;
  label: string;
  tone: NodeTone;
  /** 그리지 않음 (아직 트리에 없는 노드) */
  hidden?: boolean;
  /** 점선 테두리 (들어갈 자리를 미리 보여 주는 노드) */
  ghost?: boolean;
  /** 흐리게 (힙에서 빠져 정렬이 끝난 노드 등) */
  faded?: boolean;
};

export type DrawCard = {
  key: number;
  label: string;
  tone: NodeTone;
  ghost?: boolean;
  faded?: boolean;
};

export type DrawColumn = { label: string; cards: DrawCard[]; active?: boolean };

export type Scene =
  | { type: "tree"; nodes: DrawNode[]; maxDepth: number; columns: number; caption: string }
  | { type: "bins"; columns: DrawColumn[]; caption: string };

/** 보기 전환 버튼에 쓰는 이름 */
export function structureLabel(structure: AlgorithmStructure) {
  switch (structure.kind) {
    case "piles":
      return "더미";
    case "buckets":
    case "counting":
    case "radix":
      return "칸";
    default:
      return "트리";
  }
}

/** 각 구조가 진행 상태를 알아내는 데 쓰는 설명 코드 표식 (모두 있어야 한다) */
export const STRUCTURE_LABELS: Record<AlgorithmStructure["kind"], readonly string[]> = {
  heap: [],
  bst: ["cmp", "move"],
  splay: ["cmp", "move"],
  cartesian: ["cmp-build", "cmp-heap", "move"],
  tournament: ["cmp-match", "move"],
  piles: ["cmp-pile"],
  buckets: ["read", "move", "cmp", "swap"],
  counting: ["read", "move"],
  radix: ["read", "move"],
};

/** 계산이 무거운 부분(전체 트리 등)은 입력이 바뀔 때만 다시 만든다 */
export type SceneCache = { input: readonly ArrayItem[]; kind: string; options: SortOptions; data: Map<string, unknown> };

export function createSceneCache(input: readonly ArrayItem[], kind: string, options: SortOptions): SceneCache {
  return { input, kind, options, data: new Map() };
}

function cached<T>(cache: SceneCache, key: string, make: () => T): T {
  if (!cache.data.has(key)) cache.data.set(key, make());
  return cache.data.get(key) as T;
}

type Ctx = {
  algorithm: SortAlgorithm & { structure: AlgorithmStructure };
  view: TrackView;
  input: readonly ArrayItem[];
  values: number[];
  n: number;
  /** 마지막으로 실행된 연산의 표식 */
  label: string | undefined;
  sortedDone: boolean;
  /** 지금 배열 위치 → 강조 색 */
  highlighted: Map<number, BarTone>;
  hits: (label: string) => number;
  cache: SceneCache;
};

export function buildScene(
  algorithm: SortAlgorithm & { structure: AlgorithmStructure },
  view: TrackView,
  input: readonly ArrayItem[],
  cache: SceneCache
): Scene {
  const highlighted = new Map<number, BarTone>();
  if (view.highlight) for (const i of view.highlight.indices) highlighted.set(i, view.highlight.tone);
  const lineOf = new Map<string, number>();
  for (const [line, label] of algorithm.codeLabels) lineOf.set(label, line);
  const ctx: Ctx = {
    algorithm,
    view,
    input,
    values: input.map((item) => item.value),
    n: input.length,
    label: view.cursor > 0 ? algorithm.codeLabels.get(view.line) : undefined,
    sortedDone: view.done && !view.truncated,
    highlighted,
    hits: (label) => view.lineHits[lineOf.get(label) ?? -1] ?? 0,
    cache,
  };
  const structure = algorithm.structure;
  switch (structure.kind) {
    case "heap":
      return heapScene(ctx, structure.arity, structure.heapEndLabel);
    case "bst":
      return bstScene(ctx);
    case "splay":
      return splayScene(ctx);
    case "cartesian":
      return cartesianScene(ctx);
    case "tournament":
      return tournamentScene(ctx);
    case "piles":
      return pilesScene(ctx);
    case "buckets":
    case "counting":
    case "radix":
      return binsScene(ctx, structure.kind);
  }
}

// ───────────── 공통 ─────────────

/** 정렬된 위치(순위)를 가로 위치로 쓰는 트리: 회전·배치가 바뀌어도 원소는 위아래로만 움직인다 */
function rankedTreeNodes(
  ctx: Ctx,
  shape: TreeShape,
  ranks: Int32Array,
  toneOf: (i: number) => NodeTone,
  ghost?: { index: number; depth: number; parent: number }
): DrawNode[] {
  return ctx.input.map((item, i) => {
    const isGhost = ghost?.index === i;
    return {
      key: item.id,
      x: (ranks[i] + 0.5) / ctx.n,
      depth: isGhost ? ghost.depth : Math.max(0, shape.depth[i]),
      parent: isGhost ? ghost.parent : shape.parent[i],
      label: String(item.value),
      tone: toneOf(i),
      hidden: !isGhost && shape.depth[i] === NIL,
      ghost: isGhost,
    };
  });
}

/** 배치 단계: 목표 순서(id)대로 놓인 수와 방금 옮긴 원소의 입력 인덱스 */
function arrangeState(ctx: Ctx, targetIds: readonly number[]) {
  const placed = placedPrefix(ctx.view.items, targetIds);
  const indexOfId = ctx.cache.data.get("indexOfId") as Map<number, number> | undefined;
  const lookup = indexOfId ?? new Map(ctx.input.map((item, i) => [item.id, i]));
  if (!indexOfId) ctx.cache.data.set("indexOfId", lookup);
  const h = ctx.view.highlight;
  const changed = h && ctx.label === "move" ? lookup.get(ctx.view.items[h.indices[h.indices.length - 1]]?.id ?? -1) : undefined;
  return { placed, changed };
}

/** 입력 인덱스를 정렬된 순위 순서로 늘어놓은 id 목록 */
function idsByRank(ctx: Ctx, ranks: Int32Array) {
  const ids = new Array<number>(ctx.n);
  ctx.input.forEach((item, i) => (ids[ranks[i]] = item.id));
  return ids;
}

// ───────────── 힙 ─────────────

function heapScene(ctx: Ctx, arity: 2 | 3, heapEndLabel: string): Scene {
  const { view, n } = ctx;
  const layout = cached(ctx.cache, `heap-${n}`, () => heapLayout(n, arity));
  const heapSize = view.total === null ? n : heapSizeFromHits(n, view.lineHits, ctx.algorithm.codeLabels, heapEndLabel);
  const nodes = view.items.map((item, i): DrawNode => {
    const inHeap = i < heapSize;
    return {
      key: item.id,
      x: layout[i].x,
      depth: layout[i].depth,
      parent: heapParent(i, arity),
      label: String(item.value),
      tone: ctx.highlighted.get(i) ?? (ctx.sortedDone || !inHeap ? "done" : "idle"),
      faded: !inHeap && !ctx.sortedDone,
    };
  });
  const maxDepth = layout.length > 0 ? layout[layout.length - 1].depth : 0;
  return {
    type: "tree",
    nodes,
    maxDepth,
    columns: arity ** maxDepth,
    caption: ctx.sortedDone ? "정렬 완료" : `힙 크기 ${heapSize} · 정렬된 부분 ${n - heapSize}`,
  };
}

// ───────────── 이진 검색 트리 ─────────────

function bstScene(ctx: Ctx): Scene {
  const { view, n, input } = ctx;
  const bst = cached(ctx.cache, "bst", () => buildBst(ctx.values));
  const progress = bstProgress(n, view.cursor, view.highlight, view.done);
  const { placed, changed } =
    progress.phase === "build" ? { placed: 0, changed: undefined } : arrangeState(ctx, cached(ctx.cache, "bst-ids", () => idsByRank(ctx, bst.rank)));
  const nodes = input.map((item, i): DrawNode => {
    const inTree = i < progress.inserted;
    let tone: NodeTone = "idle";
    if (ctx.sortedDone || bst.rank[i] < placed) tone = "done";
    if (i === progress.comparing || i === progress.inserting) tone = "compare";
    if (i === changed) tone = "change";
    return {
      key: item.id,
      x: (bst.rank[i] + 0.5) / n,
      depth: bst.depth[i],
      parent: bst.parent[i],
      label: String(item.value),
      tone,
      hidden: !inTree && i !== progress.inserting,
      ghost: i === progress.inserting,
    };
  });
  const caption =
    progress.phase === "build"
      ? `트리에 넣는 중 ${progress.inserted}/${n}`
      : progress.phase === "arrange"
        ? `중위 순회 순서로 배치 ${placed}/${n}`
        : "정렬 완료";
  return { type: "tree", nodes, maxDepth: bst.maxDepth, columns: n, caption };
}

// ───────────── 스플레이 트리 ─────────────

function splayScene(ctx: Ctx): Scene {
  const { view, n, values } = ctx;
  const ranks = cached(ctx.cache, "ranks", () => stableRanks(values));
  const maxDepth = cached(ctx.cache, "splay-peak", () => splayPeakDepth(values));
  const h = view.highlight;
  const building = view.cursor === 0 || ctx.label === "cmp";

  if (building && !view.done) {
    const inserting = h && ctx.label === "cmp" ? h.indices[0] : null;
    const comparing = h && ctx.label === "cmp" ? h.indices[1] : null;
    const shape = splayAfter(values, inserting ?? Math.min(1, n));
    let ghost: { index: number; depth: number; parent: number } | undefined;
    if (inserting !== null) {
      const path = insertionPath(shape, values, inserting);
      ghost = { index: inserting, depth: path.length, parent: path[path.length - 1] };
    }
    const nodes = rankedTreeNodes(ctx, shape, ranks, (i) => (i === inserting || i === comparing ? "compare" : "idle"), ghost);
    return {
      type: "tree",
      nodes,
      maxDepth,
      columns: n,
      caption: `넣고 루트로 끌어올리는 중 ${inserting ?? Math.min(1, n)}/${n}`,
    };
  }

  const shape = cached(ctx.cache, "splay-full", () => splayAfter(values, n));
  const { placed, changed } = arrangeState(ctx, cached(ctx.cache, "rank-ids", () => idsByRank(ctx, ranks)));
  const nodes = rankedTreeNodes(ctx, shape, ranks, (i) =>
    i === changed ? "change" : ctx.sortedDone || ranks[i] < placed ? "done" : "idle"
  );
  return {
    type: "tree",
    nodes,
    maxDepth,
    columns: n,
    caption: ctx.sortedDone ? "정렬 완료" : `중위 순회 순서로 배치 ${placed}/${n}`,
  };
}

// ───────────── 카테시안 트리 ─────────────

function cartesianScene(ctx: Ctx): Scene {
  const { view, n, values } = ctx;
  const full = cached(ctx.cache, "cartesian-full", () => cartesianPrefix(values, n));
  const maxDepth = cached(ctx.cache, "cartesian-depth", () => Math.max(0, ...full.depth));
  // 가로 위치 = 원래 순서 (카테시안 트리의 중위 순회)
  const order = cached(ctx.cache, "identity-ranks", () => Int32Array.from(values.keys()));
  const h = view.highlight;

  if ((view.cursor === 0 || ctx.label === "cmp-build") && !view.done) {
    const adding = h && ctx.label === "cmp-build" ? h.indices[1] : 0;
    const shape = cartesianPrefix(values, h ? adding : Math.min(1, n));
    const nodes = rankedTreeNodes(ctx, shape, order, (i) => (h && ctx.label === "cmp-build" && (i === adding || i === h.indices[0]) ? "compare" : "idle"));
    // 넣는 중인 원소는 맨 아래에 점선으로 대기
    const ghostNode = nodes[adding];
    if (ghostNode && h) Object.assign(ghostNode, { hidden: false, ghost: true, depth: maxDepth, parent: -1 });
    return { type: "tree", nodes, maxDepth, columns: n, caption: `트리 만드는 중 ${adding}/${n}` };
  }

  if (ctx.label === "cmp-heap" && !view.done) {
    const state = cartesianQueueAfter(values, ctx.hits("cmp-heap") - 1);
    const popped = new Set(state.popped);
    const queued = new Set(state.queued);
    const comparing = new Set(state.next ?? []);
    const nodes = rankedTreeNodes(ctx, full, order, (i) =>
      comparing.has(i) ? "compare" : popped.has(i) ? "done" : queued.has(i) ? "read" : "idle"
    );
    for (const i of popped) nodes[i].faded = true;
    return {
      type: "tree",
      nodes,
      maxDepth,
      columns: n,
      caption: `최소 힙에서 꺼낸 수 ${popped.size}/${n} · 대기 ${queued.size}`,
    };
  }

  const ranks = cached(ctx.cache, "ranks", () => stableRanks(values));
  const { placed, changed } = arrangeState(ctx, cached(ctx.cache, "rank-ids", () => idsByRank(ctx, ranks)));
  const nodes = rankedTreeNodes(ctx, full, order, (i) =>
    i === changed ? "change" : ctx.sortedDone || ranks[i] < placed ? "done" : "idle"
  );
  return {
    type: "tree",
    nodes,
    maxDepth,
    columns: n,
    caption: ctx.sortedDone ? "정렬 완료" : `꺼낸 순서대로 배치 ${placed}/${n}`,
  };
}

// ───────────── 토너먼트 ─────────────

function tournamentScene(ctx: Ctx): Scene {
  const { view, n, values, input } = ctx;
  const compares = ctx.label === "cmp-match" ? ctx.hits("cmp-match") - 1 : view.cursor === 0 ? 0 : Infinity;
  const state = tournamentAfter(values, view.done ? Infinity : compares);
  const { size, winner } = state;
  const layout = cached(ctx.cache, `bracket-${size}`, () => heapLayout(2 * size - 1, 2));
  const removed = new Set(state.removed);
  const playing = ctx.label === "cmp-match" && state.nextNode !== NIL ? state.nextNode : NIL;
  const arranging = playing === NIL && view.cursor > 0;
  const { placed, changed } = arranging
    ? arrangeState(ctx, cached(ctx.cache, "rank-ids", () => idsByRank(ctx, cached(ctx.cache, "ranks", () => stableRanks(values)))))
    : { placed: 0, changed: undefined };

  // 노드 k(1부터)는 heapLayout의 k-1번 자리. 자리는 고정이라 key도 자리 번호 (이동 애니메이션 없음)
  const nodes: DrawNode[] = [];
  for (let k = 1; k < 2 * size; k++) {
    const who = winner[k];
    const leaf = k >= size;
    const out = leaf && who !== NIL && removed.has(who);
    let tone: NodeTone = "idle";
    if (leaf && who !== NIL && (out || ctx.sortedDone)) tone = "done";
    if (playing !== NIL && (k === 2 * playing || k === 2 * playing + 1)) tone = "compare";
    if (!leaf && who !== NIL && who === winner[1] && !arranging) tone = tone === "compare" ? tone : "read";
    if (changed !== undefined && who === changed && leaf) tone = "change";
    nodes.push({
      key: -k,
      x: layout[k - 1].x,
      depth: layout[k - 1].depth,
      parent: k === 1 ? -1 : (k >> 1) - 1,
      label: who === NIL ? "" : String(input[who].value),
      tone,
      ghost: who === NIL,
      hidden: firstLeaf(k, size) - size >= n,
      faded: out && !ctx.sortedDone,
    });
  }
  const maxDepth = layout[layout.length - 1].depth;
  const caption = ctx.sortedDone
    ? "정렬 완료"
    : arranging
      ? `우승 순서대로 배치 ${placed}/${n}`
      : `우승해 빠진 선수 ${removed.size}/${n}`;
  return { type: "tree", nodes, maxDepth, columns: size, caption };
}

/** 대진표 노드 k 아래 가장 왼쪽 잎 (선수가 하나도 없는 노드는 그리지 않는다) */
function firstLeaf(k: number, size: number) {
  let leaf = k;
  while (leaf < size) leaf *= 2;
  return leaf;
}

// ───────────── 페이션스 더미 ─────────────

function pilesScene(ctx: Ctx): Scene {
  const { view, n, values, input } = ctx;
  const h = view.highlight;
  const dealing = !view.done && (view.cursor === 0 || ctx.label === "cmp-pile");
  const dealt = dealing ? (h && ctx.label === "cmp-pile" ? h.indices[1] : 0) : n;
  const piles = dealing ? patiencePiles(values, dealt) : cached(ctx.cache, "piles", () => patiencePiles(values, n));
  const target = dealing && dealt < n ? pileFor(values, piles, dealt) : -1;

  // 더미를 펼친 뒤에는 배열이 움직이므로 강조는 지금 위치 → 원소 id로 찾는다
  const toneOfId = new Map<number, NodeTone>();
  if (!dealing) for (const [pos, tone] of ctx.highlighted) if (view.items[pos]) toneOfId.set(view.items[pos].id, tone);
  const comparedTop = dealing && h && ctx.label === "cmp-pile" ? h.indices[0] : NIL;

  const columns: DrawColumn[] = piles.map((pile, p) => ({
    label: String(p + 1),
    active: p === target,
    cards: pile.map((i) => ({
      key: input[i].id,
      label: String(input[i].value),
      tone: ctx.sortedDone ? "done" : i === comparedTop ? "compare" : (toneOfId.get(input[i].id) ?? "idle"),
    })),
  }));
  if (target >= 0) {
    if (target === columns.length) columns.push({ label: String(target + 1), active: true, cards: [] });
    columns[target].cards.push({ key: input[dealt].id, label: String(input[dealt].value), tone: "compare", ghost: true });
  }
  const caption = ctx.sortedDone
    ? "정렬 완료"
    : dealing
      ? `카드 나눠 놓는 중 ${dealt}/${n} · 더미 ${piles.length}개`
      : `더미 ${piles.length}개를 펼쳐 합치는 중`;
  return { type: "bins", columns, caption };
}

// ───────────── 버킷·계수·기수 ─────────────

function binsScene(ctx: Ctx, kind: "buckets" | "counting" | "radix"): Scene {
  const { view, n, values } = ctx;
  const items = view.items;
  let rule: BinRule;
  let reads = ctx.hits("read");
  let passCaption = "";
  if (kind === "buckets") {
    rule = cached(ctx.cache, "bucket-rule", () => bucketRule(values, ctx.cache.options.bucketCount));
  } else if (kind === "counting") {
    rule = cached(ctx.cache, "counting-rule", () => countingRule(values));
  } else {
    const passes = cached(ctx.cache, "radix-passes", () => radixPasses(Math.max(0, ...values)));
    const pass = radixPass(n, reads, passes);
    rule = radixRule(pass);
    reads -= pass * n;
    passCaption = `${10 ** pass}의 자리 (${pass + 1}/${passes}) · `;
  }

  const phase: "read" | "move" | "sort" | "done" = ctx.sortedDone
    ? "done"
    : view.cursor === 0 || ctx.label === "read"
      ? "read"
      : ctx.label === "move"
        ? "move"
        : "sort";

  let columns: ArrayItem[][];
  let placed = 0;
  if (phase === "read") {
    columns = fillBins(items, reads, rule);
  } else if (kind === "counting") {
    // 계수 정렬은 칸 안에서도 값 순서 (같은 값끼리는 지금 배열 순서)
    const target = items.map((item, i) => [item, i] as const).sort(([a, i], [b, j]) => a.value - b.value || i - j);
    columns = fillBins(
      target.map(([item]) => item),
      n,
      rule
    );
    placed = placedPrefix(items, target.map(([item]) => item.id));
  } else {
    columns = fillBins(items, n, rule);
    placed = placedPrefix(
      items,
      columns.flat().map((item) => item.id)
    );
  }

  // 강조: 지금 위치 → 원소 id
  const toneOfId = new Map<number, NodeTone>();
  for (const [pos, tone] of ctx.highlighted) if (items[pos]) toneOfId.set(items[pos].id, tone);
  const placedIds = new Set<number>();
  if (phase === "move") for (let k = 0; k < placed; k++) placedIds.add(items[k].id);
  // 버킷 안 삽입 정렬: 지금 정렬 중인 버킷보다 앞 버킷은 끝난 것
  let sortingBucket = -1;
  if (phase === "sort" && view.highlight) sortingBucket = rule.of(items[view.highlight.indices[0]]?.value ?? 0);

  const drawColumns: DrawColumn[] = columns.map((cards, b) => ({
    label: rule.labels[b],
    active: (phase === "read" && reads > 0 && rule.of(items[reads - 1].value) === b) || b === sortingBucket,
    cards: cards.map((item) => ({
      key: item.id,
      label: String(item.value),
      tone:
        phase === "done" || (phase === "sort" && b < sortingBucket)
          ? "done"
          : (toneOfId.get(item.id) ?? (placedIds.has(item.id) ? "done" : "idle")),
      faded: placedIds.has(item.id) && !toneOfId.has(item.id),
    })),
  }));

  const caption =
    phase === "done"
      ? "정렬 완료"
      : phase === "read"
        ? `${passCaption}칸에 담는 중 ${reads}/${n}`
        : phase === "move"
          ? `${passCaption}칸 순서대로 꺼내는 중 ${placed}/${n}`
          : `버킷 안 삽입 정렬 ${Math.max(0, sortingBucket) + 1}/${rule.k}`;
  return { type: "bins", columns: drawColumns, caption };
}
