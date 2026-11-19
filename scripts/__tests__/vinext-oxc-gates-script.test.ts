import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

// Script-level gate tests for issues #3 and #4. They copy gates.sh into temp folders
// and never write under the real repository (no measure/runs/ writes from these tests).
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const TRACK_SLUG = "vinext-oxc-toolchain_20261114";
const GATES_SH = path.join(REPO_ROOT, "measure", "tracks", TRACK_SLUG, "gates.sh");
const BASELINE = "critical=2 high=17 moderate=18 low=5";

const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

interface AuditCase {
  response: string;
  exitCode: number;
  label?: string;
  baseline?: string;
}

// Source gates.sh in bash, put a fake npm first on PATH, call audit_step, and print
// the infra and newfail flags. The folders OUT and BASE live in a temp directory.
function runAuditCase({ response, exitCode, label = "t1", baseline }: AuditCase) {
  const tmp = makeTempDir("gates-audit-");
  const out = path.join(tmp, "out");
  const base = path.join(tmp, "base");
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(base, { recursive: true });
  if (baseline !== undefined) fs.writeFileSync(path.join(base, "audit.txt"), baseline);
  const bin = path.join(tmp, "bin");
  fs.mkdirSync(bin);
  const responseFile = path.join(tmp, "audit-response.json");
  fs.writeFileSync(responseFile, response);
  const npm = path.join(bin, "npm");
  fs.writeFileSync(npm, `#!/usr/bin/env bash\ncat "${responseFile}"\nexit ${exitCode}\n`);
  fs.chmodSync(npm, 0o755);
  const harness = path.join(tmp, "harness.sh");
  fs.writeFileSync(
    harness,
    [
      "set -u",
      `LABEL="${label}"`,
      `OUT="${out}"`,
      `BASE="${base}"`,
      "newfail=0",
      "infra=0",
      `export PATH="${bin}:$PATH"`,
      `source "${GATES_SH}"`,
      "audit_step",
      'echo "infra=$infra"',
      'echo "newfail=$newfail"',
      "",
    ].join("\n"),
  );
  const result = spawnSync("bash", [harness], { encoding: "utf8", timeout: 60000 });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const infra = /infra=(\d)/.exec(output)?.[1];
  const newfail = /newfail=(\d)/.exec(output)?.[1];
  return { status: result.status, output, infra, newfail, outDir: out };
}

// Build a fake repository tree with its own copy of gates.sh.
function makeFakeRepo(withPackageJson = true): string {
  const tmp = makeTempDir("gates-repo-");
  if (withPackageJson) {
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "fake-repo", private: true }),
    );
  }
  const trackDir = path.join(tmp, "measure", "tracks", TRACK_SLUG);
  fs.mkdirSync(trackDir, { recursive: true });
  fs.copyFileSync(GATES_SH, path.join(trackDir, "gates.sh"));
  const appDir = path.join(tmp, "apps", "x");
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(
    path.join(appDir, "package.json"),
    JSON.stringify({ name: "fake-x", private: true, scripts: { lint: "node --version" } }),
  );
  return tmp;
}

// A fake heavy-job wrapper that accepts the job and succeeds without running it.
function makeFakeWrapper(): string {
  const tmp = makeTempDir("gates-wrapper-");
  const wrapper = path.join(tmp, "heavy-run.sh");
  fs.writeFileSync(wrapper, "#!/usr/bin/env bash\nexit 0\n");
  fs.chmodSync(wrapper, 0o755);
  return wrapper;
}

