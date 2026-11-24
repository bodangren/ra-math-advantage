// Final acceptance driver. Audit script, written by the final-acceptance role.
// Usage: node final-acceptance-driver.cjs          start a detached run and return at once
//        node final-acceptance-driver.cjs --run    run in the foreground (the child does this)
// Stages, in this order, one heavy job at a time (each job goes through heavy-run.sh):
//   1. sweeps: gates.sh lint, checks-all, test with label final-acceptance and GATES_BASE=baseline
//      (the track baseline, recorded before S1). gates.sh calls heavy-run.sh for each job.
//   2. targeted: the AI-feature suites, one heavy-run.sh job each, plus the doctor.
// Output goes through pipes (no shell redirection). Progress goes to JSON exit files in
// gates/final-acceptance/: sweep.exit, targeted.exit, heavy.exit.
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const LABEL = "final-acceptance";
const OUT = path.join(REPO, "measure/runs", TRACK, "gates", LABEL);
const GATES = path.join(REPO, "measure/tracks", TRACK, "gates.sh");
const H = process.env.HOME + "/Desktop/advantage-pr/scripts/jobs/heavy-run.sh";

fs.mkdirSync(OUT, { recursive: true });

if (!process.argv.includes("--run")) {
  const child = spawn(process.execPath, [__filename, "--run"], { cwd: REPO, detached: true, stdio: "ignore", env: process.env });
  child.unref();
  console.log("detached final-acceptance driver started, pid " + child.pid + ", exit file " + path.join(OUT, "heavy.exit"));
  process.exit(0);
}

function saveJson(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj) + "\n", "utf8");
}
function git(args) {
  const r = spawnSync("git", args, { cwd: REPO, encoding: "utf8" });
  return (r.stdout || "").trim();
}
function heavy(cmd) {
  const run = spawnSync(H, ["-c", cmd], { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  return { exit: run.status === null ? "signal:" + run.signal : run.status, text: (run.stdout || "") + (run.stderr || "") };
}
function vcount(text, word) {
  const m = text.match(new RegExp("Tests\\s+[^\\n]*?(\\d+) " + word));
  return m ? Number(m[1]) : 0;
}

const master = {
  started: new Date().toISOString(),
  head_at_start: git(["rev-parse", "HEAD"]),
  status_at_start: git(["status", "--short"]),
  stages: {},
  done: false,
};
function saveMaster() {
  saveJson("heavy.exit", master);
}
saveMaster();

function stageSweeps() {
  const state = { started: new Date().toISOString(), order: ["lint", "checks-all", "test"], codes: {}, done: false };
  const save = () => saveJson("sweep.exit", state);
  save();
  for (const gate of state.order) {
    state.current = gate;
    state.currentStarted = new Date().toISOString();
    save();
    const run = spawnSync("bash", [GATES, gate, LABEL], {
      cwd: REPO,
      env: Object.assign({}, process.env, { GATES_BASE: "baseline" }),
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
    fs.writeFileSync(path.join(OUT, "driver-" + gate + ".log"), (run.stdout || "") + (run.stderr || ""), "utf8");
    state.codes[gate] = run.status === null ? "signal:" + run.signal : run.status;
    save();
  }
  state.current = null;
  state.done = true;
  state.finished = new Date().toISOString();
  save();
  master.stages.sweeps = "done";
  saveMaster();
}

function stageTargeted() {
  const BM2 = "CI=true npm run test --workspace=apps/bus-math-v2 -- ";
  const IM3 = "CI=true npm run test --workspace=apps/integrated-math-3 -- ";
  const JOBS = [
    { name: "doctor", kind: "doctor", cmd: "bash measure/doctor.sh" },
    { name: "openrouter-files", kind: "vitest", cmd: "npx vitest run --config scripts/vitest.config.ts openrouter" },
    { name: "ai-tutoring", kind: "vitest", cmd: "CI=true npm run test --workspace=packages/ai-tutoring" },
    { name: "practice-core", kind: "vitest", cmd: "CI=true npm run test --workspace=packages/practice-core" },
    { name: "G-CHAT-IM3", kind: "vitest", cmd: IM3 + "-t 'POST /api/student/lesson-chatbot'" },
    { name: "G-CHAT-BM2", kind: "vitest", cmd: BM2 + "-t 'POST /api/student/lesson-chatbot'" },
    { name: "G-SHEET", kind: "vitest", cmd: BM2 + "-t 'spreadsheet-feedback'" },
    { name: "G-TEACHER", kind: "vitest", cmd: BM2 + "-t 'teacher AI error summary'" },
    { name: "G-TEACHER-ROUTE", kind: "vitest", cmd: BM2 + "-t 'GET /api/teacher/ai-error-summary'" },
    { name: "G-NO-PII-IM3", kind: "vitest", cmd: IM3 + "-t 'no-PII'" },
    { name: "G-NO-PII-BM2", kind: "vitest", cmd: BM2 + "-t 'no-PII'" },
    { name: "G-S3-FIX-IM3", kind: "vitest", cmd: IM3 + "-t 'S3 fix'" },
    { name: "G-S3-FIX-BM2", kind: "vitest", cmd: BM2 + "-t 'S3 fix'" },
    { name: "workerd-probe", kind: "probe", cmd: "npm run test:workerd --workspace=packages/ai-tutoring" },
  ];
  const state = { started: new Date().toISOString(), results: {}, done: false };
  const save = () => saveJson("targeted.exit", state);
  save();
  for (const job of JOBS) {
    state.current = job.name;
    save();
    const run = heavy(job.cmd);
    fs.writeFileSync(path.join(OUT, "targeted-" + job.name + ".log"), run.text, "utf8");
    const result = { exit: run.exit, command: job.cmd };
    if (job.kind === "vitest") {
      result.passed = vcount(run.text, "passed");
      result.failed = vcount(run.text, "failed");
      result.skipped = vcount(run.text, "skipped");
      result.verified = run.exit === 0 && result.passed !== 0 && result.failed === 0;
    } else if (job.kind === "probe") {
      result.probe_ok = /workerd probe: probe-ok/.test(run.text);
      result.verified = run.exit === 0 && result.probe_ok;
    } else if (job.kind === "doctor") {
      result.all_checks_passed = /All checks passed/i.test(run.text);
      result.verified = run.exit === 0 && result.all_checks_passed;
    } else {
      result.verified = run.exit === 0;
    }
    state.results[job.name] = result;
    save();
  }
  state.current = null;
  state.done = true;
  state.finished = new Date().toISOString();
  save();
  master.stages.targeted = "done";
  saveMaster();
}

try {
  stageSweeps();
  stageTargeted();
} catch (err) {
  master.error = String(err && err.stack ? err.stack : err);
}
master.head_at_end = git(["rev-parse", "HEAD"]);
master.status_at_end = git(["status", "--short"]);
master.done = true;
master.finished = new Date().toISOString();
saveMaster();
