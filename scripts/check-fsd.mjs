// FSD 의존 방향 검사 (npm run lint:fsd).
// ESLint 규칙은 @/ 별칭만 보므로, 상대 경로로 슬라이스 밖에 닿는 import와 같은 레이어 슬라이스 간 import까지 여기서 잡는다.
import { readdirSync, readFileSync } from "node:fs";
import { join, posix, relative } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];
const SLICED = new Set(["views", "widgets", "features", "entities"]);
// index 말고도 밖에서 가져올 수 있는 진입점 (워커용, React·CSS 없음)
const EXTRA_ENTRIES = new Set(["entities/sort-algorithm/core"]);

const stripExt = (p) => p.replace(/\.(tsx?|mjs|js)$/, "");

/** src 기준 경로("features/playback/model/track") → 레이어·슬라이스·슬라이스 안 경로 */
function locate(srcPath) {
  const [layer, ...rest] = stripExt(srcPath).split("/");
  if (!SLICED.has(layer)) return { layer, slice: null, inner: rest.join("/") };
  const [slice = "", ...inner] = rest;
  return { layer, slice, inner: inner.join("/") };
}

/** import 경로를 src 기준 경로로 바꾼다. 패키지 import이거나 src 밖이면 null */
export function resolveSpecifier(fromSrcPath, specifier) {
  if (specifier.startsWith("@/")) return specifier.slice(2);
  if (!specifier.startsWith(".")) return null;
  const resolved = posix.normalize(posix.join(posix.dirname(fromSrcPath), specifier));
  return resolved.startsWith("..") ? null : resolved;
}

/** 규칙 위반이면 메시지, 아니면 null */
export function checkImport(fromSrcPath, specifier) {
  const target = resolveSpecifier(fromSrcPath, specifier);
  if (target === null) return null;
  const from = locate(fromSrcPath);
  const to = locate(target);
  const fromRank = LAYERS.indexOf(from.layer);
  const toRank = LAYERS.indexOf(to.layer);
  if (fromRank < 0 || toRank < 0) return null;

  if (toRank < fromRank) return `${from.layer} 레이어가 상위 레이어 ${to.layer}를 import해요`;
  if (from.layer === to.layer && (from.slice === null || from.slice === to.slice)) return null;
  if (from.layer === to.layer) return `같은 레이어의 다른 슬라이스(${to.layer}/${to.slice})를 import해요`;

  const isEntry = to.slice === null || to.inner === "" || to.inner === "index" || EXTRA_ENTRIES.has(stripExt(target));
  return isEntry ? null : `${to.layer}/${to.slice}의 내부 파일을 import해요. 슬라이스의 index에서 가져오세요`;
}

/** 소스에서 정적 import, export … from, 동적 import()를 줄 번호와 함께 찾는다 (주석·문자열 제외) */
export function extractImports(source) {
  const lineStarts = ts.computeLineStarts(source);
  return ts.preProcessFile(source, true, true).importedFiles.map(({ fileName, pos }) => ({
    specifier: fileName,
    line: ts.computeLineAndCharacterOfPosition(lineStarts, pos).line + 1,
  }));
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.tsx?$/.test(entry.name)) yield path;
  }
}

function main(srcDir) {
  const violations = [];
  for (const file of walk(srcDir)) {
    const srcPath = relative(srcDir, file).split("\\").join("/");
    for (const { specifier, line } of extractImports(readFileSync(file, "utf8"))) {
      const message = checkImport(srcPath, specifier);
      if (message) violations.push(`src/${srcPath}:${line}  "${specifier}" — ${message}`);
    }
  }
  if (violations.length === 0) {
    console.log("FSD 의존성 검사 통과");
    return 0;
  }
  console.error(`FSD 의존성 위반 ${violations.length}건 (docs/ARCHITECTURE.md)\n${violations.join("\n")}`);
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv[2] ?? "src"));
}
