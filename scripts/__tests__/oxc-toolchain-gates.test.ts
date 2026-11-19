import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { load as loadYaml } from "js-yaml";
import * as ts from "typescript6";

// Resolve from the test file, never from the working folder (lessons-learned 2026-05-03).
// This file reads nothing under measure/tracks/ (closeout moves the track folder).
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const TOOL_TIMEOUT_MS = 120000;
const ABSENT_TOOL_PHRASES = ["npx canceled", "missing packages", "command not found"];

type Json = Record<string, unknown>;

function readJson(file: string): Json {
  return JSON.parse(fs.readFileSync(file, "utf8")) as Json;
}

// Strip comments and trailing commas from a tsconfig, without touching string contents.
function parseJsonc(text: string): Json {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inString) {
      out += c;
      if (c === "\\") {
        out += n ?? "";
        i++;
      } else if (c === '"') {
        inString = false;
      }
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === "/" && n === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && n === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i++;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1")) as Json;
}

function listDirs(parent: string): string[] {
  const abs = path.join(REPO_ROOT, parent);
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(abs, d.name, "package.json")))
    .map((d) => path.join(abs, d.name))
    .sort();
}

const APP_DIRS = listDirs("apps");
const PACKAGE_DIRS = listDirs("packages");
const IM3_DIR = path.join(REPO_ROOT, "apps", "integrated-math-3");
const APP_SHELL_DIR = path.join(REPO_ROOT, "packages", "app-shell");
// The folders that case 1 and case 2 check: the root, each app, and the shared shell package.
const RESOLVE_FROM_DIRS = [REPO_ROOT, ...APP_DIRS, APP_SHELL_DIR];

