// Run the production gate functions against isolated reports and command results.
// The runner intercepts HEAVY_RUN. It never runs npm, npx, or a repository sweep.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const track = __dirname;
const source = fs.readFileSync(path.join(track, "gates.sh"), "utf8");
const scratch = path.resolve(track, "../../runs/dependency-refresh_20261121/adversarial-r2-scratch");
fs.mkdirSync(scratch, { recursive: true });
const root = fs.mkdtempSync(path.join(scratch, "fixture-"));
const scratchTrack = path.join(root, "measure/tracks/dependency-refresh_20261121");
fs.mkdirSync(scratchTrack, { recursive: true });
fs.writeFileSync(path.join(scratchTrack, "gates.sh"), source);
fs.copyFileSync(path.join(track, "evidence.md"), path.join(scratchTrack, "evidence.md"));
fs.mkdirSync(path.join(root, "scripts/architecture"), { recursive: true });
fs.writeFileSync(
  path.join(root, "scripts/architecture/architecture.manifest.json"),
  JSON.stringify({ workspaces: [{ path: "packages/probe" }] }),
);
fs.mkdirSync(path.join(root, "packages/probe"), { recursive: true });
fs.writeFileSync(
  path.join(root, "packages/probe/package.json"),
  JSON.stringify({ scripts: { test: "fixture-only" } }),
);

const runner = path.join(root, "fixture-runner");
fs.writeFileSync(
  runner,
  `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$FIXTURE_CALLS"
case "$*" in
  "npm audit --json"|"npm run format:check"|"npm run test --workspace=packages/probe"|"npx --no-install vitest run --config scripts/vitest.config.ts"|"npx --no-install vitest run scripts/audit/__tests__") ;;
  *) echo "FIXTURE SETUP FAIL: unexpected command: $*" >&2; exit 201 ;;
esac
cat "$FIXTURE_STDOUT"
cat "$FIXTURE_STDERR" >&2
exit "$FIXTURE_CODE"
`,
  { mode: 0o755 },
);
const stdout = path.join(root, "stdout");
const stderr = path.join(root, "stderr");
const calls = path.join(root, "calls");
const results = [];
function run(program, args, env = {}) {
  const result = spawnSync(program, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 15000,
    env: { ...process.env, ...env },
  });
  if (result.error || result.signal) throw result.error || Error(result.signal);
  return { status: result.status, output: result.stdout + result.stderr };
}
function check(name, result, expected, outputPattern) {
  const pass = result.status === expected && (!outputPattern || outputPattern.test(result.output));
  results.push({ name, pass, expected, ...result });
  console.log(`${name}=${pass ? "PASS" : "FAIL"} expected=${expected} actual=${result.status}`);
  if (!pass) console.log(result.output.trim() || "(no output)");
}
function main(gate, label, text, code = 0, err = "", env = {}) {
  fs.writeFileSync(stdout, text);
  fs.writeFileSync(stderr, err);
  fs.writeFileSync(calls, "");
  const result = run("bash", [path.join(scratchTrack, "gates.sh"), gate, label], {
    HEAVY_RUN: runner,
    FIXTURE_STDOUT: stdout,
    FIXTURE_STDERR: stderr,
    FIXTURE_CALLS: calls,
    FIXTURE_CODE: String(code),
    ...env,
  });
  result.calls = fs.readFileSync(calls, "utf8").trim();
  return result;
}
function shell(body, args = []) {
  return run("bash", ["-c", 'source "$1"; shift\n' + body, "fixture", path.join(track, "gates.sh"), ...args]);
}
function compareKeys(name, before, after, expected) {
  const old = path.join(root, "old.log");
  const current = path.join(root, "current.log");
  fs.writeFileSync(old, before + "\n");
  fs.writeFileSync(current, after + "\n");
  check(
    name,
    shell(
      'LABEL=fixture-current; INFRA=" 290 "; newfail=0; infra=0\ncompare_result probe 1 1 "$1" "$2"\nkey "$1"; key "$2"\nexit "$newfail"',
      [old, current],
    ),
    expected,
  );
}

