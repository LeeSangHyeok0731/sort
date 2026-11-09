---
name: pr
description: 작업 브랜치를 push하고 PR을 올릴 때 쓴다("PR 올려줘", "push해"). 사용자가 push·PR을 승인했을 때만 실행한다. 브랜치·작업 섞임 확인 → 개발 로그 항목 → /verify → push → PR → CI 확인까지 하고, 머지는 하지 않는다(/merge).
---

# PR 올리기

사용자가 이번 대화에서 push나 PR을 승인했을 때만 진행한다. 어느 단계든 실패하면 그 자리에서 멈추고 출력과 함께 보고한다. 우회(`--no-verify`, force push, 검사 생략)는 하지 않는다.

## 1. 브랜치 확인

```bash
git branch --show-current
git status --short
git log --oneline main..HEAD
```
- `main`이면 멈춘다.
- 커밋 안 된 변경이 있으면 멈추고 커밋할지 묻는다(`/commit`).
- `docs/perf-benchmark`면 `git push`만 하고 끝낸다. 이 브랜치는 PR·머지하지 않고 개발 로그도 쓰지 않는다.

## 2. 작업이 섞였는지

`git log --oneline main..HEAD`의 접두어를 본다.
- 서로 다른 작업 커밋(`feat`과 `ci`처럼)이 섞여 있으면 멈추고 나눌지 묻는다(`/parallel-tasks`).
- 일에 딸린 `test:`·`docs:`·`style:` 커밋은 섞인 것으로 보지 않는다.
- `gh pr create` 때 훅도 같은 것을 확인해서 묻는다.

## 3. 개발 로그 항목

`DEVELOPMENT_LOG.md`에 이 PR의 항목을 하나 쓴다. PR 하나에 항목 하나다.

1. 파일 끝을 본다: `grep -n "^## \|^### [0-9]*\.\|마지막 업데이트" DEVELOPMENT_LOG.md | tail -5`
2. 마지막 날짜 머리(`## 📅 YYYY. MM. DD …`)가 오늘이 아니면, 마지막 `---` 앞에 오늘 날짜 머리를 새로 만든다. 날짜 구역 사이에는 `---`를 둔다.
3. 마지막 번호 다음 번호로 항목을 쓴다.

   ```markdown
   ### N. <이모지> <제목>

   - 무엇을, 왜 바꿨는지 (3~6줄 목록)
   - 사용자에게 보이는 변화가 있으면 그것부터
   ```
4. 파일 끝의 `_마지막 업데이트: YYYY-MM-DD_`를 오늘 날짜로 바꾼다.
5. `/commit`으로 `docs: 개발 로그에 <제목> 추가`를 커밋한다.

## 4. 확인

- `/verify`를 돌린다. 이미 돌렸고 그 뒤에 바뀐 게 개발 로그뿐이면 생략해도 된다. 생략했으면 PR 본문에 그렇게 쓴다.
- `/review`를 거쳤는지 본다. 거치지 않았으면 **여기서 멈추고** `/review`를 돌린 뒤, 리뷰 결과와 고친 커밋을 보고하고 push·PR 승인을 다시 받는다. 사용자는 리뷰 결과를 보고 승인해야 한다.
- 리뷰를 생략해도 되는 것은 `DEVELOPMENT_LOG.md`·`README.md`처럼 동작에 영향이 없는 문서만 바뀐 PR이다. `.claude/`(스킬·에이전트·훅)와 `CLAUDE.md` 변경은 작업 흐름을 바꾸므로 리뷰한다. 생략했으면 PR 본문에 그렇게 쓴다.

## 5. push와 PR

```bash
git push -u origin <브랜치>
```

PR 본문은 `.github/pull_request_template.md` 형식으로, 임시 폴더(스크래치패드)의 파일에 써서 넘긴다. 셸 따옴표 문제를 피하기 위해서다.

```bash
gh pr create --base main --head <브랜치> --title "<접두어>: <한국어 한 줄>" --body-file <본문 파일>
```
- 제목은 커밋 컨벤션을 따른다. 커밋이 하나면 그 제목을 쓴다.
- "변경 내용"에는 무엇을, 왜 바꿨는지 쓴다. "확인"에는 `/verify` 보고와 `/review` 결과(받은 지적·받지 않은 지적)를 옮긴다.
- 본문 끝에 "Generated with Claude Code" 줄을 넣지 않는다(`attribution.pr: ""`).
- 훅이 작업 섞임을 물으면 사용자 답을 따른다.

## 6. CI 확인

```bash
gh pr checks <번호> --watch --interval 20
```
- PR을 만든 직후에는 체크가 아직 없어서 "no checks reported"가 나올 수 있다. 잠시 기다렸다가 다시 본다.
- `Lint · Typecheck · Test`는 main ruleset의 필수 체크라, 통과해야 머지된다. Vercel 미리보기도 함께 본다.
- 실패하면 원인을 보고하고 새 커밋으로 고친 뒤 push한다(`/commit`).

## 7. 보고

PR 링크, CI 결과, 개발 로그 번호를 알린다. **머지하지 않는다.** 머지는 사용자가 승인한 뒤 `/merge`로 한다.
