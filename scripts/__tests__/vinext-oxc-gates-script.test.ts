import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// Script-level gate tests for issues #3 and #4. They copy gates.sh into temp folders
// and never write under the real repository (no measure/runs/ writes from these tests).
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TRACK_SLUG = 'vinext-oxc-toolchain_20261114';
const GATES_SH = path.join(REPO_ROOT, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
const BASELINE = 'critical=2 high=17 moderate=18 low=5';

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
function runAuditCase({ response, exitCode, label = 't1', baseline }: AuditCase) {
  const tmp = makeTempDir('gates-audit-');
  const out = path.join(tmp, 'out');
  const base = path.join(tmp, 'base');
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(base, { recursive: true });
  if (baseline !== undefined) fs.writeFileSync(path.join(base, 'audit.txt'), baseline);
  const bin = path.join(tmp, 'bin');
  fs.mkdirSync(bin);
  const responseFile = path.join(tmp, 'audit-response.json');
  fs.writeFileSync(responseFile, response);
  const npm = path.join(bin, 'npm');
  fs.writeFileSync(npm, `#!/usr/bin/env bash\ncat "${responseFile}"\nexit ${exitCode}\n`);
  fs.chmodSync(npm, 0o755);
  const harness = path.join(tmp, 'harness.sh');
  fs.writeFileSync(
    harness,
    [
      'set -u',
      `LABEL="${label}"`,
      `OUT="${out}"`,
      `BASE="${base}"`,
      'newfail=0',
      'infra=0',
      `export PATH="${bin}:$PATH"`,
      `source "${GATES_SH}"`,
      'audit_step',
      'echo "infra=$infra"',
      'echo "newfail=$newfail"',
      '',
    ].join('\n'),
  );
  const result = spawnSync('bash', [harness], { encoding: 'utf8', timeout: 60000 });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const infra = /infra=(\d)/.exec(output)?.[1];
  const newfail = /newfail=(\d)/.exec(output)?.[1];
  return { status: result.status, output, infra, newfail, outDir: out };
}

// Build a fake repository tree with its own copy of gates.sh.
function makeFakeRepo(withPackageJson = true): string {
  const tmp = makeTempDir('gates-repo-');
  if (withPackageJson) {
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({ name: 'fake-repo', private: true }),
    );
  }
  const trackDir = path.join(tmp, 'measure', 'tracks', TRACK_SLUG);
  fs.mkdirSync(trackDir, { recursive: true });
  fs.copyFileSync(GATES_SH, path.join(trackDir, 'gates.sh'));
  const appDir = path.join(tmp, 'apps', 'x');
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify({ name: 'fake-x', private: true, scripts: { lint: 'node --version' } }),
  );
  return tmp;
}

// A fake heavy-job wrapper that accepts the job and succeeds without running it.
function makeFakeWrapper(): string {
  const tmp = makeTempDir('gates-wrapper-');
  const wrapper = path.join(tmp, 'heavy-run.sh');
  fs.writeFileSync(wrapper, '#!/usr/bin/env bash\nexit 0\n');
  fs.chmodSync(wrapper, 0o755);
  return wrapper;
}

function runGate(gatesSh: string, gate: string, label: string, cwd: string, env: NodeJS.ProcessEnv) {
  const result = spawnSync('bash', [gatesSh, gate, label], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 60000,
  });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