function runGate(
  gatesSh: string,
  gate: string,
  label: string,
  cwd: string,
  env: NodeJS.ProcessEnv,
) {
  const result = spawnSync("bash", [gatesSh, gate, label], {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 60000,
  });
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

describe("gates.sh audit_step (#3)", () => {
  it("treats a registry error object as an infrastructure failure", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        error: { code: "ENOTFOUND", summary: "registry lookup failed" },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain("INFRA FAILURE: audit");
    expect(r.infra).toBe("1");
    expect(r.newfail).toBe("0");
    expect(fs.existsSync(path.join(r.outDir, "audit.txt"))).toBe(false);
  });

  it("treats a registry error with the baseline label as an infrastructure failure", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        error: { code: "ENOTFOUND", summary: "registry lookup failed" },
      }),
      exitCode: 1,
      label: "baseline",
    });
    expect(r.output).toContain("INFRA FAILURE: audit");
    expect(r.infra).toBe("1");
    expect(fs.existsSync(path.join(r.outDir, "audit.txt"))).toBe(false);
  });

  it("rejects a response that is not JSON", () => {
    const r = runAuditCase({ response: "Registry unavailable", exitCode: 1, baseline: BASELINE });
    expect(r.output).toContain("INFRA FAILURE: audit");
    expect(r.infra).toBe("1");
    expect(fs.existsSync(path.join(r.outDir, "audit.txt"))).toBe(false);
  });

  it("rejects a response with no metadata", () => {
    const r = runAuditCase({ response: "{}", exitCode: 0, baseline: BASELINE });
    expect(r.output).toContain("INFRA FAILURE: audit");
    expect(r.infra).toBe("1");
  });

  it("rejects vulnerability counts that are not numbers", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: "2", high: 1, moderate: 0, low: 0 } },
      }),
      exitCode: 0,
      baseline: BASELINE,
    });
    expect(r.output).toContain("INFRA FAILURE: audit");
    expect(r.infra).toBe("1");
  });

  it("accepts a valid report with zero counts and exit 0", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } },
      }),
      exitCode: 0,
      baseline: BASELINE,
    });
    expect(r.output).toContain("critical=0 high=0 moderate=0 low=0");
    expect(r.infra).toBe("0");
    expect(r.newfail).toBe("0");
    expect(fs.readFileSync(path.join(r.outDir, "audit.txt"), "utf8").trim()).toBe(
      "critical=0 high=0 moderate=0 low=0",
    );
  });

  it("accepts valid nonzero counts below the baseline and exit 1", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 1, high: 10, moderate: 20, low: 3 } },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain("critical=1 high=10 moderate=20 low=3");
    expect(r.infra).toBe("0");
    expect(r.newfail).toBe("0");
  });

  it("flags valid nonzero counts above the baseline and exit 1", () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 3, high: 17, moderate: 18, low: 5 } },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain("NEW FAILURE: audit critical 2 -> 3");
    expect(r.infra).toBe("0");
    expect(r.newfail).toBe("1");
  });
});

describe("gates.sh repository root (#4)", () => {
  it("resolves the root from the script location and writes results under it", () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, { HEAVY_RUN: wrapper });
    expect(r.status, r.output).toBe(0);
    expect(r.output).toContain("NEWFAIL=0");
    const results = path.join(repo, "measure", "runs", TRACK_SLUG, "gates", "scripttest");
    expect(fs.existsSync(path.join(results, "lint.exit"))).toBe(true);
    expect(fs.readFileSync(path.join(results, "lint.exit"), "utf8")).toContain("apps/x 0");
    expect(fs.existsSync(path.join(cwd, "measure"))).toBe(false);
    expect(
      fs.existsSync(path.join(REPO_ROOT, "measure", "runs", TRACK_SLUG, "gates", "scripttest")),
    ).toBe(false);
  });

  it("fails with a clear message when the heavy-job wrapper is missing", () => {
    const repo = makeFakeRepo();
    const cwd = makeTempDir("gates-cwd-");
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, {
      HEAVY_RUN: "/nonexistent/heavy-run.sh",
    });
    expect(r.status).toBe(2);
    expect(r.output).toContain("heavy-run.sh not found");
  });

  it("fails with a clear message when the root has no package.json", () => {
    const repo = makeFakeRepo(false);
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, { HEAVY_RUN: wrapper });
    expect(r.status).toBe(2);
    expect(r.output).toContain("package.json");
  });
});

