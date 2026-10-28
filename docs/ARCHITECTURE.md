# 구조

Feature-Sliced Design(FSD)을 따른다. 이 문서의 규칙은 두 곳에서 검사한다: `eslint.config.mjs`(`@/` 별칭 import, 에디터에 바로 표시)와 `scripts/check-fsd.mjs`(`npm run lint:fsd`, 상대 경로와 같은 레이어 슬라이스까지). 둘 다 CI에서 돈다.

## 레이어

```
app → views → widgets → features → entities → shared
```

- 화살표 방향으로만 import한다. 아래 레이어는 위 레이어를 모른다. (ESLint, lint:fsd)
- 같은 레이어의 다른 슬라이스는 import하지 않는다. 예: `features/playback`이 `features/sort-sound`를 가져오지 않는다. 둘을 함께 써야 하면 위 레이어(`widgets`, `views`)에서 조립한다. (lint:fsd)
- 슬라이스 안에서는 상대 경로(`../model/track`)를 쓴다.

| 레이어 | 역할 | 넣는 것 |
|---|---|---|
| `app` | Next.js 라우트·전역 스타일 | `layout.tsx`, `page.tsx`, `globals.css` |
| `views` | 페이지 하나를 조립 | 페이지 상태(URL 동기화, 단축키), 화면 배치 |
| `widgets` | 여러 기능·엔티티를 묶은 큰 화면 블록 | 시각화 무대 |
| `features` | 사용자 동작 하나 | 재생, 알고리즘 선택, 배열 설정, 소리, 테마 전환 |
| `entities` | 도메인 데이터와 그 표현 | 정렬 알고리즘, 배열 |
| `shared` | 도메인을 모르는 공용 코드 | `cn`, 테마, 팔레트, `Card`, `ArrayItem` 타입 |

## 공개 진입점

- 슬라이스 밖에서는 `@/<레이어>/<슬라이스>`(그 슬라이스의 `index.ts`)로만 가져온다. 내부 파일(`@/features/playback/model/track`)을 직접 가져오면 ESLint 오류다. 필요하면 index에서 export한다.
- 예외는 하나다: **`@/entities/sort-algorithm/core`**. React·CSS를 불러오지 않는 진입점으로, Web Worker(`features/playback/model/sort.worker.ts`)와 워커가 쓰는 모듈에서 쓴다. `index.ts`는 `core`와 UI 컴포넌트를 함께 내보낸다.
- `shared`는 슬라이스가 없고 세그먼트 단위로 가져온다: `@/shared/lib`, `@/shared/ui`, `@/shared/model`, `@/shared/config`.

## 파일 구조

```
src/
├─ app/
│  ├─ layout.tsx            # html·폰트·테마 초기화 스크립트
│  ├─ page.tsx              # main 여백(양옆 고정 사이드바 자리) + HomePage
│  ├─ globals.css           # Tailwind, 색 토큰(라이트·다크), 스크롤바 숨김
│  └─ theme.test.ts         # 테마 클래스 사용 검사 (옛 다크 전용 색 금지, dark: 짝)
├─ views/
│  └─ home/                 # 홈 화면 (유일한 페이지)
│     ├─ ui/HomePage.tsx    # 클라이언트 전용으로 HomeView를 불러온다 (난수·URL 때문에 SSR 안 함)
│     ├─ ui/HomeView.tsx    # 사이드바·재생바·시각화·설정 카드 배치와 페이지 상태
│     └─ model/
│        ├─ urlState.ts     # 상태 ↔ URL 쿼리
│        ├─ slots.ts        # 비교 모드 슬롯 → 재생기 슬롯 구성
│        └─ useKeyboardShortcuts.ts
├─ widgets/
│  └─ visualizer/           # 시각화 무대 (막대·구조 보기, 코드 패널, 통계)
│     ├─ ui/VisualizerStage.tsx
│     ├─ ui/structure/      # StructureView, TreeCanvas, BinsCanvas
│     └─ model/
│        ├─ structure.ts    # 힙·BST 노드 배치
│        ├─ orbit.ts        # 트리 노드 교환 애니메이션 경로
│        └─ structures/     # scene(구조 장면 계산), trees, bins
├─ features/
│  ├─ playback/             # 정렬 계산(워커)과 재생
│  │  ├─ model/sortJob.ts        # 작업 하나 실행 (워커·대체 경로 공용)
│  │  ├─ model/sort.worker.ts    # 워커 진입점
│  │  ├─ model/runInBackground.ts # 워커 풀 (재사용, 미리 띄우기)
│  │  ├─ model/track.ts          # 연산 로그를 앞뒤로 재생하는 커서
│  │  ├─ model/useSortPlayer.ts  # 재생 상태·속도·프레임 루프
│  │  └─ ui/                     # PlaybackBar, TrackStatsView, icons
│  ├─ select-algorithm/     # AlgorithmSidebar(폴더 트리), CompareToggle, AlgorithmOptions
│  ├─ configure-array/      # ArrayConfigurator (크기·프리셋·직접 입력)
│  ├─ sort-sound/           # 값 → 음높이, Web Audio 합성, 슬롯별 음소거
│  └─ toggle-theme/         # ThemeToggle
├─ entities/
│  ├─ sort-algorithm/
│  │  ├─ core.ts            # UI 없는 공개 API (워커용)
│  │  ├─ index.ts           # core + AlgorithmInfoCard, CodePanel
│  │  ├─ algorithms/        # 알고리즘 58개, 각각 xxxSort.ts + xxxSort.test.ts
│  │  ├─ model/
│  │  │  ├─ types.ts        # SortAlgorithm, SortOptions, SortResult
│  │  │  ├─ tracer.ts       # 알고리즘이 배열을 다루는 유일한 통로, 연산 기록
│  │  │  ├─ op.ts           # 연산 로그 형식(Int32Array)과 적용
│  │  │  ├─ run.ts          # runSort: 알고리즘 실행 → SortResult
│  │  │  ├─ code-lines.ts   # defineCode, //@표식 → 줄 번호
│  │  │  ├─ registry.ts     # ALGORITHMS 목록, AlgorithmId
│  │  │  ├─ families.ts     # 사이드바 폴더(계열) 구성
│  │  │  └─ search.ts       # 이름·설명·id 검색
│  │  ├─ testing/sortSuite.ts # describeSortAlgorithm 등 공용 테스트 도구
│  │  └─ ui/                # AlgorithmInfoCard, CodePanel
│  └─ array/
│     ├─ lib/               # generate(프리셋별 생성·섞기), parse(직접 입력)
│     ├─ model/constants.ts # 크기·값 범위, 프리셋
│     └─ ui/                # ArrayBars(DOM, 애니메이션), CanvasBars(막대가 많을 때)
└─ shared/
   ├─ lib/                  # cn, theme(읽기·저장·useTheme)
   ├─ ui/                   # Card
   ├─ model/                # ArrayItem 타입
   └─ config/               # PALETTE
```

