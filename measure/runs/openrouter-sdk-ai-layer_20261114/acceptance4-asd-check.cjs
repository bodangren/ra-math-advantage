// Phase acceptance r4: sentence length check on the prose that 8b66cbf4..HEAD added.
// Read-only. Code spans, paths, and SHAs count as one word each.
const { execFileSync } = require("node:child_process");

const repo = "/home/daniebo/Desktop/ra-math-advantage";
const files = [
  "measure/tracks/openrouter-sdk-ai-layer_20261114/plan.md",
  "measure/tracks/openrouter-sdk-ai-layer_20261114/evidence.md",
  "measure/tech-debt.md",
  "measure/tracks/openrouter-sdk-ai-layer_20261114/metadata.json",
];
const passive = /\b(is|are|was|were|been|be|being)\s+(\w+ed|fixed|made|done|written|run|given|shown|kept|left|set|held|found|built|taken|chosen)\b/i;

let total = 0;
let over = 0;
let passiveCount = 0;
const longOnes = [];
const passiveOnes = [];
for (const file of files) {
  const diff = execFileSync("git", ["diff", "-U0", "8b66cbf4", "HEAD", "--", file], { cwd: repo, encoding: "utf8" });
  const added = diff
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1))
    // Drop task markers and SHA-only edits: a line that only gained a SHA is not new prose.
    .filter((line) => !/^\s*- \[[ x~b]\] (Task|Run|Make|Append|Commit)/.test(line))
    .join(" ");
  const prose = added
    .replace(/`[^`]*`/g, "CODE")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "LINK")
    .replace(/\\n/g, " ")
    .replace(/^\s*-\s+/gm, "")
    .replace(/\*\*/g, "");
  const sentences = prose.split(/(?<=[.!?])\s+(?=[A-Z"`(\[])/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 3);
  for (const sentence of sentences) {
    total += 1;
    const words = sentence.split(/\s+/).length;
    if (words > 25) {
      over += 1;
      longOnes.push(`${file.split("/").pop()}: ${words} words: ${sentence.slice(0, 160)}`);
    }
    if (passive.test(sentence)) {
      passiveCount += 1;
      passiveOnes.push(`${file.split("/").pop()}: ${sentence.slice(0, 160)}`);
    }
  }
}
console.log(`sentences: ${total}`);
console.log(`over 25 words: ${over}`);
for (const l of longOnes) console.log("  LONG", l);
console.log(`passive candidates: ${passiveCount}`);
for (const l of passiveOnes) console.log("  PASSIVE", l);
