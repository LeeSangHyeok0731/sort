# Claude Code 작업 하네스 설계

## 배경
이 저장소에는 Claude Code용 설정이 없다. 작업 규칙(한국어 답변, PR 흐름, `docs/perf-benchmark`는 push만 등)은 개인 메모리에만 있고, 매 세션 같은 명령(lint·tsc·test, push→PR→CI→머지)을 손으로 반복한다. FSD 레이어 규칙은 지금 지켜지고 있지만 문서나 검사로 고정되어 있지 않다.

## 목표
- 작업 규칙과 파일 구조를 저장소에 문서로 고정한다. 파일 구조 문서가 가장 큰 부분이다.
- FSD 의존 방향과 공개 진입점 규칙을 ESLint로 검사해 에디터와 CI에서 잡는다.
- 자주 쓰는 명령은 권한을 미리 허용하고, 위험한 git 명령은 막는다.
- 훅으로 수정 직후 lint, 턴 끝 타입 검사, main 직접 커밋 차단을 자동화한다.
- 반복 절차(알고리즘 추가, 배포)를 프로젝트 스킬로 만든다.

## 1. 문서

### `CLAUDE.md` (저장소 루트)
짧게 유지한다(100줄 이하). 내용:
- 프로젝트 한 줄 소개, 스택(Next.js 16 Turbopack, React 19, Tailwind 4, Vitest)
- 명령어: `npm run dev`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`
- 작업 규칙
  - 모든 답변·커밋 메시지·PR은 한국어
  - 기능별 브랜치 → 커밋 → 사용자 승인 후 push·PR·CI 확인·머지(`/ship`)
  - `docs/perf-benchmark` 브랜치는 push만 하고 PR·머지하지 않는다
  - 모바일 화면은 고려하지 않는다
  - 큰 기능은 `docs/superpowers/specs`(설계)와 `plans`(계획)에 문서를 남긴다
- 주의할 점: Turbopack dev 캐시(`.next/dev`)가 오래된 CSS를 내보내면 서버를 끄고 `.next/dev`를 지운다
- 구조는 `docs/ARCHITECTURE.md`를 가리킨다(`@docs/ARCHITECTURE.md`로 불러온다)

### `docs/ARCHITECTURE.md`
- **레이어 지도:** `app → views → widgets → features → entities → shared`. 위 레이어만 아래 레이어를 import할 수 있고, 같은 레이어의 다른 슬라이스는 import하지 않는다.
- **파일 구조 트리:** `src/` 아래 모든 슬라이스와 세그먼트(`ui`, `model`, `lib`, `config`, `algorithms`, `testing`)를 트리로 그리고, 슬라이스마다 한 줄로 역할을 적는다.
- **공개 진입점:** 슬라이스 밖에서는 `@/<layer>/<slice>`(index.ts)로만 가져온다. 예외는 `@/entities/sort-algorithm/core`(React·CSS 없는 진입점, 워커용) 하나다. `shared`는 세그먼트 단위(`@/shared/lib`, `@/shared/ui` 등)로 가져온다.
- **정렬 파이프라인:** 알고리즘 `sort(t)` → tracer가 연산 기록(op log, Int32Array) → 워커 풀에서 실행(`features/playback`) → 플레이어가 단계별 재생 → `widgets/visualizer`가 그린다. 각 단계의 파일 경로를 적는다.
- **새 파일 위치 판단 기준:** 재사용 UI 조각 → `shared/ui`, 도메인 데이터·순수 로직 → `entities`, 사용자 동작 하나 → `features`, 여러 기능을 묶은 화면 블록 → `widgets`, 페이지 조립 → `views`.
- **테스트 위치:** 대상 파일 옆 `*.test.ts`. vitest는 node 환경이라 DOM 테스트는 없다.

## 2. 구조 검사 (ESLint)
`eslint.config.mjs`에 레이어별 `files` 블록을 추가하고 `no-restricted-imports`의 `patterns`로 막는다. 의존성은 추가하지 않는다.

| 대상 파일 | 금지하는 import |
|---|---|
| `src/shared/**` | `@/entities*`, `@/features*`, `@/widgets*`, `@/views*`, `@/app*` |
| `src/entities/**` | `@/features*`, `@/widgets*`, `@/views*`, `@/app*` |
| `src/features/**` | `@/widgets*`, `@/views*`, `@/app*` |
| `src/widgets/**` | `@/views*`, `@/app*` |
| `src/views/**` | `@/app*` |
| `src/**` 전체 | 슬라이스 내부 경로 `@/{entities,features,widgets,views}/*/**` (단 `@/entities/sort-algorithm/core`는 허용) |

- 같은 레이어 다른 슬라이스 금지는 규칙으로 넣지 않는다(현재 위반이 없고, 패턴으로 "자기 슬라이스만 허용"을 표현하기 어렵다). 문서로만 명시한다.
- 슬라이스 안에서는 상대 경로(`../model/x`)를 쓰므로 규칙에 걸리지 않는다.
- 메시지는 한국어로 "하위 레이어는 상위 레이어를 import할 수 없어요. docs/ARCHITECTURE.md 참고"처럼 쓴다.
- 현재 위반 1건 수정: `src/widgets/visualizer/model/structures/scene.test.ts`의 `@/features/playback/model/track` → `@/features/playback`. `Track`이 index에서 export되지 않으면 추가한다.
- 검증: 위반 import를 임시로 넣어 lint가 실패하는지 확인하고 되돌린다.

## 3. 권한 (`.claude/settings.json`, 커밋)
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint*)", "Bash(npm run typecheck*)", "Bash(npm test*)", "Bash(npm run build*)",
      "Bash(npx vitest*)", "Bash(npx tsc*)", "Bash(npx eslint*)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)", "Bash(git branch*)", "Bash(git show*)",
      "Bash(gh pr view*)", "Bash(gh pr checks*)", "Bash(gh pr list*)"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push origin main*)",
      "Bash(git reset --hard*)"
    ]
  }
}
```
PowerShell 도구용으로 같은 항목을 `PowerShell(...)` 형식으로도 넣는다. push, `gh pr create`, `gh pr merge`는 허용 목록에 넣지 않아 매번 확인을 받는다. 개인 설정은 `.claude/settings.local.json`(gitignore)에 둔다.

