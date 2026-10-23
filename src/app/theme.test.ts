import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));

/** 어두운 테마 시절의 클래스·색. 밝은 테마에서는 토큰(bg-surface, text-muted …)을 쓴다 */
const FORBIDDEN = [
  /text-white\//,
  // bg-foreground 위 글자는 text-background (다크에서 foreground가 밝아지므로)
  /\btext-white\b/,
  /bg-white\//,
  /border-white/,
  /bg-black/,
  /bg-slate-/,
  /indigo/,
  /pink-/,
  /purple-/,
  /rose-/,
  /backdrop-|\bblur-\[/,
  /rounded-(3xl|2xl|xl)\b/,
  /bg-linear-/,
  /bg-gradient-to-/,
  /shadow-\[/,
  /\bshadow-(sm|md|lg|xl|2xl)\b/,
  /bg-clip-text/,
  /prism-tomorrow/,
  /rgba\(255,\s*255,\s*255/,
  /#0f172a/i,
  // 슬라이더 강조색은 accent-foreground (다크에서 회색 900은 바탕에 묻힌다)
  /accent-gray-/,
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("밝은 테마", () => {
  it("어두운 테마용 클래스·색이 남아 있지 않다", () => {
    const files = sourceFiles(SRC);
    expect(files.length).toBeGreaterThan(0);
    const hits = files.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) =>
          FORBIDDEN.filter((re) => re.test(line)).map((re) => `${file}:${i + 1} ${re}`)
        )
    );
    expect(hits).toEqual([]);
  });

  it("밝은 바탕용 옅은 색에는 dark: 짝이 있다", () => {
    const LIGHT_ONLY =
      /\b(bg-(amber|red|sky|emerald|blue|violet)-(50|100)|text-(amber|emerald)-(700|800)|text-(sky|gray)-700|text-red-600|bg-gray-400|bg-white)\b/;
    const hits = sourceFiles(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, i) => (LIGHT_ONLY.test(line) && !/\bdark:/.test(line) ? [`${file}:${i + 1}`] : []))
    );
    expect(hits).toEqual([]);
  });
});
