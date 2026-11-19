import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
it("uses the Node runtime for local filesystem-based Convex credentials", () => {
  const source = readFileSync("vite.config.ts", "utf8");
  expect(source).toContain('command === "build"');
  expect(source).not.toContain("catch {");
});
