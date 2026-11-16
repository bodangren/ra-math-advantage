import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(import.meta.dirname, "../..", "..");
const OXLINT = path.join(ROOT, "node_modules/.bin/oxlint");
const FIXTURE_ROOT = path.join(ROOT, "scripts/architecture/fixtures/oxlint-migration");
const POLICY_PATH = path.join(FIXTURE_ROOT, "legacy-policy.json");
const CASES_PATH = path.join(FIXTURE_ROOT, "cases.json");
const CONFIG_PATH = path.join(ROOT, ".oxlintrc.json");
const RUNTIME_CONFIG_PATH = path.join(ROOT, ".oxlint-migration-runtime.config.json");
const REVIEW_EXCEPTIONS_PATH = path.join(FIXTURE_ROOT, "review-exceptions.json");

const fixtureDirectories = [
  "apps/danielson/.oxlint-migration-fixtures",
  "apps/integrated-math-1/.oxlint-migration-fixtures",
  "apps/integrated-math-3/.oxlint-migration-fixtures",
  "packages/activity-runtime/src/.oxlint-migration-fixtures",
  "packages/activity-components/src/.oxlint-migration-fixtures",
  "packages/ai-tutoring/src/.oxlint-migration-fixtures",
  "packages/lesson-renderer/src/.oxlint-migration-fixtures",
  "packages/math-content/src/.oxlint-migration-fixtures",
].map((relativePath) => path.join(ROOT, relativePath));

const fixtureRoots = {
  "app-production": "apps/integrated-math-1/.oxlint-migration-fixtures",
  "app-test": "apps/integrated-math-1/.oxlint-migration-fixtures",
  "im3-test": "apps/integrated-math-3/.oxlint-migration-fixtures",
  "package-production": "packages/activity-runtime/src/.oxlint-migration-fixtures",
  "package-test": "packages/activity-runtime/src/.oxlint-migration-fixtures",
  "package-shared-production": "packages/activity-components/src/.oxlint-migration-fixtures",
  "lesson-renderer-test": "packages/lesson-renderer/src/.oxlint-migration-fixtures",
  "math-content-production": "packages/math-content/src/.oxlint-migration-fixtures",
  "math-content-test": "packages/math-content/src/.oxlint-migration-fixtures",
};

const appConfigFiles = [
  "apps/bus-math-v2/eslint.config.mjs",
  "apps/danielson/eslint.config.mjs",
  "apps/integrated-math-1/eslint.config.mjs",
  "apps/integrated-math-2/eslint.config.mjs",
  "apps/integrated-math-3/eslint.config.mjs",
  "apps/pre-calculus/eslint.config.mjs",
];

const packageConfigFiles = [
  "packages/activity-runtime/eslint.config.mjs",
  "packages/ai-tutoring/eslint.config.mjs",
  "packages/component-approval/eslint.config.mjs",
  "packages/core-auth/eslint.config.mjs",
  "packages/core-convex/eslint.config.mjs",
  "packages/efficacy-core/eslint.config.mjs",
  "packages/graphing-core/eslint.config.mjs",
  "packages/knowledge-space-core/eslint.config.mjs",
  "packages/knowledge-space-practice/eslint.config.mjs",
  "packages/lesson-renderer/eslint.config.mjs",
  "packages/math-content/eslint.config.mjs",
  "packages/practice-core/eslint.config.mjs",
  "packages/srs-engine/eslint.config.mjs",
  "packages/study-hub-core/eslint.config.mjs",
  "packages/teacher-reporting-core/eslint.config.mjs",
  "packages/workbook-pipeline/eslint.config.mjs",
];

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const policy = readJson(POLICY_PATH);
const cases = readJson(CASES_PATH);
const reviewExceptions = readJson(REVIEW_EXCEPTIONS_PATH);
const manifest = readJson(path.join(ROOT, "scripts/architecture/architecture.manifest.json"));

const runtimeConfig = readJson(CONFIG_PATH);
runtimeConfig.ignorePatterns = runtimeConfig.ignorePatterns.filter(
  (pattern) => pattern !== "**/.oxlint-migration-fixtures/**",
);
fs.writeFileSync(RUNTIME_CONFIG_PATH, `${JSON.stringify(runtimeConfig)}\n`, "utf8");
process.on("exit", () => fs.rmSync(RUNTIME_CONFIG_PATH, { force: true }));

