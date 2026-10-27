import { describe, expect, it } from "vitest";
import { checkImport, extractImports, resolveSpecifier } from "./check-fsd.mjs";

describe("resolveSpecifier", () => {
  it("@/ 별칭과 상대 경로를 src 기준 경로로 바꾼다", () => {
    expect(resolveSpecifier("features/playback/model/a.ts", "@/entities/array")).toBe("entities/array");
    expect(resolveSpecifier("features/playback/model/a.ts", "../ui/Bar")).toBe("features/playback/ui/Bar");
    expect(resolveSpecifier("features/playback/model/a.ts", "../../../widgets/visualizer")).toBe("widgets/visualizer");
  });

  it("패키지 import와 src 밖 경로는 null", () => {
    expect(resolveSpecifier("features/playback/model/a.ts", "react")).toBeNull();
    expect(resolveSpecifier("app/page.tsx", "../../next.config")).toBeNull();
  });
});

describe("checkImport", () => {
  const ok = (from, spec) => expect(checkImport(from, spec)).toBeNull();
  const bad = (from, spec) => expect(checkImport(from, spec)).not.toBeNull();

  it("아래 레이어의 공개 진입점은 허용한다", () => {
    ok("views/home/ui/HomeView.tsx", "@/widgets/visualizer");
    ok("features/playback/model/sortJob.ts", "@/entities/sort-algorithm/core");
    ok("entities/array/ui/ArrayBars.tsx", "@/shared/lib");
    ok("widgets/visualizer/ui/Stage.tsx", "../../../features/playback/index");
  });

  it("같은 슬라이스 안, app·shared 안은 자유롭다", () => {
    ok("features/playback/model/useSortPlayer.ts", "./track");
    ok("features/playback/ui/PlaybackBar.tsx", "../model/useSortPlayer");
    ok("shared/lib/index.ts", "./theme/theme");
    ok("app/page.tsx", "./layout");
  });

  it("상위 레이어 import는 상대 경로여도 막는다", () => {
    bad("entities/array/ui/ArrayBars.tsx", "@/features/playback");
    bad("features/playback/model/track.ts", "../../../widgets/visualizer");
    bad("shared/ui/Card.tsx", "@/app/layout");
  });

  it("같은 레이어의 다른 슬라이스는 막는다", () => {
    bad("features/playback/model/track.ts", "@/features/sort-sound");
    bad("entities/array/lib/generate.ts", "../../sort-algorithm/core");
  });

  it("다른 슬라이스의 내부 파일은 막는다", () => {
    bad("widgets/visualizer/model/scene.ts", "@/features/playback/model/track");
    bad("views/home/ui/HomeView.tsx", "../../../entities/array/lib/generate");
  });
});

describe("extractImports", () => {
  it("정적·재수출·동적 import를 줄 번호와 함께 찾고 주석·문자열은 무시한다", () => {
    const source = [
      'import a from "@/a";',
      "// import b from \"@/b\";",
      'export { c } from "./c";',
      'const s = "import d from \'@/d\'";',
      'const e = await import("../e");',
    ].join("\n");
    expect(extractImports(source)).toEqual([
      { specifier: "@/a", line: 1 },
      { specifier: "./c", line: 3 },
      { specifier: "../e", line: 5 },
    ]);
  });
});
