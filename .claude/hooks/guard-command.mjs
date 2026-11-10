// PreToolUse(Bash|PowerShell): 되돌릴 수 없는 위험한 명령, settings.json deny 규칙을 형태만 바꿔 피한 git 명령, main 브랜치 직접 커밋, Claude 공동 작성자 줄이 든 커밋,
// 커밋 기록을 고치는 명령(amend·rebase)을 막고, 파일을 쓰는 조회·검사 명령(git diff·log·show --output, eslint --fix 등)과 여러 작업이 섞인 PR은 사용자에게 묻는다
import { ask, block, commandDirOf, git, readInput } from "./io.mjs";
import {
  dangerousCommand,
  forbiddenGit,
  gitOutputFile,
  hasClaudeCoauthor,
  historyRewrite,
  isGitCommit,
  isPrCreate,
  mainCommitTypes,
  prHeadBranch,
  toolWriteOption,
} from "./rules.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";
// worktree의 서브에이전트는 자기 worktree 브랜치에서 커밋하므로 명령이 도는 폴더를 본다
const dir = commandDirOf(input);

const danger = dangerousCommand(command);
if (danger) block(`위험한 명령이라 막았어요 (${danger}). 꼭 필요하면 사용자가 직접 실행하게 안내하세요.`);

const forbidden = forbiddenGit(command);
if (forbidden) block(`거부 목록의 명령이라 막았어요 (${forbidden}). 꼭 필요하면 사용자가 직접 실행하게 안내하세요.`);

const rewrite = historyRewrite(command);
if (rewrite) {
  block(`이미 만든 커밋은 고치지 않아요 (${rewrite}). 고칠 내용은 새 커밋으로 더하세요 (CLAUDE.md 커밋 규칙).`);
}

if (isGitCommit(command)) {
  const branch = git(dir, ["branch", "--show-current"])?.trim();
  if (branch === "main") block("main 브랜치에는 직접 커밋하지 않아요. 기능 브랜치를 먼저 만드세요 (git switch -c <이름>).");
  if (hasClaudeCoauthor(command)) {
    block("커밋에 Claude 공동 작성자 줄(Co-Authored-By: Claude)을 넣지 않아요. 그 줄을 빼고 다시 커밋하세요.");
  }
}

const outputWrite = gitOutputFile(command);
if (outputWrite) {
  ask(`${outputWrite}는 결과를 파일에 써요. 조회 명령이라 허용 목록에 있지만 파일을 덮어쓸 수 있어 확인합니다. 실행할까요?`);
}

const toolWrite = toolWriteOption(command);
if (toolWrite) {
  ask(`${toolWrite}는 파일을 고치거나 써요. 검사 명령이라 허용 목록에 있지만 쓰기라 확인합니다. 실행할까요?`);
}

if (isPrCreate(command)) {
  const head = prHeadBranch(command) ?? "HEAD";
  const subjects = git(dir, ["log", "--no-merges", "--format=%s", `main..${head}`]);
  const types = subjects ? mainCommitTypes(subjects.split("\n").filter(Boolean)) : [];
  if (types.length > 1) {
    ask(
      `이 PR에 서로 다른 작업 커밋(${types.join(", ")})이 섞여 있어요. ` +
        "작업 하나당 브랜치·PR 하나가 규칙입니다(/parallel-tasks). 그래도 하나로 올릴까요?"
    );
  }
}
