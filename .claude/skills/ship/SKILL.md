---
name: ship
description: 현재 기능 브랜치를 검사 → push → PR → CI 확인 → main 머지까지 반영할 때 사용한다. 사용자가 push·머지를 승인했을 때만 실행한다.
---

# 기능 브랜치 반영

사용자가 이번 대화에서 push·PR·머지를 승인했을 때만 진행한다. 어느 단계든 실패하면 그 자리에서 멈추고 출력과 함께 보고한다. 우회(`--no-verify`, force push, 검사 생략)는 하지 않는다.

## 1. 브랜치 확인

```bash
git branch --show-current
git status --short
```
- `main`이면 멈춘다(main에는 직접 반영하지 않는다).
- 커밋 안 된 변경이 있으면 멈추고 커밋할지 묻는다.
- `docs/perf-benchmark`이면 2·3단계(검사, push)만 하고 끝낸다. 이 브랜치는 PR·머지하지 않는다.

## 2. 검사

```bash
npm run typecheck
npm test
npm run lint
```

## 3. push

```bash
git push -u origin <브랜치>
```

## 4. PR

제목은 커밋 컨벤션(`feat:`, `fix:`, `chore:`, `docs:` …)에 맞춘 한국어 한 줄. 본문:

```markdown
## 변경 내용
- (무엇을 왜 바꿨는지, 핵심만)

## 확인
- `tsc`, `eslint`, 테스트 N개 통과
- (브라우저에서 확인한 것)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

```bash
gh pr create --base main --head <브랜치> --title "<제목>" --body "<본문>"
```

## 5. CI

```bash
gh pr checks <번호> --watch --interval 15
```
`Lint · Typecheck · Test`와 Vercel이 모두 pass여야 한다.

## 6. 머지

기존 PR과 같은 머지 커밋 방식을 쓴다.
```bash
gh pr merge <번호> --merge --delete-branch
git switch main
git pull --ff-only
```

## 7. 보고

PR 링크, 머지 커밋 해시, CI 결과를 짧게 알린다.
