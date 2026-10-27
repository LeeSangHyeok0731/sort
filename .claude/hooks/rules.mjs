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
