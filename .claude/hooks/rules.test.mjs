import { describe, expect, it } from "vitest";
import { hasSrcChanges, isGitCommit, lintTarget } from "./rules.mjs";

describe("lintTarget", () => {
  const root = "C:\\proj";

  it("src 아래 ts·tsx 파일은 상대 경로를 돌려준다", () => {
    expect(lintTarget("C:\\proj\\src\\a\\b.tsx", root)).toBe("src/a/b.tsx");
    expect(lintTarget("C:/proj/src/a.ts", root)).toBe("src/a.ts");
    expect(lintTarget("c:\\proj\\src\\a.ts", root)).toBe("src/a.ts");
  });

  it("src 밖이거나 ts가 아니면 null", () => {
    expect(lintTarget("C:\\proj\\docs\\a.md", root)).toBeNull();
    expect(lintTarget("C:\\proj\\src\\app\\globals.css", root)).toBeNull();
    expect(lintTarget("C:\\other\\src\\a.ts", root)).toBeNull();
    expect(lintTarget("C:\\project\\src\\a.ts", root)).toBeNull();
    expect(lintTarget("", root)).toBeNull();
  });
});

describe("isGitCommit", () => {
  it("git commit 명령을 찾는다", () => {
    expect(isGitCommit('git commit -m "x"')).toBe(true);
    expect(isGitCommit("git add . && git commit -q -m x")).toBe(true);
    expect(isGitCommit("git -c user.name=a commit -m x")).toBe(true);
  });

  it("commit이 아닌 git 명령은 통과", () => {
    expect(isGitCommit("git log --grep commit")).toBe(false);
    expect(isGitCommit("git status")).toBe(false);
    expect(isGitCommit("echo commit")).toBe(false);
  });
});

describe("hasSrcChanges", () => {
  it("src 경로 변경을 찾는다", () => {
    expect(hasSrcChanges(" M src/a.ts\n?? docs/x.md\n")).toBe(true);
    expect(hasSrcChanges("R  old.ts -> src/new.ts\n")).toBe(true);
    expect(hasSrcChanges('?? "src/한글.ts"\n')).toBe(true);
  });

  it("src 밖 변경만 있으면 false", () => {
    expect(hasSrcChanges(" M docs/a.md\n?? .claude/x\n")).toBe(false);
    expect(hasSrcChanges("")).toBe(false);
  });
});
