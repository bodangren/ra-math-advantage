// Phase S4 acceptance r3: read-only check that each mutation anchor of the heavy driver
// appears exactly once in the real source that the driver mutates.
const fs = require("node:fs");
const T = "/home/daniebo/Desktop/ra-math-advantage/scripts/__tests__/";
const helper = fs.readFileSync(T + "openrouter-scan-shared.ts", "utf8");
const gate = fs.readFileSync(T + "openrouter-only.test.ts", "utf8");
const adv = fs.readFileSync(T + "openrouter-s4-adversarial.test.ts", "utf8");
const count = (s, a) => s.split(a).length - 1;
const REPO_LINE = 'const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");';
const GATE_LINE = 'const GATE_FILE = path.join(REPO_ROOT, "scripts/__tests__/openrouter-only.test.ts");';
const LOOP = "    for (const token of tokens) {";
const ADV_WRAPPER = [
  "function scanRepoFilesForBannedTokens(files: string[]): string[] {",
  "  return scanFilesForBannedTokens(files, BANNED_TOKENS, isBinaryPath, REPO_ROOT);",
  "}",
].join("\n");
const GATE_WRAPPER = [
  "function findBannedTokenMatches(files: string[]): string[] {",
  "  return scanFilesForBannedTokens(files, BANNED_TOKENS, isBinaryPath, REPO_ROOT);",
  "}",
].join("\n");
console.log(
  JSON.stringify(
    {
      helper_loop: count(helper, LOOP),
      gate_repo_line: count(gate, REPO_LINE),
      adv_repo_line: count(adv, REPO_LINE),
      adv_gate_line: count(adv, GATE_LINE),
      adv_wrapper: count(adv, ADV_WRAPPER),
      gate_wrapper: count(gate, GATE_WRAPPER),
      helper_has_literal_nul_byte: helper.includes("\u0000"),
      helper_has_backslash_zero_text: helper.includes("\\0"),
      gate_has_backslash_zero_text: gate.includes("\\0"),
      adv_has_backslash_zero_text: adv.includes("\\0"),
    },
    null,
    1,
  ),
);
