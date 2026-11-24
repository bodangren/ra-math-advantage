// Phase S4 acceptance r3: read-only summary of the prerequisite results (Reviews A, B, C and
// adversarial testing) and of the commits between their HEAD and the audited HEAD.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const RUNS = path.join(REPO, "measure/runs/openrouter-sdk-ai-layer_20261114");
const FILES = [
  "measure-review-a-correctness-3bcf2b31.json",
  "measure-review-b-security-3bcf2b31.json",
  "measure-review-c-ux-api-3bcf2b31.json",
  "measure-adversarial-testing-3bcf2b31.json",
];
const git = (...args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();

for (const f of FILES) {
  const j = JSON.parse(fs.readFileSync(path.join(RUNS, f), "utf8"));
  console.log(
    JSON.stringify(
      {
        file: f,
        role: j.role,
        status: j.status,
        audited_head_sha: j.audited_head_sha || j.baseline_sha,
        route: j.route,
        blocking: (j.blocking_findings || []).length,
        nonblocking: (j.nonblocking_findings || []).map((x) => x.slice(0, 170)),
        retry: j.retry_recommendation,
        confidence: j.confidence,
        violations: [j.test_strategy_violations, j.live_contract_violations, j.prod_wiring_violations, j.route_parity_violations].map((a) => (a || []).length),
      },
      null,
      1,
    ),
  );
}

console.log("== commits between 3bcf2b31 and HEAD, with the paths each touches");
const list = git("rev-list", "--reverse", "3bcf2b31..HEAD").split("\n");
for (const sha of list) {
  const subject = git("log", "-1", "--format=%h %s", sha);
  const paths = git("show", "--name-only", "--format=", sha).split("\n").filter(Boolean);
  const kind = (p) =>
    p.startsWith("measure/runs/")
      ? "run-log"
      : p.startsWith("scripts/__tests__/") || p === "scripts/vitest.config.ts"
        ? "test"
        : p === "measure/tracks/openrouter-sdk-ai-layer_20261114/plan.md"
          ? "plan"
          : "OTHER";
  console.log(subject.slice(0, 120));
  for (const p of paths) console.log("   " + kind(p) + "  " + p);
}
