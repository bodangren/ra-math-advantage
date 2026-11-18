import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { load as loadYaml } from 'js-yaml';

// Resolve from the test file, never from the working folder (lessons-learned 2026-05-03).
// This file reads nothing under measure/tracks/ (closeout moves the track folder).
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOOL_TIMEOUT_MS = 120000;
const ABSENT_TOOL_PHRASES = ['npx canceled', 'missing packages', 'command not found'];

type Json = Record<string, unknown>;

function readJson(file: string): Json {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Json;
}

// Strip comments and trailing commas from a tsconfig, without touching string contents.
function parseJsonc(text: string): Json {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inString) {
      out += c;
      if (c === '\\') {
        out += n ?? '';
        i++;
      } else if (c === '"') {
        inString = false;
      }
    } else if (c === '"') {
      inString = true;
      out += c;
    } else if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (c === '/' && n === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
    } else {
      out += c;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1')) as Json;
}

function listDirs(parent: string): string[] {
  const abs = path.join(REPO_ROOT, parent);
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(abs, d.name, 'package.json')))
    .map((d) => path.join(abs, d.name))
    .sort();
}

const APP_DIRS = listDirs('apps');
const PACKAGE_DIRS = listDirs('packages');
const IM3_DIR = path.join(REPO_ROOT, 'apps', 'integrated-math-3');
const APP_SHELL_DIR = path.join(REPO_ROOT, 'packages', 'app-shell');
// The folders that case 1 and case 2 check: the root, each app, and the shared shell package.
const RESOLVE_FROM_DIRS = [REPO_ROOT, ...APP_DIRS, APP_SHELL_DIR];

// Find `node_modules/<name>/package.json` the way module resolution does: walk up from
// `fromDir`. This does not use `require.resolve`, because vinext 1.x has no
// `./package.json` entry in its `exports` map.
function findInstalledPackageJson(fromDir: string, name: string): string | null {
  let dir = fromDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name, 'package.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function relative(file: string): string {
  return path.relative(REPO_ROOT, file) || '.';
}

// The five manifest fields that a dependency scan reads.
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
];

type ManifestEntry = { display: string; manifest: Json };

// `next` also appears under a nested override key such as `next@16` (case 3).
const isNextKey = (key: string) => key === 'next' || key.startsWith('next@');