// The r5 workspace-set rule (strategy 14.4). A base workspace that the run lacks, or a run
// workspace that the base lacks, is a new failure. The existing repository-root case above
// covers the missing base (NEWFAIL=0).
describe("gates.sh workspace set (#5)", () => {
  function seedBase(repo: string, name: string, names: string[]): string {
    const base = path.join(repo, "measure", "runs", TRACK_SLUG, "gates", name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "lint.exit"), names.map((n) => `${n} 0`).join("\n") + "\n");
    return name;
  }

  it("flags a base workspace that the run lacks", () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const base = seedBase(repo, "base-superset", ["apps/x", "apps/ghost"]);
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEW FAILURE: lint workspace set differs from the baseline:");
    expect(r.output).toContain("apps/ghost");
    expect(r.output).toContain("NEWFAIL=1");
  });

  it("flags a run workspace that the base lacks", () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const base = seedBase(repo, "base-subset", ["apps/ghost"]);
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEW FAILURE: lint workspace set differs from the baseline:");
    expect(r.output).toContain("apps/x");
    expect(r.output).toContain("NEWFAIL=1");
  });
});

// The S3 errno guard (strategy 16.7). A job log that names ENOSPC or EDQUOT is
// an infrastructure failure, not a new diagnostic. A normal TS2322 line stays a
// new failure. The first two cases fail before the gates.sh change and pass
// after it; the third passes both before and after (it guards against
// over-classification).
describe("gates.sh errno classification (S3)", () => {
  // A fake repo whose only lint script prints `line` and exits 1.
  function makeErrnoRepo(line: string): string {
    const tmp = makeTempDir("gates-errno-");
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "fake-repo", private: true, workspaces: ["apps/*", "packages/*"] }),
    );
    const trackDir = path.join(tmp, "measure", "tracks", TRACK_SLUG);
    fs.mkdirSync(trackDir, { recursive: true });
    fs.copyFileSync(GATES_SH, path.join(trackDir, "gates.sh"));
    const appDir = path.join(tmp, "apps", "x");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, "package.json"),
      JSON.stringify({
        name: "fake-x",
        private: true,
        scripts: { lint: `node -e 'console.log(${JSON.stringify(line)}); process.exit(1)'` },
      }),
    );
    return tmp;
  }

  // A heavy-job wrapper that really runs the command, so the job log holds the
  // lint output. The other wrapper in this file exits 0 without running it.
  function makeExecWrapper(): string {
    const tmp = makeTempDir("gates-exec-wrapper-");
    const wrapper = path.join(tmp, "heavy-run.sh");
    fs.writeFileSync(wrapper, '#!/usr/bin/env bash\n"$@"\n');
    fs.chmodSync(wrapper, 0o755);
    return wrapper;
  }

  function seedOkBase(repo: string, name: string): string {
    const base = path.join(repo, "measure", "runs", TRACK_SLUG, "gates", name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "lint.exit"), "apps/x 0\n");
    fs.writeFileSync(path.join(base, "lint-x.log"), "");
    return name;
  }

  function runErrnoGate(repo: string, extraEnv: NodeJS.ProcessEnv = {}) {
    const wrapper = makeExecWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    return runGate(gatesSh, "lint", "scripttest", cwd, { HEAVY_RUN: wrapper, ...extraEnv });
  }

  it("classifies an ENOSPC job log as infrastructure", () => {
    const repo = makeErrnoRepo("ENOSPC: no space left on device, write");
    const r = runErrnoGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain("INFRA FAILURE:");
    expect(r.output).toContain("INFRA=1");
    expect(r.output).not.toContain("NEW FAILURE");
  });

  it("classifies an EDQUOT job log as infrastructure", () => {
    const repo = makeErrnoRepo("EDQUOT: disk quota exceeded");
    const r = runErrnoGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain("INFRA FAILURE:");
    expect(r.output).toContain("INFRA=1");
    expect(r.output).not.toContain("NEW FAILURE");
  });

  it("still reports a normal TS2322 line as a new failure, not infrastructure", () => {
    const repo = makeErrnoRepo(
      "probe.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.",
    );
    const base = seedOkBase(repo, "base-ok");
    const r = runErrnoGate(repo, { GATES_BASE: base });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEWFAIL=1");
    expect(r.output).not.toContain("INFRA=1");
  });
});

