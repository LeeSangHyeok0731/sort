// PostToolUse(Edit|Write): 수정한 src 파일에 eslint --fix를 돌리고, 자동으로 못 고친 오류만 알려준다
import { dirname } from "node:path";
import { block, readInput, repoRootOf, runNodeBin } from "./io.mjs";
import { lintTarget } from "./rules.mjs";

const input = await readInput();
const filePath = input.tool_input?.file_path ?? "";
// 파일이 속한 작업 트리 기준으로 본다 (worktree에서 고친 파일은 그 worktree의 설정으로 검사)
const root = filePath ? repoRootOf(dirname(filePath)) : null;
const file = root ? lintTarget(filePath, root) : null;
if (file) {
  const { status, output } = runNodeBin(root, "node_modules/eslint/bin/eslint.js", ["--fix", file]);
  if (status !== 0) block(`eslint 오류 (${file}, 자동 수정 후 남은 것):\n${output.trim()}`);
}
