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
      if (rel === 'packages/_template') {
        // The template package keeps its echo line (plan S2 Contract).
        if (!lint.startsWith('echo ')) wrong.push(`${rel}: ${lint}`);
        continue;
      }
      const expected = rel.startsWith('apps/')
        ? 'oxlint --config ../../.oxlintrc.json . --max-warnings 0'
        : 'oxlint --config ../../.oxlintrc.json src --max-warnings 0';
      if (lint !== expected) wrong.push(`${rel}: ${lint}`);
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
