// PreToolUse(Bash|PowerShell): 되돌릴 수 없는 위험한 명령과 main 브랜치 직접 커밋을 막는다
import { spawnSync } from "node:child_process";
import { block, projectDirOf, readInput } from "./io.mjs";
import { dangerousCommand, isGitCommit } from "./rules.mjs";

const input = await readInput();
const command = input.tool_input?.command ?? "";

const danger = dangerousCommand(command);
if (danger) block(`위험한 명령이라 막았어요 (${danger}). 꼭 필요하면 사용자가 직접 실행하게 안내하세요.`);

if (isGitCommit(command)) {
  const branch = spawnSync("git", ["branch", "--show-current"], {
    cwd: projectDirOf(input),
    encoding: "utf8",
  }).stdout?.trim();
  if (branch === "main") block("main 브랜치에는 직접 커밋하지 않아요. 기능 브랜치를 먼저 만드세요 (git switch -c <이름>).");
}
