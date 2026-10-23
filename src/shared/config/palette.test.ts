import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PALETTE } from "./palette";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

/** CSS 블록 본문 ({ 다음부터 짝이 맞는 } 앞까지) */
function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

const BLOCKS = {
  light: block("@theme"),
  dark: block(':root[data-theme="dark"]'),
} as const;

function cssToken(source: string, name: string): string | undefined {
  return source.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1].toLowerCase();
}

describe.each(["light", "dark"] as const)("PALETTE.%s", (theme) => {
  const p = PALETTE[theme];
  const flat: Array<[string, string]> = [
    ["background", p.background],
    ["surface", p.surface],
    ["subtle", p.subtle],
    ["line", p.line],
    ["line-strong", p.lineStrong],
    ["foreground", p.foreground],
    ["muted", p.muted],
    ["faint", p.faint],
    ...Object.entries(p.tone).map(([k, v]) => [`tone-${k}`, v] as [string, string]),
    ["slot-1", p.slot[0]],
    ["slot-2", p.slot[1]],
  ];

  it("CSS 블록을 찾는다", () => {
    expect(BLOCKS[theme]).not.toBe("");
  });

  it.each(flat)("--color-%s 가 globals.css와 같다", (name, value) => {
    expect(cssToken(BLOCKS[theme], name)).toBe(value.toLowerCase());
  });
});
