// PostToolUse(Edit|Write): 수정한 src 파일에 eslint를 돌려 오류를 바로 알려준다
import { block, projectDirOf, readInput, runNodeBin } from "./io.mjs";
import { lintTarget } from "./rules.mjs";

const input = await readInput();
const projectDir = projectDirOf(input);
const file = lintTarget(input.tool_input?.file_path ?? "", projectDir);
if (file) {
  const { status, output } = runNodeBin(projectDir, "node_modules/eslint/bin/eslint.js", [file]);
  if (status !== 0) block(`eslint 오류 (${file}):\n${output.trim()}`);
}
