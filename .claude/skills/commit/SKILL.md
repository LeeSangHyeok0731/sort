---
name: commit
description: 브랜치에서 필요한 일 하나를 마쳤을 때 커밋한다("커밋해줘", "변경 저장해", 구현 중 작업 단위 하나를 끝냈을 때). 변경 확인 → 이번 일 파일만 스테이징 → 관련 검사 → 접두어·한국어 메시지로 커밋. push는 하지 않는다.
---

# 커밋

규칙의 원본은 CLAUDE.md의 "커밋 규칙"이다. 이 스킬은 그 규칙대로 커밋하는 순서만 적는다.

## 1. 브랜치 확인

```bash
git branch --show-current
```
- `main`이면 멈춘다. 작업 브랜치부터 만든다(`git switch -c <접두어>/<이름>`). 훅도 main 커밋을 막는다.
- 브랜치 전환과 커밋을 한 명령으로 잇지 않는다(`git switch -c x && git commit`). 훅은 명령을 실행하기 전의 브랜치를 보기 때문에 막힌다. 따로 실행한다.

## 2. 변경 확인

```bash
git status --short
git diff
git diff --cached
```
- 이번 일과 무관한 변경은 이번 커밋에 넣지 않는다. 사용자가 만든 변경일 수 있으니 되돌리지 말고 보고에 적는다.
- 일이 둘 이상 섞여 있으면 일마다 나눠 커밋한다(3~6단계를 일마다 반복). 판단 기준: 접두어 하나와 한국어 한 줄로 설명되는가. 설명에 "~하고 ~도"가 필요하면 나눈다.

## 3. 스테이징

```bash
git add <파일> <파일> ...
```
- 파일을 이름으로 지정한다. `git add -A`, `git add .`은 쓰지 않는다.
- 스테이징한 목록을 `git diff --cached --stat`으로 다시 본다. 다음이 섞이지 않았는지 확인한다.
  - `.env*`, `.claude/settings.local.json`, 빌드 결과(`.next/`), 임시 파일
- 일에 딸린 테스트는 같은 커밋에 넣는다.

## 4. 검사

이번 커밋에 든 파일에 맞춰 돌린다.

| 바꾼 것 | 돌릴 것 |
|---|---|
| `src` 아래 | 관련 테스트(`npx vitest run <폴더>`), `npm run typecheck`, `npx eslint <파일>` |
| `.claude/hooks`, `scripts` | `npx vitest run .claude/hooks` 또는 `npx vitest run scripts` |
| 문서만 | 없음 |

실패하면 커밋하지 않고 고친다. 전체 검사는 `/verify`에서 한다.

## 5. 메시지

```
<접두어>: <무엇을 했는지 한국어 한 줄>

<필요하면: 왜 그렇게 했는지>
```
- 접두어는 `feat` `fix` `perf` `refactor` `style` `test` `docs` `chore` `ci` 중 하나다.
- 제목은 결과를 쓴다. 예: `fix: 슬라이더에 포커스가 있어도 Space 단축키 동작`. "수정함", "업데이트" 같은 말만 쓰지 않는다.
- 버그 수정이면 본문에 원인을 한 줄 쓴다.
- Claude 공동 작성자 줄(`Co-Authored-By: Claude …`)은 넣지 않는다. 훅이 막는다.

## 6. 커밋

```bash
git commit -m "<제목>" -m "<본문>"
git log -1 --format='%h %s'
```
- push하지 않는다. push·PR은 사용자 승인 뒤 `/pr`에서 한다.
- **이미 만든 커밋은 고치지 않는다.** 실수, 빠뜨린 파일, 리뷰 반영은 새 커밋으로 더한다. `git commit --amend`, `git rebase`는 훅이 막는다.
- 훅에 막히면 메시지가 알려 주는 대로 고쳐 다시 커밋한다. 훅을 피해 가지 않는다(`--no-verify` 등).

## 7. 보고

커밋 해시, 제목, 들어간 파일 수를 한 줄로 알린다. 커밋에서 뺀 변경이 있으면 함께 적는다.