## 4. 훅 (`.claude/hooks/*.mjs`)
Windows(Git Bash·PowerShell)와 다른 OS에서 모두 돌도록 node 스크립트로 쓰고, settings.json에서 `node .claude/hooks/<이름>.mjs`로 부른다. 입력은 stdin JSON이다.

| 훅 | 이벤트·매처 | 동작 |
|---|---|---|
| `lint-file.mjs` | PostToolUse, `Edit\|Write` | 수정한 파일이 `src/**/*.{ts,tsx}`이면 `npx eslint <파일>`. 오류가 있으면 exit 2와 stderr로 Claude에게 돌려준다. 아니면 조용히 0 |
| `guard-main-commit.mjs` | PreToolUse, `Bash\|PowerShell` | 명령에 `git commit`이 있고 현재 브랜치가 `main`이면 exit 2로 막고 "기능 브랜치를 먼저 만드세요"를 보낸다 |
| `typecheck-on-stop.mjs` | Stop | `git status --porcelain`에 `src/` 변경이 있을 때만 `npx tsc --noEmit`. 실패하면 exit 2로 오류 앞 30줄을 돌려준다. `stop_hook_active`가 true면 바로 0으로 끝내 무한 반복을 막는다 |

- 전체 테스트는 9초 이상 걸려 Stop 훅에 넣지 않는다.
- 각 스크립트는 판단 로직(경로 필터, 명령 판별)을 함수로 분리해 `src` 밖이지만 vitest로 테스트할 수 있게 한다. `vitest.config.mts`의 include에 `.claude/hooks/**/*.test.mjs`를 추가한다.

## 5. 프로젝트 스킬 (`.claude/skills/<이름>/SKILL.md`)

### `add-algorithm`
새 정렬 알고리즘을 추가하는 절차.
1. `src/entities/sort-algorithm/algorithms/<name>Sort.ts`: `defineCode`로 보여줄 코드를 쓰고 하이라이트할 줄에 `//@라벨`을 단다. `SortAlgorithm` 객체(id, name, category, desc, complexity, stable, code, codeLabels, sort)를 export한다. `sort(t)` 안에서는 `t.cmp`/`t.swap` 등 tracer 메서드만 쓴다.
2. 같은 폴더에 `<name>Sort.test.ts`: `describeSortAlgorithm(<name>Sort)` + 알고리즘 고유 성질 테스트 1~2개.
3. `model/registry.ts`에 import와 등록.
4. `model/families.ts`의 알맞은 폴더에 id 추가(없으면 `families.test.ts`가 실패한다).
5. `npm test`, `npm run typecheck`, `npm run lint` 통과 확인.
참고 예시로 `bubbleSort.ts`/`bubbleSort.test.ts`를 가리킨다.

### `ship`
현재 기능 브랜치를 main에 반영하는 절차. 사용자가 승인했을 때만 실행한다.
1. 현재 브랜치가 `main`이면 멈춘다. `docs/perf-benchmark`이면 검사 후 push만 하고 끝낸다.
2. `npm run typecheck`, `npm test`, `npm run lint` — 하나라도 실패하면 멈추고 보고한다.
3. `git push -u origin <브랜치>`
4. `gh pr create --base main` — 제목·본문은 한국어, 본문은 "변경 내용 / 확인" 형식.
5. `gh pr checks <번호> --watch` — 실패하면 멈추고 보고한다.
6. `gh pr merge <번호> --merge --delete-branch` (기존 PR과 같은 머지 커밋 방식)
7. `git switch main && git pull --ff-only`, 결과 보고.

## 범위 밖
- 성능 측정 스킬(`/bench`)은 만들지 않는다.
- 전역 `~/.claude` 설정과 개인 메모리는 건드리지 않는다(메모리 규칙은 CLAUDE.md로 복사만 한다).
- 같은 레이어 슬라이스 간 import 자동 검사는 넣지 않는다.

## 검증
- 테스트·tsc·lint 통과(새 ESLint 규칙 포함, 훅 판단 로직 테스트 포함).
- ESLint: 위반 import를 임시로 넣어 실패하는지 확인.
- 훅: 각 스크립트에 샘플 stdin JSON을 넣어 exit code 확인(main에서 commit 차단, src 밖 파일은 lint 건너뜀, tsc 실패 시 exit 2).
