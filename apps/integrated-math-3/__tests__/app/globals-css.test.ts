import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import path from "path";

const cssPath = path.resolve(__dirname, "../../app/globals.css");

describe("app/globals.css", () => {
  it("exists", () => {
    expect(existsSync(cssPath)).toBe(true);
  });

  it("contains Tailwind directives", () => {
    const content = readFileSync(cssPath, "utf-8");
    expect(content).toContain('@import "tailwindcss"');
  });

  it("defines oklch CSS custom properties for light and dark modes", () => {
    const content = readFileSync(cssPath, "utf-8");
    expect(content).toContain("--background:");
    expect(content).toContain("--foreground:");
    expect(content).toContain("--primary:");
    expect(content).toContain(".dark {");
  });

  it("includes font family variables", () => {
    const content = readFileSync(cssPath, "utf-8");
    expect(content).toContain("--font-display");
    expect(content).toContain("--font-body");
    expect(content).toContain("--font-mono-num");
  });

  it("includes staggered fade-up animation classes", () => {
    const content = readFileSync(cssPath, "utf-8");
    expect(content).toContain("animate-fade-up");
    expect(content).toContain("@keyframes fadeUp");
  });
});

it("scans the shared UI packages used by IM3", () => {
  const css = readFileSync(cssPath, "utf8");
  for (const name of [
    "app-shell",
    "activity-components",
    "graphing-core",
    "knowledge-space-practice",
    "lesson-renderer",
    "practice-test-engine",
  ]) {
    expect(css).toContain(`@source "../../../packages/${name}/src";`);
  }
});

it("imports KaTeX through the bundler so relative font URLs resolve", () => {
  expect(readFileSync(path.resolve(__dirname, "../../app/layout.tsx"), "utf8")).toContain(
    'import "katex/dist/katex.min.css"',
  );
  expect(readFileSync(cssPath, "utf8")).not.toContain("@import 'katex/dist/katex.min.css'");
});
