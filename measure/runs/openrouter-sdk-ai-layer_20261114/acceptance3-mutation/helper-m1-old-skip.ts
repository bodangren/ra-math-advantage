// Shared banned-token scan for the S4 removal gate.
// Both scripts/__tests__/openrouter-only.test.ts (findBannedTokenMatches)
// and scripts/__tests__/openrouter-s4-adversarial.test.ts (the real-repo
// scan) delegate to scanFilesForBannedTokens, so the NUL regression case
// calls the same code that the real scans run. Binary files skip by
// extension only. Text content scans for tokens even when it holds a NUL.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SHARED_REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function scanFilesForBannedTokens(
  files: string[],
  tokens: readonly string[],
  isBinaryPath: (file: string) => boolean,
  repoRoot: string = SHARED_REPO_ROOT,
): string[] {
  const hits: string[] = [];
  for (const file of files) {
    if (isBinaryPath(file)) continue;
    let text: string;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (text.includes("\0")) continue;
    for (const token of tokens) {
      if (text.includes(token)) hits.push(`${path.relative(repoRoot, file)}: ${token}`);
    }
  }
  return hits.sort();
}
