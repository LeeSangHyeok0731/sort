// PreToolUse(Edit|Write|MultiEdit): this is a public repository, so block secrets before they get into a file
import { block, readInput } from "./io.mjs";
import { findSecret, isSecretExempt, writtenText } from "./rules.mjs";

const input = await readInput();
const toolInput = input.tool_input ?? {};
if (!isSecretExempt(toolInput.file_path ?? "")) {
  const kind = findSecret(writtenText(toolInput));
  if (kind) block(`Blocked the write: it contains what looks like a ${kind}. Keep secrets in .env.local and read them from environment variables in code.`);
}