## 정렬 파이프라인

```
SortAlgorithm.sort(t)          entities/sort-algorithm/algorithms/*.ts
  → Tracer가 연산 기록          entities/sort-algorithm/model/tracer.ts
  → SortResult(ops: Int32Array) entities/sort-algorithm/model/run.ts, op.ts
  → 워커 풀에서 계산            features/playback/model/runInBackground.ts, sort.worker.ts, sortJob.ts
  → Track이 단계별 재생         features/playback/model/track.ts, useSortPlayer.ts
  → 화면에 그림                 widgets/visualizer (막대: entities/array/ui, 코드 줄: entities/sort-algorithm/ui/CodePanel)
  → 소리                        features/sort-sound
```

- 정렬은 배열 스냅샷이 아니라 **연산 로그**로 기록한다. 로그는 `[type, a, b, line]`을 반복하는 `Int32Array`이고, 워커에서 메인 스레드로 복사 없이 넘긴다(transfer).
- `line`은 그 연산을 만든 설명 코드 줄 번호다. 코드 패널 하이라이트와 줄별 실행 횟수가 이것을 쓴다. 설명 코드는 실제 기록 방식과 1:1이어야 한다.
- 연산은 비교(Compare), 교환(Swap), 이동(Move), 읽기(Mark) 네 가지다.
- 연산이 폭발하는 알고리즘은 `MAX_OPS`(300만)에서 멈추고 `truncated`가 된다.

## 새 파일을 어디에 둘까

| 이런 코드라면 | 여기에 |
|---|---|
| 도메인을 모르는 UI 조각, 유틸 | `shared/ui`, `shared/lib` |
| 정렬 알고리즘·배열에 관한 데이터·순수 로직·그 표현 | `entities/<슬라이스>` |
| 사용자가 하는 동작 하나(버튼·입력과 그 상태) | `features/<동작>` |
| 여러 기능을 묶은 화면 블록 | `widgets/<블록>` |
| 페이지 배치, 페이지 전체 상태 | `views/<페이지>` |

슬라이스 안에서는 세그먼트로 나눈다: `ui`(컴포넌트), `model`(상태·도메인 로직), `lib`(보조 함수), `config`(상수). 새 알고리즘 추가 절차는 `.claude/skills/add-algorithm/SKILL.md`에 있다.

## 테스트

- 대상 파일 옆에 `*.test.ts`로 둔다. Vitest는 node 환경이라 DOM 렌더링 테스트는 없다. 로직은 `model`·`lib`로 빼서 테스트한다.
- Claude Code 훅의 판단 로직 테스트는 `.claude/hooks/*.test.mjs`, FSD 검사 스크립트 테스트는 `scripts/*.test.mjs`에 있다.