describe('gates.sh audit_step (#3)', () => {
  it('treats a registry error object as an infrastructure failure', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        error: { code: 'ENOTFOUND', summary: 'registry lookup failed' },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain('INFRA FAILURE: audit');
    expect(r.infra).toBe('1');
    expect(r.newfail).toBe('0');
    expect(fs.existsSync(path.join(r.outDir, 'audit.txt'))).toBe(false);
  });

  it('treats a registry error with the baseline label as an infrastructure failure', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        error: { code: 'ENOTFOUND', summary: 'registry lookup failed' },
      }),
      exitCode: 1,
      label: 'baseline',
    });
    expect(r.output).toContain('INFRA FAILURE: audit');
    expect(r.infra).toBe('1');
    expect(fs.existsSync(path.join(r.outDir, 'audit.txt'))).toBe(false);
  });

  it('rejects a response that is not JSON', () => {
    const r = runAuditCase({ response: 'Registry unavailable', exitCode: 1, baseline: BASELINE });
    expect(r.output).toContain('INFRA FAILURE: audit');
    expect(r.infra).toBe('1');
    expect(fs.existsSync(path.join(r.outDir, 'audit.txt'))).toBe(false);
  });

  it('rejects a response with no metadata', () => {
    const r = runAuditCase({ response: '{}', exitCode: 0, baseline: BASELINE });
    expect(r.output).toContain('INFRA FAILURE: audit');
    expect(r.infra).toBe('1');
  });

  it('rejects vulnerability counts that are not numbers', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: '2', high: 1, moderate: 0, low: 0 } },
      }),
      exitCode: 0,
      baseline: BASELINE,
    });
    expect(r.output).toContain('INFRA FAILURE: audit');
    expect(r.infra).toBe('1');
  });

  it('accepts a valid report with zero counts and exit 0', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 } },
      }),
      exitCode: 0,
      baseline: BASELINE,
    });
    expect(r.output).toContain('critical=0 high=0 moderate=0 low=0');
    expect(r.infra).toBe('0');
    expect(r.newfail).toBe('0');
    expect(fs.readFileSync(path.join(r.outDir, 'audit.txt'), 'utf8').trim()).toBe(
      'critical=0 high=0 moderate=0 low=0',
    );
  });

  it('accepts valid nonzero counts below the baseline and exit 1', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 1, high: 10, moderate: 20, low: 3 } },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain('critical=1 high=10 moderate=20 low=3');
    expect(r.infra).toBe('0');
    expect(r.newfail).toBe('0');
  });

  it('flags valid nonzero counts above the baseline and exit 1', () => {
    const r = runAuditCase({
      response: JSON.stringify({
        metadata: { vulnerabilities: { critical: 3, high: 17, moderate: 18, low: 5 } },
      }),
      exitCode: 1,
      baseline: BASELINE,
    });
    expect(r.output).toContain('NEW FAILURE: audit critical 2 -> 3');
    expect(r.infra).toBe('0');
    expect(r.newfail).toBe('1');
  });
});

describe('gates.sh repository root (#4)', () => {
  it('resolves the root from the script location and writes results under it', () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, { HEAVY_RUN: wrapper });
    expect(r.status, r.output).toBe(0);
    expect(r.output).toContain('NEWFAIL=0');
    const results = path.join(repo, 'measure', 'runs', TRACK_SLUG, 'gates', 'scripttest');
    expect(fs.existsSync(path.join(results, 'lint.exit'))).toBe(true);
    expect(fs.readFileSync(path.join(results, 'lint.exit'), 'utf8')).toContain('apps/x 0');
    expect(fs.existsSync(path.join(cwd, 'measure'))).toBe(false);
    expect(
      fs.existsSync(path.join(REPO_ROOT, 'measure', 'runs', TRACK_SLUG, 'gates', 'scripttest')),
    ).toBe(false);
  });

  it('fails with a clear message when the heavy-job wrapper is missing', () => {
    const repo = makeFakeRepo();
    const cwd = makeTempDir('gates-cwd-');
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, {
      HEAVY_RUN: '/nonexistent/heavy-run.sh',
    });
    expect(r.status).toBe(2);
    expect(r.output).toContain('heavy-run.sh not found');
  });

  it('fails with a clear message when the root has no package.json', () => {
    const repo = makeFakeRepo(false);
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, { HEAVY_RUN: wrapper });
    expect(r.status).toBe(2);
    expect(r.output).toContain('package.json');
  });
});

