---
name: merge
description: 올린 PR을 main에 머지할 때 쓴다("머지해", "합쳐줘"). 사용자가 머지를 명시적으로 승인했을 때만 실행한다. CI 통과 확인 → 머지 커밋으로 머지 → main 동기화·브랜치 정리 → 보고.
---

# 머지

사용자가 이번 대화에서 **그 PR의 머지**를 승인했을 때만 진행한다. PR을 올리라는 승인은 머지 승인이 아니다. 어느 단계든 실패하면 멈추고 보고한다.

## 1. 확인

```bash
gh pr view <번호> --json state,mergeable,headRefName,title
gh pr checks <번호>
```
- 상태가 `OPEN`이 아니면 멈춘다.
- 체크가 하나라도 실패하거나 진행 중이면 멈춘다. 진행 중이면 `--watch`로 기다린다.
- 충돌(`mergeable: CONFLICTING`)이 있으면 3단계 방식으로 브랜치를 main에 맞추고, 다시 CI를 확인한다.

## 2. 머지

```bash
gh pr merge <번호> --merge --delete-branch
```
- 머지 커밋으로 머지한다. squash·rebase 머지는 쓰지 않는다(CLAUDE.md 커밋 규칙).
- 여러 PR을 머지할 때는 승인받은 것부터 하나씩 한다. 하나를 머지한 뒤 다음 PR의 충돌과 CI를 다시 본다.

## 3. 뒤 브랜치 맞추기 (여러 PR일 때)

앞 PR을 머지한 뒤 뒤 PR이 충돌하면, 그 브랜치에서 main을 병합한다. rebase는 쓰지 않는다(훅이 막는다).

```bash
git switch <뒤 브랜치>
git pull --ff-only
git merge main
```
- 충돌을 풀고 `/commit` 대신 병합 커밋으로 마무리한다(`git commit`, 기본 메시지).
- `/verify`를 다시 돌리고 push한다. force push는 하지 않는다.

## 4. 정리

```bash
git switch main
git pull --ff-only
git branch -d <브랜치>
```
- `--delete-branch`가 로컬 브랜치를 이미 지웠으면 마지막 줄은 건너뛴다.
- 남은 worktree가 있으면 `git worktree list`로 보고 지운다(`/parallel-tasks` 4단계).

## 5. 보고

PR 링크, 머지 커밋 해시(`git log -1 --format=%h`), CI 결과를 알린다.
