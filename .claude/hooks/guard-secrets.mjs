// PreToolUse(Edit|Write|MultiEdit): 공개 저장소라 비밀값이 파일에 들어가기 전에 막는다
import { block, readInput } from "./io.mjs";
import { findSecret, isSecretExempt, writtenText } from "./rules.mjs";

const input = await readInput();
const toolInput = input.tool_input ?? {};
if (!isSecretExempt(toolInput.file_path ?? "")) {
  const kind = findSecret(writtenText(toolInput));
  if (kind) block(`${kind}로 보이는 값이 있어 쓰기를 막았어요. 비밀값은 .env.local에 두고 코드에서는 환경 변수로 읽으세요.`);
}