// Find `node_modules/<name>/package.json` the way module resolution does: walk up from
// `fromDir`. This does not use `require.resolve`, because vinext 1.x has no
// `./package.json` entry in its `exports` map.
function findInstalledPackageJson(fromDir: string, name: string): string | null {
  let dir = fromDir;
  for (;;) {
    const candidate = path.join(dir, "node_modules", name, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function relative(file: string): string {
  return path.relative(REPO_ROOT, file) || ".";
}

// The five manifest fields that a dependency scan reads.
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "overrides",
];

type ManifestEntry = { display: string; manifest: Json };

// `next` also appears under a nested override key such as `next@16` (case 3).
const isNextKey = (key: string) => key === "next" || key.startsWith("next@");

// Collect each place that a manifest set declares a name that `isKey` accepts, including
// nested override objects. One scanner serves case 3 and case 9 (strategy 14.3, Q1).
function scanDeclarations(entries: ManifestEntry[], isKey: (key: string) => boolean): string[] {
  const found: string[] = [];
  const walk = (value: unknown, trail: string, display: string) => {
    if (value === null || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value as Json)) {
      if (isKey(key)) found.push(`${display}:${trail}.${key}`);
      walk(child, `${trail}.${key}`, display);
    }
  };
  for (const entry of entries) {
    for (const field of DEPENDENCY_FIELDS) walk(entry.manifest[field], field, entry.display);
  }
  return found.sort();
}

// Read a manifest file list into the shape that scanDeclarations reads.
function manifestEntries(files: string[], base = REPO_ROOT): ManifestEntry[] {
  return files.map((file) => ({
    display: path.relative(base, file) || file,
    manifest: readJson(file),
  }));
}

// Probe project helper (plan "Probe Test Helper").
const tempDirs: string[] = [];

// The two base forms of the seed folder names that this file creates inside the
// repository. S3 adversarial F1r2: an interrupted run leaves a folder behind, and the
// next run fails red on adv 7, because the folder holds carrier files that the
// allow-list does not name. The rule below holds the accepted names, so the seeding
// helper and the startup sweep agree.
const PROBE_DIR_PREFIXES = [".oxlint-adv", ".oxlint-probe-"];

// A seed folder name matches when it starts with '.oxlint-probe-', or when it starts
// with '.oxlint-adv' and the next character is '-' or a digit. Every seeded name has
// that form. A near-miss name, such as '.oxlint-advisory', matches nothing, so the
// sweep keeps it. The seeding helper and the startup sweep share this rule (F2r3).
function isSeededProbeDirName(name: string): boolean {
  if (name.startsWith(".oxlint-probe-")) return true;
  if (!name.startsWith(".oxlint-adv")) return false;
  const next = name.charAt(".oxlint-adv".length);
  return next === "-" || (next >= "0" && next <= "9");
}

// Create a seed folder under `parent` and register it for afterEach. The prefix must
// name a seed form, so the beforeAll sweep can remove a leak. The '.oxlint-adv' form
// needs its separator, because the random suffix can start with a letter.
function seedDir(parent: string, prefix: string): string {
  const seedPrefix = prefix === ".oxlint-adv" ? ".oxlint-adv-" : prefix;
  if (!isSeededProbeDirName(seedPrefix)) {
    throw new Error(`seed prefix ${prefix} is not in PROBE_DIR_PREFIXES`);
  }
  const dir = fs.mkdtempSync(path.join(parent, seedPrefix));
  tempDirs.push(dir);
  return dir;
}

// Remove a seed folder that an interrupted run left behind. The sweep reads one
// directory level in each seed parent, matches the seed name forms, and skips a
// folder that holds a tracked file. It never walks the tree, so a real path cannot
// be removed.
function sweepStaleProbeDirs(): void {
  for (const parent of [REPO_ROOT, path.join(REPO_ROOT, "apps"), ...WORKSPACE_DIRS]) {
    if (!fs.existsSync(parent)) continue;
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!isSeededProbeDirName(entry.name)) continue;
      const target = path.join(parent, entry.name);
      // The tracked-path guard: git names every tracked path under `target`, and a
      // git call that fails skips the folder (the safe direction).
      const tracked = spawnSync("git", ["-C", REPO_ROOT, "ls-files", "--", relative(target)], {
        encoding: "utf8",
      });
      if (tracked.status !== 0 || (tracked.stdout ?? "").trim() !== "") continue;
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
}

function makeProbeProject(files: Record<string, string>, tsconfig: Json): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-gate-"));
  tempDirs.push(tmp);
  fs.symlinkSync(path.join(REPO_ROOT, "node_modules"), path.join(tmp, "node_modules"), "dir");
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(tmp, name), content);
  }
  fs.writeFileSync(path.join(tmp, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
  return tmp;
}

function runTool(
  args: string[],
  env: NodeJS.ProcessEnv = {},
): { status: number | null; output: string } {
  const result = spawnSync("npx", ["--no-install", ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: TOOL_TIMEOUT_MS,
    env: { ...process.env, ...env },
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ? String(result.error) : ""}`,
  };
}

// The S3 type-check command for a probe (plan S3 Test Red, strategy 16.3).
// TSRS_FAST=1 selects the fast tsrs path. The probe file path selects the probe;
// oxlint discovers the probe tsconfig.json from the file folder upward.
function typecheckProbe(tmp: string, probeFile: string) {
  return runTool(
    [
      "oxlint",
      "--config",
      path.join(REPO_ROOT, ".oxlintrc.json"),
      "--type-aware",
      "--type-check",
      path.join(tmp, probeFile),
    ],
    { TSRS_FAST: "1" },
  );
}

function probeTsconfig(files: string[]): Json {
  return {
    compilerOptions: {
      target: "ES2022",
      module: "esnext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ["vinext/types"],
    },
    files,
  };
}

const VALID_NEXT_PROBE = [
  "import type { NextConfig } from 'next';",
  "import Link from 'next/link';",
  "import { useRouter } from 'next/navigation';",
  "",
  "export const config: NextConfig = {};",
  "",
  "export function Probe() {",
  "  const router = useRouter();",
  "  router.push('/probe');",
  '  return <Link href="/probe">probe</Link>;',
  "}",
  "",
].join("\n");

const INVALID_ARGS_PROBE = [
  "import Link from 'next/link';",
  "import { useRouter } from 'next/navigation';",
  "",
  "export function Probe() {",
  "  const router = useRouter();",
  "  router.push(123);",
  "  return <Link />;",
  "}",
  "",
].join("\n");

const MISSING_MODULE_PROBE = [
  "import Link from 'next/link';",
  "import x from 'next/does-not-exist';",
  "",
  "export const probe = [Link, x];",
  "",
].join("\n");

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

// The startup sweep (F1r2): before the suite seeds any folder, remove the folders that
// an earlier interrupted run left behind.
beforeAll(() => {
  sweepStaleProbeDirs();
});

describe("S1 vinext 1.x", () => {
  it("case 1: vinext resolves to a 1.x release from the root, each app, and app-shell", () => {
    expect(APP_DIRS.map(relative)).toContain("apps/integrated-math-3");
    // Sentinel: the app set is read from the disk, and it holds the sixth app (A4).
    expect(APP_DIRS.map(relative)).toContain("apps/danielson");
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
    const majors: Record<string, number> = {};
    for (const dir of RESOLVE_FROM_DIRS) {
      const found = findInstalledPackageJson(dir, "vinext");
      expect(found, `vinext does not resolve from ${relative(dir)}`).not.toBeNull();
      const version = String(readJson(found as string).version);
      majors[relative(dir)] = Number.parseInt(version.split(".")[0], 10);
    }
    const notOne = Object.entries(majors).filter(([, major]) => major !== 1);
    expect(notOne, `folders that resolve a vinext release that is not 1.x`).toEqual([]);
  });

  it("case 2: vinext resolves, and next does not resolve, from the root, each app, and app-shell", () => {
    const resolvedNext: string[] = [];
    const nodeResolvable: string[] = [];
    for (const dir of RESOLVE_FROM_DIRS) {
      // Paired precondition: the neighbor package resolves. Without it, a missing
      // node_modules would pass this case for the wrong reason (A4).
      expect(
        findInstalledPackageJson(dir, "vinext"),
        `precondition: vinext does not resolve from ${relative(dir)}`,
      ).not.toBeNull();
      const nextFound = findInstalledPackageJson(dir, "next");
      if (nextFound) resolvedNext.push(`${relative(dir)} -> ${relative(nextFound)}`);
      try {
        createRequire(path.join(dir, "package.json")).resolve("next/package.json");
        nodeResolvable.push(relative(dir));
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe("MODULE_NOT_FOUND");
      }
    }
    expect(resolvedNext, "folders where next is installed").toEqual([]);
    expect(nodeResolvable, "folders where require.resolve finds next/package.json").toEqual([]);
  });

  it("case 3: no manifest declares next", () => {
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...APP_DIRS.map((d) => path.join(d, "package.json")),
      ...PACKAGE_DIRS.map((d) => path.join(d, "package.json")),
    ];
    // Sentinel: the scan read the manifests that matter (A4). The count covers the root,
    // 6 apps, and 21 packages.
    expect(manifests).toContain(path.join(IM3_DIR, "package.json"));
    expect(manifests).toContain(path.join(APP_SHELL_DIR, "package.json"));
    expect(manifests).toContain(path.join(REPO_ROOT, "apps", "danielson", "package.json"));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const declarations = scanDeclarations(manifestEntries(manifests), isNextKey);
    expect(declarations, "manifest fields that declare next").toEqual([]);
  });

  it("case 4: each app and app-shell tsconfig loads vinext/types and has no next plugin", () => {
    const tsconfigs = [...APP_DIRS, APP_SHELL_DIR].map((d) => path.join(d, "tsconfig.json"));
    // Sentinel: 6 apps plus the shared shell package (A4).
    expect(tsconfigs.length).toBeGreaterThanOrEqual(7);
    const missingTypes: string[] = [];
    const nextPlugins: string[] = [];
    for (const file of tsconfigs) {
      const options = (parseJsonc(fs.readFileSync(file, "utf8")).compilerOptions ?? {}) as Json;
      const types = Array.isArray(options.types) ? (options.types as string[]) : [];
      if (!types.includes("vinext/types")) missingTypes.push(relative(file));
      const plugins = Array.isArray(options.plugins) ? (options.plugins as Json[]) : [];
      if (plugins.some((plugin) => plugin.name === "next")) nextPlugins.push(relative(file));
    }
    expect(missingTypes, "tsconfig files without vinext/types in compilerOptions.types").toEqual(
      [],
    );
    expect(nextPlugins, 'tsconfig files with the { "name": "next" } plugin').toEqual([]);
  });

  it(
    "case 5: a probe that imports next, next/link, and next/navigation type-checks with exit 0",
    () => {
      expect(runTool(["tsc", "--version"]).status, "precondition: tsc --version").toBe(0);
      const tmp = makeProbeProject({ "probe.tsx": VALID_NEXT_PROBE }, probeTsconfig(["probe.tsx"]));
      const { status, output } = typecheckProbe(tmp, "probe.tsx");
      expect(output).not.toContain("TS2688");
      expect(status, output).toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 5b: the next types are strict: Link without href and push(123) fail to type-check",
    () => {
      expect(runTool(["tsc", "--version"]).status, "precondition: tsc --version").toBe(0);
      const tmp = makeProbeProject(
        { "probe.tsx": INVALID_ARGS_PROBE },
        probeTsconfig(["probe.tsx"]),
      );
      const { status, output } = typecheckProbe(tmp, "probe.tsx");
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      // vinext/types must resolve, and next/* must resolve. If the types were `any`, no
      // TS2741 and no TS2345 would appear.
      expect(output, "vinext/types did not resolve").not.toContain("TS2688");
      expect(output).not.toContain("TS2307");
      expect(status, output).not.toBe(0);
      expect(output, "expected TS2741 (missing href) or TS2345 (push(123))").toMatch(
        /TS2741|TS2345/,
      );
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 6: a probe that imports next/does-not-exist fails with TS2307, and next/link still resolves",
    () => {
      expect(runTool(["tsc", "--version"]).status, "precondition: tsc --version").toBe(0);
      const tmp = makeProbeProject(
        { "probe.ts": MISSING_MODULE_PROBE },
        probeTsconfig(["probe.ts"]),
      );
      const { status, output } = typecheckProbe(tmp, "probe.ts");
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      // At Red, an unresolved vinext/types gives TS2688. Without this rule, the case
      // would fail for the wrong reason.
      expect(output, "vinext/types did not resolve").not.toContain("TS2688");
      expect(status, output).not.toBe(0);
      expect(output).toMatch(/TS2307/);
      expect(output).toContain("next/does-not-exist");
      // Paired neighbor: the valid import of next/link has no error.
      const linkErrors = output.split("\n").filter((line) => line.includes("'next/link'"));
      expect(linkErrors, "next/link must resolve").toEqual([]);
    },
    TOOL_TIMEOUT_MS,
  );

  it("case 7: each setup-node step in the workflows uses Node 24", () => {
    const workflowDir = path.join(REPO_ROOT, ".github", "workflows");
    const files = fs
      .readdirSync(workflowDir)
      .filter((f) => /\.ya?ml$/.test(f))
      .sort();
    const stepsByFile: Record<string, number> = {};
    const wrongNode: string[] = [];
    for (const file of files) {
      const doc = loadYaml(fs.readFileSync(path.join(workflowDir, file), "utf8")) as {
        jobs?: Record<string, { steps?: Array<{ uses?: string; with?: Record<string, unknown> }> }>;
      };
      stepsByFile[file] = 0;
      for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          if (typeof step.uses !== "string" || !step.uses.startsWith("actions/setup-node"))
            continue;
          stepsByFile[file] += 1;
          const raw = String(step.with?.["node-version"] ?? "");
          const major = Number.parseInt(raw.replace(/^v/, "").split(".")[0], 10);
          if (major !== 24) wrongNode.push(`${file}:${jobName} node-version='${raw}'`);
        }
      }
    }
    // Sentinel: the parse produced one entry for each file on the disk (A4). A filter that
    // drops a workflow fails here, not only on the content check.
    expect(Object.keys(stepsByFile).sort(), "workflow files read").toEqual(files);
    // Sentinels: the two workflows that the plan edits each have a setup-node step, and
    // jsdoc-typed-params.yml has none. The zero proves that the parse read that file.
    expect(stepsByFile["ci.yml"] ?? 0).toBeGreaterThanOrEqual(1);
    expect(stepsByFile["cloudflare-deploy.yml"] ?? 0).toBeGreaterThanOrEqual(1);
    expect(stepsByFile["jsdoc-typed-params.yml"] ?? -1).toBe(0);
    expect(wrongNode, "setup-node steps with a node-version that is not 24").toEqual([]);
  });

  it("case 8: the lockfile has no next package and no workspace entry that lists next", () => {
    const lock = readJson(path.join(REPO_ROOT, "package-lock.json")) as LockfilePackages;
    const keys = Object.keys(lock.packages);
    // Sentinel: the lockfile has the workspace entries that the check reads (A4).
    expect(keys).toContain("apps/integrated-math-3");
    expect(keys).toContain("packages/app-shell");
    const { nextKeys, vinextKeys, workspaceListing } = scanLockfileNextHygiene(lock);
    expect(nextKeys, "lockfile package keys that end with node_modules/next").toEqual([]);
    // A nested copy shadows the root vinext at runtime (risk R16). The only key that ends
    // with node_modules/vinext is the root one.
    expect(vinextKeys, "lockfile package keys that end with node_modules/vinext").toEqual([
      "node_modules/vinext",
    ]);
    expect(workspaceListing, "lockfile workspace entries that list next").toEqual([]);
  });

  it("case 9: no manifest or lockfile workspace entry declares eslint or @eslint/js", () => {
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...APP_DIRS.map((d) => path.join(d, "package.json")),
      ...PACKAGE_DIRS.map((d) => path.join(d, "package.json")),
    ];
    // The same sentinels as case 3 (A4).
    expect(manifests).toContain(path.join(APP_SHELL_DIR, "package.json"));
    expect(manifests).toContain(path.join(REPO_ROOT, "apps", "danielson", "package.json"));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const isLintPackage = (key: string) => key === "eslint" || key === "@eslint/js";
    // (a) No workspace manifest declares either name, nested overrides included.
    const declared = scanDeclarations(manifestEntries(manifests), isLintPackage);
    expect(declared, "manifest fields that declare eslint or @eslint/js").toEqual([]);
    // (b) No lockfile workspace entry lists either name. Those entries are the lockfile copy
    // of the manifests. (c) This case asserts nothing about keys under node_modules/. The
    // two packages stay as peer copies of the React ESLint plugins (strategy 14.2).
    const lock = readJson(path.join(REPO_ROOT, "package-lock.json")) as {
      packages: Record<string, Record<string, unknown>>;
    };
    const listing: string[] = [];
    for (const [key, entry] of Object.entries(lock.packages)) {
      if (key.includes("node_modules/")) continue;
      for (const field of DEPENDENCY_FIELDS.slice(0, 4)) {
        const map = (entry[field] ?? {}) as Record<string, string>;
        for (const name of ["eslint", "@eslint/js"]) {
          if (name in map) listing.push(`${key || "(root)"}:${field}.${name}`);
        }
      }
    }
    expect(listing, "lockfile workspace entries that list eslint or @eslint/js").toEqual([]);
  });

  it("case 9b: the case 9 scan reports exactly the two seeded faults", () => {
    // Seeded fault: one workspace declares eslint, and the root overrides @eslint/js. This
    // proves that case 9 can fail (A4).
    const isLintPackage = (key: string) => key === "eslint" || key === "@eslint/js";
    const hits = scanDeclarations(
      [
        { display: "package.json", manifest: { overrides: { "@eslint/js": "^10.0.0" } } },
        { display: "apps/x/package.json", manifest: { devDependencies: { eslint: "^10.0.0" } } },
      ],
      isLintPackage,
    );
    expect(hits).toEqual([
      "apps/x/package.json:devDependencies.eslint",
      "package.json:overrides.@eslint/js",
    ]);
  });
});

// ---------------------------------------------------------------------------
// S3 tsrs cases (strategy 16.3). Every case below is red at this base: the alias
// `typescript6` is absent, 27 typecheck scripts call `tsc --noEmit`, 20 package
// build scripts call `tsc --noEmit`, `tsrs` is absent, 6 workflow `run` lines
// call `tsc`, and 28 manifests declare `typescript`. TYPESCRIPT_KEEP_LIST tracks
// only manifests that declare the package named `typescript`; it never names
// `typescript6` (strategy 16.2).
// ---------------------------------------------------------------------------

// The final keep set of workspaces that declare the package named `typescript`, in
// the scan form of `scanDeclarations`. These are the four `TSC_FALLBACK_LIST` apps:
// their `tsc --noEmit` gate needs the package, and the Convex CLI looks for
// `node_modules/@typescript/native/bin/tsc` or `node_modules/typescript/bin/tsc` from
// the app folder (evidence section 9). The four workspace folders of this list are
// exactly `TSC_FALLBACK_LIST`, so the fallback list is a subset of the keep set.
const TYPESCRIPT_KEEP_LIST: string[] = [
  "apps/bus-math-v2/package.json:devDependencies.typescript",
  "apps/integrated-math-1/package.json:devDependencies.typescript",
  "apps/integrated-math-3/package.json:devDependencies.typescript",
  "apps/pre-calculus/package.json:devDependencies.typescript",
];
// Workspaces whose typecheck script stays `tsc --noEmit` for a blocking
// conformance gap. A subset of TYPESCRIPT_KEEP_LIST. Green sets the four apps whose
// tsrs check reports diagnostics that the workspace tsc project does not: tsrs
// discovers the nearest tsconfig for each file, so it checks `convex/` files
// through `convex/tsconfig.json` and imported package sources through their own
// config (evidence section 7, "blocking" rows).
const TSC_FALLBACK_LIST: string[] = [
  "apps/bus-math-v2",
  "apps/integrated-math-1",
  "apps/integrated-math-3",
  "apps/pre-calculus",
];
// The package that provides the S2 disable-comment parser API (strategy 16.2).
const SCAN_PARSER_PACKAGE = "typescript6";

// The target typecheck script of one workspace: the app form for apps, the
// package form (src in place of .) for packages.
function targetTypecheckScript(rel: string): string {
  return rel.startsWith("apps/")
    ? "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 ."
    : "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 src";
}

// The case 1 form rule, extracted so the S3 adversarial case drives the exact
// guard logic against seeded mutants (the same pattern as lintScriptForm). A
// fallback workspace must run the exact legacy command: a weakened variant (an
// added flag, a prefixed runner) changes what the gate proves, and the plan
// wording "stays `tsc --noEmit`" (plan line 389) names one exact string.
function typecheckScriptFault(rel: string, script: string): string | null {
  if (TSC_FALLBACK_LIST.includes(rel)) {
    return script === "tsc --noEmit" ? null : `${rel}: fallback must be exactly tsc --noEmit`;
  }
  return script === targetTypecheckScript(rel) ? null : `${rel}: ${script}`;
}

// The command form that case 4 rejects in a workflow `run` line: a `tsc` call,
// not the bare word (A7). Shared with the S3 adversarial workflow case.
const TSC_COMMAND_RE = /\b(npx\s+(-\S+\s+)*tsc\b|tsc\s+(-p|--project|--noEmit)\b)/;

// The S3 probe tsconfig (plan line 360): strict, noEmit, no types, files list.
function s3ProbeTsconfig(files: string[]): Json {
  return {
    compilerOptions: { strict: true, noEmit: true, types: [] },
    files,
  };
}

const S3_TYPE_MISMATCH_PROBE = 'export const n: number = "x";\n';
const S3_VALID_PROBE = "export const n: number = 1;\n";

describe("S3 tsrs", () => {
  it("case 0: the S2 disable scan keeps the 6.0 parser API through the alias", () => {
    // The alias declaration uses the exact compatibility spec (strategy 16.2).
    const root = readJson(path.join(REPO_ROOT, "package.json"));
    expect((root.devDependencies ?? {}) as Json, "root devDependencies").toMatchObject({
      [SCAN_PARSER_PACKAGE]: "npm:@typescript/typescript6@^6.0.2",
    });
    // createRequire (already imported) resolves the alias, so a missing alias
    // cannot break module load; the resolve itself is the positive assertion.
    const req = createRequire(path.join(REPO_ROOT, "package.json"));
    const pkgPath = req.resolve(`${SCAN_PARSER_PACKAGE}/package.json`);
    const version = String(readJson(pkgPath).version);
    expect(Number.parseInt(version.split(".")[0], 10), `${SCAN_PARSER_PACKAGE} major`).toBe(6);
    // The legacy compiler API that the S2 scan calls still exists.
    const parser = req(SCAN_PARSER_PACKAGE) as {
      createSourceFile?: unknown;
      getLeadingCommentRanges?: unknown;
      getTrailingCommentRanges?: unknown;
      ScriptKind?: { TSX?: unknown };
    };
    expect(typeof parser.createSourceFile, "createSourceFile is a function").toBe("function");
    expect(typeof parser.getLeadingCommentRanges, "getLeadingCommentRanges is a function").toBe(
      "function",
    );
    expect(typeof parser.getTrailingCommentRanges, "getTrailingCommentRanges is a function").toBe(
      "function",
    );
    expect(parser.ScriptKind?.TSX, "ScriptKind.TSX is defined").toBeDefined();
  });

  it("case 1: each workspace typecheck script is the tsrs target form", () => {
    const wrong: string[] = [];
    const missing: string[] = [];
    for (const dir of WORKSPACE_DIRS) {
      const rel = relative(dir);
      const scripts = (readJson(path.join(dir, "package.json")).scripts ?? {}) as Record<
        string,
        string
      >;
      const script = scripts.typecheck;
      if (typeof script !== "string") {
        missing.push(rel);
        continue;
      }
      const fault = typecheckScriptFault(rel, script);
      if (fault) wrong.push(fault);
    }
    // bus-math-v2 has no typecheck script, so the missing list names it (A4).
    expect(missing, "workspaces without a typecheck script").toEqual([]);
    expect(wrong, "typecheck scripts that are not the tsrs target form").toEqual([]);
  });

  it("case 2: no package build script contains tsc", () => {
    const hits: string[] = [];
    for (const dir of PACKAGE_DIRS) {
      const scripts = (readJson(path.join(dir, "package.json")).scripts ?? {}) as Record<
        string,
        string
      >;
      if (typeof scripts.build === "string" && scripts.build.includes("tsc")) {
        hits.push(`${relative(dir)}: ${scripts.build}`);
      }
    }
    expect(hits, "package build scripts that contain tsc").toEqual([]);
  });

  it("case 3: tsrs resolves from the repository root", () => {
    // Positive case: the resolve itself proves the tool is installed (A4).
    const req = createRequire(path.join(REPO_ROOT, "package.json"));
    const found = req.resolve("tsrs/package.json");
    expect(found).toContain(path.join("node_modules", "tsrs", "package.json"));
  });

  it("case 4: no run line in the CI workflows contains tsc", () => {
    const workflowDir = path.join(REPO_ROOT, ".github", "workflows");
    const files = fs
      .readdirSync(workflowDir)
      .filter((f) => /\.ya?ml$/.test(f))
      .sort();
    // A command form, not a bare word (A7): npx tsc, or tsc with a project flag.
    // The regex lives at module scope (TSC_COMMAND_RE) so the S3 adversarial
    // workflow case drives the exact same match.
    const tscCommandRe = TSC_COMMAND_RE;
    const parsedByFile: Record<string, number> = {};
    const hits: string[] = [];
    for (const file of files) {
      const doc = loadYaml(fs.readFileSync(path.join(workflowDir, file), "utf8")) as {
        jobs?: Record<string, { steps?: Array<{ run?: string }> }>;
      };
      parsedByFile[file] = 0;
      for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          if (typeof step.run !== "string") continue;
          parsedByFile[file] += 1;
          for (const line of step.run.split("\n")) {
            if (tscCommandRe.test(line)) hits.push(`${file}:${jobName}: ${line.trim()}`);
          }
        }
      }
    }
    // Sentinel: the parse produced one entry for each file on the disk (A4). A
    // filter that drops a workflow fails here, not only on the content check.
    expect(Object.keys(parsedByFile).sort(), "workflow files read").toEqual(files);
    expect(hits, "workflow run lines that call tsc").toEqual([]);
  });

  it("case 5: the manifests that declare typescript are exactly TYPESCRIPT_KEEP_LIST", () => {
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...APP_DIRS.map((d) => path.join(d, "package.json")),
      ...PACKAGE_DIRS.map((d) => path.join(d, "package.json")),
    ];
    // The same sentinels as S1 case 3 (A4).
    expect(manifests).toContain(path.join(IM3_DIR, "package.json"));
    expect(manifests).toContain(path.join(APP_SHELL_DIR, "package.json"));
    expect(manifests).toContain(path.join(REPO_ROOT, "apps", "danielson", "package.json"));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const isTypescript = (key: string) => key === "typescript";
    // Only the package named `typescript` counts; `typescript6` never does.
    const declared = scanDeclarations(manifestEntries(manifests), isTypescript);
    expect(declared, "manifest fields that declare typescript").toEqual(TYPESCRIPT_KEEP_LIST);
  });

  it(
    "case 6: a probe that assigns a string to a number fails the tsrs type check with TS2322",
    () => {
      expect(runTool(["tsrs", "--version"]).status, "precondition: tsrs --version").toBe(0);
      const tmp = makeProbeProject(
        { "probe.ts": S3_TYPE_MISMATCH_PROBE },
        s3ProbeTsconfig(["probe.ts"]),
      );
      const { status, output } = typecheckProbe(tmp, "probe.ts");
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).not.toBe(0);
      expect(output).toContain("TS2322");
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 7: a probe that assigns a number to a number passes the tsrs type check",
    () => {
      expect(runTool(["tsrs", "--version"]).status, "precondition: tsrs --version").toBe(0);
      const tmp = makeProbeProject({ "probe.ts": S3_VALID_PROBE }, s3ProbeTsconfig(["probe.ts"]));
      const { status, output } = typecheckProbe(tmp, "probe.ts");
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );
});

// The S3 adversarial cases (S3 attack list, test-strategy 16.4 plus the S3
// refresh). Each case seeds a fault in a temp folder or in memory, runs the same
// rule or command that the S3 guard uses, and asserts that the guard reports the
// fault. A guard that cannot fail is vacuous (A4). No case edits a real
// manifest, config, workflow, or node_modules folder. The one live case (adv 6)
// writes a probe file into a fallback app, runs the app's real typecheck, and
// deletes the probe in a finally block, so the tree stays clean.
describe("S3 adversarial", () => {
  it("adv 1: the case 1 form rule rejects each briefed mutant typecheck script, and the fallback form is exact", () => {
    // Seeded mutants: each token of the tsrs target dropped or weakened, a
    // wrong config target, the wrong path, a prefixed runner, an extra flag, a
    // non-fallback workspace on tsc, a package on the app form, and weakened
    // fallback scripts. Each mutant is one way to make the type gate check
    // less, and the rule must reject each one (A4).
    const mutants: Array<[string, string]> = [
      [
        "apps/x",
        "oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .",
      ],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --max-warnings 0 .",
      ],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-check --max-warnings 0 .",
      ],
      ["apps/x", "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check ."],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 1 .",
      ],
      ["apps/x", "TSRS_FAST=1 oxlint --type-aware --type-check --max-warnings 0 ."],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config .oxlintrc.json --type-aware --type-check --max-warnings 0 .",
      ],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 src",
      ],
      [
        "apps/x",
        "npx oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .",
      ],
      [
        "apps/x",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 . --silent",
      ],
      ["apps/x", "tsc --noEmit"],
      [
        "packages/y",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .",
      ],
      ["apps/bus-math-v2", "tsc --noEmit --skipLibCheck"],
      ["apps/bus-math-v2", "npx tsc --noEmit"],
      ["apps/bus-math-v2", "tsc --noEmit -p ."],
      ["apps/bus-math-v2", "tsc"],
      [
        "apps/bus-math-v2",
        "TSRS_FAST=1 oxlint --config ../../.oxlintrc.json --type-aware --type-check --max-warnings 0 .",
      ],
    ];
    for (const [rel, script] of mutants) {
      expect(
        typecheckScriptFault(rel, script),
        `the rule must reject: ${rel}: ${script}`,
      ).not.toBeNull();
    }
    // Controls: the two target forms, the exact fallback command, and the
    // template package form pass.
    expect(typecheckScriptFault("apps/x", targetTypecheckScript("apps/x"))).toBeNull();
    expect(typecheckScriptFault("packages/y", targetTypecheckScript("packages/y"))).toBeNull();
    expect(
      typecheckScriptFault("packages/_template", targetTypecheckScript("packages/_template")),
    ).toBeNull();
    expect(typecheckScriptFault("apps/bus-math-v2", "tsc --noEmit")).toBeNull();
    // Paired control on the real tree: every real typecheck script passes the rule.
    for (const dir of WORKSPACE_DIRS) {
      const rel = relative(dir);
      const scripts = (readJson(path.join(dir, "package.json")).scripts ?? {}) as Record<
        string,
        string
      >;
      expect(typecheckScriptFault(rel, scripts.typecheck), `${rel} typecheck script`).toBeNull();
    }
  });

  it("adv 2: the case 5 set comparison notices a dropped keep entry, a stale entry, and an alias declaration; the fallback list stays inside the keep list", () => {
    const isTypescript = (key: string) => key === "typescript";
    const realManifests = [
      path.join(REPO_ROOT, "package.json"),
      ...APP_DIRS.map((d) => path.join(d, "package.json")),
      ...PACKAGE_DIRS.map((d) => path.join(d, "package.json")),
    ];
    const declared = scanDeclarations(manifestEntries(realManifests), isTypescript);
    // Control: the real tree matches the keep list exactly (same scan as case 5).
    expect(declared).toEqual(TYPESCRIPT_KEEP_LIST);
    // A keep list that drops one workspace no longer equals the declarations.
    expect(declared, "a dropped keep entry must fail the compare").not.toEqual(
      TYPESCRIPT_KEEP_LIST.slice(1),
    );
    // A keep list with a stale entry no longer equals the declarations.
    expect(declared, "a stale keep entry must fail the compare").not.toEqual([
      ...TYPESCRIPT_KEEP_LIST,
      "apps/ghost/package.json:devDependencies.typescript",
    ]);
    // `typescript6` never counts, so a manifest that declares only the alias
    // adds nothing to the declared set (strategy 16.2).
    const aliasOnly = scanDeclarations(
      [
        {
          display: "package.json",
          manifest: {
            devDependencies: { [SCAN_PARSER_PACKAGE]: "npm:@typescript/typescript6@^6.0.2" },
          },
        },
      ],
      isTypescript,
    );
    expect(aliasOnly, "an alias declaration must not count as typescript").toEqual([]);
    // The subset rule of plan line 413 and strategy 16.3 case 5: every fallback
    // workspace has its keep entry, so a fallback list that names a workspace
    // outside the keep set fails here.
    for (const rel of TSC_FALLBACK_LIST) {
      expect(TYPESCRIPT_KEEP_LIST, `${rel} must have a keep entry`).toContain(
        `${rel}/package.json:devDependencies.typescript`,
      );
    }
  });

  it("adv 3: the typescript6 alias is load-bearing: the installed typescript package exposes none of the scan API", () => {
    const root = readJson(path.join(REPO_ROOT, "package.json"));
    expect(
      (root.devDependencies ?? {}) as Json,
      "the alias declaration matches the compat spec",
    ).toMatchObject({
      [SCAN_PARSER_PACKAGE]: "npm:@typescript/typescript6@^6.0.2",
    });
    // The package named `typescript` resolves from the repository root (the
    // hoisted copy of the workspace declarations). TypeScript 7 ships no
    // JavaScript compiler API, so a scan import pointed at `typescript`
    // crashes on the first API call. The case proves the alias is the only
    // parse API the scan can use (strategy 16.2).
    const req = createRequire(path.join(REPO_ROOT, "package.json"));
    const hoistedVersion = String(readJson(req.resolve("typescript/package.json")).version);
    expect(Number.parseInt(hoistedVersion.split(".")[0], 10), "the hoisted typescript major").toBe(
      7,
    );
    const ts7 = req("typescript") as {
      createSourceFile?: unknown;
      getLeadingCommentRanges?: unknown;
      getTrailingCommentRanges?: unknown;
      ScriptKind?: unknown;
    };
    expect(typeof ts7.createSourceFile, "typescript 7 has no createSourceFile").not.toBe(
      "function",
    );
    expect(
      typeof ts7.getLeadingCommentRanges,
      "typescript 7 has no getLeadingCommentRanges",
    ).not.toBe("function");
    expect(
      typeof ts7.getTrailingCommentRanges,
      "typescript 7 has no getTrailingCommentRanges",
    ).not.toBe("function");
    expect(ts7.ScriptKind, "typescript 7 has no ScriptKind").toBeUndefined();
  });

  it(
    "adv 4: the root tsc bin is pinned to TypeScript 7 by the @typescript/native alias",
    () => {
      const root = readJson(path.join(REPO_ROOT, "package.json"));
      expect(
        (root.devDependencies ?? {}) as Json,
        "the bin-shadow alias declaration",
      ).toMatchObject({
        "@typescript/native": "npm:typescript@^7.0.2",
      });
      // Live pin: `npx tsc` must run the 7.x binary. Without the alias, the
      // `@typescript/old` bin shadow wins and prints `Version 6.0.3`
      // (evidence section 9), which breaks the four `tsc --noEmit` fallback
      // gates and the TypeScript 7 conformance sweep. No other test pinned
      // this (attack f).
      const { status, output } = runTool(["tsc", "--version"]);
      expect(status, output).toBe(0);
      expect(output, "npx tsc must report a 7.x version").toMatch(/^Version 7\./m);
      // The bin link resolves inside the alias package, not into a 6.x shadow.
      const binTarget = fs.realpathSync(path.join(REPO_ROOT, "node_modules", ".bin", "tsc"));
      expect(binTarget, "the tsc bin link points into @typescript/native").toContain(
        path.join("@typescript", "native"),
      );
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 5: the tsrs command fails loudly when the target holds no file, and still finds a probe in src",
    () => {
      // A workspace whose target path matches nothing must not pass the type
      // gate silently (attack b). The probe project symlinks the real
      // node_modules, so the command runs the installed tools.
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-adv-empty-"));
      tempDirs.push(tmp);
      fs.symlinkSync(path.join(REPO_ROOT, "node_modules"), path.join(tmp, "node_modules"), "dir");
      const src = path.join(tmp, "src");
      fs.mkdirSync(src);
      fs.writeFileSync(
        path.join(tmp, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { strict: true, noEmit: true, types: [] },
          include: ["src/**/*"],
        }),
      );
      const runFromTmp = (target: string) => {
        const r = spawnSync(
          "npx",
          [
            "--no-install",
            "oxlint",
            "--config",
            path.join(REPO_ROOT, ".oxlintrc.json"),
            "--type-aware",
            "--type-check",
            "--max-warnings",
            "0",
            target,
          ],
          {
            cwd: tmp,
            encoding: "utf8",
            timeout: TOOL_TIMEOUT_MS,
            env: { ...process.env, TSRS_FAST: "1" },
          },
        );
        return { status: r.status, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
      };
      const empty = runFromTmp("src");
      expect(empty.status, `an empty target must fail, not pass: ${empty.output}`).not.toBe(0);
      expect(empty.output, "the failure names the empty target").toContain("No files found");
      // Control: the same command with a probe in src reports the TS2322.
      fs.writeFileSync(path.join(src, "probe.ts"), S3_TYPE_MISMATCH_PROBE);
      const probe = runFromTmp("src");
      expect(probe.status, probe.output).not.toBe(0);
      expect(probe.output).toContain("TS2322");
      expect(probe.output).toContain("probe.ts");
    },
    TOOL_TIMEOUT_MS,
  );

  it("adv 6: each fallback app typecheck reports a seeded TS2322 probe, and the probe is gone after", () => {
    // Attack h: the four TSC_FALLBACK_LIST apps keep `tsc --noEmit`, so their
    // gate is the TypeScript 7 binary through the root bin link. A committed
    // proof must exist for each app, not only IM3. The probe file sits at the
    // app root, which every app tsconfig includes through `**/*.ts`.
    expect(TSC_FALLBACK_LIST.length, "the fallback list names the four apps").toBe(4);
    for (const rel of TSC_FALLBACK_LIST) {
      const probeFile = path.join(REPO_ROOT, rel, "__oxc_probe__.ts");
      fs.writeFileSync(probeFile, S3_TYPE_MISMATCH_PROBE);
      let status: number | null = null;
      let output = "";
      try {
        const r = spawnSync("npm", ["run", "typecheck", `--workspace=${rel}`], {
          cwd: REPO_ROOT,
          encoding: "utf8",
          timeout: 300000,
          env: { ...process.env, CI: "true" },
        });
        status = r.status;
        output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
      } finally {
        fs.rmSync(probeFile, { force: true });
      }
      expect(fs.existsSync(probeFile), `${rel}: the probe file is gone after the run`).toBe(false);
      expect(status, `${rel}: the probe must fail the app typecheck\n${output}`).not.toBe(0);
      expect(output, `${rel}: the diagnostic names the probe`).toContain("__oxc_probe__");
      expect(output, `${rel}: the diagnostic is a TS2322`).toContain("TS2322");
    }
  }, 600000);

  it("adv 7: the case 4 command match catches each hidden tsc form, and the workflow file set is pinned", () => {
    // Seeded forms: a bare npx call, `npx --yes`, `npx --no-install`, a bare
    // `tsc --noEmit`, both project flags, and a tsc call after a `cd` chain.
    const hits = [
      "npx tsc --noEmit",
      "npx --yes tsc",
      "npx --no-install tsc -p .",
      "tsc --noEmit",
      "tsc -p apps/x/tsconfig.json",
      "tsc --project apps/x",
      "cd apps/x && npx tsc --noEmit",
    ];
    for (const line of hits) {
      expect(TSC_COMMAND_RE.test(line), `the match must reject: ${line}`).toBe(true);
    }
    // Controls (A7): a workspace typecheck call, the bare word in prose and in
    // an echo, and a comment line must not match.
    const controls = [
      "npm run typecheck --workspace=apps/bus-math-v2",
      "npm run typecheck --workspace=apps/integrated-math-2 && npm run curriculum:check",
      'echo "the tsc word"',
      "# tsc is gone",
    ];
    for (const line of controls) {
      expect(TSC_COMMAND_RE.test(line), `the match must keep: ${line}`).toBe(false);
    }
    // A multi-line `run: |` block holds the tsc call on its second line; the
    // case 4 loop tests each line, so the call still matches.
    const block = ["npm run build", "npx tsc --noEmit"].join("\n");
    expect(block.split("\n").some((line) => TSC_COMMAND_RE.test(line))).toBe(true);
    // File-set pin (attack g): a workflow file dropped from the disk shrinks
    // the readdir list, and no other check names the set. The pin makes the
    // drop a failure.
    const workflowDir = path.join(REPO_ROOT, ".github", "workflows");
    expect(
      fs
        .readdirSync(workflowDir)
        .filter((f) => /\.ya?ml$/.test(f))
        .sort(),
      "the workflow file set",
    ).toEqual([
      "business-math-deploy.yml",
      "ci.yml",
      "cloudflare-deploy.yml",
      "jsdoc-typed-params.yml",
      "scale-benchmarks.yml",
    ]);
    // Paired control on the real tree: the same scan as case 4 reports no hit.
    const realHits: string[] = [];
    for (const file of fs
      .readdirSync(workflowDir)
      .filter((f) => /\.ya?ml$/.test(f))
      .sort()) {
      const doc = loadYaml(fs.readFileSync(path.join(workflowDir, file), "utf8")) as {
        jobs?: Record<string, { steps?: Array<{ run?: string }> }>;
      };
      for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          if (typeof step.run !== "string") continue;
          for (const line of step.run.split("\n")) {
            if (TSC_COMMAND_RE.test(line)) realHits.push(`${file}:${jobName}: ${line.trim()}`);
          }
        }
      }
    }
    expect(realHits, "workflow run lines that call tsc").toEqual([]);
  });

  // The r3 cases attack the F1r2 startup sweep (Green 0dcc9ef1). Each seed holds
  // only probe text, never user data. r3 a pins the seedDir guard; r3 b drives the
  // real beforeAll sweep through one child vitest run and pins each survivor class.
  it("r3 a: seedDir rejects a prefix outside the sweep list, so every new seed stays sweepable", () => {
    expect(() => seedDir(IM3_DIR, ".oxlint-other-")).toThrow(
      "seed prefix .oxlint-other- is not in PROBE_DIR_PREFIXES",
    );
    // Controls: each listed prefix is accepted, and afterEach removes the folders.
    for (const prefix of PROBE_DIR_PREFIXES) {
      const dir = seedDir(os.tmpdir(), prefix);
      expect(dir.startsWith(path.join(os.tmpdir(), prefix)), `seeded under ${prefix}`).toBe(true);
    }
  });

  it("r3 b: the startup sweep removes a stale seed folder in each swept parent, and the controls stay", () => {
    // The sweep runs in beforeAll, before this body. A child vitest run of this
    // file re-runs the real sweep, so the folders below model the leak of an
    // interrupted earlier run (F1r2).
    const staleRootAdv = seedDir(REPO_ROOT, ".oxlint-adv-r3stale-");
    const staleRootProbe = seedDir(REPO_ROOT, ".oxlint-probe-r3stale-");
    const staleIm3 = seedDir(IM3_DIR, ".oxlint-adv-r3stale-");
    const stalePkg = seedDir(APP_SHELL_DIR, ".oxlint-probe-r3stale-");
    for (const dir of [staleRootAdv, staleRootProbe, staleIm3, stalePkg]) {
      fs.writeFileSync(path.join(dir, "carrier.ts"), "/* eslint-disable */ const unused = 1;\n");
    }
    // The apps/ parent is a seed parent, so the sweep must read it too (F1r3).
    const appsParentSeed = seedDir(path.join(REPO_ROOT, "apps"), ".oxlint-probe-r3stale-");
    fs.writeFileSync(path.join(appsParentSeed, "probe.ts"), "const unused = 1;\n");
    // A folder that git names must stay (the tracked-path guard). The keep file
    // is staged for the child run, and the finally block unstages it.
    const keepDir = seedDir(REPO_ROOT, ".oxlint-adv-r3keep-");
    const keepFile = path.join(keepDir, "keep.ts");
    fs.writeFileSync(keepFile, "stale\n");
    const staged = spawnSync("git", ["-C", REPO_ROOT, "add", "-f", relative(keepFile)], {
      encoding: "utf8",
    });
    expect(staged.status, "precondition: git add -f the keep file").toBe(0);
    // A symlink is not a directory entry, so the sweep must skip it, and the
    // target outside the repository must survive.
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-r3-outside-"));
    tempDirs.push(outside);
    fs.writeFileSync(path.join(outside, "sentinel.txt"), "sentinel\n");
    const link = path.join(REPO_ROOT, ".oxlint-adv-r3link");
    fs.symlinkSync(outside, link);
    // A file, a folder two levels deep, and a name with no separator after the
    // prefix must each stay.
    const fileSeed = path.join(REPO_ROOT, ".oxlint-adv-r3file");
    fs.writeFileSync(fileSeed, "stale\n");
    const deep = seedDir(path.join(IM3_DIR, "curriculum"), ".oxlint-adv-r3deep-");
    fs.writeFileSync(path.join(deep, "carrier.ts"), "stale\n");
    const noDash = fs.mkdtempSync(path.join(REPO_ROOT, ".oxlint-probe"));
    tempDirs.push(noDash);
    // F2r3 pin: '.oxlint-advisory' is no seed class, so the sweep must keep it.
    const advisory = fs.mkdtempSync(path.join(REPO_ROOT, ".oxlint-advisory-r3pin-"));
    tempDirs.push(advisory);
    fs.writeFileSync(path.join(advisory, "carrier.ts"), "stale\n");
    try {
      const child = spawnSync(
        "npx",
        [
          "--no-install",
          "vitest",
          "run",
          "--config",
          "scripts/vitest.config.ts",
          "__tests__/oxc-toolchain-gates.test.ts",
          "-t",
          "case 1: vinext resolves to a 1.x release",
        ],
        { cwd: REPO_ROOT, encoding: "utf8", timeout: TOOL_TIMEOUT_MS },
      );
      expect(child.status, `the child sweep run: ${child.status ?? "no exit"}`).toBe(0);
      for (const dir of [staleRootAdv, staleRootProbe, staleIm3, stalePkg]) {
        expect(fs.existsSync(dir), `the sweep must remove ${relative(dir)}`).toBe(false);
      }
      expect(fs.existsSync(advisory), "F2r3 pin: the near-miss folder must stay").toBe(true);
      expect(fs.existsSync(appsParentSeed), "F1r3 pin: the apps/ parent must be swept").toBe(false);
      expect(fs.existsSync(keepDir), "a folder that git names must stay").toBe(true);
      expect(fs.existsSync(link), "a symlink must stay").toBe(true);
      expect(
        fs.existsSync(path.join(outside, "sentinel.txt")),
        "the symlink target must stay",
      ).toBe(true);
      expect(fs.existsSync(fileSeed), "a file is not a folder and must stay").toBe(true);
      expect(fs.existsSync(deep), "a folder two levels deep must stay").toBe(true);
      expect(fs.existsSync(noDash), "a name with no separator after the prefix must stay").toBe(
        true,
      );
    } finally {
      spawnSync("git", ["-C", REPO_ROOT, "rm", "--cached", "--quiet", relative(keepFile)], {
        encoding: "utf8",
      });
      fs.rmSync(link, { force: true });
      fs.rmSync(fileSeed, { force: true });
    }
    // afterEach removes every registered seed, the swept ones and the survivors.
  }, 300000);
});

