// @vitest-environment node
import { it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

it("rejects legacy IM2 extraction before writing any inventory", () => {
  const repo = path.resolve(import.meta.dirname, "../../../..");
  const temporary = mkdtempSync(path.join(tmpdir(), "im2-extractor-"));
  try {
    // Redirect only filesystem locations. Run the actual CLI logic against an isolated fixture.
    const source = readFileSync(path.join(repo, "scripts/extract-skill-inventory.ts"), "utf8")
      .replace("path.resolve(__dirname, '..')", JSON.stringify(temporary))
      .replaceAll("'../packages/", `'${repo}/packages/`);
    const script = path.join(temporary, "extract.cts");
    writeFileSync(script, source);
    mkdirSync(path.join(temporary, "measure"));
    for (const args of [["im2"], ["--all"]]) {
      const result = spawnSync(process.execPath, [path.join(repo, "node_modules/tsx/dist/cli.mjs"), script, ...args], { encoding: "utf8", timeout: 10000 });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("IM2 uses the reviewed source inventory");
      expect(existsSync(path.join(temporary, "apps"))).toBe(false);
      expect(existsSync(path.join(temporary, "measure/skill-graph-inventory-audit.md"))).toBe(false);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
