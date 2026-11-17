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
    const lock = readJson(path.join(REPO_ROOT, 'package-lock.json')) as {
      packages: Record<string, Record<string, unknown>>;
    };
    const keys = Object.keys(lock.packages);
    // Sentinel: the lockfile has the workspace entries that the check reads (A4).
    expect(keys).toContain('apps/integrated-math-3');
    expect(keys).toContain('packages/app-shell');
    const nextPackages = keys.filter((key) => key.endsWith('node_modules/next'));
    expect(nextPackages, 'lockfile package keys that end with node_modules/next').toEqual([]);
    // A nested copy shadows the root vinext at runtime (risk R16). The only key that ends
    // with node_modules/vinext is the root one.
    const vinextPackages = keys.filter((key) => key.endsWith('node_modules/vinext'));
    expect(
      vinextPackages,
      'lockfile package keys that end with node_modules/vinext',
    ).toEqual(['node_modules/vinext']);
    const workspaceKeys = keys.filter((key) => !key.includes('node_modules/'));
    const listing: string[] = [];
    for (const key of workspaceKeys) {
      const entry = lock.packages[key];
      for (const field of [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies',
      ]) {
        const map = (entry[field] ?? {}) as Record<string, string>;
        if ('next' in map) listing.push(`${key || '(root)'}:${field}`);
      }
    }
    expect(listing, 'lockfile workspace entries that list next').toEqual([]);
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