function assertFixtureDirectoriesAbsent() {
  for (const directory of fixtureDirectories) {
    assert.equal(
      fs.existsSync(directory),
      false,
      `Test-owned fixture directory already exists: ${path.relative(ROOT, directory)}`,
    );
  }
}

function runOxlint(filePaths, extraArgs = []) {
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
  const args = ["--config", RUNTIME_CONFIG_PATH, "--no-ignore", "--format", "json", ...extraArgs, ...paths];
  const result = spawnSync(OXLINT, args, { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  let parsed;
  try {
    parsed = JSON.parse(result.stdout || "{}");
  } catch (error) {
    throw new Error(
      [
        "Oxlint did not return JSON diagnostics.",
        `command: ${OXLINT} ${args.join(" ")}`,
        `exit status: ${result.status}`,
        `stdout: ${result.stdout}`,
        `stderr: ${result.stderr}`,
        `parse error: ${error.message}`,
      ].join("\n"),
    );
  }
  return { args, parsed, result };
}

function expectedCode(targetRule) {
  if (targetRule === null) return null;
  const separator = targetRule.indexOf("/");
  if (separator === -1) return `eslint(${targetRule})`;
  const scope = targetRule.slice(0, separator);
  const ruleName = targetRule.slice(separator + 1);
  const diagnosticScope = scope === "nextjs" ? "next" : scope === "react" && ["rules-of-hooks", "exhaustive-deps"].includes(ruleName) ? "react-hooks" : scope;
  return `${diagnosticScope}(${ruleName})`;
}

function caseFilePath(testCase) {
  const sharedPackageTest = testCase.policyId.startsWith("package-test:shared:");
  const root = path.join(
    ROOT,
    sharedPackageTest
      ? "packages/activity-components/src/.oxlint-migration-fixtures"
      : fixtureRoots[testCase.profile],
  );
  return path.join(root, testCase.relativePath);
}

function runCases(testCases) {
  const filePaths = testCases.map((testCase) => caseFilePath(testCase));
  assert.equal(new Set(filePaths).size, filePaths.length, "selected cases must use unique fixture paths");
  for (const [index, filePath] of filePaths.entries()) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, testCases[index].source, "utf8");
  }
  const { parsed, result } = runOxlint(filePaths);
  const diagnosticsByFile = new Map();
  for (const diagnostic of parsed.diagnostics ?? []) {
    const filename = diagnostic.filename ?? diagnostic.filePath ?? diagnostic.path;
    if (!filename) continue;
    const absolutePath = path.resolve(ROOT, filename);
    const diagnostics = diagnosticsByFile.get(absolutePath) ?? [];
    diagnostics.push(diagnostic);
    diagnosticsByFile.set(absolutePath, diagnostics);
  }
  for (const [index, testCase] of testCases.entries()) {
    const diagnostics = diagnosticsByFile.get(filePaths[index]) ?? [];
    const code = expectedCode(testCase.targetRule);
    const matching = diagnostics.filter((diagnostic) => diagnostic.code === code);
    assert.equal(
      testCase.expectedDiagnostic,
      matching.length > 0,
      `${testCase.id} expected ${testCase.expectedDiagnostic ? code : "no diagnostic"}; got ${JSON.stringify(diagnostics)}`,
    );
    if (testCase.expectedDiagnostic) {
      assert.equal(matching[0].severity, testCase.severity);
      assert.equal(matching[0].labels[0].span.line, testCase.expectedLine);
    }
  }
  assert.equal(result.error, undefined, `Oxlint failed to start: ${result.error?.message}`);
}

function runCase(testCase) {
  runCases([testCase]);
}

