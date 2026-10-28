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
```

CI(`.github/workflows/ci.yml`)는 PR마다 lint → lint:fsd → typecheck → test를 돌린다.

## 작업 규칙

- 답변, 커밋 메시지, PR, 코드 주석은 **한국어**로 쓴다.
- 작업은 기능별 브랜치에서 한다(main에 직접 커밋하면 훅이 막는다). 커밋까지는 바로 해도 되고, **push·PR·머지는 사용자 승인 후** `/ship` 절차로 한다.
- `docs/perf-benchmark` 브랜치는 성능 측정 기록용이다. push만 하고 PR·머지하지 않는다.
- 모바일 화면은 고려하지 않는다.
- 큰 기능은 설계(`docs/superpowers/specs/`)와 구현 계획(`docs/superpowers/plans/`)을 먼저 문서로 남긴다.
- 커밋 메시지는 `feat:`, `fix:`, `perf:`, `refactor:`, `style:`, `test:`, `docs:`, `chore:`, `ci:` 접두어를 쓴다.

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
| `settings.json` 권한 | lint·test·typecheck·build, git 조회, `gh pr view/checks/list` 허용. force push, main 직접 push, `git reset --hard` 거부 |
| 훅 `lint-file.mjs` | Edit·Write 후 수정한 `src` 파일에 `eslint --fix`, 남은 오류만 알려줌 |
| 훅 `guard-command.mjs` | 위험한 명령(`rm -rf ~`·`/`, `sudo`, `dd`, 포맷, `curl \| sh`)과 main 브랜치 `git commit` 차단 |
| 훅 `guard-secrets.mjs` | 파일에 비밀값(AWS·GitHub·`sk-` 키, PEM, Slack 토큰)을 쓰려 하면 차단. `.env*`는 제외 |
| 훅 `typecheck-on-stop.mjs` | 턴이 끝날 때 `src`에 변경이 있으면 tsc, 실패하면 이어서 고침 |
| 스킬 `/add-algorithm` | 새 정렬 알고리즘 추가 절차 |
| 스킬 `/ship` | 검사 → push → PR → CI → 머지 (승인 후) |

개인 설정은 `.claude/settings.local.json`(커밋 안 함)에 둔다.

@docs/ARCHITECTURE.md
