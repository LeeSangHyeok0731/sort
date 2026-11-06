---
name: parallel-tasks
description: 서로 다른 작업 둘 이상을 한 번에 맡았을 때 사용한다(예 "1, 2, 3 고치자", 서브에이전트 여러 개로 병렬 작업). 작업마다 main에서 브랜치를 따로 만들고 worktree 서브에이전트로 나눠 진행한 뒤, PR도 작업마다 따로 올린다.
---

# 작업 하나당 브랜치·PR 하나

여러 작업을 함께 맡아도 **작업 하나 = 브랜치 하나 = PR 하나**다. 한 브랜치에 커밋만 나눠 PR 하나로 묶지 않는다. PR을 만들 때 커밋 접두어가 섞여 있으면 `guard-command.mjs` 훅이 사용자에게 묻는다.

## 1. 작업 나누기

- 작업마다 브랜치 이름을 `<접두어>/<짧은-이름>`으로 정한다(예: `ci/build-check`, `fix/sort-error-status`). 접두어는 그 작업의 커밋 접두어와 같다.
- 작업끼리 같은 파일을 고쳐야 하면, 따로 진행하면 머지할 때 충돌한다. 그런 작업은 하나로 묶을지, 순서대로 할지 사용자에게 묻는다.
- 큰 기능이 섞여 있으면 CLAUDE.md 규칙대로 그 작업은 설계 문서부터 쓴다.

## 2. 서브에이전트 띄우기

작업마다 `Agent`를 `isolation: "worktree"`로 띄운다. 서로 의존하지 않으면 한 메시지에서 함께 띄운다. 각 서브에이전트는 `.claude/worktrees/` 아래 자기 작업 사본에서 일하므로, 같은 폴더에서 서로의 파일을 덮어쓰지 않는다.

프롬프트에 꼭 넣을 것:

```
- 지금 폴더는 이 작업 전용 git worktree다. 원래 저장소 폴더로 cd하지 말고, 이 폴더 밖 파일은 고치지 마라.
- 시작하자마자 브랜치를 맞춘다: `git log --oneline main..HEAD`가 비어 있으면(main과 같은 커밋이면)
  `git branch -m <브랜치>`로 이름만 바꾸고, 아니면 `git switch -c <브랜치> main`.
- 맡은 작업만 한다. 다른 작업 범위의 개선을 발견하면 고치지 말고 보고에 적어라.
- bare `git stash`·`git stash pop`은 쓰지 마라(stash는 모든 worktree가 함께 쓴다).
- 끝나면 `npm run lint`, `npm run lint:fsd`, `npm run typecheck`, `npm test`를 돌리고,
  통과하면 커밋 컨벤션에 맞는 한국어 메시지로 커밋한다. push·PR은 하지 마라.
- 보고: 브랜치 이름, 커밋 해시, 바꾼 파일, 검사 결과, 확인이 필요한 점.
```

- worktree에는 `node_modules`가 없다. 그래도 Node가 위쪽 폴더로 올라가 프로젝트 루트의 `node_modules`를 찾으므로 lint, lint:fsd, typecheck, vitest는 그대로 돈다(확인함).
- `npm run build`는 worktree에서 돌려 본 적이 없다. 빌드 확인은 3단계에서 본 폴더에서 한다.

## 3. 검토

서브에이전트 보고만 믿지 말고 브랜치마다 직접 확인한다.

```bash
git diff main...<브랜치> --stat
git diff main...<브랜치>
```

- worktree가 정리되기 전에는 본 폴더에서 그 브랜치로 `git switch`할 수 없다. 같은 브랜치를 두 폴더에서 동시에 체크아웃할 수 없기 때문이다. worktree 안에서 검사하거나, 먼저 `git worktree remove <경로>`로 정리한다.
- 본 폴더에서 브랜치마다 CI와 같은 검사를 돌린다: `npm run lint && npm run lint:fsd && npm run typecheck && npm test && npm run build && npm run check:worker`.

## 4. 반영

- push·PR·머지는 사용자가 승인한 뒤에만 한다. 브랜치마다 `/ship`을 **따로** 돌려 PR을 하나씩 올린다.
- 앞 PR을 머지한 뒤 뒤 브랜치가 충돌하면 그 브랜치에서 `git merge main`으로 맞춘다. rebase 뒤 force push는 권한 설정이 막는다.
- 사용자에게 보고할 때는 PR 링크를 작업별로 나눠 적는다.

## 5. 정리

- 변경 없이 끝난 worktree는 자동으로 지워진다. 남은 것은 `git worktree list`로 확인하고, 머지가 끝나면 `git worktree remove <경로>`로 지운다.
- 셸이 그 worktree 안에 있으면 지워지지 않는다. 먼저 다른 폴더로 나와서 지운다.