// Collect each place that a manifest set declares a name that `isKey` accepts, including
// nested override objects. One scanner serves case 3 and case 9 (strategy 14.3, Q1).
function scanDeclarations(entries: ManifestEntry[], isKey: (key: string) => boolean): string[] {
  const found: string[] = [];
  const walk = (value: unknown, trail: string, display: string) => {
    if (value === null || typeof value !== 'object') return;
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

function makeProbeProject(files: Record<string, string>, tsconfig: Json): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-gate-'));
  tempDirs.push(tmp);
  fs.symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(tmp, name), content);
  }
  fs.writeFileSync(path.join(tmp, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  return tmp;
}

function runTool(args: string[]): { status: number | null; output: string } {
  const result = spawnSync('npx', ['--no-install', ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: TOOL_TIMEOUT_MS,
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`,
  };
}

// The S1 type-check command for a probe (the S3 Red commit changes it to the tsrs command).
function typecheckProbe(tmp: string) {
  return runTool(['tsc', '-p', path.join(tmp, 'tsconfig.json')]);
}

function probeTsconfig(files: string[]): Json {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'esnext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ['vinext/types'],
    },
    files,
  };
}

const VALID_NEXT_PROBE = [
  "import type { NextConfig } from 'next';",
  "import Link from 'next/link';",
  "import { useRouter } from 'next/navigation';",
  '',
  'export const config: NextConfig = {};',
  '',
  'export function Probe() {',
  '  const router = useRouter();',
  "  router.push('/probe');",
  "  return <Link href=\"/probe\">probe</Link>;",
  '}',
  '',
].join('\n');

const INVALID_ARGS_PROBE = [
  "import Link from 'next/link';",
  "import { useRouter } from 'next/navigation';",
  '',
  'export function Probe() {',
  '  const router = useRouter();',
  '  router.push(123);',
  '  return <Link />;',
  '}',
  '',
].join('\n');

const MISSING_MODULE_PROBE = [
  "import Link from 'next/link';",
  "import x from 'next/does-not-exist';",
  '',
  'export const probe = [Link, x];',
  '',
].join('\n');

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('S1 vinext 1.x', () => {
  it('case 1: vinext resolves to a 1.x release from the root, each app, and app-shell', () => {
    expect(APP_DIRS.map(relative)).toContain('apps/integrated-math-3');
    // Sentinel: the app set is read from the disk, and it holds the sixth app (A4).
    expect(APP_DIRS.map(relative)).toContain('apps/danielson');
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
    const majors: Record<string, number> = {};
    for (const dir of RESOLVE_FROM_DIRS) {
      const found = findInstalledPackageJson(dir, 'vinext');
      expect(found, `vinext does not resolve from ${relative(dir)}`).not.toBeNull();
      const version = String(readJson(found as string).version);
      majors[relative(dir)] = Number.parseInt(version.split('.')[0], 10);
    }
    const notOne = Object.entries(majors).filter(([, major]) => major !== 1);
    expect(notOne, `folders that resolve a vinext release that is not 1.x`).toEqual([]);
  });

  it('case 2: vinext resolves, and next does not resolve, from the root, each app, and app-shell', () => {
    const resolvedNext: string[] = [];
    const nodeResolvable: string[] = [];
    for (const dir of RESOLVE_FROM_DIRS) {
      // Paired precondition: the neighbor package resolves. Without it, a missing
      // node_modules would pass this case for the wrong reason (A4).
      expect(
        findInstalledPackageJson(dir, 'vinext'),
        `precondition: vinext does not resolve from ${relative(dir)}`,
      ).not.toBeNull();
      const nextFound = findInstalledPackageJson(dir, 'next');
      if (nextFound) resolvedNext.push(`${relative(dir)} -> ${relative(nextFound)}`);
      try {
        createRequire(path.join(dir, 'package.json')).resolve('next/package.json');
        nodeResolvable.push(relative(dir));
      } catch (error) {
        expect((error as NodeJS.ErrnoException).code).toBe('MODULE_NOT_FOUND');
      }
    }
    expect(resolvedNext, 'folders where next is installed').toEqual([]);
    expect(nodeResolvable, 'folders where require.resolve finds next/package.json').toEqual([]);
  });

  it('case 3: no manifest declares next', () => {
    const manifests = [
      path.join(REPO_ROOT, 'package.json'),
      ...APP_DIRS.map((d) => path.join(d, 'package.json')),
      ...PACKAGE_DIRS.map((d) => path.join(d, 'package.json')),
    ];
    // Sentinel: the scan read the manifests that matter (A4). The count covers the root,
    // 6 apps, and 21 packages.
    expect(manifests).toContain(path.join(IM3_DIR, 'package.json'));
    expect(manifests).toContain(path.join(APP_SHELL_DIR, 'package.json'));
    expect(manifests).toContain(path.join(REPO_ROOT, 'apps', 'danielson', 'package.json'));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const declarations = scanDeclarations(manifestEntries(manifests), isNextKey);
    expect(declarations, 'manifest fields that declare next').toEqual([]);
  });

  it('case 4: each app and app-shell tsconfig loads vinext/types and has no next plugin', () => {
    const tsconfigs = [...APP_DIRS, APP_SHELL_DIR].map((d) => path.join(d, 'tsconfig.json'));
    // Sentinel: 6 apps plus the shared shell package (A4).
    expect(tsconfigs.length).toBeGreaterThanOrEqual(7);
    const missingTypes: string[] = [];
    const nextPlugins: string[] = [];
    for (const file of tsconfigs) {
      const options = (parseJsonc(fs.readFileSync(file, 'utf8')).compilerOptions ?? {}) as Json;
      const types = Array.isArray(options.types) ? (options.types as string[]) : [];
      if (!types.includes('vinext/types')) missingTypes.push(relative(file));
      const plugins = Array.isArray(options.plugins) ? (options.plugins as Json[]) : [];
      if (plugins.some((plugin) => plugin.name === 'next')) nextPlugins.push(relative(file));
    }
    expect(missingTypes, 'tsconfig files without vinext/types in compilerOptions.types').toEqual([]);
    expect(nextPlugins, 'tsconfig files with the { "name": "next" } plugin').toEqual([]);
  });

  it(
    'case 5: a probe that imports next, next/link, and next/navigation type-checks with exit 0',
    () => {
      expect(runTool(['tsc', '--version']).status, 'precondition: tsc --version').toBe(0);
      const tmp = makeProbeProject({ 'probe.tsx': VALID_NEXT_PROBE }, probeTsconfig(['probe.tsx']));
      const { status, output } = typecheckProbe(tmp);
      expect(output).not.toContain('TS2688');
      expect(status, output).toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    'case 5b: the next types are strict: Link without href and push(123) fail to type-check',
    () => {
      expect(runTool(['tsc', '--version']).status, 'precondition: tsc --version').toBe(0);
      const tmp = makeProbeProject({ 'probe.tsx': INVALID_ARGS_PROBE }, probeTsconfig(['probe.tsx']));
      const { status, output } = typecheckProbe(tmp);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      // vinext/types must resolve, and next/* must resolve. If the types were `any`, no
      // TS2741 and no TS2345 would appear.
      expect(output, 'vinext/types did not resolve').not.toContain('TS2688');
      expect(output).not.toContain('TS2307');
      expect(status, output).not.toBe(0);
      expect(output, 'expected TS2741 (missing href) or TS2345 (push(123))').toMatch(/TS2741|TS2345/);
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    'case 6: a probe that imports next/does-not-exist fails with TS2307, and next/link still resolves',
    () => {
      expect(runTool(['tsc', '--version']).status, 'precondition: tsc --version').toBe(0);
      const tmp = makeProbeProject({ 'probe.ts': MISSING_MODULE_PROBE }, probeTsconfig(['probe.ts']));
      const { status, output } = typecheckProbe(tmp);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      // At Red, an unresolved vinext/types gives TS2688. Without this rule, the case
      // would fail for the wrong reason.
      expect(output, 'vinext/types did not resolve').not.toContain('TS2688');
      expect(status, output).not.toBe(0);
      expect(output).toMatch(/TS2307/);
      expect(output).toContain('next/does-not-exist');
      // Paired neighbor: the valid import of next/link has no error.
      const linkErrors = output.split('\n').filter((line) => line.includes("'next/link'"));
      expect(linkErrors, 'next/link must resolve').toEqual([]);
    },
    TOOL_TIMEOUT_MS,
  );

  it('case 7: each setup-node step in the workflows uses Node 24', () => {
    const workflowDir = path.join(REPO_ROOT, '.github', 'workflows');
    const files = fs.readdirSync(workflowDir).filter((f) => /\.ya?ml$/.test(f)).sort();
    const stepsByFile: Record<string, number> = {};
    const wrongNode: string[] = [];
    for (const file of files) {
      const doc = loadYaml(fs.readFileSync(path.join(workflowDir, file), 'utf8')) as {
        jobs?: Record<string, { steps?: Array<{ uses?: string; with?: Record<string, unknown> }> }>;
      };
      stepsByFile[file] = 0;
      for (const [jobName, job] of Object.entries(doc.jobs ?? {})) {
        for (const step of job.steps ?? []) {
          if (typeof step.uses !== 'string' || !step.uses.startsWith('actions/setup-node')) continue;
          stepsByFile[file] += 1;
          const raw = String(step.with?.['node-version'] ?? '');
          const major = Number.parseInt(raw.replace(/^v/, '').split('.')[0], 10);
          if (major !== 24) wrongNode.push(`${file}:${jobName} node-version='${raw}'`);
        }
      }
    }
    // Sentinel: the parse produced one entry for each file on the disk (A4). A filter that
    // drops a workflow fails here, not only on the content check.
    expect(Object.keys(stepsByFile).sort(), 'workflow files read').toEqual(files);
    // Sentinels: the two workflows that the plan edits each have a setup-node step, and
    // jsdoc-typed-params.yml has none. The zero proves that the parse read that file.
    expect(stepsByFile['ci.yml'] ?? 0).toBeGreaterThanOrEqual(1);
    expect(stepsByFile['cloudflare-deploy.yml'] ?? 0).toBeGreaterThanOrEqual(1);
    expect(stepsByFile['jsdoc-typed-params.yml'] ?? -1).toBe(0);
    expect(wrongNode, 'setup-node steps with a node-version that is not 24').toEqual([]);
  });

  it('case 8: the lockfile has no next package and no workspace entry that lists next', () => {
    const lock = readJson(path.join(REPO_ROOT, 'package-lock.json')) as LockfilePackages;
    const keys = Object.keys(lock.packages);
    // Sentinel: the lockfile has the workspace entries that the check reads (A4).
    expect(keys).toContain('apps/integrated-math-3');
    expect(keys).toContain('packages/app-shell');
    const { nextKeys, vinextKeys, workspaceListing } = scanLockfileNextHygiene(lock);
    expect(nextKeys, 'lockfile package keys that end with node_modules/next').toEqual([]);
    // A nested copy shadows the root vinext at runtime (risk R16). The only key that ends
    // with node_modules/vinext is the root one.
    expect(
      vinextKeys,
      'lockfile package keys that end with node_modules/vinext',
    ).toEqual(['node_modules/vinext']);
    expect(workspaceListing, 'lockfile workspace entries that list next').toEqual([]);
  });

  it('case 9: no manifest or lockfile workspace entry declares eslint or @eslint/js', () => {
    const manifests = [
      path.join(REPO_ROOT, 'package.json'),
      ...APP_DIRS.map((d) => path.join(d, 'package.json')),
      ...PACKAGE_DIRS.map((d) => path.join(d, 'package.json')),
    ];
    // The same sentinels as case 3 (A4).
    expect(manifests).toContain(path.join(APP_SHELL_DIR, 'package.json'));
    expect(manifests).toContain(path.join(REPO_ROOT, 'apps', 'danielson', 'package.json'));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const isLintPackage = (key: string) => key === 'eslint' || key === '@eslint/js';
    // (a) No workspace manifest declares either name, nested overrides included.
    const declared = scanDeclarations(manifestEntries(manifests), isLintPackage);
    expect(declared, 'manifest fields that declare eslint or @eslint/js').toEqual([]);
    // (b) No lockfile workspace entry lists either name. Those entries are the lockfile copy
    // of the manifests. (c) This case asserts nothing about keys under node_modules/. The
    // two packages stay as peer copies of the React ESLint plugins (strategy 14.2).
    const lock = readJson(path.join(REPO_ROOT, 'package-lock.json')) as {
      packages: Record<string, Record<string, unknown>>;
    };
    const listing: string[] = [];
    for (const [key, entry] of Object.entries(lock.packages)) {
      if (key.includes('node_modules/')) continue;
      for (const field of DEPENDENCY_FIELDS.slice(0, 4)) {
        const map = (entry[field] ?? {}) as Record<string, string>;
        for (const name of ['eslint', '@eslint/js']) {
          if (name in map) listing.push(`${key || '(root)'}:${field}.${name}`);
        }
      }
    }
    expect(listing, 'lockfile workspace entries that list eslint or @eslint/js').toEqual([]);
  });

  it('case 9b: the case 9 scan reports exactly the two seeded faults', () => {
    // Seeded fault: one workspace declares eslint, and the root overrides @eslint/js. This
    // proves that case 9 can fail (A4).
    const isLintPackage = (key: string) => key === 'eslint' || key === '@eslint/js';
    const hits = scanDeclarations(
      [
        { display: 'package.json', manifest: { overrides: { '@eslint/js': '^10.0.0' } } },
        { display: 'apps/x/package.json', manifest: { devDependencies: { eslint: '^10.0.0' } } },
      ],
      isLintPackage,
    );
    expect(hits).toEqual([
      'apps/x/package.json:devDependencies.eslint',
      'package.json:overrides.@eslint/js',
    ]);
  });
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
  const nextKeys = keys.filter((key) => key.endsWith('node_modules/next'));
  const vinextKeys = keys.filter((key) => key.endsWith('node_modules/vinext'));
  const workspaceKeys = keys.filter((key) => !key.includes('node_modules/'));
  const workspaceListing: string[] = [];
  for (const key of workspaceKeys) {
    const entry = lock.packages[key];
    for (const field of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      const map = (entry[field] ?? {}) as Record<string, string>;
      if ('next' in map) workspaceListing.push(`${key || '(root)'}:${field}`);
    }
  }
  return { nextKeys, vinextKeys, workspaceListing };
}

// The S1 adversarial cases (strategy 13.7 row "Adversarial", risks R1, R3, R16, R18).
// Each case seeds a fault in a temp folder or in memory, runs the same scanner that the
// S1 guard uses, and asserts that the guard reports the fault. A guard that cannot fail
// is vacuous (A4). No case edits a real manifest, lockfile, or node_modules folder.
describe('S1 adversarial', () => {
  // A temp tree helper for the resolution attacks. Each folder gets a package.json so
  // that createRequire can resolve from it.
  function writeTempPackage(dir: string, manifest: Record<string, unknown> = {}) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest));
  }

  function writeTempInstalled(dir: string, name: string, version: string) {
    const pkgDir = path.join(dir, 'node_modules', name);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({ name, version }));
  }

  it('adv 1 (R1): the case 2 walker and require.resolve catch a hoisted next copy in a temp tree', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-adv-'));
    tempDirs.push(tmp);
    writeTempPackage(tmp, { name: 'adv-root', private: true });
    // The seeded fault: a hoisted next copy, for example re-installed by an auto-installed
    // peer (the geist path of the S1 Implement task).
    writeTempInstalled(tmp, 'vinext', '1.4.5');
    writeTempInstalled(tmp, 'next', '16.2.7');
    const appDirs = ['integrated-math-3', 'danielson'].map((name) => {
      const dir = path.join(tmp, 'apps', name);
      writeTempPackage(dir, { name, private: true });
      return dir;
    });
    const shellDir = path.join(tmp, 'packages', 'app-shell');
    writeTempPackage(shellDir, { name: '@math-platform/app-shell', private: true });
    for (const dir of [tmp, ...appDirs, shellDir]) {
      // Paired precondition: vinext resolves from the same folders (strategy section 5).
      const vinext = findInstalledPackageJson(dir, 'vinext');
      expect(vinext, `precondition: vinext does not resolve from ${dir}`).not.toBeNull();
      expect(Number.parseInt(String(readJson(vinext as string).version).split('.')[0], 10)).toBe(1);
      // The guard logic of case 2 reports the hoisted copy from every workspace depth.
      expect(findInstalledPackageJson(dir, 'next'), `walker missed next from ${dir}`).not.toBeNull();
      const resolved = createRequire(path.join(dir, 'package.json')).resolve('next/package.json');
      expect(resolved).toContain(path.join('node_modules', 'next', 'package.json'));
    }
    // Paired control on the real tree: no folder resolves next at HEAD (guard holds).
    for (const dir of RESOLVE_FROM_DIRS) {
      expect(findInstalledPackageJson(dir, 'next'), `real tree resolved next from ${relative(dir)}`).toBeNull();
    }
  });

  it('adv 2 (R16, R18): a nested 0.x vinext copy under apps/danielson is caught only when danielson is scanned', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-adv-'));
    tempDirs.push(tmp);
    writeTempPackage(tmp, { name: 'adv-root', private: true });
    writeTempInstalled(tmp, 'vinext', '1.4.5');
    for (const name of ['danielson', 'other']) writeTempPackage(path.join(tmp, 'apps', name));
    // The seeded fault: the pre-merge state of apps/danielson, a nested 0.0.55 copy that
    // shadows the root 1.x release at runtime.
    writeTempInstalled(path.join(tmp, 'apps', 'danielson'), 'vinext', '0.0.55');
    // The scan set is read from the disk, the same rule as APP_DIRS (strategy section 5).
    const advAppDirs = fs
      .readdirSync(path.join(tmp, 'apps'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(tmp, 'apps', d.name, 'package.json')))
      .map((d) => path.join(tmp, 'apps', d.name))
      .sort();
    expect(advAppDirs.map((dir) => path.relative(tmp, dir))).toEqual([
      'apps/danielson',
      'apps/other',
    ]);
    const majorsOf = (dirs: string[]) => {
      const majors: Record<string, number> = {};
      for (const dir of dirs) {
        const found = findInstalledPackageJson(dir, 'vinext');
        expect(found, `vinext does not resolve from ${dir}`).not.toBeNull();
        majors[path.relative(tmp, dir)] = Number.parseInt(String(readJson(found as string).version).split('.')[0], 10);
      }
      return Object.entries(majors)
        .filter(([, major]) => major !== 1)
        .map(([rel]) => rel);
    };
    // The disk-read scan reports the fault: case 1 fails under the seeded copy.
    expect(majorsOf(advAppDirs), 'disk-read scan must report the nested 0.x copy').toEqual([
      'apps/danielson',
    ]);
    // The attack: a scan set that drops apps/danielson reports nothing. The fault hides in
    // the excluded folder, so the case 1 sentinel that pins apps/danielson into the
    // disk-read set is the load-bearing defense.
    const filteredDirs = advAppDirs.filter((dir) => path.basename(dir) !== 'danielson');
    expect(majorsOf(filteredDirs), 'a danielson-filtered scan hides the fault').toEqual([]);
    // The sentinel holds at HEAD: the real APP_DIRS is read from the disk and holds danielson.
    expect(APP_DIRS.map(relative)).toContain('apps/danielson');
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
  });

  it('adv 3 (R1): the case 3 scan reports a next declaration in each manifest field and a nested next@ override', () => {
    // Seeded faults in memory: a next declaration in each of the five manifest fields,
    // plus a nested override key that carries a version suffix. A scanner weakened to
    // two fields, or blind to nested override keys, misses a hit (A4).
    const hits = scanDeclarations(
      [
        {
          display: 'package.json',
          manifest: {
            devDependencies: { next: '^16.0.0' },
            overrides: { next: '^16.0.0', 'next@16.2.7': { conflicts: ['eslint'] } },
          },
        },
        { display: 'apps/danielson/package.json', manifest: { dependencies: { next: '^16.0.0' } } },
        { display: 'packages/app-shell/package.json', manifest: { peerDependencies: { next: '^16' } } },
        { display: 'packages/x/package.json', manifest: { optionalDependencies: { next: '^16' } } },
      ],
      isNextKey,
    );
    expect(hits, 'the scan must report every seeded next declaration').toEqual([
      'apps/danielson/package.json:dependencies.next',
      'package.json:devDependencies.next',
      'package.json:overrides.next',
      'package.json:overrides.next@16.2.7',
      'packages/app-shell/package.json:peerDependencies.next',
      'packages/x/package.json:optionalDependencies.next',
    ]);
  });

  it('adv 4 (R1, R16): the case 8 scan reports a lockfile next key, a nested vinext key, and a workspace entry that lists next', () => {
    // Seeded faults in memory: the pre-merge lockfile shape. Each rule of case 8 has one
    // fault, and each rule must report it.
    const seeded: LockfilePackages = {
      packages: {
        '': { devDependencies: { vinext: '^1.4.5' } },
        'node_modules/vinext': { version: '1.4.5' },
        'node_modules/next': { version: '16.2.7' },
        'apps/danielson': { optionalDependencies: { next: '16.2.7' } },
        'apps/danielson/node_modules/vinext': { version: '0.0.55' },
        'apps/danielson/node_modules/next': { version: '16.2.7' },
      },
    };
    const { nextKeys, vinextKeys, workspaceListing } = scanLockfileNextHygiene(seeded);
    expect([...nextKeys].sort(), 'the no-next-key rule must report both seeded keys').toEqual([
      'apps/danielson/node_modules/next',
      'node_modules/next',
    ]);
    expect([...vinextKeys].sort(), 'the nested-vinext rule must report the 0.0.55 copy').toEqual([
      'apps/danielson/node_modules/vinext',
      'node_modules/vinext',
    ]);
    // The guard is not vacuous: the seeded vinext key set is not the allowed single key.
    expect([...vinextKeys].sort()).not.toEqual(['node_modules/vinext']);
    expect(workspaceListing, 'the workspace-listing rule must report the seeded entry').toEqual([
      'apps/danielson:optionalDependencies',
    ]);
  });

  it(
    'adv 5 (R3): with any-typed next modules the invalid probe passes, so the case 5b guard fails on the fault',
    () => {
      expect(runTool(['tsc', '--version']).status, 'precondition: tsc --version').toBe(0);
      // The attack probe uses no JSX, so no React types are needed.
      const anyAttackProbe = [
        "import { useRouter } from 'next/navigation';",
        '',
        'export function Probe() {',
        '  const router = useRouter();',
        '  router.push(123);',
        '  return null;',
        '}',
        '',
      ].join('\n');
      // The seeded fault: shorthand ambient modules make every next/* import `any`.
      // This is the degradation that would make the S1 type gate vacuous.
      const tsconfig = probeTsconfig(['probe.ts', 'next-any.d.ts']);
      (tsconfig.compilerOptions as Json).types = [];
      const tmp = makeProbeProject(
        { 'probe.ts': anyAttackProbe, 'next-any.d.ts': "declare module 'next/navigation';\n" },
        tsconfig,
      );
      const attack = typecheckProbe(tmp);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(attack.output).not.toContain(phrase);
      expect(attack.output).not.toContain('TS2688');
      expect(attack.output).not.toContain('TS2307');
      // Under the any fault the probe passes with no TS2345. The case 5b guard asserts
      // the opposite (non-zero exit, TS2741 or TS2345), so the guard fails here: the
      // attack cannot produce a false green.
      expect(attack.status, 'the any fault must make the probe pass').toBe(0);
      expect(attack.output).not.toMatch(/TS2741|TS2345/);
      // Paired control: the real vinext/types are strict, so the same probe fails.
      const real = makeProbeProject({ 'probe.ts': anyAttackProbe }, probeTsconfig(['probe.ts']));
      const realRun = typecheckProbe(real);
      expect(realRun.output, 'vinext/types did not resolve').not.toContain('TS2688');
      expect(realRun.status, realRun.output).not.toBe(0);
      expect(realRun.output, 'the real types must reject push(123) with TS2345').toMatch(/TS2345/);
    },
    TOOL_TIMEOUT_MS,
  );
});

// The five ESLint-family names that S2 removes from the manifests (plan S2 case 1).
const ESLINT_FAMILY = [
  'eslint',
  'typescript-eslint',
  'eslint-config-next',
  '@eslint/js',
  '@eslint/eslintrc',
];

// An override key such as `eslint@10` carries the same name with a version suffix.
const isEslintFamily = (key: string): boolean =>
  ESLINT_FAMILY.some((name) => key === name || key.startsWith(`${name}@`));

const WORKSPACE_DIRS = [...APP_DIRS, ...PACKAGE_DIRS];

// Directory names that the recursive find skips. None holds a tracked config file.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'coverage',
  '.convex',
  'playwright-report',
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
  const scripts = (readJson(path.join(dir, 'package.json')).scripts ?? {}) as Record<string, string>;
  return typeof scripts.lint === 'string' ? scripts.lint : null;
}

type JsPluginEntry = { name?: string; specifier: string };

// The S2 case 9 scan. One hit for each clause (a), (b), (c) that the lockfile breaks.
// Clause (a): no ESLint config package. Clause (b): each ESLint copy is absent or peer-only.
// Clause (c): each jsPlugins specifier resolves from the repository root.
function scanLockfileLintHygiene(lock: Json, jsPlugins: JsPluginEntry[]): string[] {
  const packages = (lock.packages ?? {}) as Record<string, Json>;
  const keys = Object.keys(packages);
  const hits: string[] = [];
  for (const name of ['eslint-config-next', 'typescript-eslint']) {
    for (const key of keys) {
      if (key === `node_modules/${name}` || key.endsWith(`/node_modules/${name}`)) {
        hits.push(`a:${key}`);
      }
    }
  }
  for (const name of ['eslint', '@eslint/js', '@eslint/eslintrc']) {
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
  const dir = fs.mkdtempSync(path.join(REPO_ROOT, 'apps', '.oxlint-probe-'));
  tempDirs.push(dir);
  const file = path.join(dir, 'probe.ts');
  fs.writeFileSync(file, content);
  return file;
}

function runOxlintProbe(file: string) {
  return runTool([
    'oxlint',
    '--config',
    path.join(REPO_ROOT, '.oxlintrc.json'),
    '--max-warnings',
    '0',
    file,
  ]);
}

describe('S2 oxlint', () => {
  it('case 1: no manifest declares an ESLint package and the root overrides have no eslint key', () => {
    const manifests = [
      path.join(REPO_ROOT, 'package.json'),
      ...WORKSPACE_DIRS.map((dir) => path.join(dir, 'package.json')),
    ];
    // Sentinels: the scan read the root, 6 apps, and 21 packages (A4).
    expect(manifests).toContain(path.join(APP_SHELL_DIR, 'package.json'));
    expect(manifests).toContain(path.join(REPO_ROOT, 'apps', 'danielson', 'package.json'));
    expect(manifests.length).toBeGreaterThanOrEqual(28);
    const declarations = scanDeclarations(manifestEntries(manifests), isEslintFamily);
    expect(declarations, 'manifest fields that declare an ESLint package').toEqual([]);
    const root = readJson(path.join(REPO_ROOT, 'package.json'));
    const overrideKeys = Object.keys((root.overrides ?? {}) as Json);
    expect(overrideKeys, 'keys of the root overrides').not.toContain('eslint');
  });

  it('case 2: no eslint.config.* file exists under apps/ or packages/', () => {
    // Sentinel: the same walk finds the manifest of each app, so an empty result is real (A4).
    const appManifests = findFiles(path.join(REPO_ROOT, 'apps'), (name) => name === 'package.json');
    expect(appManifests.length).toBeGreaterThanOrEqual(APP_DIRS.length);
    expect(APP_DIRS.length).toBeGreaterThanOrEqual(6);
    const configs = WORKSPACE_DIRS.flatMap((dir) =>
      findFiles(dir, (name) => /^eslint\.config\./.test(name)),
    );
    expect(configs.map(relative), 'files named eslint.config.* in the workspaces').toEqual([]);
  });

  it('case 3: each workspace lint script is the target form, and only the root config exists', () => {
    const entries = WORKSPACE_DIRS.map((dir) => ({
      dir,
      rel: relative(dir),
      lint: lintScript(dir),
    })).filter((entry): entry is { dir: string; rel: string; lint: string } => entry.lint !== null);
    // Sentinels: 27 workspaces have a lint script, and the template package is one of them.
    expect(entries.length).toBeGreaterThanOrEqual(27);
    expect(entries.map((entry) => entry.rel)).toContain('packages/_template');
    expect(entries.map((entry) => entry.rel)).toContain('apps/danielson');
    const wrong: string[] = [];
    for (const { rel, lint } of entries) {
      const violation = lintScriptForm(rel, lint);
      if (violation !== null) wrong.push(violation);
    }
    expect(wrong, 'lint scripts that are not in the target form').toEqual([]);
    // 26 of the 27 scripts name the root config. The template package is the exception.
    const named = entries.filter((entry) => entry.lint.includes('../../.oxlintrc.json'));
    expect(named.length, 'lint scripts that name ../../.oxlintrc.json').toBe(entries.length - 1);
    const configs = findFiles(REPO_ROOT, (name) => name === '.oxlintrc.json');
    expect(configs.map(relative), 'files named .oxlintrc.json outside node_modules').toEqual([
      '.oxlintrc.json',
    ]);
  });

  it(
    'case 4: the root config reports an unused variable in a workspace file with a non-zero exit',
    () => {
      expect(runTool(['oxlint', '--version']).status, 'precondition: oxlint --version').toBe(0);
      const file = makeLintProbe('const unused = 1;\n');
      const { status, output } = runOxlintProbe(file);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).not.toBe(0);
      expect(output).toContain('no-unused-vars');
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    'case 5: the same probe with an oxlint-disable comment on its first line exits 0',
    () => {
      expect(runTool(['oxlint', '--version']).status, 'precondition: oxlint --version').toBe(0);
      const file = makeLintProbe('/* oxlint-disable */\nconst unused = 1;\n');
      const { status, output } = runOxlintProbe(file);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(output).not.toContain(phrase);
      expect(status, output).toBe(0);
    },
    TOOL_TIMEOUT_MS,
  );

  it('case 9: the lockfile has no ESLint config package, and each jsPlugin resolves', () => {
    const lock = readJson(path.join(REPO_ROOT, 'package-lock.json'));
    const keys = Object.keys((lock.packages ?? {}) as Json);
    // Sentinels: the lockfile read the workspace entries that the check needs (A4).
    expect(keys).toContain('apps/integrated-math-3');
    expect(keys).toContain('packages/app-shell');
    const jsPlugins = (readJson(path.join(REPO_ROOT, '.oxlintrc.json')).jsPlugins ??
      []) as JsPluginEntry[];
    // K4 of strategy 14.2 records three jsPlugins entries at this HEAD.
    expect(jsPlugins.length, 'jsPlugins entries of the root config').toBeGreaterThanOrEqual(3);
    for (const plugin of jsPlugins) expect(typeof plugin.specifier).toBe('string');
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits, 'lockfile ESLint-hygiene hits').toEqual([]);
  });

  it('case 9b: the case 9 scan reports exactly the three seeded faults', () => {
    // One seeded fault for each clause: (a) typescript-eslint stays, (b) eslint is not
    // peer-only, and (c) a jsPlugins specifier has no lockfile key. The scan must report
    // all three, so case 9 cannot pass vacuously (A4).
    const jsPlugins: JsPluginEntry[] = [
      { name: 'react-js', specifier: 'eslint-plugin-react' },
      { name: 'missing-js', specifier: 'oxlint-plugin-missing' },
    ];
    const lock: Json = {
      packages: {
        '': {},
        'node_modules/eslint-plugin-react': { version: '7.37.5' },
        'node_modules/typescript-eslint': { version: '8.0.0' },
        'node_modules/eslint': { version: '9.0.0' },
      },
    };
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits).toHaveLength(3);
    expect(hits).toEqual([
      'a:node_modules/typescript-eslint',
      'b:node_modules/eslint',
      'c:oxlint-plugin-missing',
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
  if (rel === 'packages/_template') {
    // The template package keeps its echo line (plan S2 Contract).
    return lint.startsWith('echo ') ? null : `${rel}: ${lint}`;
  }
  const expected = rel.startsWith('apps/')
    ? 'oxlint --config ../../.oxlintrc.json . --max-warnings 0'
    : 'oxlint --config ../../.oxlintrc.json src --max-warnings 0';
  return lint === expected ? null : `${rel}: ${lint}`;
}

// A whole-line disable comment, including the JSX comment form. Every block disable
// in this tree closes on its own line (checked 2026-11-19), so a line-by-line strip
// is exact.
const WHOLE_LINE_DISABLE_RE = /^\{?\s*\/\*\s*(?:eslint|oxlint)-disable[\s\S]*?\*\/\s*\}?$/;
const TRAILING_DISABLE_RE = /\s*\/\/\s*(?:eslint|oxlint)-disable\S*.*$/;

// Remove every disable comment: whole-line comments are dropped, trailing comments
// are cut from their line. The code under the comment stays, so a finding that the
// comment hid must surface in the stripped copy.
function stripDisableComments(content: string): string {
  return content
    .split('\n')
    .filter((line) => !WHOLE_LINE_DISABLE_RE.test(line.trim()))
    .map((line) => line.replace(TRAILING_DISABLE_RE, ''))
    .join('\n');
}

// The source extensions that the root config's override globs lint.
const SOURCE_EXT_RE = /\.(js|jsx|mjs|cjs|ts|tsx)$/;
// Folders that no workspace lint script lints: the SKIP_DIRS build and install folders
// plus the Convex codegen folders (root config ignorePatterns).
const DISABLE_SCAN_SKIP = new Set([...SKIP_DIRS, '_generated']);

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
    for (const file of findFilesSkipping(dir, (name) => SOURCE_EXT_RE.test(name), DISABLE_SCAN_SKIP)) {
      if (/(eslint|oxlint)-disable/.test(fs.readFileSync(file, 'utf8'))) found.push(file);
    }
  }
  return found;
}

// The allow-list of pre-existing disable directives (F1, option B): one entry per
// tracked file that holds a directive, with the directive kinds, the directive and
// blanket-block counts, and the live rules the directives hide. A carrier file that
// the list does not name, a stale entry, a new blanket block, or a hidden rule that
// the entry does not record all fail adv 7.
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
    path.join(REPO_ROOT, 'scripts', '__tests__', 'fixtures', 'lint-disable-allowlist.json'),
  ) as { version: number; entries: DisableAllowlistEntry[] };
  expect(doc.version, 'allow-list version').toBe(1);
  expect(doc.entries.length, 'allow-list entry count').toBeGreaterThan(0);
  return doc.entries;
}

// The directive kinds of one file: 'block' for a whole-file `/* disable */` line,
// 'next-line' for a `disable-next-line` comment in either comment spelling,
// 'trailing' for a `disable-line` comment. Mirrors the allow-list inventory.
function directiveKindsOfFile(content: string): { kinds: string[]; total: number; blocks: number } {
  const kinds = new Set<string>();
  let total = 0;
  let blocks = 0;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (WHOLE_LINE_DISABLE_RE.test(trimmed)) {
      total += 1;
      if (trimmed.includes('disable-next-line')) kinds.add('next-line');
      else if (trimmed.includes('disable-line')) kinds.add('trailing');
      else {
        kinds.add('block');
        blocks += 1;
      }
    } else {
      const trailing = line.match(/\/\/\s*((?:eslint|oxlint)-disable\S*)/);
      if (trailing) {
        total += 1;
        if (trailing[1].includes('disable-next-line')) kinds.add('next-line');
        else kinds.add('trailing');
      }
    }
  }
  return { kinds: [...kinds].sort(), total, blocks };
}

describe('S2 adversarial', () => {
  it('adv 1: the case 1 scan reports each ESLint-family field, nested overrides, and version-suffixed keys', () => {
    // Seeded faults in memory: one declaration per dependency field, a
    // version-suffixed override key for each family name, a nested override object,
    // and a declaration re-entered inside an override value. A scanner weakened to
    // two fields, or blind to nested override keys and their children, misses a
    // hit (A4).
    const hits = scanDeclarations(
      [
        {
          display: 'package.json',
          manifest: {
            dependencies: { eslint: '^10.0.0' },
            devDependencies: { 'eslint-config-next': '^16.0.0' },
            peerDependencies: { '@eslint/js': '^10.0.0' },
            optionalDependencies: { '@eslint/eslintrc': '^4.0.0' },
            overrides: {
              'typescript-eslint@8': '^8.0.0',
              'eslint-config-next@16.2.0': '^16.2.0',
              '@eslint/js@10': '^10.0.0',
              '@eslint/eslintrc@4': '^4.0.0',
              'eslint@10': { devDependencies: { eslint: '^10.0.0' } },
            },
          },
        },
      ],
      isEslintFamily,
    );
    expect(hits, 'the scan must report every seeded ESLint-family declaration').toEqual([
      'package.json:dependencies.eslint',
      'package.json:devDependencies.eslint-config-next',
      'package.json:optionalDependencies.@eslint/eslintrc',
      'package.json:overrides.@eslint/eslintrc@4',
      'package.json:overrides.@eslint/js@10',
      'package.json:overrides.eslint-config-next@16.2.0',
      'package.json:overrides.eslint@10',
      'package.json:overrides.eslint@10.devDependencies.eslint',
      'package.json:overrides.typescript-eslint@8',
      'package.json:peerDependencies.@eslint/js',
    ]);
    // Paired control on the real tree: the same scan over the real manifests reports
    // nothing (guard holds at HEAD).
    const manifests = [
      path.join(REPO_ROOT, 'package.json'),
      ...WORKSPACE_DIRS.map((dir) => path.join(dir, 'package.json')),
    ];
    expect(scanDeclarations(manifestEntries(manifests), isEslintFamily)).toEqual([]);
  });

  it('adv 2: the case 2 and case 3 walks find a second .oxlintrc.json and an eslint.config.* in seeded workspaces', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-adv-cfg2-'));
    tempDirs.push(tmp);
    const wsA = path.join(tmp, 'apps', 'a');
    const wsB = path.join(tmp, 'packages', 'b');
    fs.mkdirSync(path.join(wsA, 'deep'), { recursive: true });
    fs.mkdirSync(path.join(wsB, 'nested'), { recursive: true });
    for (const ws of [wsA, wsB]) fs.writeFileSync(path.join(ws, 'package.json'), '{"name":"x"}');
    // The seeded faults: a second oxlint config and an eslint config in a workspace
    // root, and the same names deeper in the tree. A copy under node_modules stays
    // invisible, because the walk rule is "outside node_modules".
    fs.mkdirSync(path.join(wsA, 'node_modules'), { recursive: true });
    fs.writeFileSync(path.join(wsA, 'node_modules', 'eslint.config.js'), 'x');
    fs.writeFileSync(path.join(wsA, '.oxlintrc.json'), '{}');
    fs.writeFileSync(path.join(wsA, 'deep', '.oxlintrc.json'), '{}');
    fs.writeFileSync(path.join(wsA, 'eslint.config.mjs'), 'export default {}');
    fs.writeFileSync(path.join(wsB, 'eslint.config.js'), 'export default {}');
    fs.writeFileSync(path.join(wsB, 'nested', 'eslint.config.cjs'), 'module.exports = {}');
    const oxlintConfigs = findFiles(tmp, (name) => name === '.oxlintrc.json');
    expect(oxlintConfigs.map((file) => path.relative(tmp, file))).toEqual([
      'apps/a/.oxlintrc.json',
      'apps/a/deep/.oxlintrc.json',
    ]);
    const eslintConfigs = [wsA, wsB].flatMap((dir) =>
      findFiles(dir, (name) => /^eslint\.config\./.test(name)),
    );
    expect(eslintConfigs.map((file) => path.relative(tmp, file))).toEqual([
      'apps/a/eslint.config.mjs',
      'packages/b/eslint.config.js',
      'packages/b/nested/eslint.config.cjs',
    ]);
    // Paired control on the real tree: only the root .oxlintrc.json exists, and no
    // eslint.config.* file exists under apps/ or packages/ (guards hold at HEAD).
    expect(findFiles(REPO_ROOT, (name) => name === '.oxlintrc.json').map(relative)).toEqual([
      '.oxlintrc.json',
    ]);
    expect(
      WORKSPACE_DIRS.flatMap((dir) =>
        findFiles(dir, (name) => /^eslint\.config\./.test(name)),
      ).map(relative),
    ).toEqual([]);
  });

  it('adv 3: the case 3 form rule reports each mutant lint script, and a dropped lint script fails the sentinels', () => {
    // Seeded mutant scripts: a dropped --config, a wrong config target, a dropped
    // --max-warnings 0, a raised budget, a prefixed runner, the wrong lint path, and
    // the template echo line replaced by an oxlint call. Each mutant is one way to
    // weaken the lint gate, and the rule must reject each one.
    const mutants: Array<[string, string]> = [
      ['apps/x', 'oxlint . --max-warnings 0'],
      ['apps/x', 'oxlint --config .oxlintrc.json . --max-warnings 0'],
      ['apps/x', 'oxlint --config ../../.oxlintrc.json .'],
      ['apps/x', 'oxlint --config ../../.oxlintrc.json . --max-warnings 1'],
      ['apps/x', 'npx oxlint --config ../../.oxlintrc.json . --max-warnings 0'],
      ['apps/x', 'oxlint --config ../../.oxlintrc.json src --max-warnings 0'],
      ['packages/y', 'oxlint --config ../../.oxlintrc.json . --max-warnings 0'],
      ['packages/_template', 'oxlint --config ../../.oxlintrc.json src --max-warnings 0'],
    ];
    for (const [rel, lint] of mutants) {
      expect(lintScriptForm(rel, lint), `the rule must reject: ${rel}: ${lint}`).not.toBeNull();
    }
    // Controls: the two target forms and the template echo line pass.
    expect(lintScriptForm('apps/x', 'oxlint --config ../../.oxlintrc.json . --max-warnings 0')).toBeNull();
    expect(lintScriptForm('packages/y', 'oxlint --config ../../.oxlintrc.json src --max-warnings 0')).toBeNull();
    expect(
      lintScriptForm('packages/_template', "echo 'No lint configured for template package'"),
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
    const dropped = entries.filter((entry) => entry.rel !== 'apps/danielson');
    expect(dropped.length, 'a danielson-filtered entries set is below the sentinel count').toBeLessThan(27);
    expect(dropped.map((entry) => entry.rel)).not.toContain('apps/danielson');
  });

  it(
    'adv 4: a mutant config that lints no file makes the probe pass, so case 4 is the vacuous-pass defense',
    () => {
      expect(runTool(['oxlint', '--version']).status, 'precondition: oxlint --version').toBe(0);
      // The seeded fault: every override glob of a copy of the root config matches no
      // file. Such a config lints nothing, so every probe passes vacuously.
      const config = readJson(path.join(REPO_ROOT, '.oxlintrc.json'));
      for (const override of (config.overrides ?? []) as Array<{ files?: string[] }>) {
        override.files = ['nomatch/**/*.{js,jsx,mjs,cjs,ts,tsx}'];
      }
      const cfgTmp = fs.mkdtempSync(path.join(REPO_ROOT, '.oxlint-adv-cfg-'));
      tempDirs.push(cfgTmp);
      const mutantConfig = path.join(cfgTmp, 'mutant.oxlintrc.json');
      fs.writeFileSync(mutantConfig, JSON.stringify(config));
      const probe = makeLintProbe('const unused = 1;\n');
      const mutant = runTool(['oxlint', '--config', mutantConfig, '--max-warnings', '0', probe]);
      for (const phrase of ABSENT_TOOL_PHRASES) expect(mutant.output).not.toContain(phrase);
      expect(mutant.status, 'the mutant config lints no file, so the probe passes vacuously').toBe(0);
      expect(mutant.output).not.toContain('no-unused-vars');
      // The case 4 guard shape fails on the mutant (it needs a non-zero exit and the
      // no-unused-vars text), so this attack cannot produce a false green.
      expect(!(mutant.status !== 0 && mutant.output.includes('no-unused-vars'))).toBe(true);
      // Paired control: the real config fails the same probe (case 4 holds).
      const real = runOxlintProbe(probe);
      expect(real.status).not.toBe(0);
      expect(real.output).toContain('no-unused-vars');
      // The mirror attack: a probe outside apps/ and packages/ matches no glob, so the
      // makeLintProbe placement under apps/ is load-bearing. A guard that moved the
      // probe to the system temp folder would pass vacuously.
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'oxc-adv-out-'));
      tempDirs.push(outside);
      const outsideFile = path.join(outside, 'probe.ts');
      fs.writeFileSync(outsideFile, 'const unused = 1;\n');
      const outsideRun = runTool([
        'oxlint',
        '--config',
        path.join(REPO_ROOT, '.oxlintrc.json'),
        '--max-warnings',
        '0',
        outsideFile,
      ]);
      expect(outsideRun.status, 'a probe outside apps/ and packages/ must pass vacuously').toBe(0);
      expect(outsideRun.output).not.toContain('no-unused-vars');
    },
    TOOL_TIMEOUT_MS,
  );

  it('adv 5: the case 9 scan reports each seeded lockfile fault, including nested copies', () => {
    // The jsPlugins set of the real root config (K4 of strategy 14.2).
    const jsPlugins: JsPluginEntry[] = [
      { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
      { name: 'react-js', specifier: 'eslint-plugin-react' },
      { name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' },
    ];
    // The seeded faults: (a) an eslint-config-next key at the root and a
    // typescript-eslint key nested under a workspace, (b) a non-peer eslint copy at the
    // root and a non-peer @eslint/js copy nested, (c) one jsPlugins specifier with no
    // lockfile key. The @eslint/js root copy with peer: true is the clean control.
    const lock: Json = {
      packages: {
        '': {},
        'node_modules/eslint': { version: '9.39.5' },
        'node_modules/@eslint/js': { version: '9.39.5', peer: true },
        'apps/danielson/node_modules/@eslint/js': { version: '9.39.5' },
        'node_modules/eslint-config-next': { version: '16.2.0' },
        'packages/x/node_modules/typescript-eslint': { version: '8.0.0' },
        'node_modules/oxlint-plugin-eslint': { version: '1.93.0' },
        'node_modules/eslint-plugin-react': { version: '7.37.5' },
      },
    };
    const hits = scanLockfileLintHygiene(lock, jsPlugins);
    expect(hits, 'the scan must report every seeded lockfile fault').toEqual([
      'a:node_modules/eslint-config-next',
      'a:packages/x/node_modules/typescript-eslint',
      'b:apps/danielson/node_modules/@eslint/js',
      'b:node_modules/eslint',
      'c:eslint-plugin-react-hooks',
    ]);
    // Control: the same lockfile with peer: true on every ESLint copy and the missing
    // jsPlugins key added reports no hit, so the hits above come from the faults only.
    const clean: Json = {
      packages: {
        '': {},
        'node_modules/eslint': { version: '9.39.5', peer: true },
        'node_modules/@eslint/js': { version: '9.39.5', peer: true },
        'apps/danielson/node_modules/@eslint/js': { version: '9.39.5', peer: true },
        'node_modules/oxlint-plugin-eslint': { version: '1.93.0' },
        'node_modules/eslint-plugin-react': { version: '7.37.5' },
        'node_modules/eslint-plugin-react-hooks': { version: '7.1.1' },
      },
    };
    expect(scanLockfileLintHygiene(clean, jsPlugins)).toEqual([]);
  });

  it(
    'adv 6: every disable-comment variant hides a live finding, so a source scan is the only defense',
    () => {
      expect(runTool(['oxlint', '--version']).status, 'precondition: oxlint --version').toBe(0);
      // Paired control: the bare probe fails (the same proof as case 4).
      const bare = runOxlintProbe(makeLintProbe('const unused = 1;\n'));
      expect(bare.status).not.toBe(0);
      expect(bare.output).toContain('no-unused-vars');
      // Each variant suppresses the finding, with the oxlint spelling and with the
      // eslint spelling, in block, next-line, and trailing form (verified 2026-11-19,
      // oxlint 1.93.0). No manifest or script guard can see a comment, so the defense
      // must scan the source files: adv 7.
      const variants = [
        '/* oxlint-disable */\nconst unused = 1;\n',
        '/* eslint-disable */\nconst unused = 1;\n',
        '/* eslint-disable no-unused-vars */\nconst unused = 1;\n',
        '// eslint-disable-next-line\nconst unused = 1;\n',
        '// oxlint-disable-next-line\nconst unused = 1;\n',
        'const unused = 1; // eslint-disable-line\n',
      ];
      for (const content of variants) {
        const run = runOxlintProbe(makeLintProbe(content));
        expect(run.status, `this variant must hide the finding: ${JSON.stringify(content)}`).toBe(0);
      }
    },
    TOOL_TIMEOUT_MS,
  );

  it(
    'adv 7: every disable comment in the linted surface is pinned by the allow-list',
    () => {
      // Seeded control, run first: the same pipeline must catch a seeded hidden finding,
      // so an empty result on the real tree below is a real pass, not a vacuous one (A4).
      // The seed folder lives inside apps/integrated-math-3, so the root config's app
      // rules apply to it.
      const seedRoot = fs.mkdtempSync(path.join(IM3_DIR, '.oxlint-adv-seed-'));
      tempDirs.push(seedRoot);
      const seedFile = path.join(seedRoot, 'seed.ts');
      fs.writeFileSync(seedFile, '/* eslint-disable */\nconst unused = 1;\n');
      const hidden = runTool([
        'oxlint',
        '--config',
        path.join(REPO_ROOT, '.oxlintrc.json'),
        '--max-warnings',
        '0',
        seedFile,
      ]);
      expect(hidden.status, 'the seeded disable comment must hide the finding').toBe(0);
      fs.writeFileSync(seedFile, stripDisableComments(fs.readFileSync(seedFile, 'utf8')));
      const surfaced = runTool([
        'oxlint',
        '--config',
        path.join(REPO_ROOT, '.oxlintrc.json'),
        '--max-warnings',
        '0',
        seedFile,
      ]);
      expect(surfaced.status, 'the stripped seed must surface the finding').not.toBe(0);
      expect(surfaced.output).toContain('no-unused-vars');
      // The seed proved the pipeline. Remove it before the real-tree scan, so the
      // scan sees only tracked files.
      fs.rmSync(seedRoot, { recursive: true, force: true });
      tempDirs.splice(tempDirs.indexOf(seedRoot), 1);
      // The allow-list pin (F1, option B): only the recorded pre-existing carrier
      // files may hold a directive, each exactly as recorded.
      const allowlist = readDisableAllowlist();
      const byPath = new Map(allowlist.map((entry) => [entry.path, entry]));
      const files = lintedFilesWithDisableDirectives();
      const unlisted = files
        .map((file) => relative(file))
        .filter((rel) => !byPath.has(rel));
      expect(unlisted, 'carrier files that the allow-list does not name').toEqual([]);
      const stale: string[] = [];
      const changed: string[] = [];
      for (const entry of allowlist) {
        const abs = path.join(REPO_ROOT, entry.path);
        if (!fs.existsSync(abs)) {
          stale.push(`${entry.path} (file is gone)`);
          continue;
        }
        const current = directiveKindsOfFile(fs.readFileSync(abs, 'utf8'));
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
      expect(stale, 'stale allow-list entries: the file no longer holds the directive').toEqual([]);
      expect(changed, 'allow-list entries whose directives changed').toEqual([]);
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
          tempRoot = fs.mkdtempSync(path.join(workspace, '.oxlint-adv-'));
          rootByWorkspace.set(workspace, tempRoot);
          tempDirs.push(tempRoot);
        }
        const copy = path.join(tempRoot, path.relative(workspace, file));
        fs.mkdirSync(path.dirname(copy), { recursive: true });
        fs.writeFileSync(copy, stripDisableComments(fs.readFileSync(file, 'utf8')));
        // oxlint prints paths relative to the working folder, so the map key is the
        // copy path relative to the repository root.
        tempToReal.set(relative(copy), relative(file));
      }
      if (tempToReal.size > 0) {
        const run = runTool([
          'oxlint',
          '--config',
          path.join(REPO_ROOT, '.oxlintrc.json'),
          '--max-warnings',
          '0',
          ...rootByWorkspace.values(),
        ]);
        const decoded = run.output
          .split('\n')
          .map((line) => line.match(/^(\S+):\d+:\d+: (?:error|warning) ([^\s:]+(?:\([^)]*\))?)/))
          .filter((match): match is RegExpMatchArray => match !== null)
          .map((match) => {
            const real = tempToReal.get(match[1]) ?? match[1];
            return { real, rule: match[2] ?? '' };
          });
        const unrecorded = decoded.filter(({ real, rule }) => {
          const entry = byPath.get(real);
          return !entry || !entry.hiddenRules.includes(rule);
        });
        expect(
          [...new Set(unrecorded.map(({ real, rule }) => `${real} hides ${rule}`))],
          `hidden findings that the allow-list does not record (strip the comment, lint the copy)\n${run.output}`,
        ).toEqual([]);
      }
    },
    TOOL_TIMEOUT_MS,
  );
});
