// Phase S4 acceptance r3: one detached driver for all heavy jobs. Audit script.
// Usage: node acceptance3-heavy-driver.cjs          start a detached run and return at once
//        node acceptance3-heavy-driver.cjs --run    run in the foreground (the child does this)
// Stages, in this order, one heavy job at a time (each job goes through heavy-run.sh):
//   1. mutation: the F4 mutation proof. The real test files are never edited. A mutated
//      helper is reached by a vitest alias, or a mutated test copy sits in
//      acceptance3-mutation/. The driver checks that the real sources did not change.
//   2. format-lint: oxfmt --check and oxlint on the three scan test files.
//   3. sweeps: gates.sh lint, test, checks-all with GATES_BASE=s3 and label s4-acceptance3.
//   4. targeted: the same targeted jobs as r2, plus the openrouter file filter.
// Output goes through pipes (no shell redirection). Progress goes to JSON exit files in
// gates/s4-acceptance3/: mutation.exit, format-lint.exit, sweep.exit, targeted.exit, heavy.exit.
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const REPO = "/home/daniebo/Desktop/ra-math-advantage";
const TRACK = "openrouter-sdk-ai-layer_20261114";
const LABEL = "s4-acceptance3";
const OUT = path.join(REPO, "measure/runs", TRACK, "gates", LABEL);
const MUT = path.join(REPO, "measure/runs", TRACK, "acceptance3-mutation");
const GATES = path.join(REPO, "measure/tracks", TRACK, "gates.sh");
const H = process.env.HOME + "/Desktop/advantage-pr/scripts/jobs/heavy-run.sh";
const TESTS = path.join(REPO, "scripts/__tests__");
const REAL = {
  helper: path.join(TESTS, "openrouter-scan-shared.ts"),
  gate: path.join(TESTS, "openrouter-only.test.ts"),
  adv: path.join(TESTS, "openrouter-s4-adversarial.test.ts"),
  config: path.join(REPO, "scripts/vitest.config.ts"),
};

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(MUT, { recursive: true });

if (!process.argv.includes("--run")) {
  const child = spawn(process.execPath, [__filename, "--run"], { cwd: REPO, detached: true, stdio: "ignore", env: process.env });
  child.unref();
  console.log("detached heavy driver started, pid " + child.pid + ", exit file " + path.join(OUT, "heavy.exit"));
  process.exit(0);
}