// The lockfile shape that the S1 case 8 scan reads.
type LockfilePackages = { packages: Record<string, Record<string, unknown>> };

// The S1 case 8 scan, extracted so the S1 adversarial lockfile case drives the exact
// guard logic against a seeded lockfile (mutation test, strategy 13.7 R1 and R16).
function scanLockfileNextHygiene(lock: LockfilePackages): {
  nextKeys: string[];
  vinextKeys: string[];
  workspaceListing: string[];
} {
  const keys = Object.keys(lock.packages);
  const nextKeys = keys.filter((key) => key.endsWith("node_modules/next"));
  const vinextKeys = keys.filter((key) => key.endsWith("node_modules/vinext"));
  const workspaceKeys = keys.filter((key) => !key.includes("node_modules/"));
  const workspaceListing: string[] = [];
  for (const key of workspaceKeys) {
    const entry = lock.packages[key];
    for (const field of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ]) {
      const map = (entry[field] ?? {}) as Record<string, string>;
      if ("next" in map) workspaceListing.push(`${key || "(root)"}:${field}`);
    }
  }
  return { nextKeys, vinextKeys, workspaceListing };
}

// The S1 adversarial cases (strategy 13.7 row "Adversarial", risks R1, R3, R16, R18).
// Each case seeds a fault in a temp folder or in memory, runs the same scanner that the
// S1 guard uses, and asserts that the guard reports the fault. A guard that cannot fail
// is vacuous (A4). No case edits a real manifest, lockfile, or node_modules folder.
describe("S1 adversarial", () => {
  // A temp tree helper for the resolution attacks. Each folder gets a package.json so
  // that createRequire can resolve from it.
  function writeTempPackage(dir: string, manifest: Record<string, unknown> = {}) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(manifest));
  }

  function writeTempInstalled(dir: string, name: string, version: string) {
    const pkgDir = path.join(dir, "node_modules", name);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(path.join(pkgDir, "package.json"), JSON.stringify({ name, version }));
  }

  it("adv 1 (R1): the case 2 walker and require.resolve catch a hoisted next copy in a temp tree", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-adv-"));
    tempDirs.push(tmp);
    writeTempPackage(tmp, { name: "adv-root", private: true });
    // The seeded fault: a hoisted next copy, for example re-installed by an auto-installed
    // peer (the geist path of the S1 Implement task).
    writeTempInstalled(tmp, "vinext", "1.4.5");
    writeTempInstalled(tmp, "next", "16.2.7");
    const appDirs = ["integrated-math-3", "danielson"].map((name) => {
      const dir = path.join(tmp, "apps", name);
      writeTempPackage(dir, { name, private: true });
      return dir;
    });
    const shellDir = path.join(tmp, "packages", "app-shell");
    writeTempPackage(shellDir, { name: "@math-platform/app-shell", private: true });
    for (const dir of [tmp, ...appDirs, shellDir]) {
      // Paired precondition: vinext resolves from the same folders (strategy section 5).
      const vinext = findInstalledPackageJson(dir, "vinext");
      expect(vinext, `precondition: vinext does not resolve from ${dir}`).not.toBeNull();
      expect(Number.parseInt(String(readJson(vinext as string).version).split(".")[0], 10)).toBe(1);
      // The guard logic of case 2 reports the hoisted copy from every workspace depth.
      expect(
        findInstalledPackageJson(dir, "next"),
        `walker missed next from ${dir}`,
      ).not.toBeNull();
      const resolved = createRequire(path.join(dir, "package.json")).resolve("next/package.json");
      expect(resolved).toContain(path.join("node_modules", "next", "package.json"));
    }
    // Paired control on the real tree: no folder resolves next at HEAD (guard holds).
    for (const dir of RESOLVE_FROM_DIRS) {
      expect(
        findInstalledPackageJson(dir, "next"),
        `real tree resolved next from ${relative(dir)}`,
      ).toBeNull();
    }
  });

  it("adv 2 (R16, R18): a nested 0.x vinext copy under apps/danielson is caught only when danielson is scanned", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-adv-"));
    tempDirs.push(tmp);
    writeTempPackage(tmp, { name: "adv-root", private: true });
    writeTempInstalled(tmp, "vinext", "1.4.5");
    for (const name of ["danielson", "other"]) writeTempPackage(path.join(tmp, "apps", name));
    // The seeded fault: the pre-merge state of apps/danielson, a nested 0.0.55 copy that
    // shadows the root 1.x release at runtime.
    writeTempInstalled(path.join(tmp, "apps", "danielson"), "vinext", "0.0.55");
    // The scan set is read from the disk, the same rule as APP_DIRS (strategy section 5).
    const advAppDirs = fs
      .readdirSync(path.join(tmp, "apps"), { withFileTypes: true })
      .filter(
        (d) => d.isDirectory() && fs.existsSync(path.join(tmp, "apps", d.name, "package.json")),
      )
      .map((d) => path.join(tmp, "apps", d.name))
      .sort();
    expect(advAppDirs.map((dir) => path.relative(tmp, dir))).toEqual([
      "apps/danielson",
      "apps/other",
    ]);
    const majorsOf = (dirs: string[]) => {
      const majors: Record<string, number> = {};
      for (const dir of dirs) {
        const found = findInstalledPackageJson(dir, "vinext");
        expect(found, `vinext does not resolve from ${dir}`).not.toBeNull();
        majors[path.relative(tmp, dir)] = Number.parseInt(
          String(readJson(found as string).version).split(".")[0],
          10,
        );
      }
      return Object.entries(majors)
        .filter(([, major]) => major !== 1)
        .map(([rel]) => rel);
    };
    // The disk-read scan reports the fault: case 1 fails under the seeded copy.
    expect(majorsOf(advAppDirs), "disk-read scan must report the nested 0.x copy").toEqual([
      "apps/danielson",
    ]);
    // The attack: a scan set that drops apps/danielson reports nothing. The fault hides in
    // the excluded folder, so the case 1 sentinel that pins apps/danielson into the
    // disk-read set is the load-bearing defense.
    const filteredDirs = advAppDirs.filter((dir) => path.basename(dir) !== "danielson");
    expect(majorsOf(filteredDirs), "a danielson-filtered scan hides the fault").toEqual([]);
    // The sentinel holds at HEAD: the real APP_DIRS is read from the disk and holds danielson.
    expect(APP_DIRS.map(relative)).toContain("apps/danielson");
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
  });

  it("adv 3 (R1): the case 3 scan reports a next declaration in each manifest field and a nested next@ override", () => {
    // Seeded faults in memory: a next declaration in each of the five manifest fields,
    // plus a nested override key that carries a version suffix. A scanner weakened to
    // two fields, or blind to nested override keys, misses a hit (A4).
    const hits = scanDeclarations(
      [
        {
          display: "package.json",
          manifest: {
            devDependencies: { next: "^16.0.0" },
            overrides: { next: "^16.0.0", "next@16.2.7": { conflicts: ["eslint"] } },
          },
        },
        { display: "apps/danielson/package.json", manifest: { dependencies: { next: "^16.0.0" } } },
        {
          display: "packages/app-shell/package.json",
          manifest: { peerDependencies: { next: "^16" } },
        },
        { display: "packages/x/package.json", manifest: { optionalDependencies: { next: "^16" } } },
      ],
      isNextKey,
    );
    expect(hits, "the scan must report every seeded next declaration").toEqual([
      "apps/danielson/package.json:dependencies.next",
      "package.json:devDependencies.next",
      "package.json:overrides.next",
      "package.json:overrides.next@16.2.7",
      "packages/app-shell/package.json:peerDependencies.next",
      "packages/x/package.json:optionalDependencies.next",
    ]);
  });

  it("adv 4 (R1, R16): the case 8 scan reports a lockfile next key, a nested vinext key, and a workspace entry that lists next", () => {
    // Seeded faults in memory: the pre-merge lockfile shape. Each rule of case 8 has one
    // fault, and each rule must report it.
    const seeded: LockfilePackages = {
      packages: {
        "": { devDependencies: { vinext: "^1.4.5" } },
        "node_modules/vinext": { version: "1.4.5" },
        "node_modules/next": { version: "16.2.7" },
        "apps/danielson": { optionalDependencies: { next: "16.2.7" } },
        "apps/danielson/node_modules/vinext": { version: "0.0.55" },
        "apps/danielson/node_modules/next": { version: "16.2.7" },
      },
    };
    const { nextKeys, vinextKeys, workspaceListing } = scanLockfileNextHygiene(seeded);
    expect([...nextKeys].sort(), "the no-next-key rule must report both seeded keys").toEqual([
      "apps/danielson/node_modules/next",
      "node_modules/next",
    ]);
    expect([...vinextKeys].sort(), "the nested-vinext rule must report the 0.0.55 copy").toEqual([
      "apps/danielson/node_modules/vinext",
      "node_modules/vinext",
    ]);
    // The guard is not vacuous: the seeded vinext key set is not the allowed single key.
    expect([...vinextKeys].sort()).not.toEqual(["node_modules/vinext"]);
    expect(workspaceListing, "the workspace-listing rule must report the seeded entry").toEqual([
      "apps/danielson:optionalDependencies",
    ]);
  });

  it(
    "adv 5 (R3): with any-typed next modules the invalid probe passes, so the case 5b guard fails on the fault",
    () => {
      expect(runTool(["tsc", "--version"]).status, "precondition: tsc --version").toBe(0);
      // The attack probe uses no JSX, so no React types are needed.
      const anyAttackProbe = [
        "import { useRouter } from 'next/navigation';",
        "",
        "export function Probe() {",
        "  const router = useRouter();",
        "  router.push(123);",
        "  return null;",
        "}",
        "",
      ].join("\n");
      // The seeded fault: shorthand ambient modules make every next/* import `any`.
      // This is the degradation that would make the S1 type gate vacuous.
      const tsconfig = probeTsconfig(["probe.ts", "next-any.d.ts"]);
      (tsconfig.compilerOptions as Json).types = [];
      const tmp = makeProbeProject(
        { "probe.ts": anyAttackProbe, "next-any.d.ts": "declare module 'next/navigation';\n" },
        tsconfig,
      );
      const attack = typecheckProbe(tmp, "probe.ts");
      for (const phrase of ABSENT_TOOL_PHRASES) expect(attack.output).not.toContain(phrase);
      expect(attack.output).not.toContain("TS2688");
      expect(attack.output).not.toContain("TS2307");
      // Under the any fault the probe passes with no TS2345. The case 5b guard asserts
      // the opposite (non-zero exit, TS2741 or TS2345), so the guard fails here: the
      // attack cannot produce a false green.
      expect(attack.status, "the any fault must make the probe pass").toBe(0);
      expect(attack.output).not.toMatch(/TS2741|TS2345/);
      // Paired control: the real vinext/types are strict, so the same probe fails.
      const real = makeProbeProject({ "probe.ts": anyAttackProbe }, probeTsconfig(["probe.ts"]));
      const realRun = typecheckProbe(real, "probe.ts");
      expect(realRun.output, "vinext/types did not resolve").not.toContain("TS2688");
      expect(realRun.status, realRun.output).not.toBe(0);
      expect(realRun.output, "the real types must reject push(123) with TS2345").toMatch(/TS2345/);
    },
    TOOL_TIMEOUT_MS,
  );
});

