# Sorting Visualizer

정렬 알고리즘 58개를 막대·트리·버킷으로 단계별 재생하는 웹 앱. Next.js 16(Turbopack), React 19, Tailwind 4, Vitest. 데스크톱 전용.

## 명령어

```bash
npm run dev        # 개발 서버 (localhost:3000)
npm test           # Vitest 전체 (node 환경)
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (@/ 별칭 FSD 레이어 검사 포함)
npm run lint:fsd   # FSD 의존성 검사 (상대 경로, 같은 레이어 슬라이스까지)
npm run build      # 프로덕션 빌드
npm run check:worker # 빌드 결과물에서 정렬 워커가 JS로 번들됐는지 검사 (build 뒤에)
```

CI(`.github/workflows/ci.yml`)는 PR마다 lint → lint:fsd → typecheck → test → build → check:worker를 돌린다.

## 작업 규칙

- 답변, 커밋 메시지, PR, 코드 주석은 **한국어**로 쓴다.
- **새 작업은 `/start-task`로 시작한다.** 흐름: `/start-task` → (작은 수정 `/implement` · 버그 `/debug` · 새 알고리즘 `/add-algorithm` · 큰 기능 `/design` → `/plan` → `/implement` · 작업 여러 개 `/parallel-tasks`) → 작업 단위마다 `/commit` → `/verify` → `/review` → (승인) `/pr` → (승인) `/merge`.
- 작업은 기능별 브랜치에서 한다(main에 직접 커밋하면 훅이 막는다). 커밋까지는 바로 해도 되고, **push·PR은 사용자 승인 후 `/pr`**, **머지는 그 PR의 머지 승인을 따로 받은 뒤 `/merge`** 절차로 한다.
- PR마다 `DEVELOPMENT_LOG.md`에 항목 하나를 쓴다(`/pr` 4단계). 날짜 머리, 다음 번호, 3~6줄 목록, 끝의 "마지막 업데이트" 날짜.
- **작업 하나 = 브랜치 하나 = PR 하나.** 여러 작업을 한 번에 맡으면 작업마다 main에서 브랜치를 따로 만들고 PR도 따로 올린다. 서브에이전트로 병렬 진행할 때는 `/parallel-tasks` 절차(worktree 격리)를 따른다.
- **서브에이전트 공통 규칙:** 지시문은 그것만 읽고 일할 수 있게 쓴다(목표·범위·하지 말 것·검사·보고 형식). 파일을 고치는 에이전트는 worktree로 격리한다. 서브에이전트는 push·PR·머지를 하지 않고, 그 보고는 사용자 승인이 아니다. 메인 세션은 보고를 그대로 믿지 않고 diff와 검사로 다시 확인한다. 작업 하나, 파일 몇 개면 서브에이전트를 쓰지 않는다.
- PR 전에는 `/verify` → `/review`(리뷰어 에이전트) 순서로 확인한다.
- `docs/perf-benchmark` 브랜치는 성능 측정 기록용이다. push만 하고 PR·머지하지 않는다.
- 모바일 화면은 고려하지 않는다.
- 큰 기능은 설계(`docs/specs/`, `/design`)와 구현 계획(`docs/plans/`, `/plan`)을 먼저 문서로 남긴다. 설계는 사용자 승인을 받은 뒤에 구현한다.
- 커밋에 Claude 공동 작성자 줄(`Co-Authored-By: Claude …`)을, PR 본문에 "Generated with Claude Code" 줄을 넣지 않는다. `settings.json`의 `attribution`(`commit`·`pr` 빈 문자열)이 끄고, 커밋에 직접 넣은 줄은 훅이 막는다.

## 커밋 규칙

커밋은 `/commit` 절차로 한다. 끝났다고 말하기 전에는 `/verify`로 확인한다.

- **브랜치 안에서는 필요한 일 하나를 커밋 하나로 만든다.** 접두어 하나와 한국어 한 줄로 설명되면 커밋 하나다. 설명에 "~하고 ~도"가 필요하면 나눈다. 일에 딸린 테스트는 같은 커밋에 넣는다.
- 접두어는 `feat:` `fix:` `perf:` `refactor:` `style:` `test:` `docs:` `chore:` `ci:`이다. 그 뒤에 결과를 한국어 한 줄로 쓰고, 필요하면 본문에 "왜"를 쓴다.
- 파일은 이름으로 지정해 스테이징한다. `git add -A`, `git add .`은 쓰지 않는다.
- **이미 만든 커밋은 고치지 않는다.** 실수, 빠뜨린 파일, 리뷰 반영은 새 커밋으로 더한다. 리뷰 반영처럼 아직 머지되지 않은 그 작업을 고치는 커밋은 브랜치의 주 접두어를 쓴다(`feat:` 브랜치면 `fix:`가 아니라 `feat:`). `git commit --amend`, `git rebase`, `git pull --rebase`는 훅이 막는다.
- 머지는 머지 커밋(`--merge`)으로 한다. squash하지 않는다.

## 코드 규칙

