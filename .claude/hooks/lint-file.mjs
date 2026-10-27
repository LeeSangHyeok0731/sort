// PostToolUse(Edit|Write): 수정한 src 파일에 eslint --fix를 돌리고, 자동으로 못 고친 오류만 알려준다
import { block, projectDirOf, readInput, runNodeBin } from "./io.mjs";
import { lintTarget } from "./rules.mjs";

const input = await readInput();
const projectDir = projectDirOf(input);
const file = lintTarget(input.tool_input?.file_path ?? "", projectDir);
if (file) {
  const { status, output } = runNodeBin(projectDir, "node_modules/eslint/bin/eslint.js", ["--fix", file]);
  if (status !== 0) block(`eslint 오류 (${file}, 자동 수정 후 남은 것):\n${output.trim()}`);
}
