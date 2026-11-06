// PreToolUse(Bash|PowerShell): 되돌릴 수 없는 위험한 명령과 main 브랜치 직접 커밋을 막고,
// 여러 작업이 섞인 PR을 만들려 하면 사용자에게 묻는다
import { ask, block, commandDirOf, git, readInput } from "./io.mjs";
import { dangerousCommand, isGitCommit, isPrCreate, mainCommitTypes, prHeadBranch } from "./rules.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";
// worktree의 서브에이전트는 자기 worktree 브랜치에서 커밋하므로 명령이 도는 폴더를 본다
const dir = commandDirOf(input);

const danger = dangerousCommand(command);
if (danger) block(`위험한 명령이라 막았어요 (${danger}). 꼭 필요하면 사용자가 직접 실행하게 안내하세요.`);

if (isGitCommit(command)) {
  const branch = git(dir, ["branch", "--show-current"])?.trim();
  if (branch === "main") block("main 브랜치에는 직접 커밋하지 않아요. 기능 브랜치를 먼저 만드세요 (git switch -c <이름>).");
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
