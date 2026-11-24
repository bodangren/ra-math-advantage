// Phase S4 acceptance r2: targeted test driver.
// Usage: node acceptance2-targeted-driver.cjs          start a detached run and return at once
//        node acceptance2-targeted-driver.cjs --run    run in the foreground
// Each job runs through heavy-run.sh, one at a time. The driver captures output through a
// pipe (no shell redirection), writes one log for each job, and writes the results as JSON
// to gates/s4-acceptance2/targeted.exit. A job is "verified" when it exits 0, ran at least
// one case, and reports no failed case. "matches_expected" compares the passed count.
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const OUT = path.join(REPO, "measure/runs", TRACK, "gates", "s4-acceptance2");
const EXIT_FILE = path.join(OUT, "targeted.exit");
const H = process.env.HOME + "/Desktop/advantage-pr/scripts/jobs/heavy-run.sh";

const BM2 = "CI=true npm run test --workspace=apps/bus-math-v2 -- ";
const IM3 = "CI=true npm run test --workspace=apps/integrated-math-3 -- ";
const JOBS = [
  { name: "openrouter-only", kind: "vitest", expected: 3, cmd: "npx vitest run --config scripts/vitest.config.ts -t 'openrouter-only'" },
  { name: "openrouter-s4-adversarial", kind: "vitest", expected: 7, cmd: "npx vitest run --config scripts/vitest.config.ts -t 'openrouter-s4-adversarial'" },
  { name: "G-CHAT-IM3", kind: "vitest", expected: 12, cmd: IM3 + "-t 'POST /api/student/lesson-chatbot'" },
  { name: "G-CHAT-BM2", kind: "vitest", expected: 16, cmd: BM2 + "-t 'POST /api/student/lesson-chatbot'" },
  { name: "G-SHEET", kind: "vitest", expected: 13, cmd: BM2 + "-t 'spreadsheet-feedback'" },
  { name: "G-TEACHER", kind: "vitest", expected: 8, cmd: BM2 + "-t 'teacher AI error summary'" },
  { name: "G-TEACHER-ROUTE", kind: "vitest", expected: 12, cmd: BM2 + "-t 'GET /api/teacher/ai-error-summary'" },
  { name: "G-NO-PII-IM3", kind: "vitest", expected: 1, cmd: IM3 + "-t 'no-PII'" },
  { name: "G-NO-PII-BM2", kind: "vitest", expected: 5, cmd: BM2 + "-t 'no-PII'" },
  {
    name: "BM2-release-PII-strip",
    kind: "vitest",
    expected: 1,
    cmd:
      BM2 +
      "__tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts -t 'strips fixture person details from the lesson markdown before the provider call'",
  },
  { name: "ai-tutoring", kind: "vitest", expected: 165, cmd: "CI=true npm run test --workspace=packages/ai-tutoring" },
  { name: "practice-core", kind: "vitest", expected: 263, cmd: "CI=true npm run test --workspace=packages/practice-core" },
  { name: "workerd-probe", kind: "probe", cmd: "npm run test:workerd --workspace=packages/ai-tutoring" },
  { name: "generate", kind: "plain", cmd: "npm run generate" },
  { name: "doctor", kind: "doctor", cmd: "bash measure/doctor.sh" },
];

fs.mkdirSync(OUT, { recursive: true });

if (!process.argv.includes("--run")) {
  const child = spawn(process.execPath, [__filename, "--run"], { cwd: REPO, detached: true, stdio: "ignore", env: process.env });
  child.unref();
  console.log("detached targeted driver started, pid " + child.pid + ", exit file " + EXIT_FILE);
  process.exit(0);
}

const state = { started: new Date().toISOString(), results: {}, done: false };
function save() {
  fs.writeFileSync(EXIT_FILE, JSON.stringify(state) + "\n", "utf8");
}
save();

function count(text, word) {
  const m = text.match(new RegExp("Tests\\s+[^\\n]*?(\\d+) " + word));
  return m ? Number(m[1]) : 0;
}

for (const job of JOBS) {
  state.current = job.name;
  save();
  const run = spawnSync(H, ["-c", job.cmd], { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const text = (run.stdout || "") + (run.stderr || "");
  fs.writeFileSync(path.join(OUT, "targeted-" + job.name + ".log"), text, "utf8");
  const exit = run.status === null ? "signal:" + run.signal : run.status;
  const result = { exit, command: job.cmd };
  if (job.kind === "vitest") {
    result.passed = count(text, "passed");
    result.failed = count(text, "failed");
    result.skipped = count(text, "skipped");
    result.expected = job.expected;
    result.matches_expected = result.passed === job.expected;
    result.verified = exit === 0 && result.passed !== 0 && result.failed === 0;
  } else if (job.kind === "probe") {
    result.probe_ok = /workerd probe: probe-ok/.test(text);
    result.verified = exit === 0 && result.probe_ok;
  } else if (job.kind === "doctor") {
    result.all_checks_passed = /All checks passed/i.test(text);
    result.verified = exit === 0 && result.all_checks_passed;
  } else {
    result.verified = exit === 0;
  }
  state.results[job.name] = result;
  save();
}
state.current = null;
state.done = true;
state.finished = new Date().toISOString();
save();
