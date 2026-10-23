import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PALETTE } from "./palette";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

/** globals.css @theme 안의 --color-* 값 */
function cssToken(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1].toLowerCase();
}

describe("PALETTE", () => {
  const flat: Array<[string, string]> = [
    ["background", PALETTE.background],
    ["surface", PALETTE.surface],
    ["subtle", PALETTE.subtle],
    ["line", PALETTE.line],
    ["line-strong", PALETTE.lineStrong],
    ["foreground", PALETTE.foreground],
    ["muted", PALETTE.muted],
    ["faint", PALETTE.faint],
    ...Object.entries(PALETTE.tone).map(([k, v]) => [`tone-${k}`, v] as [string, string]),
    ["slot-1", PALETTE.slot[0]],
    ["slot-2", PALETTE.slot[1]],
  ];

  it.each(flat)("--color-%s 가 globals.css와 같다", (name, value) => {
    expect(cssToken(name)).toBe(value.toLowerCase());
  });
});
