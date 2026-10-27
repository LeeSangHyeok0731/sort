---
name: add-algorithm
description: 새 정렬 알고리즘을 시각화 목록에 추가할 때 사용한다. 알고리즘 파일·테스트 작성, registry·families 등록, 검증까지의 절차.
---

# 정렬 알고리즘 추가

모든 파일은 `src/entities/sort-algorithm/` 아래에 있다. 기준 예시는 `algorithms/bubbleSort.ts`와 `algorithms/bubbleSort.test.ts`다. 시작 전에 둘 다 읽는다.

## 1. 알고리즘 파일 `algorithms/<name>Sort.ts`

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

규칙:
- **설명 코드(`defineCode`)는 실제 기록 방식과 1:1로 같아야 한다.** 화면에서 줄 하이라이트가 이 코드를 따라간다.
- 연산이 일어나는 줄 끝에 `//@표식`을 단다. 표식 이름의 접두어가 연산 종류를 정한다: `cmp*` → `t.cmp`, `swap*` → `t.swap`, `move*` → `t.move`, `read*` → `t.mark`. 같은 종류가 여러 줄이면 `cmp-left`, `swap-root`처럼 접미어를 붙인다. 표식은 한 번씩만 쓴다.
- `sort(t, options)` 안에서는 배열을 직접 만지지 않고 tracer 메서드만 쓴다: `t.length`, `t.value(i)`, `t.item(i)`, `t.cmp(i, j, line)`, `t.swap(i, j, line)`, `t.move(from, to, line)`, `t.mark(i, line)`, `t.arrange(start, target, line)`. 모든 호출에 `L.xxx` 줄 번호를 넘긴다.
- 연산이 폭발할 수 있는 알고리즘(보고 정렬류)은 한도 초과 시 `true`를 반환하고 `note`에 주의 사항을 적는다.
- `category`: `"standard" | "linear" | "special" | "fun"` (`fun`은 테스트에서 큰 입력 검증을 건너뛴다).
- 트리·힙·버킷처럼 구조 보기가 가능하면 `structure`를 지정한다(`model/types.ts`의 `AlgorithmStructure`).

## 2. 테스트 `algorithms/<name>Sort.test.ts`

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

- `describeSortAlgorithm`이 정렬 결과, id 보존, 연산 재생, 안정성(stable이면)을 검증한다.
- 알고리즘 고유 성질 테스트를 1~2개 더한다(연산 수, 특정 입력에서의 동작 등).

## 3. `model/registry.ts`

import를 알파벳 순서 자리에 넣고, `ALGORITHMS` 배열의 알맞은 구획(기본·비교 없는·특이한·재미있는 정렬)에 추가한다. id는 `AlgorithmId` 타입이 자동으로 만든다.

## 4. `model/families.ts`

사이드바 폴더 중 하나에 id를 넣는다: exchange, selection, insertion, merge, quick, heap, tree, distribution, network, hybrid, fun. 빠뜨리면 `families.test.ts`가 실패한다.

## 5. 검증

```bash
npx vitest run src/entities/sort-algorithm
npm run typecheck
npm run lint
```
`model/traced-code.test.ts`가 표식과 실제 연산 종류가 맞는지 검사한다. 실패하면 표식 접두어나 넘긴 줄 번호를 확인한다. 마지막으로 dev 서버에서 직접 재생해 줄 하이라이트가 자연스러운지 본다.