test("migration policy and cases have matching schema-shaped records", () => {
  assert.equal(policy.schemaVersion, 1);
  assert.equal(cases.schemaVersion, 1);
  assert.equal(policy.entries.length > 0, true);
  assert.equal(cases.cases.length >= policy.entries.length, true);

  const policyIds = new Set();
  for (const entry of policy.entries) {
    assert.equal(policyIds.has(entry.id), false, `duplicate policy ID: ${entry.id}`);
    policyIds.add(entry.id);
  }

  const caseIds = new Set();
  const entryById = new Map(policy.entries.map((entry) => [entry.id, entry]));
  for (const testCase of cases.cases) {
    assert.equal(caseIds.has(testCase.id), false, `duplicate case ID: ${testCase.id}`);
    caseIds.add(testCase.id);
    const entry = entryById.get(testCase.policyId);
    assert.ok(entry, `${testCase.id} references an unknown policy entry`);
    for (const field of ["profile", "legacyRule", "targetRule", "severity", "provider"]) {
      assert.deepEqual(testCase[field], entry[field], `${testCase.id} has a mismatched ${field}`);
    }
    assert.equal(testCase.expectedDiagnostic, testCase.expectedLine !== null);
  }

  const activePolicyIds = new Set(
    policy.entries
      .filter((entry) => entry.severity !== "off" && entry.disposition !== "remove-obsolete")
      .map((entry) => entry.id),
  );
  assert.equal(reviewExceptions.schemaVersion, 1);
  const exceptionIds = new Set();
  for (const exception of reviewExceptions.exceptions) {
    assert.equal(exceptionIds.has(exception.policyId), false, `duplicate review exception: ${exception.policyId}`);
    exceptionIds.add(exception.policyId);
    const entry = entryById.get(exception.policyId);
    assert.ok(entry, `${exception.policyId} review exception references an unknown policy entry`);
    assert.equal(entry.targetRule, exception.targetRule);
    assert.equal(exception.reason.length > 0, true);
  }
  const violatingPolicyIds = new Set(
    cases.cases
      .filter((testCase) => testCase.purpose === "violation" && testCase.expectedDiagnostic)
      .map((testCase) => testCase.policyId),
  );
  assert.deepEqual(
    [...activePolicyIds].filter((policyId) => !violatingPolicyIds.has(policyId) && !exceptionIds.has(policyId)),
    [],
    "every active policy entry requires a diagnostic-producing violation case or an explicit review exception",
  );
});

test("review exceptions have explicit owner approval", () => {
  assert.deepEqual(
    reviewExceptions.exceptions.filter((exception) => exception.status !== "approved"),
    [],
    "each parity exception requires explicit owner approval before manual completion",
  );
});

test("standard config has the explicit native policy and separate anti-slop boundary", () => {
  const config = readJson(CONFIG_PATH);
  assert.deepEqual(config.plugins, ["typescript", "react", "import", "jsx-a11y", "nextjs"]);
  assert.deepEqual(config.jsPlugins.map((plugin) => plugin.name), ["eslint-js", "react-js", "react-hooks-js"]);
  assert.deepEqual(config.settings.react, { version: "19" });
  for (const category of ["correctness", "nursery", "pedantic", "perf", "restriction", "style", "suspicious"]) {
    assert.equal(config.categories[category], "off", `${category} defaults must be disabled`);
  }
  assert.equal(JSON.stringify(config).includes('"anti-slop/'), false);
  assert.equal(config.ignorePatterns.includes("tools/oxlint/anti-slop/**"), true);
  assert.equal(fs.existsSync(path.join(ROOT, "oxlint.anti-slop.config.ts")), true);

  const packageTestOverride = config.overrides.find((override) =>
    override.files?.includes("packages/**/src/**/__tests__/**/*.{ts,tsx}"),
  );
  assert.deepEqual(packageTestOverride.rules["typescript/ban-ts-comment"], "error");
  assert.deepEqual(packageTestOverride.rules["no-unused-vars"], ["error", { argsIgnorePattern: "^_" }]);
});

test("workspace lint commands use the root Oxlint policy", () => {
  const governed = manifest.workspaces.filter((workspace) => workspace.kind === "app" || workspace.kind === "package");
  assert.equal(governed.length, 26);
  assert.equal(manifest.excludedWorkspaces.includes("packages/_template"), true);

  for (const workspace of governed) {
    const packageJson = readJson(path.join(ROOT, workspace.path, "package.json"));
    const lint = packageJson.scripts?.lint ?? "";
    assert.match(lint, /^oxlint --config \.\.\/\.\.\/\.oxlintrc\.json (?:\. |src )--max-warnings 0$/);
    assert.equal(lint.includes("eslint"), false);
  }
  const rootPackage = readJson(path.join(ROOT, "package.json"));
  assert.match(rootPackage.scripts.lint, /run-workspace-quality\.mjs --kind package --capability lint/);
  assert.equal(rootPackage.scripts["lint:anti-slop"], "oxlint --config oxlint.anti-slop.config.ts .");
});

