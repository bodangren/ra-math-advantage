// Phase S4 acceptance r3: run the phase-acceptance role gate with the three project gate
// variables set in the environment. The gate for this role reads the audit result, the
// result block of the log, and the plan markers. It does not run the three commands, but
// the brief asks for them on every role-gate call. Output goes to stdout only.
const { spawnSync } = require("node:child_process");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const LABEL = "s4-acceptance3";
const RUNS = "measure/runs/" + TRACK;
const gates = (g) => "GATES_BASE=s3 bash measure/tracks/" + TRACK + "/gates.sh " + g + " " + LABEL;
const env = Object.assign({}, process.env, {
  PROJECT_LINT: gates("lint"),
  PROJECT_CHECKS: gates("checks-all"),
  PROJECT_TESTS: gates("test"),
});
const run = spawnSync(
  "python3",
  [
    process.env.HOME + "/.agents/skills/measure-orchestrator/scripts/measure_interphase_checks.py",
    "role-gate",
    "--repo", REPO,
    "--role", "phase-acceptance",
    "--track", TRACK,
    "--phase", "Phase S4: Remove the OpenAI paths and document the roles",
    "--baseline", "8b66cbf41490f5478a37c1d74b9088e3cc52448f",
    "--result-file", RUNS + "/phase-acceptance-8b66cbf4.json",
    "--log-file", RUNS + "/phase-acceptance-8b66cbf4.log",
  ],
  { cwd: REPO, env, encoding: "utf8" },
);
process.stdout.write(run.stdout || "");
process.stdout.write(run.stderr || "");
console.log("role-gate exit=" + run.status);
