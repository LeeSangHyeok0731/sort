// PostToolUse(Edit|Write): run eslint --fix on the edited src file and report only the errors it could not fix
import { dirname } from "node:path";
import { block, readInput, repoRootOf, runNodeBin } from "./io.mjs";
import { lintTarget } from "./rules.mjs";

const input = await readInput();
const filePath = input.tool_input?.file_path ?? "";
// Judge by the working tree the file belongs to (a file edited in a worktree is linted with that worktree's config)
const root = filePath ? repoRootOf(dirname(filePath)) : null;
const file = root ? lintTarget(filePath, root) : null;
if (file) {
  const { status, output } = runNodeBin(root, "node_modules/eslint/bin/eslint.js", ["--fix", file]);
  if (status !== 0) block(`eslint errors (${file}, remaining after auto-fix):\n${output.trim()}`);
}