function saveJson(name, obj) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj) + "\n", "utf8");
}
function heavy(cmd) {
  const run = spawnSync(H, ["-c", cmd], { cwd: REPO, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  return { exit: run.status === null ? "signal:" + run.signal : run.status, text: (run.stdout || "") + (run.stderr || "") };
}
function vcount(text, word) {
  const m = text.match(new RegExp("Tests\\s+[^\\n]*?(\\d+) " + word));
  return m ? Number(m[1]) : 0;
}
function once(src, from, to, label) {
  const parts = src.split(from);
  if (parts.length !== 2) throw new Error("mutation anchor not found exactly once: " + label + " (" + (parts.length - 1) + ")");
  return parts.join(to);
}

const master = { started: new Date().toISOString(), stages: {}, done: false };
function saveMaster() {
  saveJson("heavy.exit", master);
}
saveMaster();

// ---------- Stage 1: mutation ----------
function stageMutation() {
  const state = { started: new Date().toISOString(), results: {}, done: false };
  const save = () => saveJson("mutation.exit", state);
  save();

  const before = Object.fromEntries(Object.entries(REAL).map(([k, p]) => [k, fs.readFileSync(p)]));
  const helperSrc = before.helper.toString("utf8");
  const gateSrc = before.gate.toString("utf8");
  const advSrc = before.adv.toString("utf8");
  const OLD_SKIP = 'if (text.includes("\\0")) continue;';
  const LOOP = "    for (const token of tokens) {";

  const aliasConfig = (helperPath) =>
    [
      'import { defineConfig } from "vitest/config";',
      "export default defineConfig({",
      "  root: " + JSON.stringify(path.join(REPO, "scripts")) + ",",
      "  resolve: { alias: [{ find: /^\\.\\/openrouter-scan-shared$/, replacement: " + JSON.stringify(helperPath) + " }] },",
      '  test: { globals: true, environment: "node", include: ["__tests__/openrouter-only.test.ts", "__tests__/openrouter-s4-adversarial.test.ts"] },',
      "});",
      "",
    ].join("\n");
  const copyConfig = (dir) =>
    [
      'import { defineConfig } from "vitest/config";',
      "export default defineConfig({",
      "  root: " + JSON.stringify(dir) + ",",
      '  test: { globals: true, environment: "node", include: ["*.test.ts"] },',
      "});",
      "",
    ].join("\n");

  const REPO_LINE = 'const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");';
  const GATE_LINE = 'const GATE_FILE = path.join(REPO_ROOT, "scripts/__tests__/openrouter-only.test.ts");';
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

  const jobs = [];
  // Alias runs: the real, unmodified test files import a mutated copy of the helper.
  const aliasRun = (name, helperText, expectNote) => {
    const helperPath = path.join(MUT, "helper-" + name + ".ts");
    const cfgPath = path.join(MUT, "alias-" + name + ".config.ts");
    fs.writeFileSync(helperPath, helperText, "utf8");
    fs.writeFileSync(cfgPath, aliasConfig(helperPath), "utf8");
    jobs.push({ name, kind: "alias", cfg: cfgPath, note: expectNote });
  };
  aliasRun("m0-control", helperSrc, "byte-identical copy of the real helper");
  aliasRun("m1-old-skip", once(helperSrc, LOOP, "    " + OLD_SKIP + "\n" + LOOP, "m1"), "old NUL skip put back in the shared helper loop");
  aliasRun(
    "m2-nul-in-first-8k",
    once(helperSrc, LOOP, '    if (text.slice(0, 8192).includes("\\0")) continue;\n' + LOOP, "m2"),
    "a binary heuristic: skip a file with a NUL in its first 8192 characters",
  );

  // Copy runs: a mutated copy of a test file runs next to a copy of the real helper.
  const copyRun = (name, mutateGate, mutateAdv, note) => {
    const dir = path.join(MUT, "copy-" + name);
    fs.mkdirSync(dir, { recursive: true });
    const gateCopy = path.join(dir, "gate.test.ts");
    let g = once(gateSrc, REPO_LINE, "const REPO_ROOT = " + JSON.stringify(REPO) + ";", name + " gate root");
    let a = once(advSrc, REPO_LINE, "const REPO_ROOT = " + JSON.stringify(REPO) + ";", name + " adv root");
    a = once(a, GATE_LINE, "const GATE_FILE = " + JSON.stringify(gateCopy) + ";", name + " gate path");
    g = mutateGate(g);
    a = mutateAdv(a);
    fs.writeFileSync(gateCopy, g, "utf8");
    fs.writeFileSync(path.join(dir, "adversarial.test.ts"), a, "utf8");
    fs.writeFileSync(path.join(dir, "openrouter-scan-shared.ts"), helperSrc, "utf8");
    const cfgPath = path.join(dir, "copy.config.ts");
    fs.writeFileSync(cfgPath, copyConfig(dir), "utf8");
    jobs.push({ name, kind: "copy", cfg: cfgPath, note });
  };
  copyRun(
    "m3-adv-wrapper-prefilter",
    (g) => g,
    (a) =>
      once(
        a,
        ADV_WRAPPER,
        [
          "function scanRepoFilesForBannedTokens(files: string[]): string[] {",
          "  const kept = files.filter((f) => {",
          "    try {",
          '      return !fs.readFileSync(f, "utf8").includes("\\0");',
          "    } catch {",
          "      return true;",
          "    }",
          "  });",
          "  return scanFilesForBannedTokens(kept, BANNED_TOKENS, isBinaryPath, REPO_ROOT);",
          "}",
        ].join("\n"),
        "m3 wrapper",
      ),
    "the NUL skip put back in the adversarial wrapper only",
  );
  copyRun(
    "m4-gate-wrapper-bypass",
    (g) =>
      once(
        g,
        GATE_WRAPPER,
        [
          "function findBannedTokenMatches(files: string[]): string[] {",
          "  const hits: string[] = [];",
          "  for (const file of files) {",
          "    if (isBinaryPath(file)) continue;",
          "    let text: string;",
          "    try {",
          '      text = fs.readFileSync(file, "utf8");',
          "    } catch {",
          "      continue;",
          "    }",
          '    if (text.includes("\\0")) continue;',
          "    for (const token of BANNED_TOKENS) {",
          "      if (text.includes(token)) hits.push(`${path.relative(REPO_ROOT, file)}: ${token}`);",
          "    }",
          "  }",
          "  return hits.sort();",
          "}",
        ].join("\n"),
        "m4 wrapper",
      ),
    (a) => a,
    "the gate wrapper bypasses the shared helper and carries the NUL skip (the residual-gap probe)",
  );

  for (const job of jobs) {
    state.current = job.name;
    save();
    const run = heavy("npx vitest run --config " + job.cfg);
    fs.writeFileSync(path.join(OUT, "mutation-" + job.name + ".log"), run.text, "utf8");
    const failedTitles = run.text
      .split("\n")
      .filter((l) => /^\s*(FAIL|×)\s/.test(l))
      .map((l) => l.trim());
    const messages = run.text
      .split("\n")
      .filter((l) => /AssertionError/.test(l))
      .map((l) => l.trim());
    state.results[job.name] = {
      note: job.note,
      exit: run.exit,
      passed: vcount(run.text, "passed"),
      failed: vcount(run.text, "failed"),
      failed_titles: failedTitles.slice(0, 6),
      assertion_messages: messages.slice(0, 6),
    };
    save();
  }
  state.current = null;

  const after = Object.fromEntries(Object.entries(REAL).map(([k, p]) => [k, fs.readFileSync(p)]));
  state.real_sources_unchanged = Object.keys(REAL).every((k) => Buffer.compare(before[k], after[k]) === 0);
  const gitDiff = spawnSync("git", ["diff", "--quiet", "--", "scripts/"], { cwd: REPO });
  state.git_diff_scripts_exit = gitDiff.status;
  state.done = true;
  state.finished = new Date().toISOString();
  save();
  master.stages.mutation = "done";
  saveMaster();
}

// ---------- Stage 2: format and lint of the three scan test files ----------
function stageFormatLint() {
  const state = { started: new Date().toISOString(), results: {}, done: false };
  const save = () => saveJson("format-lint.exit", state);
  save();
  const files = "scripts/__tests__/openrouter-scan-shared.ts scripts/__tests__/openrouter-only.test.ts scripts/__tests__/openrouter-s4-adversarial.test.ts";
  for (const [name, cmd] of [
    ["oxfmt-check", "npx oxfmt --check " + files],
    ["oxlint", "npx oxlint " + files],
  ]) {
    state.current = name;
    save();
    const run = heavy(cmd);
    fs.writeFileSync(path.join(OUT, "format-lint-" + name + ".log"), run.text, "utf8");
    state.results[name] = { exit: run.exit, command: cmd };
    save();
  }
  state.current = null;
  state.done = true;
  state.finished = new Date().toISOString();
  save();
  master.stages.formatLint = "done";
  saveMaster();
}

// ---------- Stage 3: sweeps ----------
function stageSweeps() {
  const state = { started: new Date().toISOString(), order: ["lint", "test", "checks-all"], codes: {}, done: false };
  const save = () => saveJson("sweep.exit", state);
  save();
  for (const gate of state.order) {
    state.current = gate;
    state.currentStarted = new Date().toISOString();
    save();
    const run = spawnSync("bash", [GATES, gate, LABEL], {
      cwd: REPO,
      env: Object.assign({}, process.env, { GATES_BASE: "s3" }),
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

// ---------- Stage 4: targeted jobs ----------
function stageTargeted() {
  const BM2 = "CI=true npm run test --workspace=apps/bus-math-v2 -- ";
  const IM3 = "CI=true npm run test --workspace=apps/integrated-math-3 -- ";
  const JOBS = [
    { name: "openrouter-only", kind: "vitest", expected: 3, cmd: "npx vitest run --config scripts/vitest.config.ts -t 'openrouter-only'" },
    { name: "openrouter-s4-adversarial", kind: "vitest", expected: 7, cmd: "npx vitest run --config scripts/vitest.config.ts -t 'openrouter-s4-adversarial'" },
    { name: "openrouter-files", kind: "vitest", expected: 10, cmd: "npx vitest run --config scripts/vitest.config.ts openrouter" },
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
      result.expected = job.expected;
      result.matches_expected = result.passed === job.expected;
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
  stageMutation();
  stageFormatLint();
  stageSweeps();
  stageTargeted();
} catch (err) {
  master.error = String(err && err.stack ? err.stack : err);
}
master.done = true;
master.finished = new Date().toISOString();
saveMaster();
