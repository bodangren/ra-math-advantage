// @vitest-environment node
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
function luminance(hex: string) {
  const rgb = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
it("keeps small muted and accent text readable on the light course surfaces", () => {
  const css = readFileSync(path.resolve(import.meta.dirname, "../../app/globals.css"), "utf8");
  for (const token of ["text-muted-text", "text-accent"]) {
    const color = css.match(new RegExp(`  \\.${token} \\{ color: #([0-9a-fA-F]{6});`))?.[1];
    expect(color).toBeDefined();
    for (const background of ["FFFFFF", "FAF9F6", "F4F1EA"]) {
      const [low, high] = [luminance(color!), luminance(background)].sort((a, b) => a - b);
      expect((high + 0.05) / (low + 0.05), `${token} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