// The five ESLint-family names that S2 removes from the manifests (plan S2 case 1).
const ESLINT_FAMILY = [
  "eslint",
  "typescript-eslint",
  "eslint-config-next",
  "@eslint/js",
  "@eslint/eslintrc",
];

// An override key such as `eslint@10` carries the same name with a version suffix.
const isEslintFamily = (key: string): boolean =>
  ESLINT_FAMILY.some((name) => key === name || key.startsWith(`${name}@`));

const WORKSPACE_DIRS = [...APP_DIRS, ...PACKAGE_DIRS];

// Directory names that the recursive find skips. None holds a tracked config file.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  ".convex",
  "playwright-report",
]);

// Find each file below `root` whose name `matches` accepts. Skip build and install folders.
function findFiles(root: string, matches: (name: string) => boolean): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(abs);
      } else if (entry.isFile() && matches(entry.name)) {
        found.push(abs);
      }
    }
  };
  walk(root);
  return found.sort();
}

function lintScript(dir: string): string | null {
  const scripts = (readJson(path.join(dir, "package.json")).scripts ?? {}) as Record<
    string,
    string
  >;
  return typeof scripts.lint === "string" ? scripts.lint : null;
}

type JsPluginEntry = { name?: string; specifier: string };

// The S2 case 9 scan. One hit for each clause (a), (b), (c) that the lockfile breaks.
// Clause (a): no ESLint config package. Clause (b): each ESLint copy is absent or peer-only.
// Clause (c): each jsPlugins specifier resolves from the repository root.
function scanLockfileLintHygiene(lock: Json, jsPlugins: JsPluginEntry[]): string[] {
  const packages = (lock.packages ?? {}) as Record<string, Json>;
  const keys = Object.keys(packages);
  const hits: string[] = [];
  for (const name of ["eslint-config-next", "typescript-eslint"]) {
    for (const key of keys) {
      if (key === `node_modules/${name}` || key.endsWith(`/node_modules/${name}`)) {
        hits.push(`a:${key}`);
      }
    }
  }
  for (const name of ["eslint", "@eslint/js", "@eslint/eslintrc"]) {
    for (const key of keys) {
      if (key !== `node_modules/${name}` && !key.endsWith(`/node_modules/${name}`)) continue;
      if (packages[key].peer !== true) hits.push(`b:${key}`);
    }
  }
  for (const plugin of jsPlugins) {
    if (!(`node_modules/${plugin.specifier}` in packages)) hits.push(`c:${plugin.specifier}`);
  }
  return hits.sort();
}

// The root config applies its rules through `files` globs on apps/ and packages/ paths.
// A probe in the system temp folder matches no glob, so the probe lives under apps/.
function makeLintProbe(content: string): string {
  const dir = seedDir(path.join(REPO_ROOT, "apps"), ".oxlint-probe-");
  const file = path.join(dir, "probe.ts");
  fs.writeFileSync(file, content);
  return file;
}

function runOxlintProbe(file: string) {
  return runTool([
    "oxlint",
    "--config",
    path.join(REPO_ROOT, ".oxlintrc.json"),
    "--max-warnings",
    "0",
    file,
  ]);
}

describe("S2 oxlint", () => {
  it("case 1: no manifest declares an ESLint package and the root overrides have no eslint key", () => {
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...WORKSPACE_DIRS.map((dir) => path.join(dir, "package.json")),
    ];
    // Sentinels: the scan read the root, 6 apps, and 21 packages (A4).
    expect(manifests).toContain(path.join(APP_SHELL_DIR, "package.json"));
    expect(manifests).toContain(path.join(REPO_ROOT, "apps", "danielson", "package.json"));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const declarations = scanDeclarations(manifestEntries(manifests), isEslintFamily);
    expect(declarations, "manifest fields that declare an ESLint package").toEqual([]);
    const root = readJson(path.join(REPO_ROOT, "package.json"));
    const overrideKeys = Object.keys((root.overrides ?? {}) as Json);
    expect(overrideKeys, "keys of the root overrides").not.toContain("eslint");
  });

  it("case 2: no eslint.config.* file exists under apps/ or packages/", () => {
    // Sentinel: the same walk finds the manifest of each app, so an empty result is real (A4).
    const appManifests = findFiles(path.join(REPO_ROOT, "apps"), (name) => name === "package.json");
    expect(appManifests.length).toBeGreaterThanOrEqual(APP_DIRS.length);
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
    const configs = WORKSPACE_DIRS.flatMap((dir) =>
      findFiles(dir, (name) => /^eslint\.config\./.test(name)),
    );
    expect(configs.map(relative), "files named eslint.config.* in the workspaces").toEqual([]);
  });

  it("case 3: each workspace lint script is the target form, and only the root config exists", () => {
    const entries = WORKSPACE_DIRS.map((dir) => ({
      dir,
      rel: relative(dir),
      lint: lintScript(dir),
    })).filter((entry): entry is { dir: string; rel: string; lint: string } => entry.lint !== null);
    // Sentinels: 27 workspaces have a lint script, and the template package is one of them.
    expect(entries.length).toBeGreaterThanOrEqual(27);
    expect(entries.map((entry) => entry.rel)).toContain("packages/_template");
    expect(entries.map((entry) => entry.rel)).toContain("apps/danielson");
    const wrong: string[] = [];
    for (const { rel, lint } of entries) {
      const violation = lintScriptForm(rel, lint);
      if (violation !== null) wrong.push(violation);
    }
    expect(wrong, "lint scripts that are not in the target form").toEqual([]);
    // 26 of the 27 scripts name the root config. The template package is the exception.
    const named = entries.filter((entry) => entry.lint.includes("../../.oxlintrc.json"));
    expect(named.length, "lint scripts that name ../../.oxlintrc.json").toBe(entries.length - 1);
    const configs = findFiles(REPO_ROOT, (name) => name === ".oxlintrc.json");
    expect(configs.map(relative), "files named .oxlintrc.json outside node_modules").toEqual([
      ".oxlintrc.json",
    ]);
  });

  it(
    "case 4: the root config reports an unused variable in a workspace file with a non-zero exit",
    () => {
      expect(runTool(["oxlint", "--version"]).status, "precondition: oxlint --version").toBe(0);
      const file = makeLintProbe("const unused = 1;\n");
      const { status, output } = runOxlintProbe(file);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).not.toBe(0);
      expect(output).toContain("no-unused-vars");
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 5: the same probe with an oxlint-disable comment on its first line exits 0",
    () => {
      expect(runTool(["oxlint", "--version"]).status, "precondition: oxlint --version").toBe(0);
      const file = makeLintProbe("/* oxlint-disable */\nconst unused = 1;\n");
      const { status, output } = runOxlintProbe(file);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );

  it("case 9: the lockfile has no ESLint config package, and each jsPlugin resolves", () => {
    const lock = readJson(path.join(REPO_ROOT, "package-lock.json"));
    const keys = Object.keys((lock.packages ?? {}) as Json);
    // Sentinels: the lockfile read the workspace entries that the check needs (A4).
    expect(keys).toContain("apps/integrated-math-3");
    expect(keys).toContain("packages/app-shell");
    const jsPlugins = (readJson(path.join(REPO_ROOT, ".oxlintrc.json")).jsPlugins ??
      []) as JsPluginEntry[];
    // K4 of strategy 14.2 records three jsPlugins entries at this HEAD.
    expect(jsPlugins.length, "jsPlugins entries of the root config").toBeGreaterThanOrEqual(3);
    for (const plugin of jsPlugins) expect(typeof plugin.specifier).toBe("string");
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits, "lockfile ESLint-hygiene hits").toEqual([]);
  });

  it("case 9b: the case 9 scan reports exactly the three seeded faults", () => {
    // One seeded fault for each clause: (a) typescript-eslint stays, (b) eslint is not
    // peer-only, and (c) a jsPlugins specifier has no lockfile key. The scan must report
    // all three, so case 9 cannot pass vacuously (A4).
    const jsPlugins: JsPluginEntry[] = [
      { name: "react-js", specifier: "eslint-plugin-react" },
      { name: "missing-js", specifier: "oxlint-plugin-missing" },
    ];
    const lock: Json = {
      packages: {
        "": {},
        "node_modules/eslint-plugin-react": { version: "7.37.5" },
        "node_modules/typescript-eslint": { version: "8.0.0" },
        "node_modules/eslint": { version: "9.0.0" },
      },
    };
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits).toHaveLength(3);
    expect(hits).toEqual([
      "a:node_modules/typescript-eslint",
      "b:node_modules/eslint",
      "c:oxlint-plugin-missing",
    ]);
  });
});

// ---------------------------------------------------------------------------
// S2 adversarial helpers (strategy section 8: the R17 row and the blanket-disable
// row; anti-patterns A3, A4, A7). Each case seeds a fault in a temp folder or in
// memory, drives the exact guard logic, and asserts that the guard reports the
// fault. A guard that cannot fail is vacuous (A4). No case edits a real manifest,
// lockfile, config, or source file.
// ---------------------------------------------------------------------------

// The per-entry rule of the S2 case 3 form check, extracted so the S2 adversarial
// cases drive the exact guard logic against seeded mutant scripts.
function lintScriptForm(rel: string, lint: string): string | null {
  if (rel === "packages/_template") {
    // The template package keeps its echo line (plan S2 Contract).
    return lint.startsWith("echo ") ? null : `${rel}: ${lint}`;
  }
  const expected = rel.startsWith("apps/")
    ? "oxlint --config ../../.oxlintrc.json . --max-warnings 0"
    : "oxlint --config ../../.oxlintrc.json src --max-warnings 0";
  return lint === expected ? null : `${rel}: ${lint}`;
}

// A disable directive is text that names a disable in either spelling (eslint or
// oxlint): `disable`, `disable-next-line`, or `disable-line`, with or without a
// rule list and a ` -- reason`. Only text inside a real comment range counts.
const DISABLE_TEXT_RE = /(?:eslint|oxlint)-disable(?:-next-line|-line)?/;

// The TypeScript ScriptKind of a linted file, from its extension. TSX and JSX
// files use the JSX-aware scan; every other linted extension uses the standard
// scan. Unknown extensions fall back to JS.
function scriptKindForFile(fileName: string): ts.ScriptKind {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  if (ext === ".ts" || ext === ".mts" || ext === ".cts") return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

// Every disable comment range in a file, from the TypeScript parser (rung 5 of
// the Ponytail rule: the installed `typescript` package). The walk visits every
// child including punctuation tokens through getChildren, not forEachChild: a
// comment that leads a `}` or another punctuator is trivia of a token that
// forEachChild never visits, for example `{/* eslint-disable */}` in TSX.
// Trivia scanning treats strings, templates, and JSX text as non-comment tokens,
// so disable text inside them never counts (F3r3). A `//` line inside a block
// comment is block text, not a second directive. Positions are UTF-16 offsets
// into content, so slicing and blanking keep their length.
function disableCommentRanges(
  fileName: string,
  content: string,
): Array<{ pos: number; end: number; text: string }> {
  // Prefilter: a file without disable text needs no parse. This keeps the
  // full-tree walk as cheap as the old text scan; only candidate files parse.
  if (!/(?:eslint|oxlint)-disable/.test(content)) return [];
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForFile(fileName),
  );
  const seen = new Set<string>();
  const ranges: Array<{ pos: number; end: number; text: string }> = [];
  const add = (pos: number, end: number) => {
    const key = `${pos}-${end}`;
    if (seen.has(key)) return;
    seen.add(key);
    const text = content.slice(pos, end);
    if (DISABLE_TEXT_RE.test(text)) ranges.push({ pos, end, text });
  };
  const visit = (node: ts.Node): void => {
    for (const range of ts.getLeadingCommentRanges(content, node.getFullStart()) ?? []) {
      add(range.pos, range.end);
    }
    for (const range of ts.getTrailingCommentRanges(content, node.getEnd()) ?? []) {
      add(range.pos, range.end);
    }
    for (const child of node.getChildren(sourceFile)) visit(child);
  };
  visit(sourceFile);
  ranges.sort((a, b) => a.pos - b.pos);
  return ranges;
}

// Remove every disable comment: replace each disable range with spaces of the
// same length, keeping `\r` and `\n`, so no code is deleted and line and column
// positions stay. The code under the comment stays, so a finding that the comment
// hid must surface in the stripped copy. Limitation (F4r3): the strip removes
// every disable in the file at once, although a blanket block disable is not
// retroactive and `eslint-enable` ends the blanket region. The sweep copy can
// therefore surface a live fault that sits above the first disable or after an
// enable, and the decode marks it as hidden. Both fault classes stay visible to
// the workspace lint gate itself, so no silent hole exists; the allow-list
// simply records them.
function stripDisableComments(content: string, fileName = "probe.tsx"): string {
  const ranges = disableCommentRanges(fileName, content);
  if (ranges.length === 0) return content;
  const chars = content.split("");
  for (const range of ranges) {
    for (let i = range.pos; i < range.end; i++) {
      if (chars[i] !== "\r" && chars[i] !== "\n") chars[i] = " ";
    }
  }
  return chars.join("");
}

// The source extensions that the root config's override globs lint.
const SOURCE_EXT_RE = /\.(js|jsx|mjs|cjs|ts|tsx)$/;
// Folders that no workspace lint script lints: the SKIP_DIRS build and install folders
// plus the Convex codegen folders (root config ignorePatterns).
const DISABLE_SCAN_SKIP = new Set([...SKIP_DIRS, "_generated"]);

// findFiles with a caller-provided skip set.
function findFilesSkipping(
  root: string,
  matches: (name: string) => boolean,
  skip: Set<string>,
): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(abs);
      } else if (entry.isFile() && matches(entry.name)) {
        found.push(abs);
      }
    }
  };
  walk(root);
  return found.sort();
}

// The files under apps/ and packages/ that the workspace lint scripts lint and that hold
// a disable comment. The walk mirrors the lint surface of the root config: source
// extensions, outside the ignored folders.
function lintedFilesWithDisableDirectives(): string[] {
  const found: string[] = [];
  for (const dir of WORKSPACE_DIRS) {
    for (const file of findFilesSkipping(
      dir,
      (name) => SOURCE_EXT_RE.test(name),
      DISABLE_SCAN_SKIP,
    )) {
      if (disableCommentRanges(file, fs.readFileSync(file, "utf8")).length > 0) found.push(file);
    }
  }
  return found;
}

// The allow-list of pre-existing disable directives (F1, option B): one entry per
// tracked file that holds a directive, with the directive kinds, the directive and
// blanket-block counts, and the live rules the directives hide. A carrier file that
// the list does not name, a stale entry, a new blanket block in any block form
// (whole-line, mid-line, or multi-line), or a hidden rule that the entry does not
// record all fail adv 7.
interface DisableAllowlistEntry {
  path: string;
  kinds: string[];
  directiveCount: number;
  blanketBlocks: number;
  hiddenRules: string[];
  reason: string;
}

function readDisableAllowlist(): DisableAllowlistEntry[] {
  const doc = readJson(
    path.join(REPO_ROOT, "scripts", "__tests__", "fixtures", "lint-disable-allowlist.json"),
  ) as { version: number; entries: DisableAllowlistEntry[] };
  expect(doc.version, "allow-list version").toBe(1);
  expect(doc.entries.length, "allow-list entry count").toBeGreaterThan(0);
  return doc.entries;
}

// The directive kinds of one file: 'block' for a blanket `disable` comment in
// any position (whole-line, mid-line, or spanning lines), 'next-line' for a
// `disable-next-line` comment in either comment spelling, 'trailing' for a
// `disable-line` comment. Only real comment ranges count (disableCommentRanges),
// so CRLF line ends need no special case and disable text in strings, templates,
// or JSX text never counts. Mirrors the allow-list inventory. The optional file
// name selects the parse ScriptKind; the default parses as TSX, which finds the
// comment ranges of every seeded probe form.
function directiveKindsOfFile(
  content: string,
  fileName = "probe.tsx",
): { kinds: string[]; total: number; blocks: number } {
  const kinds = new Set<string>();
  let total = 0;
  let blocks = 0;
  const classify = (text: string) => {
    total += 1;
    if (text.includes("disable-next-line")) kinds.add("next-line");
    else if (text.includes("disable-line")) kinds.add("trailing");
    else {
      kinds.add("block");
      blocks += 1;
    }
  };
  for (const range of disableCommentRanges(fileName, content)) classify(range.text);
  return { kinds: [...kinds].sort(), total, blocks };
}

// The pin of one allow-list against the carrier files: a carrier that no entry names,
// an entry whose file lost its directive, and an entry whose kinds, directive count,
// or blanket blocks changed. Pure, so the adversarial cases can drive it with seeded
// files and seeded entries.
function allowlistPinViolations(
  entries: DisableAllowlistEntry[],
  files: string[],
): { unlisted: string[]; stale: string[]; changed: string[] } {
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const unlisted = files.map((file) => relative(file)).filter((rel) => !byPath.has(rel));
  const stale: string[] = [];
  const changed: string[] = [];
  for (const entry of entries) {
    const abs = path.join(REPO_ROOT, entry.path);
    if (!fs.existsSync(abs)) {
      stale.push(`${entry.path} (file is gone)`);
      continue;
    }
    const current = directiveKindsOfFile(fs.readFileSync(abs, "utf8"), entry.path);
    if (current.total === 0) {
      stale.push(`${entry.path} (no directive left)`);
      continue;
    }
    if (JSON.stringify(current.kinds) !== JSON.stringify([...entry.kinds].sort())) {
      changed.push(`${entry.path} (kinds ${current.kinds} vs recorded ${entry.kinds})`);
    } else if (current.total !== entry.directiveCount) {
      changed.push(
        `${entry.path} (directive count ${current.total} vs recorded ${entry.directiveCount})`,
      );
    } else if (current.blocks > entry.blanketBlocks) {
      changed.push(
        `${entry.path} (blanket blocks ${current.blocks} vs recorded ${entry.blanketBlocks})`,
      );
    }
  }
  return { unlisted, stale, changed };
}