// The S4 disk-full guard (strategy 17.7 item 1, Review A S3 r2 F1). The gate
// classifier misses the Rust form `No space left on device (os error 28)` and
// the Node form `Error: spawn ENOSPC`. The first two cases fail before the
// `DISK_FULL_RE` change and pass after it. The third case passes both before
// and after: a failing test title that names the spawn form in prose stays a
// normal diagnostic, because the new alternatives are full-line anchored (A7).
describe("gates.sh Rust and spawn disk-full forms (S4)", () => {
  // Compose the trigger word at runtime, as the S3 r2 cases do: a failing run
  // of this test must not print a literal disk-full line into the
  // scripts-suite log and cloak itself.
  const NO_SPC = ["EN", "OSPC"].join("");
  const RUST_LINE = `No space left on device (os error 28)`;
  const SPAWN_LINE = `Error: spawn ${NO_SPC}`;
  const PROSE_LINE = `FAIL  __tests__/disk.test.ts > handles the spawn ${NO_SPC} write path`;

  // A fake repo whose only lint script prints `line` and exits 1.
  function makeLineRepo(line: string): string {
    const tmp = makeTempDir("gates-s4-");
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "fake-repo", private: true, workspaces: ["apps/*", "packages/*"] }),
    );
    const trackDir = path.join(tmp, "measure", "tracks", TRACK_SLUG);
    fs.mkdirSync(trackDir, { recursive: true });
    fs.copyFileSync(GATES_SH, path.join(trackDir, "gates.sh"));
    const appDir = path.join(tmp, "apps", "x");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, "package.json"),
      JSON.stringify({
        name: "fake-x",
        private: true,
        scripts: { lint: `node -e 'console.log(${JSON.stringify(line)}); process.exit(1)'` },
      }),
    );
    return tmp;
  }

  // A heavy-job wrapper that really runs the command, so the job log holds the
  // lint output.
  function makeS4ExecWrapper(): string {
    const tmp = makeTempDir("gates-s4-wrapper-");
    const wrapper = path.join(tmp, "heavy-run.sh");
    fs.writeFileSync(wrapper, '#!/usr/bin/env bash\n"$@"\n');
    fs.chmodSync(wrapper, 0o755);
    return wrapper;
  }

  function seedS4OkBase(repo: string, name: string): string {
    const base = path.join(repo, "measure", "runs", TRACK_SLUG, "gates", name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, "lint.exit"), "apps/x 0\n");
    fs.writeFileSync(path.join(base, "lint-x.log"), "");
    return name;
  }

  function runS4LineGate(repo: string, extraEnv: NodeJS.ProcessEnv = {}) {
    const wrapper = makeS4ExecWrapper();
    const cwd = makeTempDir("gates-s4-cwd-");
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    return runGate(gatesSh, "lint", "scripttest", cwd, { HEAVY_RUN: wrapper, ...extraEnv });
  }

  it("classifies the Rust os error 28 job log as infrastructure", () => {
    const repo = makeLineRepo(RUST_LINE);
    const r = runS4LineGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain("INFRA FAILURE:");
    expect(r.output).toContain("INFRA=1");
    expect(r.output).not.toContain("NEW FAILURE");
  });

  it("classifies the Node spawn ENOSPC job log as infrastructure", () => {
    const repo = makeLineRepo(SPAWN_LINE);
    const r = runS4LineGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain("INFRA FAILURE:");
    expect(r.output).toContain("INFRA=1");
    expect(r.output).not.toContain("NEW FAILURE");
  });

  it("still reports a failing test title that names spawn ENOSPC in prose as a new failure", () => {
    const repo = makeLineRepo(PROSE_LINE);
    const base = seedS4OkBase(repo, "base-ok-s4");
    const r = runS4LineGate(repo, { GATES_BASE: base });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEWFAIL=1");
    expect(r.output).not.toContain("INFRA=1");
  });
});
// The S1 adversarial cases for the sweep (strategy 13.7, R18: no app is ever excluded
// from a gate to make the phase pass). Each case seeds the named exclusion in a fake
// repository and asserts that gates.sh reports a new failure. The allowed outcome of the
// attack is never an exclusion.
describe("S1 adversarial: gates.sh workspace set", () => {
  // A fake repo whose tree the sweep visits. `lintScripts` maps a workspace name to
  // whether its package.json has a lint script.
  function makeAdvRepo(lintScripts: Record<string, boolean>): string {
    const tmp = makeTempDir("gates-adv-");
    fs.writeFileSync(
      path.join(tmp, "package.json"),
      JSON.stringify({ name: "fake-repo", private: true }),
    );
    const trackDir = path.join(tmp, "measure", "tracks", TRACK_SLUG);
    fs.mkdirSync(trackDir, { recursive: true });
    fs.copyFileSync(GATES_SH, path.join(trackDir, "gates.sh"));
    for (const [name, hasLint] of Object.entries(lintScripts)) {
      const dir = path.join(tmp, "apps", name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, "package.json"),
        JSON.stringify({
          name: `fake-${name}`,
          private: true,
          scripts: hasLint ? { lint: "node --version" } : {},
        }),
      );
    }
    return tmp;
  }

  function seedExitFile(repo: string, name: string, rows: Array<[string, string]>): string {
    const base = path.join(repo, "measure", "runs", TRACK_SLUG, "gates", name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(
      path.join(base, "lint.exit"),
      rows.map(([ws, code]) => `${ws} ${code}`).join("\n") + "\n",
    );
    return name;
  }

  it("adv 6 (R18): a sweep whose tree drops apps/danielson reports a new failure that names it", () => {
    // The attack: the run tree holds apps/x only; the baseline holds apps/danielson too.
    const repo = makeAdvRepo({ x: true });
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const base = seedExitFile(repo, "base-with-danielson", [
      ["apps/x", "0"],
      ["apps/danielson", "0"],
    ]);
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEW FAILURE: lint workspace set differs from the baseline:");
    expect(r.output).toContain("apps/danielson");
    expect(r.output).toContain("NEWFAIL=1");
  });

  it("adv 7 (R18, A4): removing the danielson lint script is a new failure, not a pass", () => {
    // The attack: apps/danielson stays in the tree, but its lint script is removed, so
    // the sweep records n/a. Section 7 counts a removed script as a new failure.
    const repo = makeAdvRepo({ x: true, danielson: false });
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir("gates-cwd-");
    const base = seedExitFile(repo, "base-danielson-lints", [
      ["apps/x", "0"],
      ["apps/danielson", "0"],
    ]);
    const gatesSh = path.join(repo, "measure", "tracks", TRACK_SLUG, "gates.sh");
    const r = runGate(gatesSh, "lint", "scripttest", cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain("NEW FAILURE: lint script removed in apps/danielson");
    expect(r.output).toContain("NEWFAIL=1");
  });
});

// The S3 adversarial errno probe (attack i of the S3 attack list, gates.sh
// commit 4f4fc3c4, narrow matcher fix in the S3 remediation round 1). The
// original matcher grepped a whole job log for the disk-space errno words, and
// the key function dropped every line that held them. A diagnostic that only
// mentions the word in its text was therefore classified infrastructure and
// dropped from the compare, so a real new failure could hide behind the word.
// The fix accepts only the real system message forms. The round-1 case pins
// that a word-only title stays a diagnostic and yields NEWFAIL, and that a real
// message still classifies as infrastructure. The round-2 cases attack the new
// matcher itself: errno data forms inside a diagnostic (r2 a), the real-failure
// plus real-message trade-off (r2 c), the real npm and Node outputs (r2 d),
// and the near-miss variants (r2 e). The trigger words are composed at runtime
// so this test's own failure diff cannot put them into the scripts-suite log
// and cloak this test.
describe("S3 adversarial", () => {
  const DISK_ERRNO = ["EN", "OSPC"].join("");
  const DISK_QUOTA = ["ED", "QUOT"].join("");
  const NEG28 = ["-", "2", "8"].join("");
  const NEG122 = ["-", "1", "2", "2"].join("");

  function runBashFn(script: string): { status: number | null; output: string } {
    const r = spawnSync("bash", ["-c", `source "${GATES_SH}"\n${script}`], {
      encoding: "utf8",
      timeout: 60000,
    });
    return { status: r.status, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
  }

  it("a diagnostic that only mentions the disk-space errno word stays a diagnostic", () => {
    const tmp = makeTempDir("gates-adv-errno-");
    // A normal failing-test line whose title mentions the errno word, and the
    // same line without the word.
    const wordLog = path.join(tmp, "word.log");
    fs.writeFileSync(
      wordLog,
      `FAIL  __tests__/disk.test.ts > handles the ${DISK_ERRNO} write path\n`,
    );
    const plainLog = path.join(tmp, "plain.log");
    fs.writeFileSync(plainLog, "FAIL  __tests__/disk.test.ts > handles the write path\n");
    // A real disk-full system message, in a line that the include filter keeps.
    const realLog = path.join(tmp, "real.log");
    fs.writeFileSync(
      realLog,
      `FAIL  __tests__/disk.test.ts > write fails: ${DISK_ERRNO}: no space left on device\n`,
    );

    // 1. has_infra_output leaves the word-only failure a normal diagnostic.
    expect(
      runBashFn(`has_infra_output "${wordLog}"`).status,
      "the word-bearing failure is not classified infrastructure",
    ).not.toBe(0);
    expect(
      runBashFn(`has_infra_output "${plainLog}"`).status,
      "the plain failure is not infrastructure",
    ).not.toBe(0);
    // A real message is still an infrastructure failure.
    expect(
      runBashFn(`has_infra_output "${realLog}"`).status,
      "a real disk-full message is infrastructure",
    ).toBe(0);

    // 2. key() keeps the word-bearing diagnostic, so the compare sees it. It
    // drops the real message, which is an infrastructure failure.
    expect(runBashFn(`key "${wordLog}"`).output).toContain(`handles the ${DISK_ERRNO} write path`);
    expect(runBashFn(`key "${plainLog}"`).output).toContain("handles the write path");
    expect(runBashFn(`key "${realLog}"`).output.trim(), "a real message leaves no key").toBe("");

    // 3. new_keys sees a new failure whose diagnostic holds the word: the
    // baseline has one old diagnostic, and the current log adds the
    // word-bearing failure. The compare reports a new key, so the gate turns
    // red instead of staying green.
    const baseLog = path.join(tmp, "base.log");
    fs.writeFileSync(baseLog, "FAIL  __tests__/old.test.ts > an old failing test\n");
    const curWordLog = path.join(tmp, "cur-word.log");
    fs.writeFileSync(
      curWordLog,
      `FAIL  __tests__/old.test.ts > an old failing test\nFAIL  __tests__/disk.test.ts > handles the ${DISK_ERRNO} write path\n`,
    );
    const curPlainLog = path.join(tmp, "cur-plain.log");
    fs.writeFileSync(
      curPlainLog,
      "FAIL  __tests__/old.test.ts > an old failing test\nFAIL  __tests__/disk.test.ts > handles the write path\n",
    );
    expect(
      runBashFn(`new_keys "${baseLog}" "${curWordLog}"`).status,
      "the word-bearing new failure is visible to the compare",
    ).toBe(0);
    expect(
      runBashFn(`new_keys "${baseLog}" "${curPlainLog}"`).status,
      "the plain new failure is visible to the compare",
    ).toBe(0);
  });

  it("r2 a: a real failure whose diagnostic carries an errno data form is still hidden as infrastructure and dropped from the compare", () => {
    // The round-2 residual of F1: the three data forms that the narrow matcher
    // still accepts (`Error: <errno>`, `code: '<errno>'`, `errno: -28`) can sit
    // inside a failing assertion diff, for example a test that asserts on a
    // caught error object. Such a line is a real new failure, but the matcher
    // classifies the job log as infrastructure and key() drops the line, so a
    // baseline that already fails reports no new key. This case pins the
    // current behavior so a Green fix has a failing-first target; each hit
    // line has a paired control without the data form.
    const tmp = makeTempDir("gates-adv-errno-r2a-");
    const pairs: Array<{ hit: string; control: string; marker: string }> = [
      {
        hit: `FAIL  __tests__/disk.test.ts > rejects the write: AssertionError: expected 'Error: ${DISK_ERRNO}' to be 'Error: EACCES' [r2a-1]`,
        control: `FAIL  __tests__/disk.test.ts > rejects the write: AssertionError: expected 'Error: EACCES' to be 'Error: EPERM' [r2a-1-ctrl]`,
        marker: "[r2a-1]",
      },
      {
        hit: `AssertionError: expected { code: '${DISK_ERRNO}', errno: ${NEG28} } to match { code: 'ENOENT' } [r2a-2]`,
        control: `AssertionError: expected { code: 'EACCES', errno: -13 } to match { code: 'ENOENT' } [r2a-2-ctrl]`,
        marker: "[r2a-2]",
      },
      {
        hit: `AssertionError: the watcher state held errno: ${NEG28} after the write [r2a-3]`,
        control: `AssertionError: the watcher state held errno: -13 after the write [r2a-3-ctrl]`,
        marker: "[r2a-3]",
      },
    ];
    for (const { hit, control, marker } of pairs) {
      const hitLog = path.join(tmp, marker.slice(1, -1) + "-hit.log");
      fs.writeFileSync(hitLog, `${hit}\n`);
      const controlLog = path.join(tmp, marker.slice(1, -1) + "-ctrl.log");
      fs.writeFileSync(controlLog, `${control}\n`);
      // Pinned defect: the data-form hit is classified infrastructure.
      expect(
        runBashFn(`has_infra_output "${hitLog}"`).status,
        `${marker}: the data-form diagnostic is classified infrastructure`,
      ).toBe(0);
      expect(
        runBashFn(`has_infra_output "${controlLog}"`).status,
        `${marker}: the control diagnostic is not infrastructure`,
      ).not.toBe(0);
      // Pinned defect: key() drops the data-form hit and keeps the control.
      expect(
        runBashFn(`key "${hitLog}"`).output,
        `${marker}: the data-form diagnostic leaves no key`,
      ).not.toContain(marker);
      expect(runBashFn(`key "${controlLog}"`).output).toContain(`${marker.slice(1, -1)}-ctrl`);
    }
    // The compare is blind to a new failure whose diagnostic holds the form.
    const baseLog = path.join(tmp, "r2a-base.log");
    fs.writeFileSync(baseLog, "FAIL  __tests__/old.test.ts > an old failing test\n");
    const curHit = path.join(tmp, "r2a-cur-hit.log");
    fs.writeFileSync(
      curHit,
      `FAIL  __tests__/old.test.ts > an old failing test\nFAIL  __tests__/disk.test.ts > rejects the write: AssertionError: expected 'Error: ${DISK_ERRNO}' to be 'Error: EACCES' [r2a-new]\n`,
    );
    const curCtrl = path.join(tmp, "r2a-cur-ctrl.log");
    fs.writeFileSync(
      curCtrl,
      `FAIL  __tests__/old.test.ts > an old failing test\nFAIL  __tests__/disk.test.ts > rejects the write: AssertionError: expected 'Error: EACCES' to be 'Error: EPERM' [r2a-new-ctrl]\n`,
    );
    expect(
      runBashFn(`new_keys "${baseLog}" "${curHit}"`).status,
      "the data-form new failure is invisible to the compare",
    ).not.toBe(0);
    expect(
      runBashFn(`new_keys "${baseLog}" "${curCtrl}"`).status,
      "the control new failure is visible to the compare",
    ).toBe(0);
  });

  it("r2 c: a job log that holds one real disk-full line and a real failure still classifies the job as infrastructure", () => {
    // Strategy 16.7 records the trade-off: /tmp is a memory disk near its
    // quota, so a tool can write the real message and still exit with a real
    // failure code. The gate prefers the re-run: one real message line makes
    // the whole job infrastructure (exit 3, re-run once), even when a real
    // TS2322 failure sits in the same log. This case pins that decision.
    const tmp = makeTempDir("gates-adv-errno-r2c-");
    const seed = path.join(tmp, "seed.log");
    fs.writeFileSync(
      seed,
      `Error: ${DISK_ERRNO}: no space left on device, write\n` +
        "probe.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.\n",
    );
    const outDir = path.join(tmp, "out");
    fs.mkdirSync(outDir);
    const wrapper = path.join(tmp, "heavy-run.sh");
    fs.writeFileSync(wrapper, `#!/usr/bin/env bash\ncat "${seed}"\nexit 1\n`);
    fs.chmodSync(wrapper, 0o755);
    const harness = path.join(tmp, "harness.sh");
    fs.writeFileSync(
      harness,
      [
        "set -u",
        `source "${GATES_SH}"`,
        `H="${wrapper}"`,
        `OUT="${outDir}"`,
        `run_job test x "${path.join(outDir, "job.log")}" cat /dev/null`,
        'echo "JOB_CODE=$JOB_CODE"',
        "",
      ].join("\n"),
    );
    // The job itself exited 1 for a real reason, but the real disk-full line
    // upgrades the recorded code to 290 (infrastructure, one re-run).
    expect(runBashFn(`bash "${harness}"`).output).toContain("JOB_CODE=290");
  });

  it("r2 d: the real Node and npm disk-full outputs are caught, and the npm trailer-only lines are not", () => {
    // Real outputs, seeded verbatim (the errno words composed at runtime). The
    // full npm error block is caught through its summary line, and Node prints
    // the full message. The trailer-only lines (`npm ERR! code <errno>`,
    // `npm error code <errno>`, `npm ERR! errno -28`) match no alternative, so
    // a log that holds only them is not classified infrastructure; that miss
    // is pinned for a Green decision.
    const tmp = makeTempDir("gates-adv-errno-r2d-");
    const writes: Array<[string, string, boolean]> = [
      ["npm-err-bang", `npm ERR! code ${DISK_ERRNO}`, false],
      ["npm-lower", `npm error code ${DISK_ERRNO}`, false],
      ["npm-errno", `npm ERR! errno ${NEG28}`, false],
      [
        "npm-block",
        `npm ERR! code ${DISK_ERRNO}\nnpm ERR! syscall write\nnpm ERR! errno ${NEG28}\nnpm ERR! enospc ${DISK_ERRNO}: no space left on device, write\n`,
        true,
      ],
      ["node-write", `Error: ${DISK_ERRNO}: no space left on device, write`, true],
      ["node-close", `Error: ${DISK_ERRNO}: no space left on device, close`, true],
      ["quota-write", `Error: ${DISK_QUOTA}: disk quota exceeded, write`, true],
      [
        "node-fields",
        `[Error: ${DISK_ERRNO}: no space left on device, write] { errno: ${NEG28}, code: '${DISK_ERRNO}', syscall: 'write' }`,
        true,
      ],
      ["npm-modern", `npm error enospc ${DISK_ERRNO}: no space left on device, write`, true],
    ];
    for (const [name, content, infra] of writes) {
      const log = path.join(tmp, `${name}.log`);
      fs.writeFileSync(log, `${content}\n`);
      const status = runBashFn(`has_infra_output "${log}"`).status;
      if (infra) {
        expect(status, `${name}: a real disk-full output is infrastructure`).toBe(0);
      } else {
        // Pinned miss: the trailer-only line classifies as a normal
        // diagnostic. A Green fix that widens the matcher flips this half.
        expect(status, `${name}: the trailer-only line is not infrastructure`).not.toBe(0);
      }
    }
  });

  it("r2 e: the canonical field forms stay infrastructure and the near-miss variants stay diagnostics", () => {
    // Case and spacing edges around the new matcher. The canonical forms that
    // Node prints stay infrastructure; the near-miss variants (lowercase, no
    // space after the colon, compact JSON, a double space, a capitalized key)
    // stay diagnostics. Node never prints the near-miss forms, so the misses
    // are the safe direction: no real disk-full output escapes.
    const tmp = makeTempDir("gates-adv-errno-r2e-");
    const writes: Array<[string, string, boolean]> = [
      ["errno-122", `errno: ${NEG122}`, true],
      ["code-double-quotes", `code: "${DISK_ERRNO}"`, true],
      ["code-no-quotes", `code: ${DISK_ERRNO}`, true],
      ["lower-word", `${["en", "ospc"].join("")}: no space left on device`, false],
      ["compact-json", `{"code":"${DISK_ERRNO}"}`, false],
      ["errno-tight", `errno:${NEG28}`, false],
      ["errno-wide", `errno:  ${NEG28}`, false],
      ["cap-code", `Code: '${DISK_ERRNO}'`, false],
    ];
    for (const [name, content, infra] of writes) {
      const log = path.join(tmp, `${name}.log`);
      fs.writeFileSync(log, `${content}\n`);
      const status = runBashFn(`has_infra_output "${log}"`).status;
      expect(status, `${name}: the infra flag must match the recorded decision`).toBe(
        infra ? 0 : 1,
      );
    }
  });
});
