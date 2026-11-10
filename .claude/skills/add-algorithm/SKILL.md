---
name: add-algorithm
description: Use to add a new sorting algorithm to the visualizer list. Procedure from writing the algorithm file and tests, through registering in registry and families, to verification.
---

# Add a sorting algorithm

Work on the `feat/<name>-sort` branch created by `/start-task`. If you are on main, start with `/start-task`.

The algorithm files live under `src/entities/sort-algorithm/`. The reference examples are `algorithms/bubbleSort.ts` and `algorithms/bubbleSort.test.ts`. Read both before starting.

## 1. Algorithm file `algorithms/<name>Sort.ts`

```ts
import { defineCode } from "../model/code-lines";
import type { SortAlgorithm } from "../model/types";

const CODE = defineCode(`function bubbleSort(arr) {
  ...
      if (arr[j] > arr[j + 1]) { //@cmp
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; //@swap
  ...
}`);

const L = { cmp: CODE.line("cmp"), swap: CODE.line("swap") };

export const bubbleSort: SortAlgorithm = {
  id: "bubble",
  name: "버블 정렬",
  category: "standard",
  desc: "인접한 두 항을 비교하며 정렬",
  complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  stable: true,
  code: CODE.code,
  codeLabels: CODE.labels,
  sort(t) {
    // t.cmp(j, j + 1, L.cmp), t.swap(j, j + 1, L.swap) ...
  },
};
```

Rules:
- **The explanation code (`defineCode`) must match what is actually recorded, 1:1.** The line highlight on screen follows this code.
- Put a `//@label` at the end of each line where an op happens. The label's prefix sets the op kind: `cmp*` → `t.cmp`, `swap*` → `t.swap`, `move*` → `t.move`, `read*` → `t.mark`. If the same kind appears on several lines, add a suffix like `cmp-left`, `swap-root`. Each label is used once.
- Inside `sort(t, options)`, never touch the array directly; use only tracer methods: `t.length`, `t.value(i)`, `t.item(i)`, `t.cmp(i, j, line)`, `t.swap(i, j, line)`, `t.move(from, to, line)`, `t.mark(i, line)`, `t.arrange(start, target, line)`. Pass an `L.xxx` line number to every call.
- Algorithms whose op count can explode (bogosort and the like) return `true` when the limit is exceeded and put a caution in `note`.
- `category`: `"standard" | "linear" | "special" | "fun"` (`fun` may explode, so some tests use only small inputs).
- If a structure view is possible (tree, heap, buckets), set `structure` (step 5).
- The name, description and comments are in Korean, like the existing algorithms.

## 2. Test `algorithms/<name>Sort.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { OpType } from "../model/op";
import { runSort } from "../model/run";
import { describeSortAlgorithm, countOps, toItems } from "../testing/sortSuite";
import { bubbleSort } from "./bubbleSort";

describeSortAlgorithm(bubbleSort);

describe("bubbleSort", () => {
  it("정렬된 입력은 한 번의 패스(n-1 비교)로 끝내고 교환하지 않는다", () => {
    const { ops } = runSort(bubbleSort, toItems(Array.from({ length: 50 }, (_, i) => i)));
    expect(countOps(ops, OpType.Compare)).toBe(49);
    expect(countOps(ops, OpType.Swap)).toBe(0);
  });
});
```

- `describeSortAlgorithm` verifies the sort result, id preservation, op replay and stability (if stable).
- Add 1–2 tests for properties specific to the algorithm (op counts, behavior on particular inputs, etc.).

## 3. `model/registry.ts`

Put the import in its alphabetical place and add the algorithm to the right section of the `ALGORITHMS` array (standard, non-comparison, special, fun). The `AlgorithmId` type derives the id automatically.

## 4. `model/families.ts`

Put the id in one of the sidebar folders: exchange, selection, insertion, merge, quick, heap, tree, distribution, network, hybrid, fun. If you leave it out, `families.test.ts` fails.

## 5. Structure view

If the algorithm uses a heap, tree, piles, buckets or digit bins, consider setting `structure`. It can then also be viewed as that structure, not only as bars.

- The supported shapes are `AlgorithmStructure` in `model/types.ts`: `heap` (arity 2 or 3), `bst`, `splay`/`cartesian`/`tournament` (trees), `piles`/`buckets`/`counting`/`radix` (bins).
- Find existing algorithms using the same shape (`grep -rln "kind: \"<shape>\"" src/entities/sort-algorithm/algorithms`) and follow how they set it.
- Each shape requires certain labels in the explanation code: `STRUCTURE_LABELS` in `src/widgets/visualizer/model/structures/scene.ts` (e.g. `cartesian` needs `cmp-build`, `cmp-heap`, `move`). Use those label names exactly. `heap` has no labels there; instead the label given as `heapEndLabel` must be in the explanation code (checked by `src/widgets/visualizer/model/structure.test.ts`).
- `scene.test.ts` automatically runs every algorithm with `structure` set and checks the labels and the scene at each step, so setting it puts the algorithm under that test. If its behavior within the shape differs (insertion order, comparison order, etc.), add a case. Heaps go in `model/structure.test.ts`; other shapes in `model/structures/structures.test.ts`.
- If a new shape is needed (it cannot be drawn with an existing one), stop here and tell the user. Changing `widgets/visualizer` is a large feature, so it starts with `/design`.
- If a structure view does not fit the algorithm, do not set one.

## 6. Update the algorithm count

Replace the algorithm count written as a fixed number in the docs with the new count.

```bash
ls src/entities/sort-algorithm/algorithms/*Sort.ts | wc -l
grep -rnE "<old count> ?(개|종|가지)" README.md CLAUDE.md docs/ARCHITECTURE.md
```
- The first line gives the new count (helper files such as `rotation.ts` do not end in `Sort.ts` and are left out).
- Change every place the second line finds. Leave numbers that are not the algorithm count (e.g. "1,000개") as they are.

## 7. Verify

```bash
npx vitest run src/entities/sort-algorithm
npm run typecheck
npm run lint
```
`model/traced-code.test.ts` checks that the labels match the actual op kinds. If it fails, check the label prefixes or the line numbers passed. Finally, play it in the dev server and see that the line highlight looks natural. If you set a structure view, play that view too.

## 8. Commit and check

- Commit with `/commit`. The algorithm file, test, registry, families, structure view tests and count update are one unit of work, "add one new algorithm", so they go in one commit: `feat: <이름> 정렬 추가`.
- Then move on to `/verify`.