try {
  compareKeys(
    "KEY_NPM_TIMESTAMP_ONLY",
    "npm error A complete log of this run can be found in: /cache/2026-11-20.log",
    "npm error A complete log of this run can be found in: /cache/2026-11-21.log",
    0,
  );
  compareKeys("KEY_PACKAGE_DIAGNOSTIC", "npm error invalid: old@1 /node_modules/old", "npm error invalid: new@2 /node_modules/new", 1);
  compareKeys("KEY_NEVER_PRESERVES_HIT", "error: original failure", "error: never accept a leaked token", 1);
  compareKeys(
    "KEY_DISTINCT_TEST_TITLES",
    "FAIL tests/window.test.ts > retains 10ms error window",
    "FAIL tests/window.test.ts > retains 20ms error window",
    1,
  );
  compareKeys(
    "KEY_TRAILING_TITLE_DURATION",
    "FAIL tests/window.test.ts > retains error window 10ms",
    "FAIL tests/window.test.ts > retains error window 20ms",
    1,
  );
  compareKeys(
    "KEY_PARENTHESIZED_TITLE_DURATION",
    "FAIL tests/window.test.ts > retains error window (10ms)",
    "FAIL tests/window.test.ts > retains error window (20ms)",
    1,
  );
  compareKeys(
    "KEY_RUNNER_TIMING_ONLY",
    "× reports a clear error (12 ms)",
    "× reports a clear error (15 ms)",
    0,
  );
  const titlePairs = [
    ["UNICODE", "rejects π ≤ 1", "rejects π ≤ 2"],
    ["TRAILING_BRACKETS", "rejects error [alpha]", "rejects error [beta]"],
    ["SECOND_DURATION", "rejects error in 1.2s", "rejects error in 1.3s"],
    ["RETRY_SUFFIX", "rejects error (1 retry)", "rejects error (2 retry)"],
    ["TAB", "rejects\terror alpha", "rejects\terror beta"],
    ["COORDINATE_TUPLE", "rejects point (1,2)", "rejects point (3,4)"],
    ["COLON_TITLE", "rejects ratio :1:2", "rejects ratio :3:4"],
  ];
  for (const [name, before, after] of titlePairs) {
    compareKeys(`KEY_FAIL_${name}`, `FAIL tests/probe.test.ts > ${before}`, `FAIL tests/probe.test.ts > ${after}`, 1);
  }
  compareKeys(
    "KEY_ANSI_DISTINCT_TITLE",
    "\u001b[31mFAIL\u001b[0m tests/probe.test.ts > rejects error [alpha]",
    "\u001b[31mFAIL\u001b[0m tests/probe.test.ts > rejects error [beta]",
    1,
  );
  compareKeys(
    "KEY_PASSED_TITLE_IGNORED",
    "FAIL tests/probe.test.ts > retained\n✓ accepts error alpha 1.2s",
    "FAIL tests/probe.test.ts > retained\n✓ accepts error beta 1.3s",
    0,
  );
  compareKeys("KEY_RUNNER_SECONDS_ONLY", "× rejects error alpha (1.2s)", "× rejects error alpha (1.3s)", 0);
  compareKeys("KEY_RUNNER_TITLE_AND_SECONDS", "× rejects error alpha (1.2s)", "× rejects error beta (1.3s)", 1);
  compareKeys(
    "KEY_NODE_TEST_TITLE",
    "not ok 1 - rejects alpha\n  error: assertion failed\n  code: ERR_ASSERTION",
    "not ok 1 - rejects beta\n  error: assertion failed\n  code: ERR_ASSERTION",
    1,
  );
  compareKeys(
    "KEY_PLAYWRIGHT_TITLE",
    "  1) [chromium] › tests/probe.spec.ts:10:3 › rejects alpha\n    Error: expect(received).toBe(expected)",
    "  1) [chromium] › tests/probe.spec.ts:10:3 › rejects beta\n    Error: expect(received).toBe(expected)",
    1,
  );
  compareKeys("KEY_DO_NOT_PRESERVES_HIT", "error: original failure", "error: do not accept a leaked token", 1);

  const bundle = source.slice(source.indexOf("bundle() {")).match(/^\s*node -e '\n([\s\S]*?)\n\s*' "\$OUT"/m);
  if (!bundle) throw Error("FIXTURE SETUP FAIL: bundle comparison extraction failed");
  const base = path.join(root, "bundle-base");
  const out = path.join(root, "bundle-current");
  fs.mkdirSync(base);
  fs.mkdirSync(out);
  const app = "integrated-math-3";
  const budget = path.resolve(track, "../../../apps/integrated-math-3/scripts/bundle-size-audit.mjs");
  const ssr = "[OK] server/ssr/index.js → index.js: 292.85 KB (threshold: 700.00 KB)";
  const page = (stem, hash, status = "OK", kb = 100) =>
    `[${status}] client/assets/page-*.js → page-${stem}-${hash}.js: ${kb.toFixed(2)} KB (threshold: 900.00 KB)`;
  function bundleCase(name, old, current, expected, total = "1050000", oldTotal = "1000000") {
    fs.writeFileSync(path.join(base, `step-bundle-${app}.log`), old);
    fs.writeFileSync(path.join(out, `step-bundle-${app}.log`), current);
    fs.writeFileSync(path.join(base, `step-total-${app}.log`), `TOTAL_BYTES=${oldTotal}\n`);
    fs.writeFileSync(path.join(out, `step-total-${app}.log`), `TOTAL_BYTES=${total}\n`);
    check(name, run(process.execPath, ["-e", bundle[1], out, base, app, budget, "0"]), expected);
  }
  const complete = [ssr, page("alpha", "abc12345"), page("beta", "def12345")].join("\n");
  bundleCase("BUNDLE_EXACT_FIVE_PERCENT", complete, complete, 0);
  bundleCase("BUNDLE_OVER_FIVE_PERCENT", complete, complete, 1, "1050001");
  bundleCase("BUNDLE_EMPTY_CURRENT", complete, "", 1);
  bundleCase("BUNDLE_MISSING_PATTERN", complete, page("alpha", "abc12345"), 1);
  bundleCase("BUNDLE_MISSING_SIBLING_CHUNK", complete, [ssr, page("alpha", "abc12345")].join("\n"), 1);
  bundleCase("BUNDLE_TRUNCATED_SIBLING", complete, [ssr, page("alpha", "abc12345"), "[OK] client/assets/page-*.js → page-beta-def12345.js:"].join("\n"), 1);
  bundleCase("BUNDLE_EMPTY_BASELINE", "", complete, 1);
  bundleCase("BUNDLE_MISSING_TOTAL", complete, complete, 1, "");
  bundleCase("BUNDLE_NEW_BUDGET_FAILURE", complete, [ssr, page("alpha", "abc12345", "EXCEEDS", 901), page("beta", "def12345")].join("\n"), 1);
  bundleCase("BUNDLE_HASH_RENAME", [ssr, page("alpha", "abc12345", "EXCEEDS", 901)].join("\n"), [ssr, page("alpha", "xyz12345", "EXCEEDS", 901)].join("\n"), 0);
  bundleCase("BUNDLE_HASH_RENAME_LARGER", [ssr, page("alpha", "abc12345", "EXCEEDS", 901)].join("\n"), [ssr, page("alpha", "xyz12345", "EXCEEDS", 902)].join("\n"), 1);
  const hashOnly = (hash, status = "OK", kb = 100) =>
    `[${status}] client/assets/page-*.js → page-${hash}.js: ${kb.toFixed(2)} KB (threshold: 900.00 KB)`;
  bundleCase("BUNDLE_MISSING_HASH_ONLY_SIBLING", [ssr, hashOnly("abc12345"), hashOnly("def12345")].join("\n"), [ssr, hashOnly("abc12345")].join("\n"), 1);
  bundleCase("BUNDLE_HASH_ONLY_RENAME", [ssr, hashOnly("abc12345")].join("\n"), [ssr, hashOnly("xyz12345")].join("\n"), 0);
  bundleCase("BUNDLE_DUPLICATE_NAMED_SIBLING", complete, [ssr, page("alpha", "abc12345"), page("alpha", "abc12345")].join("\n"), 1);
  bundleCase(
    "BUNDLE_DUPLICATE_HASH_ONLY_SIBLING",
    [ssr, hashOnly("abc12345"), hashOnly("def12345")].join("\n"),
    [ssr, hashOnly("abc12345"), hashOnly("abc12345")].join("\n"),
    1,
  );
  bundleCase(
    "BUNDLE_PASSING_SIBLING_NOW_EXCEEDS",
    [ssr, hashOnly("abc12345", "EXCEEDS", 950), hashOnly("def12345", "OK", 100)].join("\n"),
    [ssr, hashOnly("abc12345", "EXCEEDS", 950), hashOnly("def12345", "EXCEEDS", 901)].join("\n"),
    1,
    "3000000",
    "3000000",
  );
  bundleCase(
    "BUNDLE_BOTH_HASHES_RENAMED_CONTROL",
    [ssr, hashOnly("abc12345"), hashOnly("def12345")].join("\n"),
    [ssr, hashOnly("xyz12345"), hashOnly("uvw12345")].join("\n"),
    0,
  );
  bundleCase("BUNDLE_STEM_RENAMED", complete, [ssr, page("gamma", "abc12345"), page("beta", "def12345")].join("\n"), 1);

  let sequence = 0;
  const known = "GHSA-rgj7-g3m4-5g8c";
  const unknown = "GHSA-0000-1111-2222";
  function entry(name, id, severity = "high") {
    return {
      name,
      severity,
      range: "*",
      nodes: [`node_modules/${name}`],
      via: [{ name, severity, source: 123, url: `https://github.com/advisories/${id}` }],
    };
  }
  function report(entries, high = 1, critical = 0) {
    return JSON.stringify({
      auditReportVersion: 2,
      metadata: { vulnerabilities: { critical, high, moderate: 0, low: 0, info: 0, total: high + critical } },
      vulnerabilities: entries,
    });
  }
  function audit(name, text, expected, code = 1, err = "") {
    const result = main("audit-high", `fixture-audit-${sequence++}`, text, code, err);
    if (result.calls !== "npm audit --json") throw Error("FIXTURE SETUP FAIL: audit did not intercept the production command");
    check(name, result, expected);
  }
  audit("AUDIT_KNOWN_LEAF", report({ sharp: entry("sharp", known) }), 0);
  audit("AUDIT_ZERO_FINDINGS", report({}, 0), 0, 0);
  audit("AUDIT_NEW_HIGH_PACKAGE", report({ unexpected: entry("unexpected", unknown) }), 1);
  audit("AUDIT_KNOWN_ID_WRONG_PACKAGE", report({ unexpected: entry("unexpected", known) }), 1);
  audit("AUDIT_NEW_CRITICAL", report({ unexpected: entry("unexpected", unknown, "critical") }, 0, 1), 1);
  audit("AUDIT_JSON_PARSE_ERROR", "{", 3);
  audit("AUDIT_ERROR_OBJECT", JSON.stringify({ error: { code: "ECONNRESET" } }), 3);
  audit("AUDIT_NETWORK_ERROR", report({}, 0), 3, 1, "npm error code EAI_AGAIN\n");
  audit("AUDIT_BAD_EXIT", report({}, 0), 3, 7);
  audit("AUDIT_MISSING_HIGH_ENTRIES", report({}, 1), 3);
  audit("AUDIT_PARTIAL_HIGH_ENTRIES", report({ sharp: entry("sharp", known) }, 2), 3);
  const propagated = { severity: "high", via: ["sharp"], nodes: ["node_modules/miniflare"] };
  audit("AUDIT_PROPAGATED_PARENT", report({ sharp: entry("sharp", known), miniflare: propagated }, 2), 0);
  const disclosedLeaf = entry("sharp", known);
  disclosedLeaf.nodes = ["node_modules/miniflare/node_modules/sharp"];
  audit("AUDIT_DISCLOSED_PATH_CONTROL", report({ sharp: disclosedLeaf }), 0);
  const newPath = { ...disclosedLeaf, nodes: [...disclosedLeaf.nodes, "packages/probe/node_modules/sharp"] };
  audit("AUDIT_KNOWN_ID_NEW_PATH", report({ sharp: newPath }), 1);
  audit(
    "AUDIT_KNOWN_ID_CRITICAL_ESCALATION",
    report({ sharp: { ...disclosedLeaf, severity: "critical", via: [{ ...disclosedLeaf.via[0], severity: "critical" }] } }, 0, 1),
    1,
  );
  const extraAdvisory = { ...disclosedLeaf, via: [...disclosedLeaf.via, entry("sharp", unknown).via[0]] };
  audit("AUDIT_KNOWN_PACKAGE_NEW_ADVISORY", report({ sharp: extraAdvisory }), 1);
  const evidenceFile = path.join(scratchTrack, "evidence.md");
  const savedEvidence = fs.readFileSync(evidenceFile, "utf8");
  fs.writeFileSync(evidenceFile, "## D1 High Exceptions\n\n| Advisory | Package | Version | Dependency path | Reason |\n|---|---|---|---|---|\n");
  audit("AUDIT_EMPTY_EXCEPTION_TABLE", report({ sharp: disclosedLeaf }), 1);
  fs.writeFileSync(evidenceFile, savedEvidence);

  const gatesRoot = path.join(root, "measure/runs/dependency-refresh_20261121/gates");
  const formatCommand = "npm run format:check \n";
  function formatRecord(label, log, command, code = 0, timingCode = code) {
    const dir = path.join(gatesRoot, label, "format");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "format.steps"), `format ${code}\n`);
    fs.writeFileSync(path.join(dir, "step-format.log"), log);
    fs.writeFileSync(path.join(dir, "timing.txt"), `step format 1 exit=${timingCode}\n`);
    if (command !== undefined) fs.writeFileSync(path.join(dir, "step-format.log.command"), command);
  }
  formatRecord("fixture-base", "All files correctly formatted\n", formatCommand);
  function resume(name, label, log, command, expected, recordCode = 0, timingCode = recordCode, expectedCalls = "npm run format:check") {
    formatRecord(label, log, command, recordCode, timingCode);
    const result = main("format", label, "error: current format check fails\n", 1, "", {
      GATES_RESUME: "1",
      GATES_BASE: "fixture-base",
    });
    check(name, result, expected);
    console.log(`${name}_COMMAND_CALLS=${result.calls || "(none)"}`);
    if (expectedCalls !== null) {
      check(`${name}_EXECUTION`, { status: result.calls === expectedCalls ? 0 : 1, output: result.calls }, 0);
    }
  }
  resume("RESUME_EMPTY_LOG", "fixture-empty-log", "", formatCommand, 1);
  resume("RESUME_WRONG_COMMAND", "fixture-wrong-command", "Earlier command passed\n", "npm run lint\n", 1);
  resume("RESUME_MISSING_COMMAND", "fixture-no-command", "Earlier command passed\n", undefined, 1);
  resume("RESUME_VALID_SUCCESS_CONTROL", "fixture-valid-success", "All files correctly formatted\n", formatCommand, 0, 0, 0, "");
  resume("RESUME_TRUNCATED_LOG", "fixture-truncated", "> format:check\n> oxfmt --check", formatCommand, 1);
  resume(
    "RESUME_EXIT_DISAGREES_WITH_FAILURE",
    "fixture-false-zero",
    "error: current format check fails\n",
    formatCommand,
    1,
    0,
    1,
  );
  resume("RESUME_EMPTY_EXIT_CODE", "fixture-empty-exit", "All files correctly formatted\n", formatCommand, 1, "");
  resume("RESUME_INVALID_EXIT_CODE", "fixture-invalid-exit", "error: current format check fails\n", formatCommand, 1, "garbage", "garbage", null);
  const fresh = main("format", "fixture-fresh", "error: current format check fails\n", 1, "", { GATES_BASE: "fixture-base" });
  check("RESUME_FRESH_FAILURE_CONTROL", fresh, 1, /NEWFAIL=1/);
  if (fresh.calls !== "npm run format:check") throw Error("FIXTURE SETUP FAIL: format command interception failed");

  function testRecords(label, partial) {
    const dir = path.join(gatesRoot, label, "test");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "test.exit"), "packages/probe 0\n");
    fs.writeFileSync(path.join(dir, "test-packages-probe.log"), partial ? "" : "Tests 1 passed\n");
    fs.writeFileSync(path.join(dir, "test-packages-probe.log.command"), "npm run test --workspace=packages/probe \n");
    fs.writeFileSync(path.join(dir, "test.steps"), "scripts-suite 0\naudit-suites 0\n");
    for (const name of ["scripts-suite", "audit-suites"]) {
      fs.writeFileSync(path.join(dir, `step-${name}.log`), "Tests 1 passed\n");
      const cmd = name === "scripts-suite"
        ? "npx --no-install vitest run --config scripts/vitest.config.ts"
        : "npx --no-install vitest run scripts/audit/__tests__";
      fs.writeFileSync(path.join(dir, `step-${name}.log.command`), `${cmd} \n`);
    }
  }
  testRecords("fixture-base", false);
  testRecords("fixture-partial-test", true);
  const resumedTest = main("test", "fixture-partial-test", "FAIL tests/new.test.ts > new failure\n", 1, "", {
    GATES_RESUME: "1",
    GATES_BASE: "fixture-base",
  });
  check("RESUME_WORKSPACE_EMPTY_LOG", resumedTest, 1);
  console.log(`RESUME_WORKSPACE_EMPTY_LOG_COMMAND_CALLS=${resumedTest.calls || "(none)"}`);
  check(
    "RESUME_WORKSPACE_EMPTY_LOG_EXECUTION",
    { status: resumedTest.calls === "npm run test --workspace=packages/probe" ? 0 : 1, output: resumedTest.calls },
    0,
  );
  testRecords("fixture-false-workspace-zero", false);
  const falseWorkspace = path.join(gatesRoot, "fixture-false-workspace-zero/test");
  fs.writeFileSync(path.join(falseWorkspace, "test-packages-probe.log"), "FAIL tests/new.test.ts > new failure\nTests 1 failed\n");
  fs.writeFileSync(path.join(falseWorkspace, "timing.txt"), "test packages/probe 1 exit=1\n");
  const disagreedTest = main("test", "fixture-false-workspace-zero", "FAIL tests/new.test.ts > new failure\n", 1, "", {
    GATES_RESUME: "1",
    GATES_BASE: "fixture-base",
  });
  check("RESUME_WORKSPACE_EXIT_DISAGREES", disagreedTest, 1);
  testRecords("fixture-failed-base", false);
  const failedBase = path.join(gatesRoot, "fixture-failed-base/test");
  fs.writeFileSync(path.join(failedBase, "test.exit"), "packages/probe 1\n");
  fs.writeFileSync(path.join(failedBase, "test-packages-probe.log"), "FAIL tests/old.test.ts > baseline failure\nTests 1 failed\n");
  testRecords("fixture-truncated-new-run", false);
  fs.writeFileSync(path.join(gatesRoot, "fixture-truncated-new-run/test/test.exit"), "");
  const truncatedRun = main("test", "fixture-truncated-new-run", "> vitest run\n", 1, "", {
    GATES_RESUME: "1",
    GATES_BASE: "fixture-failed-base",
  });
  check("FRESH_TRUNCATED_TEST_EXECUTION", truncatedRun, 1);
  check(
    "FRESH_TRUNCATED_TEST_EXECUTION_CONTROL",
    { status: truncatedRun.calls === "npm run test --workspace=packages/probe" ? 0 : 1, output: truncatedRun.calls },
    0,
  );

  const passed = results.filter((r) => r.pass).length;
  console.log(`FIXTURE_PASSED=${passed} FIXTURE_FAILED=${results.length - passed}`);
  fs.writeFileSync(path.join(scratch, "last-results.json"), JSON.stringify(results, null, 2) + "\n");
  process.exitCode = passed === results.length ? 0 : 1;
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
