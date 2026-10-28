// 훅 스크립트가 쓰는 순수 판단 함수. 입출력 없이 테스트할 수 있게 분리했다

const toPosix = (p) => p.replace(/\\/g, "/");

/** 수정된 파일이 lint 대상(src 아래 ts·tsx)이면 프로젝트 기준 상대 경로, 아니면 null */
export function lintTarget(filePath, projectDir) {
  if (!filePath) return null;
  const root = toPosix(projectDir).replace(/\/$/, "") + "/";
  const file = toPosix(filePath);
  // Windows 경로는 드라이브 문자 대소문자가 섞여 들어올 수 있다
  if (!file.toLowerCase().startsWith(root.toLowerCase())) return null;
  const rel = file.slice(root.length);
  return /^src\/.+\.tsx?$/.test(rel) ? rel : null;
}

/** 셸 명령에 git commit이 들어 있는지 (git -c k=v commit 형태 포함) */
export function isGitCommit(command) {
  return /\bgit(?:\s+-c\s+\S+)*\s+commit\b/.test(command);
}

/** git status --porcelain 출력에 src/ 아래 변경이 있는지 */
export function hasSrcChanges(porcelain) {
  return porcelain
    .split("\n")
    .filter(Boolean)
    .some((line) => {
      const path = line.slice(3);
      // 이름 바꾸기는 "옛 경로 -> 새 경로", 특수 문자가 든 경로는 따옴표로 감싸져 나온다
      const target = path.includes(" -> ") ? path.split(" -> ")[1] : path;
      return target.replace(/^"/, "").startsWith("src/");
    });
}

// 비밀 형식. 앞뒤 경계를 둬서 disk-usage 같은 일반 단어에 걸리지 않게 한다
const SECRET_PATTERNS = [
  ["AWS 액세스 키", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub 토큰", /\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ["API 키(sk-)", /(?<![\w-])sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/],
  ["개인키(PEM)", /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/],
  ["Slack 토큰", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
];

/** 글에 비밀로 보이는 값이 있으면 그 종류, 없으면 null */
export function findSecret(text) {
  return SECRET_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

/** .env 파일은 원래 비밀을 두는 곳이고 gitignore 대상이라 검사하지 않는다 */
export function isSecretExempt(filePath) {
  return /(?:^|[\\/])\.env[^\\/]*$/.test(filePath);
}

/** Write·Edit·MultiEdit 입력에서 새로 쓰는 글 */
export function writtenText(toolInput) {
  if (typeof toolInput.content === "string") return toolInput.content;
  if (typeof toolInput.new_string === "string") return toolInput.new_string;
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map((e) => e.new_string ?? "").join("\n");
  return "";
}

const DANGEROUS_COMMANDS = [
  ["홈·루트 전체 삭제", /\brm\s+(?:-\S+\s+)+(?:\/\*?|~\/?|\$HOME\/?)(?=\s|$|[;&|])/],
  ["sudo", /(?:^|[;&|(]\s*)sudo\b/],
  ["디스크 직접 쓰기", /\bdd\s+if=|>\s*\/dev\/(?:sd|nvme|disk)/],
  ["디스크 포맷", /\bmkfs\b|\bFormat-Volume\b/i],
  ["내려받은 스크립트 바로 실행", /\b(?:curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|iex|Invoke-Expression)\b/i],
];

/** 되돌릴 수 없는 위험한 명령이면 그 이유, 아니면 null */
export function dangerousCommand(command) {
  return DANGEROUS_COMMANDS.find(([, pattern]) => pattern.test(command))?.[0] ?? null;
}