test("final cutover removes live ESLint configuration and direct workspace dependencies", () => {
  for (const relativePath of [...appConfigFiles, ...packageConfigFiles, "scripts/architecture/eslint.package.config.mjs"]) {
    assert.equal(fs.existsSync(path.join(ROOT, relativePath)), false, `${relativePath} still exists`);
  }

  for (const workspace of manifest.workspaces.filter((item) => item.kind === "app" || item.kind === "package")) {
    const packageJson = readJson(path.join(ROOT, workspace.path, "package.json"));
    for (const dependencyName of ["eslint", "@eslint/js", "@eslint/eslintrc", "eslint-config-next", "typescript-eslint"]) {
      assert.equal(packageJson.dependencies?.[dependencyName], undefined, `${workspace.path} declares ${dependencyName}`);
      assert.equal(packageJson.devDependencies?.[dependencyName], undefined, `${workspace.path} declares ${dependencyName}`);
    }
  }
});

test("controlled violation and valid cases produce the recorded JSON behavior", { timeout: 120_000 }, () => {
  assertFixtureDirectoriesAbsent();
  const selected = [
    ...cases.cases.filter((testCase) => testCase.purpose === "violation"),
    cases.cases.find((testCase) => testCase.purpose === "valid"),
  ];
  try {
    runCases(selected);
  } finally {
    for (const directory of fixtureDirectories) {
      fs.rmSync(directory, { recursive: true, force: true });
      assert.equal(fs.existsSync(directory), false, `fixture directory remained: ${directory}`);
    }
  }
});

test("zero-warning policy rejects a warning diagnostic", { timeout: 30_000 }, () => {
  assertFixtureDirectoriesAbsent();
  const warningCase = cases.cases.find((testCase) => testCase.targetRule === "nextjs/no-img-element" && testCase.expectedDiagnostic);
  assert.ok(warningCase, "warning fixture is required");
  const filePath = caseFilePath(warningCase);
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, warningCase.source, "utf8");
    const { result } = runOxlint(filePath, ["--max-warnings", "0"]);
    assert.notEqual(result.status, 0);
  } finally {
    for (const directory of fixtureDirectories) {
      fs.rmSync(directory, { recursive: true, force: true });
      assert.equal(fs.existsSync(directory), false);
    }
  }
});

test("anti-slop config loads its 15 error rules without entering standard policy", () => {
  const antiSlopConfig = fs.readFileSync(path.join(ROOT, "oxlint.anti-slop.config.ts"), "utf8");
  const ruleLines = antiSlopConfig.split("\n").filter((line) => line.includes('"anti-slop/'));
  assert.equal(ruleLines.length, 15);
  assert.equal(ruleLines.every((line) => line.includes('": "error"')), true);
  assert.match(antiSlopConfig, /specifier: "\.\/tools\/oxlint\/anti-slop\/index\.ts"/);
});

test("no final command invokes ESLint or next lint", () => {
  const offenders = [];
  const files = ["package.json", ...manifest.workspaces.map((workspace) => `${workspace.path}/package.json`)];
  for (const relativePath of files) {
    const packageJson = readJson(path.join(ROOT, relativePath));
    for (const [scriptName, command] of Object.entries(packageJson.scripts ?? {})) {
      if (/\beslint(?:\s|$)|\bnext lint\b/.test(command)) offenders.push(`${relativePath}#${scriptName}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("policy rule aliases match the installed Oxlint rule inventory", () => {
  const inventory = JSON.parse(execFileSync(OXLINT, ["--rules", "--format", "json"], { cwd: "/tmp", encoding: "utf8" }));
  const nativeNames = new Set(inventory.map((rule) => `${rule.scope}/${rule.value}`));
  const pluginAliases = new Set(["eslint-js", "react-js", "react-hooks-js"]);
  const missing = [];
  for (const entry of policy.entries) {
    if (entry.disposition !== "native") continue;
    const [scope, name] = entry.targetRule.includes("/") ? entry.targetRule.split("/") : ["eslint", entry.targetRule];
    const normalizedScope = scope === "jsx-a11y" ? "jsx_a11y" : scope;
    if (!pluginAliases.has(scope) && !nativeNames.has(`${normalizedScope}/${name}`)) missing.push(entry.targetRule);
  }
  assert.deepEqual([...new Set(missing)], []);
});