// The r5 workspace-set rule (strategy 14.4). A base workspace that the run lacks, or a run
// workspace that the base lacks, is a new failure. The existing repository-root case above
// covers the missing base (NEWFAIL=0).
describe('gates.sh workspace set (#5)', () => {
  function seedBase(repo: string, name: string, names: string[]): string {
    const base = path.join(repo, 'measure', 'runs', TRACK_SLUG, 'gates', name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, 'lint.exit'), names.map((n) => `${n} 0`).join('\n') + '\n');
    return name;
  }

  it('flags a base workspace that the run lacks', () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const base = seedBase(repo, 'base-superset', ['apps/x', 'apps/ghost']);
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain('NEW FAILURE: lint workspace set differs from the baseline:');
    expect(r.output).toContain('apps/ghost');
    expect(r.output).toContain('NEWFAIL=1');
  });

  it('flags a run workspace that the base lacks', () => {
    const repo = makeFakeRepo();
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const base = seedBase(repo, 'base-subset', ['apps/ghost']);
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain('NEW FAILURE: lint workspace set differs from the baseline:');
    expect(r.output).toContain('apps/x');
    expect(r.output).toContain('NEWFAIL=1');
  });
});

// The S3 errno guard (strategy 16.7). A job log that names ENOSPC or EDQUOT is
// an infrastructure failure, not a new diagnostic. A normal TS2322 line stays a
// new failure. The first two cases fail before the gates.sh change and pass
// after it; the third passes both before and after (it guards against
// over-classification).
describe('gates.sh errno classification (S3)', () => {
  // A fake repo whose only lint script prints `line` and exits 1.
  function makeErrnoRepo(line: string): string {
    const tmp = makeTempDir('gates-errno-');
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({ name: 'fake-repo', private: true, workspaces: ['apps/*', 'packages/*'] }),
    );
    const trackDir = path.join(tmp, 'measure', 'tracks', TRACK_SLUG);
    fs.mkdirSync(trackDir, { recursive: true });
    fs.copyFileSync(GATES_SH, path.join(trackDir, 'gates.sh'));
    const appDir = path.join(tmp, 'apps', 'x');
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, 'package.json'),
      JSON.stringify({
        name: 'fake-x',
        private: true,
        scripts: { lint: `node -e 'console.log(${JSON.stringify(line)}); process.exit(1)'` },
      }),
    );
    return tmp;
  }

  // A heavy-job wrapper that really runs the command, so the job log holds the
  // lint output. The other wrapper in this file exits 0 without running it.
  function makeExecWrapper(): string {
    const tmp = makeTempDir('gates-exec-wrapper-');
    const wrapper = path.join(tmp, 'heavy-run.sh');
    fs.writeFileSync(wrapper, '#!/usr/bin/env bash\n"$@"\n');
    fs.chmodSync(wrapper, 0o755);
    return wrapper;
  }

  function seedOkBase(repo: string, name: string): string {
    const base = path.join(repo, 'measure', 'runs', TRACK_SLUG, 'gates', name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(path.join(base, 'lint.exit'), 'apps/x 0\n');
    fs.writeFileSync(path.join(base, 'lint-x.log'), '');
    return name;
  }

  function runErrnoGate(repo: string, extraEnv: NodeJS.ProcessEnv = {}) {
    const wrapper = makeExecWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    return runGate(gatesSh, 'lint', 'scripttest', cwd, { HEAVY_RUN: wrapper, ...extraEnv });
  }

  it('classifies an ENOSPC job log as infrastructure', () => {
    const repo = makeErrnoRepo('ENOSPC: no space left on device, write');
    const r = runErrnoGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain('INFRA FAILURE:');
    expect(r.output).toContain('INFRA=1');
    expect(r.output).not.toContain('NEW FAILURE');
  });

  it('classifies an EDQUOT job log as infrastructure', () => {
    const repo = makeErrnoRepo('EDQUOT: disk quota exceeded');
    const r = runErrnoGate(repo);
    expect(r.status, r.output).toBe(3);
    expect(r.output).toContain('INFRA FAILURE:');
    expect(r.output).toContain('INFRA=1');
    expect(r.output).not.toContain('NEW FAILURE');
  });

  it('still reports a normal TS2322 line as a new failure, not infrastructure', () => {
    const repo = makeErrnoRepo(
      "probe.ts(1,14): error TS2322: Type 'string' is not assignable to type 'number'.",
    );
    const base = seedOkBase(repo, 'base-ok');
    const r = runErrnoGate(repo, { GATES_BASE: base });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain('NEWFAIL=1');
    expect(r.output).not.toContain('INFRA=1');
  });
});
// The S1 adversarial cases for the sweep (strategy 13.7, R18: no app is ever excluded
// from a gate to make the phase pass). Each case seeds the named exclusion in a fake
// repository and asserts that gates.sh reports a new failure. The allowed outcome of the
// attack is never an exclusion.
describe('S1 adversarial: gates.sh workspace set', () => {
  // A fake repo whose tree the sweep visits. `lintScripts` maps a workspace name to
  // whether its package.json has a lint script.
  function makeAdvRepo(lintScripts: Record<string, boolean>): string {
    const tmp = makeTempDir('gates-adv-');
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({ name: 'fake-repo', private: true }),
    );
    const trackDir = path.join(tmp, 'measure', 'tracks', TRACK_SLUG);
    fs.mkdirSync(trackDir, { recursive: true });
    fs.copyFileSync(GATES_SH, path.join(trackDir, 'gates.sh'));
    for (const [name, hasLint] of Object.entries(lintScripts)) {
      const dir = path.join(tmp, 'apps', name);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify({
          name: `fake-${name}`,
          private: true,
          scripts: hasLint ? { lint: 'node --version' } : {},
        }),
      );
    }
    return tmp;
  }

  function seedExitFile(repo: string, name: string, rows: Array<[string, string]>): string {
    const base = path.join(repo, 'measure', 'runs', TRACK_SLUG, 'gates', name);
    fs.mkdirSync(base, { recursive: true });
    fs.writeFileSync(
      path.join(base, 'lint.exit'),
      rows.map(([ws, code]) => `${ws} ${code}`).join('\n') + '\n',
    );
    return name;
  }

  it('adv 6 (R18): a sweep whose tree drops apps/danielson reports a new failure that names it', () => {
    // The attack: the run tree holds apps/x only; the baseline holds apps/danielson too.
    const repo = makeAdvRepo({ x: true });
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const base = seedExitFile(repo, 'base-with-danielson', [
      ['apps/x', '0'],
      ['apps/danielson', '0'],
    ]);
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain('NEW FAILURE: lint workspace set differs from the baseline:');
    expect(r.output).toContain('apps/danielson');
    expect(r.output).toContain('NEWFAIL=1');
  });

  it('adv 7 (R18, A4): removing the danielson lint script is a new failure, not a pass', () => {
    // The attack: apps/danielson stays in the tree, but its lint script is removed, so
    // the sweep records n/a. Section 7 counts a removed script as a new failure.
    const repo = makeAdvRepo({ x: true, danielson: false });
    const wrapper = makeFakeWrapper();
    const cwd = makeTempDir('gates-cwd-');
    const base = seedExitFile(repo, 'base-danielson-lints', [
      ['apps/x', '0'],
      ['apps/danielson', '0'],
    ]);
    const gatesSh = path.join(repo, 'measure', 'tracks', TRACK_SLUG, 'gates.sh');
    const r = runGate(gatesSh, 'lint', 'scripttest', cwd, {
      HEAVY_RUN: wrapper,
      GATES_BASE: base,
    });
    expect(r.status, r.output).toBe(1);
    expect(r.output).toContain('NEW FAILURE: lint script removed in apps/danielson');
    expect(r.output).toContain('NEWFAIL=1');
  });
});
