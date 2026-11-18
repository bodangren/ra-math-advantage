// Review A r4 (S2, audit at 54aa79e3): independent fixture-exactness recheck.
// Walks apps/ and packages/ with the same surface as the committed
// lintedFilesWithDisableDirectives (source extensions, SKIP_DIRS plus
// _generated), counts the carriers with the committed tokenizer helpers, and
// compares every fixture entry field by field. Zero tolerance: 49 carriers
// against 49 entries, no unlisted, no stale, no kind, count, or blanket drift.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEST_FILE = path.join(REPO_ROOT, 'scripts', '__tests__', 'oxc-toolchain-gates.test.ts');
const src = fs.readFileSync(TEST_FILE, 'utf8');
const marker = (text) => {
  const at = src.indexOf(text);
  if (at < 0) throw new Error(`marker not found: ${text}`);
  return at;
};
const helperSource =
  src.slice(marker('// A disable directive is text'), marker('// The source extensions that the root config')) +
  '\n' +
  src.slice(marker('// The directive kinds of one file'), marker('// The pin of one allow-list'));
const js = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { disableCommentRanges, directiveKindsOfFile } = new Function(
  'ts',
  js + '\nreturn { disableCommentRanges, directiveKindsOfFile };',
)(ts);

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'coverage', '.convex', 'playwright-report', '_generated']);
const SOURCE_EXT_RE = /\.(js|jsx|mjs|cjs|ts|tsx)$/;

const walk = (dir, found) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(abs, found);
    } else if (entry.isFile() && SOURCE_EXT_RE.test(entry.name)) {
      found.push(abs);
    }
  }
};

const carriers = [];
for (const top of ['apps', 'packages']) {
  const found = [];
  walk(path.join(REPO_ROOT, top), found);
  for (const file of found) {
    if (disableCommentRanges(file, fs.readFileSync(file, 'utf8')).length > 0) carriers.push(file);
  }
}

const fixture = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'scripts', '__tests__', 'fixtures', 'lint-disable-allowlist.json'), 'utf8'),
);
const entries = fixture.entries;
const relCarriers = carriers.map((f) => path.relative(REPO_ROOT, f)).sort();
const entryPaths = entries.map((e) => e.path).sort();

let failed = 0;
const check = (name, cond, detail) => {
  if (cond) console.log(`ok   ${name}${detail ? `: ${detail}` : ''}`);
  else {
    failed += 1;
    console.log(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
};

check('carrier count equals fixture entry count', carriers.length === entries.length, `${carriers.length} carriers vs ${entries.length} entries`);
const unlisted = relCarriers.filter((p) => !entryPaths.includes(p));
check('no unlisted carrier', unlisted.length === 0, unlisted.join(', '));
const stale = entryPaths.filter((p) => !relCarriers.includes(p));
check('no stale entry', stale.length === 0, stale.join(', '));

for (const entry of entries) {
  const abs = path.join(REPO_ROOT, entry.path);
  const current = directiveKindsOfFile(fs.readFileSync(abs, 'utf8'), entry.path);
  const kindsOk = JSON.stringify(current.kinds) === JSON.stringify([...entry.kinds].sort());
  const label = `${entry.path}`;
  check(`${label}: kinds`, kindsOk, `got ${JSON.stringify(current.kinds)} recorded ${JSON.stringify(entry.kinds)}`);
  check(`${label}: directiveCount`, current.total === entry.directiveCount, `got ${current.total} recorded ${entry.directiveCount}`);
  check(`${label}: blanketBlocks`, current.blocks === entry.blanketBlocks, `got ${current.blocks} recorded ${entry.blanketBlocks}`);
}

console.log(`FIXTURE RECHECK: ${failed} failed (${carriers.length} carriers vs ${entries.length} entries)`);
process.exit(failed === 0 ? 0 : 1);
