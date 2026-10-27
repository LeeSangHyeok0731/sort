# 알고리즘 선택 사이드바 설계

## 배경
알고리즘 선택 UI는 페이지 아래쪽 카드 안에 있다. 분류 탭 4개를 고르면 알고리즘이 카드 그리드로 나온다. 이 구조에는 두 가지 문제가 있다.
- "특이한 정렬" 탭 하나에 성격이 다른 22개(하이브리드, 정렬 네트워크, 트리 기반 등)가 섞여 있어 원하는 알고리즘을 찾기 어렵다.
- 선택 UI가 시각화 아래에 있어서 알고리즘을 바꿀 때마다 스크롤을 오르내려야 한다.

## 목표
- 알고리즘을 계열별 폴더 트리로 정리해 왼쪽 고정 사이드바에 둔다.
- 데스크톱만 고려한다(모바일 대응은 하지 않는다).

## 1. 폴더 구성
폴더 11개에 58개를 넣는다. 알고리즘은 각각 정확히 한 폴더에만 속한다.

| 폴더 id | 이름 | 알고리즘 id |
|---|---|---|
| exchange | 교환 정렬 | bubble, cocktail, comb, gnome, oddEven, exchange, circle |
| selection | 선택 정렬 | selection, doubleSelection, cycle, pancake |
| insertion | 삽입 정렬 | insertion, binaryInsertion, shell, mergeInsertion |
| merge | 병합 정렬 | merge, bottomUpMerge, naturalMerge, strand, patience |
| quick | 퀵 정렬 | quick, quick3, hoareQuick, dualPivot |
| heap | 힙 정렬 | heap, ternaryHeap, bottomUpHeap, weakHeap, smooth |
| tree | 트리 정렬 | tree, splay, cartesian, tournament |
| distribution | 비교 없는 정렬 | counting, radix, msdRadix, radixExchange, bucket, pigeonhole, spread, americanFlag, flash |
| network | 정렬 네트워크 | bitonic, oddEvenMerge, pairwise |
| hybrid | 하이브리드 | tim, intro, pdq, block, grail |
| fun | 재미있는 정렬 | bogo, bogobogo, bozo, quantumBogo, miracle, permutation, stooge, slow |

폴더 안의 알고리즘은 표에 적은 순서대로 보여준다.

## 2. 데이터
- `src/entities/sort-algorithm/model/families.ts`에 다음 두 가지를 둔다.
  - `FAMILIES: ReadonlyArray<{ id: AlgorithmFamily; name: string; ids: readonly AlgorithmId[] }>`
  - `getFamily(id: AlgorithmId): AlgorithmFamily`
- 알고리즘 정의 파일은 수정하지 않는다.
- `families.test.ts`에서 모든 `ALGORITHMS`가 정확히 한 폴더에 들어 있는지 확인한다(빠진 것과 중복 모두 실패).
- `category` 필드는 유지한다. 테스트에서 "fun" 판별에 쓰고 있다.
- 탭 UI에서만 쓰던 `CATEGORIES`는 제거한다.

## 3. 사이드바 컴포넌트
`features/select-algorithm/ui/AlgorithmPicker.tsx`를 `AlgorithmSidebar.tsx`로 바꾼다. props는 기존과 같다(`compareMode`, `onCompareModeChange`, `selected`, `onSelect`, `disabled`).

위에서부터 다음 순서로 배치한다.
1. 제목 "알고리즘"과 비교 모드 스위치
2. 비교 모드일 때만 슬롯 탭 1·2. 고른 슬롯에 클릭한 알고리즘이 들어간다.
3. 검색창. 기존 `searchAlgorithms`를 그대로 쓰고, Esc로 지운다.
4. 폴더 트리

폴더 트리의 동작은 다음과 같다.
- 폴더 버튼에는 ▸/▾ 아이콘, 이름, 개수를 표시하고 `aria-expanded`를 단다.
- 펼친 폴더는 `Set<AlgorithmFamily>` 상태로 관리한다. 처음에는 선택된 알고리즘(비교 모드면 둘 다)이 있는 폴더만 펼친다.
- 항목 하나는 한 줄 버튼이고 이름만 보여준다. 설명은 `title`로 띄운다.
- 선택된 항목은 슬롯 색으로 강조한다. 비교 모드에서는 각 항목이 어느 슬롯에 들어 있는지 1·2 배지로 표시한다.
- 검색 중에는 일치하는 항목이 있는 폴더만 모두 펼쳐 보여준다. 펼침 상태는 바꾸지 않고, 검색어를 지우면 원래대로 돌아간다. 결과가 없으면 안내 문구를 보여준다.
- `disabled` prop은 기존처럼 받아 항목 버튼에만 적용한다. 지금 HomeView는 넘기지 않으므로 재생 중에도 선택할 수 있고, 선택하면 플레이어가 처음 상태로 돌아간다(기존 동작).

## 4. 페이지 레이아웃
- `app/page.tsx`의 최대 폭을 `max-w-6xl`에서 `max-w-7xl`로 넓히고, 왼쪽 여백을 `pl-[296px]`(사이드바 left 12px + 너비 260px + 간격 24px)로 둬 사이드바 자리를 비운다.
- 사이드바는 화면 왼쪽에 고정하고, 본문은 남은 공간에서 가운데 정렬한다.
  - 사이드바: `aside`, `fixed left-3 top-3 bottom-3`, 너비 260px. 목록이 넘치면 사이드바 안에서만 스크롤한다.
  - 본문: 헤더, 재생바, 시각화를 두고, 그 아래에 두 칸을 둔다.
    - 왼쪽 칸: 알고리즘 옵션(`AlgorithmOptions`)과 배열 설정
    - 오른쪽 칸: 알고리즘 정보
  - 알고리즘 옵션은 표시할 옵션이 없으면 렌더링되지 않는다(기존 동작).

## 5. 검증
- `families.test.ts`를 추가하고, 기존 테스트와 `tsc`가 모두 통과해야 한다.
- 브라우저에서 다음을 확인한다.
  - 단일 모드에서 선택하면 시각화가 바뀐다.
  - 비교 모드에서 슬롯 탭을 바꿔 가며 선택할 수 있고 배지가 맞게 나온다.
  - 검색했을 때 폴더가 펼쳐지고, 결과가 없을 때 안내 문구가 나온다.
  - 폴더를 열고 닫을 수 있다.
  - 사이드바가 화면 왼쪽에 고정되고, 목록이 넘치면 안에서 스크롤된다.
  - 재생 중에 알고리즘을 바꾸면 처음 상태로 돌아가는 기존 동작이 유지된다.

## 범위 밖
- 모바일 레이아웃
- 트리 키보드 화살표 탐색
- 즐겨찾기·최근 사용 목록