// A widened entry (attack e): a recorded hiddenRules rule that the file's directives do
// not actually hide. Without this check, an entry could pre-authorize a rule, and a later
// directive that hides that rule would pass the sweep silently.
function widenedAllowlistRules(
  entries: DisableAllowlistEntry[],
  surfacedByReal: Map<string, Set<string>>,
): string[] {
  return entries.flatMap((entry) => {
    const surfaced = surfacedByReal.get(entry.path) ?? new Set<string>();
    return entry.hiddenRules
      .filter((rule) => !surfaced.has(rule))
      .map((rule) => `${entry.path} records ${rule}, which its directives do not hide`);
  });
}

describe("S2 adversarial", () => {
  it("adv 1: the case 1 scan reports each ESLint-family field, nested overrides, and version-suffixed keys", () => {
    // Seeded faults in memory: one declaration per dependency field, a
    // version-suffixed override key for each family name, a nested override object,
    // and a declaration re-entered inside an override value. A scanner weakened to
    // two fields, or blind to nested override keys and their children, misses a
    // hit (A4).
    const hits = scanDeclarations(
      [
        {
          display: "package.json",
          manifest: {
            dependencies: { eslint: "^10.0.0" },
            devDependencies: { "eslint-config-next": "^16.0.0" },
            peerDependencies: { "@eslint/js": "^10.0.0" },
            optionalDependencies: { "@eslint/eslintrc": "^4.0.0" },
            overrides: {
              "typescript-eslint@8": "^8.0.0",
              "eslint-config-next@16.2.0": "^16.2.0",
              "@eslint/js@10": "^10.0.0",
              "@eslint/eslintrc@4": "^4.0.0",
              "eslint@10": { devDependencies: { eslint: "^10.0.0" } },
            },
          },
        },
      ],
      isEslintFamily,
    );
    expect(hits, "the scan must report every seeded ESLint-family declaration").toEqual([
      "package.json:dependencies.eslint",
      "package.json:devDependencies.eslint-config-next",
      "package.json:optionalDependencies.@eslint/eslintrc",
      "package.json:overrides.@eslint/eslintrc@4",
      "package.json:overrides.@eslint/js@10",
      "package.json:overrides.eslint-config-next@16.2.0",
      "package.json:overrides.eslint@10",
      "package.json:overrides.eslint@10.devDependencies.eslint",
      "package.json:overrides.typescript-eslint@8",
      "package.json:peerDependencies.@eslint/js",
    ]);
    // Paired control on the real tree: the same scan over the real manifests reports
    // nothing (guard holds at HEAD).
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...WORKSPACE_DIRS.map((dir) => path.join(dir, "package.json")),
    ];
    expect(scanDeclarations(manifestEntries(manifests), isEslintFamily)).toEqual([]);
  });

  it("adv 2: the case 2 and case 3 walks find a second .oxlintrc.json and an eslint.config.* in seeded workspaces", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-adv-cfg2-"));
    tempDirs.push(tmp);
    const wsA = path.join(tmp, "apps", "a");
    const wsB = path.join(tmp, "packages", "b");
    fs.mkdirSync(path.join(wsA, "deep"), { recursive: true });
    fs.mkdirSync(path.join(wsB, "nested"), { recursive: true });
    for (const ws of [wsA, wsB]) fs.writeFileSync(path.join(ws, "package.json"), '{"name":"x"}');
    // The seeded faults: a second oxlint config and an eslint config in a workspace
    // root, and the same names deeper in the tree. A copy under node_modules stays
    // invisible, because the walk rule is "outside node_modules".
    fs.mkdirSync(path.join(wsA, "node_modules"), { recursive: true });
    fs.writeFileSync(path.join(wsA, "node_modules", "eslint.config.js"), "x");
    fs.writeFileSync(path.join(wsA, ".oxlintrc.json"), "{}");
    fs.writeFileSync(path.join(wsA, "deep", ".oxlintrc.json"), "{}");
    fs.writeFileSync(path.join(wsA, "eslint.config.mjs"), "export default {}");
    fs.writeFileSync(path.join(wsB, "eslint.config.js"), "export default {}");
    fs.writeFileSync(path.join(wsB, "nested", "eslint.config.cjs"), "module.exports = {}");
    const oxlintConfigs = findFiles(tmp, (name) => name === ".oxlintrc.json");
    expect(oxlintConfigs.map((file) => path.relative(tmp, file))).toEqual([
      "apps/a/.oxlintrc.json",
      "apps/a/deep/.oxlintrc.json",
    ]);
    const eslintConfigs = [wsA, wsB].flatMap((dir) =>
      findFiles(dir, (name) => /^eslint\.config\./.test(name)),
    );
    expect(eslintConfigs.map((file) => path.relative(tmp, file))).toEqual([
      "apps/a/eslint.config.mjs",
      "packages/b/eslint.config.js",
      "packages/b/nested/eslint.config.cjs",
    ]);
    // Paired control on the real tree: only the root .oxlintrc.json exists, and no
    // eslint.config.* file exists under apps/ or packages/ (guards hold at HEAD).
    expect(findFiles(REPO_ROOT, (name) => name === ".oxlintrc.json").map(relative)).toEqual([
      ".oxlintrc.json",
    ]);
    expect(
      WORKSPACE_DIRS.flatMap((dir) => findFiles(dir, (name) => /^eslint\.config\./.test(name))).map(
        relative,
      ),
    ).toEqual([]);
  });

  it("adv 3: the case 3 form rule reports each mutant lint script, and a dropped lint script fails the sentinels", () => {
    // Seeded mutant scripts: a dropped --config, a wrong config target, a dropped
    // --max-warnings 0, a raised budget, a prefixed runner, the wrong lint path, and
    // the template echo line replaced by an oxlint call. Each mutant is one way to
    // weaken the lint gate, and the rule must reject each one.
    const mutants: Array<[string, string]> = [
      ["apps/x", "oxlint . --max-warnings 0"],
      ["apps/x", "oxlint --config .oxlintrc.json . --max-warnings 0"],
      ["apps/x", "oxlint --config ../../.oxlintrc.json ."],
      ["apps/x", "oxlint --config ../../.oxlintrc.json . --max-warnings 1"],
      ["apps/x", "npx oxlint --config ../../.oxlintrc.json . --max-warnings 0"],
      ["apps/x", "oxlint --config ../../.oxlintrc.json src --max-warnings 0"],
      ["packages/y", "oxlint --config ../../.oxlintrc.json . --max-warnings 0"],
      ["packages/_template", "oxlint --config ../../.oxlintrc.json src --max-warnings 0"],
    ];
    for (const [rel, lint] of mutants) {
      expect(lintScriptForm(rel, lint), `the rule must reject: ${rel}: ${lint}`).not.toBeNull();
    }
    // Controls: the two target forms and the template echo line pass.
    expect(
      lintScriptForm("apps/x", "oxlint --config ../../.oxlintrc.json . --max-warnings 0"),
    ).toBeNull();
    expect(
      lintScriptForm("packages/y", "oxlint --config ../../.oxlintrc.json src --max-warnings 0"),
    ).toBeNull();
    expect(
      lintScriptForm("packages/_template", "echo 'No lint configured for template package'"),
    ).toBeNull();
    // Paired control on the real tree: every real lint script passes the rule.
    const entries = WORKSPACE_DIRS.map((dir) => ({
      rel: relative(dir),
      lint: lintScript(dir),
    })).filter((entry): entry is { rel: string; lint: string } => entry.lint !== null);
    expect(
      entries
        .map(({ rel, lint }) => lintScriptForm(rel, lint))
        .filter((violation): violation is string => violation !== null),
    ).toEqual([]);
    // The dropped-script attack: a workspace that loses its lint script leaves the
    // entries set, so the count sentinel and the named sentinel of case 3 fail (A4).
    const dropped = entries.filter((entry) => entry.rel !== "apps/danielson");
    expect(
      dropped.length,
      "a danielson-filtered entries set is below the sentinel count",
    ).toBeLessThan(27);
    expect(dropped.map((entry) => entry.rel)).not.toContain("apps/danielson");
  });

  it(
    "adv 4: a mutant config that lints no file makes the probe pass, so case 4 is the vacuous-pass defense",
    () => {
      expect(runTool(["oxlint", "--version"]).status, "precondition: oxlint --version").toBe(0);
      // The seeded fault: every override glob of a copy of the root config matches no
      // file. Such a config lints nothing, so every probe passes vacuously.
      const config = readJson(path.join(REPO_ROOT, ".oxlintrc.json"));
      for (const override of (config.overrides ?? []) as Array<{ files?: string[] }>) {
        override.files = ["nomatch/**/*.{js,jsx,mjs,cjs,ts,tsx}"];
      }
      const cfgTmp = seedDir(REPO_ROOT, ".oxlint-adv-cfg-");
      const mutantConfig = path.join(cfgTmp, "mutant.oxlintrc.json");
      fs.writeFileSync(mutantConfig, JSON.stringify(config));
      const probe = makeLintProbe("const unused = 1;\n");
      const mutant = runTool(["oxlint", "--config", mutantConfig, "--max-warnings", "0", probe]);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(mutant.output).not.toContain(phrase);
      expect(mutant.status, "the mutant config lints no file, so the probe passes vacuously").toBe(
        0,
      );
      expect(mutant.output).not.toContain("no-unused-vars");
      // The case 4 guard shape fails on the mutant (it needs a non-zero exit and the
      // no-unused-vars text), so this attack cannot produce a false green.
      expect(!(mutant.status !== 0 && mutant.output.includes("no-unused-vars"))).toBe(true);
      // Paired control: the real config fails the same probe (case 4 holds).
      const real = runOxlintProbe(probe);
      expect(real.status).not.toBe(0);
      expect(real.output).toContain("no-unused-vars");
      // The mirror attack: a probe outside apps/ and packages/ matches no glob, so the
      // makeLintProbe placement under apps/ is load-bearing. A guard that moved the
      // probe to the system temp folder would pass vacuously.
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), "oxc-adv-out-"));
      tempDirs.push(outside);
      const outsideFile = path.join(outside, "probe.ts");
      fs.writeFileSync(outsideFile, "const unused = 1;\n");
      const outsideRun = runTool([
        "oxlint",
        "--config",
        path.join(REPO_ROOT, ".oxlintrc.json"),
        "--max-warnings",
        "0",
        outsideFile,
      ]);
      expect(outsideRun.status, "a probe outside apps/ and packages/ must pass vacuously").toBe(0);
      expect(outsideRun.output).not.toContain("no-unused-vars");
    },
    TOOL_TIMEOUT_MS,
  );

  it("adv 5: the case 9 scan reports each seeded lockfile fault, including nested copies", () => {
    // The jsPlugins set of the real root config (K4 of strategy 14.2).
    const jsPlugins: JsPluginEntry[] = [
      { name: "eslint-js", specifier: "oxlint-plugin-eslint" },
      { name: "react-js", specifier: "eslint-plugin-react" },
      { name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" },
    ];
    // The seeded faults: (a) an eslint-config-next key at the root and a
    // typescript-eslint key nested under a workspace, (b) a non-peer eslint copy at the
    // root and a non-peer @eslint/js copy nested, (c) one jsPlugins specifier with no
    // lockfile key. The @eslint/js root copy with peer: true is the clean control.
    const lock: Json = {
      packages: {
        "": {},
        "node_modules/eslint": { version: "9.39.5" },
        "node_modules/@eslint/js": { version: "9.39.5", peer: true },
        "apps/danielson/node_modules/@eslint/js": { version: "9.39.5" },
        "node_modules/eslint-config-next": { version: "16.2.0" },
        "packages/x/node_modules/typescript-eslint": { version: "8.0.0" },
        "node_modules/oxlint-plugin-eslint": { version: "1.93.0" },
        "node_modules/eslint-plugin-react": { version: "7.37.5" },
      },
    };
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits, "the scan must report every seeded lockfile fault").toEqual([
      "a:node_modules/eslint-config-next",
      "a:packages/x/node_modules/typescript-eslint",
      "b:apps/danielson/node_modules/@eslint/js",
      "b:node_modules/eslint",
      "c:eslint-plugin-react-hooks",
    ]);
    // Control: the same lockfile with peer: true on every ESLint copy and the missing
    // jsPlugins key added reports no hit, so the hits above come from the faults only.
    const clean: Json = {
      packages: {
        "": {},
        "node_modules/eslint": { version: "9.39.5", peer: true },
        "node_modules/@eslint/js": { version: "9.39.5", peer: true },
        "apps/danielson/node_modules/@eslint/js": { version: "9.39.5", peer: true },
        "node_modules/oxlint-plugin-eslint": { version: "1.93.0" },
        "node_modules/eslint-plugin-react": { version: "7.37.5" },
        "node_modules/eslint-plugin-react-hooks": { version: "7.1.1" },
      },
    };
    expect(scanLockfileLintHygiene(clean, jsPlugins)).toEqual([]);
  });

  it(
    "adv 6: every disable-comment variant hides a live finding, so a source scan is the only defense",
    () => {
      expect(runTool(["oxlint", "--version"]).status, "precondition: oxlint --version").toBe(0);
      // Paired control: the bare probe fails (the same proof as case 4).
      const bare = runOxlintProbe(makeLintProbe("const unused = 1;\n"));
      expect(bare.status).not.toBe(0);
      expect(bare.output).toContain("no-unused-vars");
      // Each variant suppresses the finding, with the oxlint spelling and with the
      // eslint spelling, in block, next-line, and trailing form (verified 2026-11-19,
      // oxlint 1.93.0). No manifest or script guard can see a comment, so the defense
      // must scan the source files: adv 7.
      const variants = [
        "/* oxlint-disable */\nconst unused = 1;\n",
        "/* eslint-disable */\nconst unused = 1;\n",
        "/* eslint-disable no-unused-vars */\nconst unused = 1;\n",
        "// eslint-disable-next-line\nconst unused = 1;\n",
        "// oxlint-disable-next-line\nconst unused = 1;\n",
        "const unused = 1; // eslint-disable-line\n",
      ];
      for (const content of variants) {
        const run = runOxlintProbe(makeLintProbe(content));
        expect(run.status, `this variant must hide the finding: ${JSON.stringify(content)}`).toBe(
          0,
        );
      }
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 7: every disable comment in the linted surface is pinned by the allow-list",
    () => {
      // Seeded control, run first: the same pipeline must catch a seeded hidden finding,
      // so an empty result on the real tree below is a real pass, not a vacuous one (A4).
      // The seed folder lives inside apps/integrated-math-3, so the root config's app
      // rules apply to it.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv-seed-");
      const seedFile = path.join(seedRoot, "seed.ts");
      fs.writeFileSync(seedFile, "/* eslint-disable */\nconst unused = 1;\n");
      const hidden = runTool([
        "oxlint",
        "--config",
        path.join(REPO_ROOT, ".oxlintrc.json"),
        "--max-warnings",
        "0",
        seedFile,
      ]);
      expect(hidden.status, "the seeded disable comment must hide the finding").toBe(0);
      fs.writeFileSync(seedFile, stripDisableComments(fs.readFileSync(seedFile, "utf8")));
      const surfaced = runTool([
        "oxlint",
        "--config",
        path.join(REPO_ROOT, ".oxlintrc.json"),
        "--max-warnings",
        "0",
        seedFile,
      ]);
      expect(surfaced.status, "the stripped seed must surface the finding").not.toBe(0);
      expect(surfaced.output).toContain("no-unused-vars");
      // The seed proved the pipeline. Remove it before the real-tree scan, so the
      // scan sees only tracked files.
      fs.rmSync(seedRoot, { recursive: true, force: true });
      tempDirs.splice(tempDirs.indexOf(seedRoot), 1);
      // The allow-list pin (F1, option B): only the recorded pre-existing carrier
      // files may hold a directive, each exactly as recorded.
      const allowlist = readDisableAllowlist();
      const files = lintedFilesWithDisableDirectives();
      const { unlisted, stale, changed } = allowlistPinViolations(allowlist, files);
      expect(unlisted, "carrier files that the allow-list does not name").toEqual([]);
      expect(stale, "stale allow-list entries: the file no longer holds the directive").toEqual([]);
      expect(changed, "allow-list entries whose directives changed").toEqual([]);
      const byPath = new Map(allowlist.map((entry) => [entry.path, entry]));
      // The attack: strip every disable comment from each carrier file into a temp
      // copy inside the same workspace (so every override glob of the original path
      // applies to the copy too), then lint the copies with the root config. A finding
      // on a copy is a live finding that the comment hides in the real tree; it passes
      // only when the allow-list records that rule for that file.
      const rootByWorkspace = new Map<string, string>();
      const tempToReal = new Map<string, string>();
      for (const file of files) {
        const workspace = [...WORKSPACE_DIRS]
          .sort((a, b) => b.length - a.length)
          .find((dir) => file.startsWith(`${dir}${path.sep}`));
        if (!workspace) throw new Error(`no workspace folder for ${relative(file)}`);
        let tempRoot = rootByWorkspace.get(workspace);
        if (!tempRoot) {
          tempRoot = seedDir(workspace, ".oxlint-adv-");
          rootByWorkspace.set(workspace, tempRoot);
        }
        const copy = path.join(tempRoot, path.relative(workspace, file));
        fs.mkdirSync(path.dirname(copy), { recursive: true });
        fs.writeFileSync(copy, stripDisableComments(fs.readFileSync(file, "utf8")));
        // oxlint prints paths relative to the working folder, so the map key is the
        // copy path relative to the repository root.
        tempToReal.set(relative(copy), relative(file));
      }
      if (tempToReal.size > 0) {
        const run = runTool([
          "oxlint",
          "--config",
          path.join(REPO_ROOT, ".oxlintrc.json"),
          "--max-warnings",
          "0",
          ...rootByWorkspace.values(),
        ]);
        const decoded = run.output
          .split("\n")
          .map((line) => line.match(/^(\S+):\d+:\d+: (?:error|warning) ([^\s:]+(?:\([^)]*\))?)/))
          .filter((match): match is RegExpMatchArray => match !== null)
          .map((match) => {
            const real = tempToReal.get(match[1]) ?? match[1];
            return { real, rule: match[2] ?? "" };
          });
        const unrecorded = decoded.filter(({ real, rule }) => {
          const entry = byPath.get(real);
          return !entry || !entry.hiddenRules.includes(rule);
        });
        expect(
          [...new Set(unrecorded.map(({ real, rule }) => `${real} hides ${rule}`))],
          `hidden findings that the allow-list does not record (strip the comment, lint the copy)\n${run.output}`,
        ).toEqual([]);
        // Attack e (a widened entry): every recorded hiddenRules rule must actually be
        // hidden by the file's directives, so no entry can pre-authorize a rule that
        // nothing hides yet.
        const surfacedByReal = new Map<string, Set<string>>();
        for (const { real, rule } of decoded) {
          if (!surfacedByReal.has(real)) surfacedByReal.set(real, new Set());
          surfacedByReal.get(real)?.add(rule);
        }
        expect(
          widenedAllowlistRules(allowlist, surfacedByReal),
          "allow-list entries that record a rule their directives do not hide",
        ).toEqual([]);
      }
    },
    TOOL_TIMEOUT_MS,
  );

  it("adv 8: the pin fails each seeded attack on the allow-list, and the controls pass", () => {
    // Attacks on the allow-list pin (F1, option B): a new carrier in every spelling,
    // a stale entry, blanket growth, a changed directive, and a widened entry. Each
    // attack is seeded inside apps/ (so the root config applies), never in a real
    // file, and each has a paired control that must pass.
    const seedRoot = seedDir(IM3_DIR, ".oxlint-adv8-");
    const write = (name: string, content: string): string => {
      const file = path.join(seedRoot, name);
      fs.writeFileSync(file, content);
      return file;
    };
    const bare = "const keep = 1;\nconst unused = 2;\nexport { keep };\n";
    // Attack a: a new carrier under each spelling. Every one hides the same finding.
    const carriers = [
      write("a-block-eslint.ts", `/* eslint-disable */\n${bare}`),
      write("a-block-oxlint.ts", `/* oxlint-disable */\n${bare}`),
      write(
        "a-next-eslint.ts",
        "const keep = 1;\n// eslint-disable-next-line no-unused-vars -- probe\nconst unused = 2;\nexport { keep };\n",
      ),
      write(
        "a-next-oxlint.ts",
        "const keep = 1;\n// oxlint-disable-next-line no-unused-vars\nconst unused = 2;\nexport { keep };\n",
      ),
      write(
        "a-trailing-eslint.ts",
        "const keep = 1;\nconst unused = 2; // eslint-disable-line\nexport { keep };\n",
      ),
      write(
        "a-jsx-wrap.tsx",
        "export function P() {\n  const unused = 1;\n  {/* eslint-disable */}\n  return <div>{unused}</div>;\n}\n",
      ),
    ];
    const carrierPaths = carriers.map(relative);
    const files = lintedFilesWithDisableDirectives();
    for (const relPath of carrierPaths) {
      expect(files.map(relative), "the carrier scan must see each spelling").toContain(relPath);
    }
    // No entry names them, so each must be unlisted.
    const withNoEntries = allowlistPinViolations([], files);
    for (const relPath of carrierPaths) {
      expect(withNoEntries.unlisted, `a new carrier must be unlisted: ${relPath}`).toContain(
        relPath,
      );
    }
    // Control: correct entries name them, so the pin reports nothing for them.
    const entryFor = (
      relPath: string,
      extra: Partial<DisableAllowlistEntry> = {},
    ): DisableAllowlistEntry => {
      const current = directiveKindsOfFile(fs.readFileSync(path.join(REPO_ROOT, relPath), "utf8"));
      return {
        path: relPath,
        kinds: current.kinds,
        directiveCount: current.total,
        blanketBlocks: current.blocks,
        hiddenRules: [],
        reason: "seed",
        ...extra,
      };
    };
    const carrierEntries = carrierPaths.map((relPath) => entryFor(relPath));
    const withCarrierEntries = allowlistPinViolations(carrierEntries, files);
    for (const relPath of carrierPaths) {
      expect(withCarrierEntries.unlisted, `control: ${relPath}`).not.toContain(relPath);
    }
    expect(withCarrierEntries.stale, "control: no stale entry").toEqual([]);
    expect(withCarrierEntries.changed, "control: no changed entry").toEqual([]);
    // Attack b: a stale entry whose file lost its directive, and one whose file is gone.
    const noDirective = write("b-plain.ts", bare);
    const staleEntry: DisableAllowlistEntry = {
      path: relative(noDirective),
      kinds: ["next-line"],
      directiveCount: 1,
      blanketBlocks: 0,
      hiddenRules: [],
      reason: "seed",
    };
    const withStale = allowlistPinViolations([staleEntry], files);
    expect(withStale.stale, "an entry whose file lost the directive must be stale").toEqual([
      `${relative(noDirective)} (no directive left)`,
    ]);
    const goneEntry: DisableAllowlistEntry = {
      ...staleEntry,
      path: "apps/integrated-math-3/.no-such-carrier.ts",
    };
    const withGone = allowlistPinViolations([goneEntry], files);
    expect(withGone.stale, "an entry whose file is gone must be stale").toEqual([
      "apps/integrated-math-3/.no-such-carrier.ts (file is gone)",
    ]);
    // Control: drop the stale entries and neither is stale.
    const withoutStale = allowlistPinViolations([], files);
    expect(withoutStale.stale).toEqual([]);
    // Attack c: blanket growth in a listed file. The file gains a blanket block, so
    // its kinds change, and the pin fails it.
    fs.writeFileSync(carriers[2], `/* eslint-disable */\n${fs.readFileSync(carriers[2], "utf8")}`);
    // carrierEntries[2] still records the pre-growth kinds, so the pin must fail it.
    const grown = allowlistPinViolations([carrierEntries[2]], files);
    expect(grown.changed, "blanket growth must fail the pin").toEqual([
      `${carrierPaths[2]} (kinds block,next-line vs recorded next-line)`,
    ]);
    // The blanket-block clause itself: same kinds and count, a lowered recorded count
    // of blocks. The pin must fail on the block growth alone.
    const bothBlocks = write(
      "c-two-blocks.ts",
      "/* eslint-disable */\nconst keep = 1;\n/* eslint-disable */\nconst unused = 2;\nexport { keep };\n",
    );
    const twoBlocksEntry: DisableAllowlistEntry = {
      path: relative(bothBlocks),
      kinds: ["block"],
      directiveCount: 2,
      blanketBlocks: 0,
      hiddenRules: [],
      reason: "seed",
    };
    const twoBlocks = allowlistPinViolations([twoBlocksEntry], files);
    expect(twoBlocks.changed, "the blanket-block clause must fail on block growth alone").toEqual([
      `${relative(bothBlocks)} (blanket blocks 2 vs recorded 0)`,
    ]);
    // Control: the recorded blanketBlocks matches, so the pin holds.
    const twoBlocksControl = allowlistPinViolations(
      [{ ...twoBlocksEntry, blanketBlocks: 2 }],
      files,
    );
    expect(twoBlocksControl.changed).toEqual([]);
    // Attack d: a listed file whose next-line directive now hides a different rule.
    // The live sweep: strip the carrier, lint the copy, decode the surfaced rule.
    const dCarrier = write(
      "d-next.ts",
      "const keep = 1;\n// eslint-disable-next-line no-unused-vars -- probe\nconst unused = 2;\nexport { keep };\n",
    );
    expect(runOxlintProbe(dCarrier).status, "the seeded directive hides the finding").toBe(0);
    const dStripped = write(
      "d-stripped.ts",
      stripDisableComments(fs.readFileSync(dCarrier, "utf8")),
    );
    const dSurfaced = runOxlintProbe(dStripped);
    expect(dSurfaced.status, "the stripped copy must surface the finding").not.toBe(0);
    const dRule = (dSurfaced.output.match(/: (?:error|warning) ([^\s:]+(?:\([^)]*\))?)/) ?? [])[1];
    expect(dRule, "the surfaced rule decodes").toBe("eslint(no-unused-vars)");
    // An entry that records a different rule, or no rule, must not cover the finding.
    const wrongRule: DisableAllowlistEntry = {
      path: relative(dCarrier),
      kinds: ["next-line"],
      directiveCount: 1,
      blanketBlocks: 0,
      hiddenRules: ["typescript(no-explicit-any)"],
      reason: "seed",
    };
    expect(
      wrongRule.hiddenRules.includes(dRule ?? ""),
      "a different recorded rule must not cover the finding",
    ).toBe(false);
    const emptyRules: DisableAllowlistEntry = { ...wrongRule, hiddenRules: [] };
    expect(
      emptyRules.hiddenRules.includes(dRule ?? ""),
      "an empty rule list must not cover the finding",
    ).toBe(false);
    // Control: the exact surfaced rule covers the finding.
    const exactRules: DisableAllowlistEntry = { ...wrongRule, hiddenRules: [dRule ?? ""] };
    expect(exactRules.hiddenRules.includes(dRule ?? ""), "the exact rule covers the finding").toBe(
      true,
    );
    // Attack e: a widened entry. A glob path does not name the file, so the file stays
    // unlisted and the guard holds.
    const globEntry: DisableAllowlistEntry = { ...exactRules, path: "apps/**" };
    const withGlob = allowlistPinViolations([globEntry], files);
    expect(withGlob.unlisted, "a glob entry must not name the carrier").toContain(carrierPaths[3]);
    // A widened entry that pre-authorizes a rule the file does not hide passes the
    // unrecorded predicate, so the exactness check must flag the extra rule.
    const widenedEntry: DisableAllowlistEntry = {
      ...exactRules,
      hiddenRules: [dRule ?? "", "react-hooks-js(purity)"],
    };
    expect(
      widenedEntry.hiddenRules.includes(dRule ?? ""),
      "a widened entry still covers the real finding",
    ).toBe(true);
    const surfacedByReal = new Map<string, Set<string>>([
      [relative(dCarrier), new Set([dRule ?? ""])],
    ]);
    expect(
      widenedAllowlistRules([exactRules], surfacedByReal),
      "control: the exact entry has no widened rule",
    ).toEqual([]);
    expect(
      widenedAllowlistRules([widenedEntry], surfacedByReal),
      "a widened entry must be flagged",
    ).toEqual([
      `${relative(dCarrier)} records react-hooks-js(purity), which its directives do not hide`,
    ]);
  });

  it(
    "adv 9: a mid-line or multi-line disable in a listed file still fails the pin and the sweep",
    () => {
      // F1r2: oxlint honors a /* disable */ comment that shares its line with code and
      // a comment that spans lines, but the pin counts only whole-line and // forms,
      // and the sweep strips only those. A listed carrier can hide a new finding
      // behind either form without failing adv 7. Live controls first, so the case is
      // not vacuous.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv9-");
      const write = (name: string, content: string): string => {
        const file = path.join(seedRoot, name);
        fs.writeFileSync(file, content);
        return file;
      };
      const bare = "const keep = 1;\nconst unused = 2;\nexport { keep };\n";
      const bareFile = write("bare.ts", bare);
      const bareRun = runOxlintProbe(bareFile);
      expect(bareRun.status, "control: without a directive the finding surfaces").not.toBe(0);
      expect(bareRun.output).toContain("no-unused-vars");
      const forms = [
        ["inline", "const keep = 1; /* eslint-disable */\nconst unused = 2;\nexport { keep };\n"],
        [
          "multiline",
          "const keep = 1;\n/* eslint-disable\n */\nconst unused = 2;\nexport { keep };\n",
        ],
      ] as const;
      for (const [name, content] of forms) {
        // Live proof: the comment hides the finding, so a guard that ignores the form
        // leaves a real hole.
        const file = write(`${name}.ts`, content);
        const hidden = runOxlintProbe(file);
        expect(hidden.status, `${name}: the seeded comment must hide the finding`).toBe(0);
        // Required: the pin counts the directive, so a listed file that gains it fails
        // the kinds or the blanket-block clause.
        const counted = directiveKindsOfFile(content);
        expect(
          counted.total,
          `${name}: directiveKindsOfFile must count the mid-line or multi-line directive`,
        ).toBe(1);
        expect(counted.blocks, `${name}: the blanket form must count as a block`).toBe(1);
        // Required: the sweep strips the comment, so the hidden finding surfaces.
        const stripped = stripDisableComments(content);
        const copy = write(`${name}-stripped.ts`, stripped);
        const surfaced = runOxlintProbe(copy);
        expect(surfaced.status, `${name}: the stripped copy must surface the finding`).not.toBe(0);
        expect(surfaced.output, `${name}: the surfaced finding`).toContain("no-unused-vars");
      }
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 10: a CRLF line ending must not blind the sweep for the // disable forms",
    () => {
      // F1r3: oxlint honors a trailing disable-line and a disable-next-line on a
      // file with CRLF line ends, but TRAILING_DISABLE_RE does not match a line
      // that ends with a carriage return, so stripDisableComments keeps the
      // directive and the sweep copy stays clean. A listed CRLF carrier can hide
      // a live finding behind either form without the sweep surfacing it. Live
      // controls first, so the case is not vacuous.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv10-");
      const write = (name: string, content: string): string => {
        const file = path.join(seedRoot, name);
        fs.writeFileSync(file, content);
        return file;
      };
      // Control: CRLF alone must not hide anything.
      const bare = "const keep = 1;\r\nconst unused = 2;\r\nexport { keep };\r\n";
      const bareRun = runOxlintProbe(write("bare-crlf.ts", bare));
      expect(bareRun.status, "control: CRLF alone must surface the finding").not.toBe(0);
      expect(bareRun.output).toContain("no-unused-vars");
      // The two attacked forms, each with its LF twin as the paired control.
      const forms = [
        [
          "crlf-trailing",
          "const keep = 1;\r\nconst unused = 2; // eslint-disable-line\r\nexport { keep };\r\n",
        ],
        [
          "crlf-next",
          "const keep = 1;\r\n// eslint-disable-next-line\r\nconst unused = 2;\r\nexport { keep };\r\n",
        ],
      ] as const;
      const lfTwins = [
        [
          "lf-trailing",
          "const keep = 1;\nconst unused = 2; // eslint-disable-line\nexport { keep };\n",
        ],
        [
          "lf-next",
          "const keep = 1;\n// eslint-disable-next-line\nconst unused = 2;\nexport { keep };\n",
        ],
      ] as const;
      for (const [name, content] of forms) {
        // Live proof: oxlint honors the directive although the file uses CRLF.
        const hidden = runOxlintProbe(write(`${name}.ts`, content));
        expect(hidden.status, `${name}: the CRLF directive must hide the finding`).toBe(0);
        // Required: the pin counts the directive, so the kinds stay visible.
        const counted = directiveKindsOfFile(content);
        expect(counted.total, `${name}: the pin must count the CRLF directive`).toBe(1);
        // Required: the sweep strips the directive, so the copy surfaces the
        // finding. This is the assertion that fails until F1r3 is fixed.
        const stripped = stripDisableComments(content);
        const copy = write(`${name}-stripped.ts`, stripped);
        const surfaced = runOxlintProbe(copy);
        expect(
          surfaced.status,
          `${name}: the stripped copy must surface the finding (strip result ${JSON.stringify(stripped)})`,
        ).not.toBe(0);
        expect(surfaced.output, `${name}: the surfaced finding`).toContain("no-unused-vars");
      }
      for (const [name, content] of lfTwins) {
        // Paired control: the LF twins strip and surface, so the pipeline works
        // and the CR at the line end is the only trigger of the blindness.
        const stripped = stripDisableComments(content);
        const copy = write(`${name}-stripped.ts`, stripped);
        const surfaced = runOxlintProbe(copy);
        expect(surfaced.status, `control ${name}: the LF twin must strip and surface`).not.toBe(0);
        expect(surfaced.output, `control ${name}`).toContain("no-unused-vars");
      }
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 11: a string that holds /* before a real disable must not blind the sweep",
    () => {
      // F2r3: BLOCK_COMMENT_RE starts inside the string literal, so the span runs
      // from the in-string /* to the real disable's */. The strip then deletes
      // the code between them, breaks the string, and the copy reports a parse
      // error, so the finding that the real disable hides never surfaces.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv11-");
      const write = (name: string, content: string): string => {
        const file = path.join(seedRoot, name);
        fs.writeFileSync(file, content);
        return file;
      };
      // Controls first: a disable inside a string literal or a template literal
      // is string text, not a comment, so oxlint must not honor it (verified
      // 2026-11-19, oxlint 1.93.0). Counting such text is the conservative
      // direction, because nothing hides behind it.
      const inString = 'const s = "/* eslint-disable */";\nconst unused = 2;\nexport { s };\n';
      const stringRun = runOxlintProbe(write("in-string.ts", inString));
      expect(stringRun.status, "control: a disable inside a string must not hide").not.toBe(0);
      expect(stringRun.output).toContain("no-unused-vars");
      const inTemplate =
        "const t = `/* eslint-disable */`;\nconst unused = 2;\nexport default t;\n";
      const templateRun = runOxlintProbe(write("in-template.ts", inTemplate));
      expect(templateRun.status, "control: a disable inside a template must not hide").not.toBe(0);
      expect(templateRun.output).toContain("no-unused-vars");
      // The attacked form: a string that holds /* sits above a real disable, and
      // the fault sits below the disable.
      const content =
        'const s = "a /* b";\n/* eslint-disable */\nconst unused = 2;\nexport { s };\n';
      // Live proof: oxlint honors the real disable, so the finding is hidden.
      const hidden = runOxlintProbe(write("swallow.ts", content));
      expect(hidden.status, "the real disable must hide the finding").toBe(0);
      // Required: the pin counts the directive.
      const counted = directiveKindsOfFile(content);
      expect(counted.total, "the pin must count the disable").toBe(1);
      expect(counted.blocks, "the disable must count as a block").toBe(1);
      // Required: the sweep strips the disable without breaking the copy, so the
      // hidden finding surfaces. This is the assertion that fails until F2r3 is
      // fixed: the copy today reports an unterminated string and no rule.
      const stripped = stripDisableComments(content);
      const copy = write("swallow-stripped.ts", stripped);
      const surfaced = runOxlintProbe(copy);
      expect(surfaced.output, "the stripped copy must not report a parse error").not.toContain(
        "Unterminated string",
      );
      expect(surfaced.status, "the stripped copy must surface the finding").not.toBe(0);
      expect(surfaced.output, "the surfaced finding").toContain("no-unused-vars");
      // Paired control: the same file without the in-string /* strips and
      // surfaces, so the pipeline works and the in-string /* is the trigger.
      const control = 'const s = "a b";\n/* eslint-disable */\nconst unused = 2;\nexport { s };\n';
      const controlStripped = stripDisableComments(control);
      const controlCopy = write("control-stripped.ts", controlStripped);
      const controlRun = runOxlintProbe(controlCopy);
      expect(controlRun.status, "control: without the in-string /* the strip surfaces").not.toBe(0);
      expect(controlRun.output, "control").toContain("no-unused-vars");
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 12: the verified-good disable forms stay honored, counted, and stripped",
    () => {
      // The r3 probe set that the guard already handles: each form must stay
      // honored by oxlint (live), counted by the pin, and stripped by the sweep,
      // with the surfaced finding. A regression on any form reopens the F1r2
      // hole through a new spelling.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv12-");
      const write = (name: string, content: string): string => {
        const file = path.join(seedRoot, name);
        fs.writeFileSync(file, content);
        return file;
      };
      // Each entry: a form, the expected directive count, and the expected kinds.
      const forms = [
        [
          "star-slash-in-string.ts",
          'const s = "a */ b"; /* eslint-disable */ const unused = 2;\nexport { s };\n',
        ],
        ["adjacent-blocks.ts", "/* keep */ /* eslint-disable */ const unused = 2;\nexport {};\n"],
        [
          "two-disables-one-line.ts",
          "/* eslint-disable */ /* eslint-disable */ const unused = 2;\nexport {};\n",
        ],
        ["tight-block.ts", "/*eslint-disable*/\nconst unused = 2;\nexport {};\n"],
        [
          "wide-whitespace.ts",
          "/*  oxlint-disable  no-unused-vars  */\nconst unused = 2;\nexport {};\n",
        ],
        [
          "jsx-wrap-midline.tsx",
          "export function P() {\n  {/* eslint-disable */} const unused = 2;\n  return <div />;\n}\n",
        ],
        [
          "crlf-block.ts",
          "const keep = 1;\r\n/* eslint-disable */\r\nconst unused = 2;\r\nexport { keep };\r\n",
        ],
      ] as const;
      for (const [name, content] of forms) {
        // Live: oxlint honors the form, so the finding stays hidden.
        const hidden = runOxlintProbe(write(name, content));
        expect(hidden.status, `${name}: oxlint must honor the form`).toBe(0);
        // The pin counts the form.
        const counted = directiveKindsOfFile(content);
        expect(counted.total, `${name}: the pin must count the form`).toBeGreaterThanOrEqual(1);
        // The sweep strips the form, so the copy surfaces the finding.
        const copy = write(name.replace(".", "-stripped."), stripDisableComments(content));
        const surfaced = runOxlintProbe(copy);
        expect(surfaced.status, `${name}: the stripped copy must surface the finding`).not.toBe(0);
        expect(surfaced.output, `${name}: the surfaced finding`).toContain("no-unused-vars");
      }
      // Live semantic pins that the sweep decode relies on (verified 2026-11-19,
      // oxlint 1.93.0): a blanket block disable does not act retroactively, and
      // eslint-enable ends the blanket region. Each fault below the pin stays
      // live in the original file, so the workspace lint gate itself reports it.
      const retroactive =
        "const unused = 1;\n/* eslint-disable */\nconst unused2 = 2;\nexport {};\n";
      const retroRun = runOxlintProbe(write("retroactive.ts", retroactive));
      expect(retroRun.status, "a fault above the disable stays live").not.toBe(0);
      expect(retroRun.output).toContain("no-unused-vars");
      const enableForm =
        "/* eslint-disable */\nconst unused = 1;\n/* eslint-enable */\nconst unused2 = 2;\nexport {};\n";
      const enableRun = runOxlintProbe(write("enable-form.ts", enableForm));
      expect(enableRun.status, "a fault after eslint-enable stays live").not.toBe(0);
      expect(enableRun.output).toContain("no-unused-vars");
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "adv 13: the tokenizer edge forms stay honored, counted, and stripped, and unhonored spellings stay live",
    () => {
      // The r4 probe set: forms that the r7 tokenizer must keep handling, live
      // against oxlint (verified 2026-11-19, oxlint 1.93.0). Group 1: oxlint
      // honors the form, so the pin must count it and the strip must surface
      // the finding. Group 2: oxlint does not honor it, so the finding must
      // stay live and the file must stay loud; the pin counts it, which is the
      // conservative direction. Group 3: oxlint does not honor the spelling,
      // and the pin counts nothing. If a future oxlint starts to honor a group 3
      // spelling, the prefilter would go blind, and this test fails on the live
      // probe first.
      const seedRoot = seedDir(IM3_DIR, ".oxlint-adv13-");
      const write = (name: string, content: string): string => {
        const file = path.join(seedRoot, name);
        fs.writeFileSync(file, content);
        return file;
      };
      // Group 1: honored forms. Each hides the finding, the pin counts at least
      // one directive, and the stripped copy surfaces the finding.
      const honored: Array<[string, string]> = [
        [
          "shebang.js",
          "#!/usr/bin/env node\n/* eslint-disable */\nconst unused = 2;\nexport {};\n",
        ],
        [
          "shebang-mjs.mjs",
          "#!/usr/bin/env node\n/* eslint-disable */\nconst unused = 2;\nexport {};\n",
        ],
        ["bom.ts", "﻿/* eslint-disable */\nconst unused = 2;\nexport {};\n"],
        ["ext-mjs.mjs", "/* eslint-disable */\nconst unused = 2;\nexport {};\n"],
        ["ext-cjs.cjs", "/* eslint-disable */\nconst unused = 2;\nmodule.exports = {};\n"],
        [
          "template-substitution.ts",
          "const t = `${/* eslint-disable */ 1}`;\nconst unused = 2;\nexport { t };\n",
        ],
        [
          "jsx-in-js.js",
          "export function P() {\n  {/* eslint-disable */}\n  const unused = 1;\n  return <div />;\n}\n",
        ],
        [
          "regex-star-slash.ts",
          "const r = /a\\/*b/;\n/* eslint-disable */\nconst unused = 2;\nexport { r };\n",
        ],
        [
          "type-annotation.ts",
          "const x: /* eslint-disable */ number = 1;\nconst unused = 2;\nexport { x };\n",
        ],
        [
          "dup-adjacent.ts",
          "const keep = 1; /* eslint-disable */ const unused = 2;\nexport { keep };\n",
        ],
      ];
      for (const [name, content] of honored) {
        const hidden = runOxlintProbe(write(name, content));
        expect(hidden.status, `${name}: oxlint must honor the form`).toBe(0);
        const counted = directiveKindsOfFile(content, name);
        expect(counted.total, `${name}: the pin must count the form`).toBeGreaterThanOrEqual(1);
        const copy = write(name.replace(".", "-stripped."), stripDisableComments(content, name));
        const surfaced = runOxlintProbe(copy);
        expect(surfaced.status, `${name}: the stripped copy must surface the finding`).not.toBe(0);
        expect(surfaced.output, `${name}: the surfaced finding`).toContain("no-unused-vars");
      }
      // The dedupe pin: leading and trailing trivia of adjacent tokens must not
      // count the same comment twice.
      const dupAdjacent = honored.find(([name]) => name === "dup-adjacent.ts")?.[1] ?? "";
      expect(
        directiveKindsOfFile(dupAdjacent, "dup-adjacent.ts").total,
        "a mid-line comment shared by two tokens must count once",
      ).toBe(1);
      // A file that holds only the directive: the walk must reach the comment
      // through the end-of-file token.
      expect(
        directiveKindsOfFile("/* eslint-disable */\n", "only-comment.ts").total,
        "a comment-only file must count its directive",
      ).toBe(1);
      // The tokenizer must parse the .mts and .cts extensions. No rule of the
      // root config applies to them, so oxlint hides nothing there; the count
      // is the conservative leg.
      expect(
        directiveKindsOfFile("/* eslint-disable */\nconst unused = 2;\n", "probe.mts").total,
      ).toBe(1);
      expect(
        directiveKindsOfFile("/* eslint-disable */\nconst unused = 2;\n", "probe.cts").total,
      ).toBe(1);
      // Group 2: counted but not honored. The finding must stay live, and a
      // parse-broken file must stay loud, so nothing hides silently.
      const countedNotHonored: Array<[string, string]> = [
        ["empty-block.ts", "function f() {/* eslint-disable */}\nconst unused = 2;\nexport {};\n"],
        [
          "jsx-attribute.tsx",
          'export function P() {\n  const unused = 1;\n  return <div id="a" /* eslint-disable */ className="b" />;\n}\n',
        ],
        ["unterminated.ts", "/* eslint-disable\nconst unused = 2;\nexport {};\n"],
        ["syntax-error.ts", "const = 5;\n/* eslint-disable */\nconst unused = 2;\nexport {};\n"],
      ];
      for (const [name, content] of countedNotHonored) {
        const live = runOxlintProbe(write(name, content));
        expect(live.status, `${name}: oxlint must not hide the file`).not.toBe(0);
        const counted = directiveKindsOfFile(content, name);
        expect(counted.total, `${name}: the pin must still count the conservative directive`).toBe(
          1,
        );
        if (name === "empty-block.ts" || name === "jsx-attribute.tsx") {
          expect(live.output, `${name}: the finding must stay live`).toContain("no-unused-vars");
        }
      }
      // A parse-broken form stays loud in the stripped copy too, so the sweep
      // cannot turn it into a silent pass. The unterminated form blanks to EOF,
      // so only the syntax-error form keeps its parse error here.
      const syntaxError = countedNotHonored.find(([name]) => name === "syntax-error.ts")?.[1] ?? "";
      const syntaxCopy = write(
        "syntax-error-stripped.ts",
        stripDisableComments(syntaxError, "syntax-error.ts"),
      );
      const syntaxStrippedRun = runOxlintProbe(syntaxCopy);
      expect(syntaxStrippedRun.status, "the stripped copy must stay loud").not.toBe(0);
      // Group 3: unhonored spellings. The finding stays live and the pin counts
      // nothing, so the prefilter and oxlint agree.
      const unhonored: Array<[string, string]> = [
        ["case-upper.ts", "/* ESLINT-DISABLE */\nconst unused = 2;\nexport {};\n"],
        ["case-mixed.ts", "/* Eslint-Disable */\nconst unused = 2;\nexport {};\n"],
        ["case-next-upper.ts", "// ESLINT-DISABLE-NEXT-LINE\nconst unused = 2;\nexport {};\n"],
        ["spaced-hyphen.ts", "/* eslint - disable */\nconst unused = 2;\nexport {};\n"],
        ["unicode-hyphen.ts", "/* eslint‑disable */\nconst unused = 2;\nexport {};\n"],
        ["regex-holding.ts", "const r = /eslint-disable/;\nconst unused = 2;\nexport { r };\n"],
      ];
      for (const [name, content] of unhonored) {
        const live = runOxlintProbe(write(name, content));
        expect(live.status, `${name}: oxlint must not honor the spelling`).not.toBe(0);
        expect(live.output, `${name}: the finding must stay live`).toContain("no-unused-vars");
        expect(
          directiveKindsOfFile(content, name).total,
          `${name}: the pin must not count the unhonored spelling`,
        ).toBe(0);
      }
    },
    TOOL_TIMEOUT_MS,
  );
});

// ---------------------------------------------------------------------------
// S4 oxfmt (test-strategy 17). The formatter is absent at Red: no `oxfmt`
// package, no `format` script, no `.oxfmtrc.json`, and no
// `.git-blame-ignore-revs`. Each case below fails for its named reason at Red
// (strategy 17.2). Probes live in `seedDir` folders inside the repository, so
// the stale-probe sweep covers them. Each probe uses a `.ts` extension: a
// `.py` probe exits 2 for an unsupported target and is not a valid negative
// probe (A4).
// ---------------------------------------------------------------------------

// Phrases that prove a probe ran against a missing tool or a missing target.
// A negative probe must show neither: it must fail because the file is
// unformatted (A4). The target phrases come from the 0.78.0 CLI run of
// strategy 17.1.
const ABSENT_TARGET_PHRASES = [
  "Expected at least one target file",
  "may have been excluded by ignore rules",
];

function runOxfmt(args: string[]): { status: number | null; output: string } {
  return runTool(["oxfmt", ...args]);
}

// A `.ts` probe file inside the repository. The prefix keeps the sweepable seed
// form, so an interrupted run cannot leak the folder past the sweep (F1r3).
function makeOxfmtProbe(fileName: string, content: string): string {
  const dir = seedDir(REPO_ROOT, ".oxlint-probe-");
  const file = path.join(dir, fileName);
  fs.writeFileSync(file, content);
  return file;
}

const OX_FMT_BAD_PROBE = "const  a={b:1}";
const OX_FMT_GOOD_PROBE = "const a = { b: 1 };\n";

describe("S4 oxfmt", () => {
  it("case 1: oxfmt --check at the repository root exits with code 0", () => {
    // Positive case: the check itself proves the tool is installed (A4). At
    // Red the tool is absent, so `npx --no-install` cannot find an executable
    // and the status assertion fails with that output.
    const { status, output } = runOxfmt(["--check"]);
    expect(status, output).toBe(0);
  });

  it("case 2: the root package.json has the format and format:check scripts in the target form", () => {
    const scripts = (readJson(path.join(REPO_ROOT, "package.json")).scripts ?? {}) as Record<
      string,
      string
    >;
    const wrong: string[] = [];
    if (scripts.format !== "oxfmt") wrong.push(`format: ${String(scripts.format)}`);
    if (scripts["format:check"] !== "oxfmt --check")
      wrong.push(`format:check: ${String(scripts["format:check"])}`);
    // Exact values, not a bare-word grep for `oxfmt` (A3, A7).
    expect(wrong, "root scripts that are not in the target form").toEqual([]);
  });

  it("case 3: .git-blame-ignore-revs holds the SHA of the format-only commit", () => {
    const file = path.join(REPO_ROOT, ".git-blame-ignore-revs");
    // The missing-file line is the named Red reason: the blame file lands in
    // the Implement commit, after the format-only commit exists (A4).
    expect(fs.existsSync(file), ".git-blame-ignore-revs is missing").toBe(true);
    const lines = fs
      .readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#"));
    const sha = lines[0] ?? "";
    // A labeled length, not a digit-only match (A3).
    expect(sha.length, ".git-blame-ignore-revs SHA length").toBe(40);
    const subject = spawnSync("git", ["log", "-1", "--format=%s", sha], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    expect(String(subject.stdout ?? "").trim(), `git log subject of ${sha}`).toBe(
      "style: format the repo with oxfmt",
    );
  });

  it(
    "case 4: a .ts probe with bad spacing fails oxfmt --check and names the probe",
    () => {
      expect(runTool(["oxfmt", "--version"]).status, "precondition: oxfmt --version").toBe(0);
      const probe = makeOxfmtProbe("probe.ts", OX_FMT_BAD_PROBE);
      const { status, output } = runOxfmt(["--check", probe]);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      for (const phrase of ABSENT_TARGET_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).not.toBe(0);
      expect(output).toContain("probe.ts");
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 5: a .ts probe with correct spacing passes oxfmt --check with the clean summary",
    () => {
      expect(runTool(["oxfmt", "--version"]).status, "precondition: oxfmt --version").toBe(0);
      const probe = makeOxfmtProbe("probe.ts", OX_FMT_GOOD_PROBE);
      const { status, output } = runOxfmt(["--check", probe]);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      for (const phrase of ABSENT_TARGET_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).toBe(0);
      expect(output).toContain("All matched files use the correct format.");
      const countMatch = output.match(/on (\d+) files/);
      expect(countMatch, "oxfmt file count in the clean output").not.toBeNull();
      expect(Number((countMatch as RegExpMatchArray)[1]), "oxfmt checked file count").toBe(1);
    },
    TOOL_TIMEOUT_MS,
  );
});

// ---------------------------------------------------------------------------
// S5 gate rules (strategy 18.2). Cases 1 to 4, 7, and 10 are red at the S4
// checkpoint base: the guardrails name `npx tsc`, the root `ws:*` scripts keep
// the tsc fallback, `ci.yml` has no format:check step and keeps the deploy
// job, and the planned markers remain. Cases 5, 6, 8, and 9 are guards.
// Case 9 uses command-form regexes with named path exclusions only (A7). The
// root `ws:*` hits are owned by the red case 3, and the architecture manifest
// snapshot is a recorded value, not a live call site.
// ---------------------------------------------------------------------------

// The five exact banned strings of plan case 1: exact substrings, never a
// bare word match.
const S5_BANNED_STRINGS = ["npx tsc", "tsc --noEmit", "eslint .", "eslint src", "vinext lint"];

// The command forms of strategy section 8, written with JS alternation. Each
// form names a tool call, never a bare English word (A7).
const S5_TSC_CALL_RE = /\b(npx|npm exec)\s+(-\S+\s+)*tsc\b/;
const S5_TSC_FLAG_RE = /\btsc\s+(-p|--project|--noEmit)\b/;
const S5_ESLINT_CALL_RE = /\beslint\s+(\.|src|--)/;
const S5_COMMAND_RES = [S5_TSC_CALL_RE, S5_TSC_FLAG_RE, S5_ESLINT_CALL_RE];

// The target root script forms of plan line 649 and the S4 format scripts.
const S5_ROOT_LINT_TARGET = "npm run lint --workspaces --if-present";
const S5_ROOT_TYPECHECK_TARGET = "npm run typecheck --workspaces --if-present";

// The architecture-track snapshot holds a recorded command value, not a live
// call site. The S5 Contract does not own it, so the live-call scan names
// this one path (A7).
const S5_ARCHITECTURE_SNAPSHOT = "scripts/architecture/architecture.manifest.json";

function s5WorkflowFiles(): string[] {
  const dir = path.join(REPO_ROOT, ".github", "workflows");
  return fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort();
}

function s5ScanStrings(label: string, text: string): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, n) => {
    for (const s of S5_BANNED_STRINGS) {
      if (line.includes(s)) hits.push(`${label}:${n + 1}: [${s}]`);
    }
  });
  return hits;
}

