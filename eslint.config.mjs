import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// FSD 레이어. 앞쪽 레이어만 뒤쪽 레이어를 import할 수 있다 (docs/ARCHITECTURE.md)
const LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

// 슬라이스 밖에서는 index로만 가져온다. core는 워커용 두 번째 진입점이라 허용한다
const DEEP_IMPORT = {
  group: ["@/entities/*/*", "@/features/*/*", "@/widgets/*/*", "@/views/*/*", "!@/entities/sort-algorithm/core"],
  message: "슬라이스 내부 파일은 직접 import할 수 없어요. 슬라이스의 index에서 export해 주세요. (docs/ARCHITECTURE.md)",
};

// 같은 파일에 no-restricted-imports를 두 번 걸면 뒤의 것이 덮어쓰므로 레이어마다 한 블록으로 만든다
const layerRules = LAYERS.map((layer, i) => {
  const upper = LAYERS.slice(0, i);
  const patterns = [DEEP_IMPORT];
  if (upper.length > 0) {
    patterns.push({
      group: upper.map((l) => `@/${l}`),
      message: `${layer} 레이어는 상위 레이어(${upper.join(", ")})를 import할 수 없어요. (docs/ARCHITECTURE.md)`,
    });
  }
  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