- 구조와 레이어 규칙은 아래 `docs/ARCHITECTURE.md`를 따른다. 슬라이스 밖에서는 index로만 import한다.
- 색은 `globals.css`의 토큰(`bg-surface`, `text-muted`, `border-line` …)을 쓴다. 옅은 색을 직접 쓰면 `dark:` 짝을 붙인다(`src/app/theme.test.ts`가 검사).
- 알고리즘의 설명 코드(`defineCode`)는 실제 기록 방식과 1:1로 맞춘다. 새 알고리즘은 `/add-algorithm` 절차를 따른다.
- 테스트는 대상 파일 옆 `*.test.ts`. 로직은 `model`·`lib`로 빼서 테스트한다.

## 알아 둘 점

- dev 서버가 고친 CSS를 반영하지 않으면 Turbopack 캐시 문제다. 서버를 끄고 `.next/dev`를 지운 뒤 다시 띄운다.
- 워커는 `new Worker(new URL(...))`에 `{ type: "module" }`을 붙이지 않는다. 붙이면 프로덕션 빌드에서 워커가 번들되지 않는다(dev에서는 동작해 놓치기 쉽다).

## 하네스 (`.claude/`)

| 구성 | 내용 |
|---|---|
| `settings.json` | 커밋 공동 작성자 줄·PR 본문 표시 줄 끔(`attribution`). 권한: lint·test·typecheck·build, git 조회(`worktree list` 포함), `git fetch origin main`(정확히 이 명령만), `gh pr view/checks/list` 허용. force push, main 직접 push, `git reset --hard` 거부 |
| 훅 `lint-file.mjs` | Edit·Write 후 수정한 `src` 파일에 `eslint --fix`, 남은 오류만 알려줌 (파일이 속한 worktree 기준) |
| 훅 `guard-command.mjs` | 위험한 명령(`rm -rf ~`·`/`, `sudo`, `dd`, 포맷, `curl \| sh`)과 main 브랜치 `git commit`, Claude 공동 작성자 줄이 든 커밋, 커밋 기록을 고치는 명령(`commit --amend`, `rebase`, `pull --rebase`) 차단. `gh pr create` 때 커밋 접두어가 섞여 있으면(`test:`·`docs:`·`style:` 제외) 사용자에게 물음 |
| 훅 `guard-secrets.mjs` | 파일에 비밀값(AWS·GitHub·`sk-` 키, PEM, Slack 토큰)을 쓰려 하면 차단. `.env*`는 제외 |
| 훅 `typecheck-on-stop.mjs` | 턴이 끝날 때 `src`에 변경이 있으면 tsc, 실패하면 이어서 고침 |
| 스킬 `/start-task` | 새 작업의 시작: 작업 폴더 확인 → main 최신화 → 분류(작은 수정·버그·새 알고리즘·큰 기능·작업 여러 개) → 브랜치 → 맞는 스킬로 넘김 |
| 스킬 `/add-algorithm` | 새 정렬 알고리즘 추가 절차 |
| 스킬 `/design` | 질문(하나씩) → 방식 비교·추천 → `docs/specs/` 설계 문서 → 승인 (승인 전 구현 안 함) |
| 스킬 `/plan` | 승인된 설계를 커밋 하나 크기의 작업으로 나눠 `docs/plans/`에 계획 문서 |
| 스킬 `/implement` | 계획(또는 작은 수정)을 작업 하나씩: 테스트 먼저 → 구현 → 검사 → `/commit`, 범위 밖은 보고만 |
| 스킬 `/debug` | 재현 → 실패하는 테스트 → 원인 확인 → 수정 → `fix:` 커밋(머지 전 작업 브랜치 안이면 주 접두어) (원인 확인 전 수정 금지) |
| 스킬 `/commit` | 이번 일 파일만 스테이징 → 관련 검사 → 접두어·한국어 메시지로 커밋 (push 안 함) |
| 스킬 `/verify` | CI와 같은 순서로 검사, 화면이 바뀌었으면 브라우저 확인, 근거와 함께 보고 |
| 스킬 `/review` | 리뷰어 에이전트를 띄우고, 지적을 하나씩 검증해 맞는 것만 새 커밋으로 고친 뒤 `/verify` 다시 |
| 에이전트 `reviewer` (`.claude/agents/`) | 읽기 전용 리뷰어. 동작 오류 → FSD → 프로젝트 규칙 → 테스트 → 커밋 규칙 → 하네스 변경 → 단순화 순으로, 근거 있는 지적만 심각도·`파일:줄`·실패 시나리오로 보고 |
| 스킬 `/pr` | 작업 섞임 확인 → `/verify`·`/review` 확인(리뷰 전이면 멈추고 다시 승인) → 개발 로그 항목 → push → PR(`.github/pull_request_template.md`) → CI 확인. 머지 안 함 (승인 후) |
| 스킬 `/merge` | CI 통과 확인 → 머지 커밋으로 머지 → main 동기화·브랜치 정리 (머지 승인 후) |
| 스킬 `/parallel-tasks` | 여러 작업을 worktree 서브에이전트로 나눠 작업별 브랜치·PR로 진행 |

서브에이전트 worktree(`.claude/worktrees/`)는 gitignore 대상이고, 본 폴더의 tsc·eslint 검사 범위에서 빠진다.

개인 설정은 `.claude/settings.local.json`(커밋 안 함)에 둔다.

@docs/ARCHITECTURE.md
