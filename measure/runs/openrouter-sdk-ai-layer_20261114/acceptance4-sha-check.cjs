// Phase acceptance r4: resolve each SHA that the delta 8b66cbf4..HEAD added to plan.md.
// Read-only. It prints the subject, the date, the touched-path summary, and the ancestor result.
const { execFileSync, spawnSync } = require("node:child_process");

const repo = "/home/daniebo/Desktop/ra-math-advantage";
const git = (args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();

const head = git(["rev-parse", "HEAD"]);
const diff = git(["diff", "-U0", "8b66cbf4", "HEAD", "--", "measure/tracks/openrouter-sdk-ai-layer_20261114/plan.md"]);
const added = diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
const shaPattern = /\b[0-9a-f]{7,40}\b/g;

const rows = [];
for (const line of added) {
  const shas = line.match(shaPattern) ?? [];
  // Keep only lines of the 11 closeout edits: they carry a SHA and start a task or a sub-task.
  if (shas.length === 0) continue;
  rows.push({ line: line.slice(1, 150), shas });
}

console.log(`HEAD ${head}`);
console.log(`added plan lines that cite a SHA: ${rows.length}`);
const seen = new Map();
for (const row of rows) {
  for (const sha of row.shas) {
    if (!seen.has(sha)) seen.set(sha, []);
    seen.get(sha).push(row.line);
  }
}
let bad = 0;
for (const [sha, lines] of seen) {
  const type = spawnSync("git", ["cat-file", "-t", sha], { cwd: repo, encoding: "utf8" });
  const resolves = type.status === 0 && type.stdout.trim() === "commit";
  const anc = spawnSync("git", ["merge-base", "--is-ancestor", sha, "HEAD"], { cwd: repo });
  const isAncestor = anc.status === 0;
  const full = resolves ? git(["rev-parse", sha]) : "";
  const meta = resolves ? git(["show", "-s", "--format=%ad | %s", "--date=iso", sha]) : "";
  const files = resolves ? git(["show", "--stat", "--format=", "--stat-width=140", sha]).split("\n").slice(-1)[0] : "";
  if (!resolves || !isAncestor) bad += 1;
  console.log(`\n${sha} -> ${full}\n  resolves=${resolves} ancestorOfHEAD=${isAncestor}\n  ${meta}\n  ${files}`);
  for (const l of lines) console.log(`  used on: ${l}`);
}
console.log(`\nUNRESOLVED_OR_NOT_ANCESTOR=${bad}`);
process.exit(bad === 0 ? 0 : 1);