function s5ScanCommands(label: string, text: string): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, n) => {
    for (const re of S5_COMMAND_RES) {
      if (re.test(line)) hits.push(`${label}:${n + 1}: [${re.source}]`);
    }
  });
  return hits;
}

// Every file under a repo folder, except paths that hold a `__tests__`
// segment. Fixtures and mocks under `__tests__` are not live call sites.
function s5ListFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "__tests__") walk(full);
      } else {
        out.push(full);
      }
    }
  };
  walk(path.join(REPO_ROOT, dir));
  return out.sort();
}

describe("S5 gate rules", () => {
  it("case 1: no gate document, manifest, or workflow names a removed tool", () => {
    const files = [
      "AGENTS.md",
      path.join("measure", "workflow.md"),
      path.join("measure", "tech-stack.md"),
      "package.json",
      ...s5WorkflowFiles().map((f) => path.join(".github", "workflows", f)),
    ];
    // Sentinel: the workflow list equals the disk list, so a dropped file
    // fails here and not only on the content check (A4).
    expect(
      files
        .filter((f) => f.includes("workflows"))
        .map((f) => path.basename(f))
        .sort(),
      "workflow files read",
    ).toEqual(s5WorkflowFiles());
    const hits = files.flatMap((f) =>
      s5ScanStrings(f, fs.readFileSync(path.join(REPO_ROOT, f), "utf8")),
    );
    expect(hits, "files that name a removed tool").toEqual([]);
  });

  it("case 2: ci.yml runs the format check", () => {
    const doc = loadYaml(
      fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8"),
    ) as {
      jobs?: Record<string, { steps?: Array<{ run?: string }> }>;
    };
    expect(doc.jobs?.["boundary-check"], "ci.yml has a boundary-check job").toBeDefined();
    const runs: string[] = [];
    for (const job of Object.values(doc.jobs ?? {})) {
      for (const step of job.steps ?? []) {
        if (typeof step.run === "string") runs.push(step.run);
      }
    }
    // Exact run value, not a bare-word grep for `format` (A3, A7).
    expect(runs, "ci.yml run lines with npm run format:check").toContain("npm run format:check");
  });

  it("case 3: the root scripts name the Oxc gates and no root ws:* script calls tsc", () => {
    const scripts = (readJson(path.join(REPO_ROOT, "package.json")).scripts ?? {}) as Record<
      string,
      string
    >;
    const wrong: string[] = [];
    if (scripts.lint !== S5_ROOT_LINT_TARGET) wrong.push(`lint: ${String(scripts.lint)}`);
    if (scripts.typecheck !== S5_ROOT_TYPECHECK_TARGET)
      wrong.push(`typecheck: ${String(scripts.typecheck)}`);
    if (scripts.format !== "oxfmt") wrong.push(`format: ${String(scripts.format)}`);
    if (scripts["format:check"] !== "oxfmt --check")
      wrong.push(`format:check: ${String(scripts["format:check"])}`);
    // Exact values, not a bare-word grep for `oxfmt` or `workspaces` (A3, A7).
    expect(wrong, "root scripts that are not in the target form").toEqual([]);
    // Scope: root `ws:*` scripts only. The four TSC_FALLBACK_LIST workspace
    // scripts keep `tsc --noEmit` under S3 AC4 (strategy 18.11 default 1).
    const flagged = Object.entries(scripts)
      .filter(([key, value]) => key.startsWith("ws:") && String(value).includes("tsc"))
      .map(([key]) => key);
    expect(flagged, "root ws:* scripts that call tsc").toEqual([]);
  });

  it("case 4: the workflow quality gates name the three Oxc gate scripts", () => {
    const text = fs.readFileSync(path.join(REPO_ROOT, "measure", "workflow.md"), "utf8");
    const lines = text.split("\n");
    const start = lines.findIndex((line) => line.trim() === "### Quality Gates");
    expect(start, "Quality Gates section exists").toBeGreaterThanOrEqual(0);
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => /^## /.test(line));
    const section = rest.slice(0, end === -1 ? undefined : end).join("\n");
    const names = ["npm run format:check", "npm run lint", "npm run typecheck"];
    const missing = names.filter((name) => !section.includes(name));
    // Exact script names inside the section, not a bare word such as `lint` (A7).
    expect(missing, "Quality Gates names missing from measure/workflow.md").toEqual([]);
  });

  it(
    "case 5: the CI validator passes and every needs entry names a job",
    () => {
      const result = spawnSync("node", ["scripts/validate-ci.mjs"], {
        cwd: REPO_ROOT,
        encoding: "utf8",
      });
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
      expect(result.status, output).toBe(0);
      const doc = loadYaml(
        fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8"),
      ) as {
        jobs?: Record<string, { needs?: string | string[] }>;
      };
      const names = new Set(Object.keys(doc.jobs ?? {}));
      const dangling: string[] = [];
      for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
        const needsList: string[] = [];
        if (typeof job.needs === "string") needsList.push(job.needs);
        else if (Array.isArray(job.needs)) needsList.push(...job.needs);
        for (const dep of needsList) {
          if (!names.has(dep)) dangling.push(`${jobName} needs ${dep}`);
        }
      }
      expect(dangling, "ci.yml needs entries without a job").toEqual([]);
      // Mutant: the same closure check reports a dangling entry, so a removed
      // job that leaves a `needs` behind cannot pass (A4).
      const mutantNames = new Set(["build"]);
      const mutantNeeds: Record<string, string[]> = { build: ["ghost-job"] };
      const mutantDangling: string[] = [];
      for (const [jobName, deps] of Object.entries(mutantNeeds)) {
        for (const dep of deps) {
          if (!mutantNames.has(dep)) mutantDangling.push(`${jobName} needs ${dep}`);
        }
      }
      expect(mutantDangling, "mutant needs closure").toEqual(["build needs ghost-job"]);
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    "case 6: no measure script calls a removed tool",
    () => {
      const dir = path.join(REPO_ROOT, "measure", "scripts");
      const files = fs.readdirSync(dir).sort();
      // Sentinel: the scan ran over a non-empty folder (A4). Labeled integer (A3).
      expect(files.length, "measure/scripts file count").toBeGreaterThanOrEqual(1);
      const result = spawnSync(
        "git",
        [
          "grep",
          "-n",
          "-E",
          "npx tsc|tsc --noEmit|eslint \\.|eslint src|vinext lint",
          "--",
          "measure/scripts",
        ],
        { cwd: REPO_ROOT, encoding: "utf8" },
      );
      // git grep exits 1 when nothing matches: the exit code proves the
      // empty result is real and not a dropped folder (A4).
      expect(result.status, result.stdout).toBe(1);
      // Positive control: the same pattern matches a seeded file, so the
      // pattern cannot pass vacuously (A4). The seed lives in the system temp
      // folder and is removed in afterEach.
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s5-case6-"));
      tempDirs.push(tmp);
      fs.writeFileSync(path.join(tmp, "seed.sh"), "run: npx tsc --noEmit\n");
      const probe = spawnSync("grep", ["-E", "npx tsc|tsc --noEmit", path.join(tmp, "seed.sh")], {
        encoding: "utf8",
      });
      expect(probe.status, "seeded command form matches").toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );

  it("case 7: ci.yml has no deploy job and no wrangler deploy line", () => {
    const text = fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8");
    const doc = loadYaml(text) as { jobs?: Record<string, unknown> };
    const jobNames = Object.keys(doc.jobs ?? {}).sort();
    // Exact job-key set from the YAML parse, not a word filter (A7). A renamed
    // deploy job keeps the wrangler lines below and still fails.
    expect(jobNames, "ci.yml job keys").not.toContain("deploy");
    const wrangler = text
      .split("\n")
      .filter((line) => line.includes("wrangler-action") || line.includes("wrangler deploy"))
      .map((line) => line.trim());
    expect(wrangler, "ci.yml lines that deploy with wrangler").toEqual([]);
  });

  it("case 8: every workflow uses Node 22 or later", () => {
    const parsedByFile: Record<string, number> = {};
    const below: string[] = [];
    for (const file of s5WorkflowFiles()) {
      const doc = loadYaml(
        fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", file), "utf8"),
      ) as {
        jobs?: Record<
          string,
          { steps?: Array<{ uses?: string; with?: { "node-version"?: string } }> }
        >;
      };
      parsedByFile[file] = 0;
      for (const job of Object.values(doc.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          const version = step.with?.["node-version"];
          if (
            typeof step.uses === "string" &&
            step.uses.startsWith("actions/setup-node") &&
            typeof version === "string"
          ) {
            parsedByFile[file] += 1;
            const major = Number.parseInt(version.replace(/^v/, "").split(".")[0], 10);
            // Labeled integer major, required >= 22 (A3).
            expect(Number.isInteger(major), `${file} node-version parses to an integer`).toBe(true);
            if (major < 22) below.push(`${file}: ${version}`);
          }
        }
      }
    }
    // Sentinel: the parse produced one entry for each file on the disk (A4).
    expect(Object.keys(parsedByFile).sort(), "workflow files read").toEqual(s5WorkflowFiles());
    expect(below, "setup-node steps with a node-version below 22").toEqual([]);
    // Mutant: the same threshold rejects a 20 line, so a lowered workflow
    // cannot pass (A4).
    expect(Number.parseInt("20", 10) >= 22, "mutant node-version 20 is below the floor").toBe(
      false,
    );
  });

  it("case 9: command-form regexes over the live call sites match nothing", () => {
    // Root package.json: every script except `ws:*`. Case 3 owns every root
    // `ws:*` script and is red for the six fallback lines, so this scan
    // excludes exactly the `ws:`-prefixed keys (A7: a structural exclusion).
    const scripts = (readJson(path.join(REPO_ROOT, "package.json")).scripts ?? {}) as Record<
      string,
      string
    >;
    const wsKeys = Object.keys(scripts)
      .filter((key) => key.startsWith("ws:"))
      .sort();
    expect(wsKeys.length, "root ws:* script count").toBeGreaterThanOrEqual(1);
    const hits: string[] = [];
    for (const [key, value] of Object.entries(scripts)) {
      if (!key.startsWith("ws:"))
        hits.push(...s5ScanCommands(`package.json script ${key}`, String(value)));
    }
    // Workflows: the full text of every file on the disk.
    for (const file of s5WorkflowFiles()) {
      hits.push(
        ...s5ScanCommands(
          `.github/workflows/${file}`,
          fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", file), "utf8"),
        ),
      );
    }
    // scripts/ outside __tests__, except the architecture snapshot. The
    // snapshot records a command value; it is not a live call site, and the
    // S5 Contract does not own it. The scan names the one path (A7).
    const allScriptFiles = s5ListFiles("scripts");
    expect(
      allScriptFiles.map((f) => relative(f)),
      "scripts scan sees the architecture snapshot",
    ).toContain(S5_ARCHITECTURE_SNAPSHOT);
    for (const file of allScriptFiles) {
      if (relative(file) === S5_ARCHITECTURE_SNAPSHOT) continue;
      hits.push(...s5ScanCommands(relative(file), fs.readFileSync(file, "utf8")));
    }
    // measure/scripts/: every file. The workspace manifests are not scanned
    // here; the four TSC_FALLBACK_LIST manifests stay out of the Green removal
    // sweep by plan line 689.
    for (const file of s5ListFiles(path.join("measure", "scripts"))) {
      hits.push(...s5ScanCommands(relative(file), fs.readFileSync(file, "utf8")));
    }
    expect(hits, "live call sites that use a removed command form").toEqual([]);
    // Mutant: the same regexes catch one seeded form per pattern, so the
    // scan cannot pass vacuously (A4). Each line matches exactly one form.
    const mutant = ["run: npx tsc --version", "cmd: tsc -p tsconfig.json", "lint: eslint src"].join(
      "\n",
    );
    for (const re of S5_COMMAND_RES) {
      expect(
        mutant.split("\n").some((line) => re.test(line)),
        `mutant matches ${re.source}`,
      ).toBe(true);
    }
    expect(s5ScanCommands("mutant", mutant).length, "mutant command-form hit count").toBe(3);
  });

  it(
    "case 10: the planned markers are gone and the docs name the current tools",
    () => {
      for (const tool of ["vinext", "oxlint", "oxfmt", "tsrs"]) {
        for (const file of ["README.md", path.join("measure", "tech-stack.md")]) {
          const text = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
          expect(text.includes(tool), `${file} names ${tool}`).toBe(true);
        }
      }
      const result = spawnSync(
        "git",
        [
          "grep",
          "-n",
          "planned: vinext-oxc-toolchain_20261114",
          "--",
          "README.md",
          "measure/tech-stack.md",
          "measure/index.md",
        ],
        { cwd: REPO_ROOT, encoding: "utf8" },
      );
      // git grep exits 1 when nothing matches. At Red it exits 0 and names
      // README.md:131 and measure/tech-stack.md:20.
      expect(result.status, result.stdout).toBe(1);
    },
    TOOL_TIMEOUT_MS,
  );
});

describe("S5 adversarial", () => {
  it.each(["lint", "typecheck"])(
    "adv 1: root %s visits every workspace and preserves a failing exit",
    (gate) => {
      // Run the real root script with real npm discovery. Only the workspace
      // commands are fixtures. No fake npm binary intercepts the command.
      const root = readJson(path.join(REPO_ROOT, "package.json"));
      const scripts = root.scripts as Record<string, string>;
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s5-fanout-"));
      tempDirs.push(tmp);
      fs.writeFileSync(
        path.join(tmp, "package.json"),
        JSON.stringify({
          private: true,
          workspaces: root.workspaces,
          scripts: { [gate]: scripts[gate] },
        }),
      );
      fs.writeFileSync(
        path.join(tmp, "probe.cjs"),
        [
          'const fs = require("node:fs");',
          'const path = require("node:path");',
          'const workspace = path.relative(__dirname, process.cwd()).split(path.sep).join("/");',
          'fs.appendFileSync(path.join(__dirname, "visits.log"), workspace + "\\n");',
          "process.exit(workspace === process.env.S5_FAIL_WORKSPACE ? 23 : 0);",
        ].join("\n"),
      );
      const expected = WORKSPACE_DIRS.map(relative).sort();
      expect(expected.length, "the disk inventory contains all 27 workspaces").toBe(27);
      for (const [index, workspace] of expected.entries()) {
        const dir = path.join(tmp, workspace);
        const liveScripts = readJson(path.join(REPO_ROOT, workspace, "package.json"))
          .scripts as Record<string, string>;
        expect(liveScripts[gate], `${workspace} supplies ${gate}`).toBeTypeOf("string");
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, "package.json"),
          JSON.stringify({
            name: `s5-fixture-${index}`,
            private: true,
            scripts: { [gate]: "node ../../probe.cjs" },
          }),
        );
      }
      const run = (failWorkspace: string) => {
        fs.writeFileSync(path.join(tmp, "visits.log"), "");
        const result = spawnSync("npm", ["run", gate], {
          cwd: tmp,
          encoding: "utf8",
          timeout: TOOL_TIMEOUT_MS,
          env: { ...process.env, CI: "true", S5_FAIL_WORKSPACE: failWorkspace },
        });
        expect(result.error, "npm starts without a timeout or a spawn failure").toBeUndefined();
        const visits = fs.readFileSync(path.join(tmp, "visits.log"), "utf8").trim().split("\n");
        expect(
          visits.sort(),
          "each workspace runs exactly once, including after a failure",
        ).toEqual(expected);
        return result;
      };
      const clean = run("");
      expect(clean.status, `${clean.stdout}${clean.stderr}`).toBe(0);
      const failed = run(expected[0]);
      expect(failed.status, `${failed.stdout}${failed.stderr}`).toBe(23);
      expect(failed.stderr, "npm reports the actual probe exit").toContain("code 23");
    },
    TOOL_TIMEOUT_MS,
  );

  it.each(["never", "do not", "forbidden"])(
    "adv 2: command scans preserve a banned call beside the filter words '%s'",
    (words) => {
      const text = `npx --no-install tsc --noEmit # ${words}\neslint src # ${words}`;
      expect(s5ScanCommands("probe.sh", text)).toEqual([
        `probe.sh:1: [${S5_TSC_CALL_RE.source}]`,
        `probe.sh:1: [${S5_TSC_FLAG_RE.source}]`,
        `probe.sh:2: [${S5_ESLINT_CALL_RE.source}]`,
      ]);
      expect(s5ScanStrings("probe.sh", text)).toEqual([
        "probe.sh:1: [tsc --noEmit]",
        "probe.sh:2: [eslint src]",
      ]);
    },
  );

  it.each([
    ['npx --no-install "tsc" --noEmit', 'npx --no-install "tsc" --version', /^Version 7\./m],
    ['npm exec -- "eslint" .', 'npm exec -- "eslint" --version', /^v\d+\./m],
  ] as const)(
    "adv 3: the removed-command scan detects the executable shell form %s",
    (command, versionCommand, versionPattern) => {
      // Shell quotes preserve the executable name. These calls evade both
      // the exact-string scan and the command-form scan at the reviewed HEAD.
      const result = spawnSync("sh", ["-c", versionCommand], {
        cwd: REPO_ROOT,
        encoding: "utf8",
        timeout: TOOL_TIMEOUT_MS,
      });
      expect(result.error).toBeUndefined();
      expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
      expect(result.stdout, "the real shell resolves the quoted executable").toMatch(
        versionPattern,
      );
      expect(s5ScanCommands("probe.sh", command), `hidden tool call: ${command}`).not.toEqual([]);
    },
    TOOL_TIMEOUT_MS,
  );

  it("adv 4: every script is scanned, with only exact fallback commands excluded", () => {
    const manifests = [
      path.join(REPO_ROOT, "package.json"),
      ...WORKSPACE_DIRS.map((dir) => path.join(dir, "package.json")),
    ];
    const hits: string[] = [];
    const fallbacks: string[] = [];
    for (const file of manifests) {
      const workspace = relative(path.dirname(file));
      const scripts = (readJson(file).scripts ?? {}) as Record<string, string>;
      for (const [name, command] of Object.entries(scripts)) {
        if (
          TSC_FALLBACK_LIST.includes(workspace) &&
          name === "typecheck" &&
          command === "tsc --noEmit"
        ) {
          fallbacks.push(workspace);
          continue;
        }
        // Review A F4 is existing debt. Exclude this exact entry, not the
        // workspace or every script whose name contains "backend".
        if (
          workspace === "apps/integrated-math-2" &&
          name === "typecheck:backend" &&
          command === "tsc --noEmit -p convex/tsconfig.json"
        )
          continue;
        hits.push(...s5ScanCommands(`${relative(file)}:${name}`, command));
      }
    }
    expect(fallbacks.sort(), "all four exact fallback scripts remain present").toEqual(
      [...TSC_FALLBACK_LIST].sort(),
    );
    expect(
      hits,
      "root ws:* aliases and workspace auxiliary scripts have no new banned call",
    ).toEqual([]);
    // The excluded architecture file contains executable configuration.
    // Read each command instead of excluding the complete file.
    const manifest = readJson(path.join(REPO_ROOT, S5_ARCHITECTURE_SNAPSHOT)) as {
      workspaces: Array<{ path: string; qualityCommands: Record<string, string | null> }>;
    };
    expect(manifest.workspaces.length).toBeGreaterThan(0);
    for (const workspace of manifest.workspaces) {
      for (const [name, command] of Object.entries(workspace.qualityCommands)) {
        if (command === null) continue;
        if (
          TSC_FALLBACK_LIST.includes(workspace.path) &&
          name === "typecheck" &&
          command === `npx tsc --noEmit --project ${workspace.path}/tsconfig.json`
        )
          continue;
        expect(s5ScanCommands(`${workspace.path}:${name}`, command)).toEqual([]);
      }
    }
  });

  it.todo(
    "adv 4 debt: remove IM2 typecheck:backend tsc outside TSC_FALLBACK_LIST (Review A F4; pre-existing)",
  );

  it("adv 5: CI root commands exist, apart from the recorded curriculum:check debt", () => {
    const doc = loadYaml(
      fs.readFileSync(path.join(REPO_ROOT, ".github/workflows/ci.yml"), "utf8"),
    ) as {
      jobs: Record<string, { steps?: Array<{ name?: string; run?: string }> }>;
    };
    const scripts = (readJson(path.join(REPO_ROOT, "package.json")).scripts ?? {}) as Record<
      string,
      string
    >;
    const rootCommands = (text: string) =>
      [...text.matchAll(/\bnpm\s+run\s+([\w:-]+)([^\n&|]*)/g)]
        .filter((match) => !/--(?:workspace|prefix)/.test(match[2]))
        .map((match) => match[1]);
    const commands = Object.entries(doc.jobs).flatMap(([jobName, job]) =>
      (job.steps ?? []).flatMap((step) =>
        rootCommands(step.run ?? "").map((name) => ({ jobName, step, name })),
      ),
    );
    expect(
      commands.map(({ name }) => name),
      "the new S5 format step is in the scan",
    ).toContain("format:check");
    const missing = commands.filter(({ jobName, step, name }) => {
      if (name in scripts) return false;
      return !(
        jobName === "app-foundations" &&
        step.name === "Check IM2 backend types and content bundle" &&
        step.run ===
          "npm run typecheck --workspace=apps/integrated-math-2 && npm run curriculum:check" &&
        name === "curriculum:check"
      );
    });
    expect(missing).toEqual([]);
    const seeded = rootCommands("npm run deliberately-missing && npm run lint --workspace=apps/x");
    expect(seeded.filter((name) => !(name in scripts))).toEqual(["deliberately-missing"]);
  });

  it.todo(
    "adv 5 debt: CI curriculum:check must name an existing root script (Review C F2; pre-existing)",
  );

  it("adv 6: push CI contains no renamed deployment path or secret reference", () => {
    type Workflow = {
      jobs: Record<
        string,
        { environment?: unknown; uses?: string; steps?: Array<{ uses?: string; run?: string }> }
      >;
    };
    const faults = (doc: Workflow): string[] => {
      const hits: string[] = [];
      if (/\bsecrets\s*(?:\.|\[)/.test(JSON.stringify(doc))) hits.push("secret reference");
      for (const [name, job] of Object.entries(doc.jobs)) {
        if (job.environment !== undefined) hits.push(`${name}: environment`);
        for (const step of [job, ...(job.steps ?? [])]) {
          if (/wrangler-action|deploy/i.test(step.uses ?? "")) hits.push(`${name}: deploy action`);
          if (
            "run" in step &&
            /\b(?:wrangler|convex)\b[^\n]*\bdeploy\b|\bnpm\s+(?:run\s+)?deploy\b/.test(
              step.run ?? "",
            )
          )
            hits.push(`${name}: deploy command`);
        }
      }
      return hits;
    };
    const doc = loadYaml(
      fs.readFileSync(path.join(REPO_ROOT, ".github/workflows/ci.yml"), "utf8"),
    ) as Workflow;
    expect(Object.keys(doc.jobs).length).toBeGreaterThan(0);
    expect(faults(doc)).toEqual([]);
    for (const run of ["npm exec -- wrangler deploy", "npx convex deploy", "npm run deploy"]) {
      expect(faults({ jobs: { production: { steps: [{ run }] } } })).toEqual([
        "production: deploy command",
      ]);
    }
    expect(
      faults({ jobs: { production: { steps: [{ uses: "cloudflare/wrangler-action@v3" }] } } }),
    ).toEqual(["production: deploy action"]);
    expect(faults({ jobs: { production: { environment: "production" } } })).toEqual([
      "production: environment",
    ]);
    for (const secret of [
      "${{ secrets.CLOUDFLARE_API_TOKEN }}",
      "${{ secrets['CLOUDFLARE_API_TOKEN'] }}",
    ]) {
      expect(faults({ jobs: { production: { steps: [{ run: `echo ${secret}` }] } } })).toEqual([
        "secret reference",
      ]);
    }
    const deploy = loadYaml(
      fs.readFileSync(path.join(REPO_ROOT, ".github/workflows/cloudflare-deploy.yml"), "utf8"),
    ) as { on: Record<string, unknown> };
    expect(Object.keys(deploy.on), "only a manual dispatch can start the deploy workflow").toEqual([
      "workflow_dispatch",
    ]);
  });
});
