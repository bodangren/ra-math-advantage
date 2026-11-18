// Review A S2 r3 scratch: re-check the allow-list fixture against the real tree with
// the NEW directiveKindsOfFile of commit 35ffb32b (mid-line and multi-line aware).
// Compares paths, kinds, directiveCount, and blanketBlocks for all carriers.
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..', '..', '..');
const src = fs.readFileSync(path.join(repo, 'scripts/__tests__', 'oxc-toolchain-gates.test.ts'), 'utf8').split('\n');
const slice = (a, b) => src.slice(a - 1, b).join('\n');
let code = slice(903, 916) + '\n' + slice(986, 1007);
code = code.replace(
  'function directiveKindsOfFile(content: string): { kinds: string[]; total: number; blocks: number }',
  'function directiveKindsOfFile(content)',
);
code = code.replace('function stripDisableComments(content: string): string {', 'function stripDisableComments(content) {');
code = code.replace('const classify = (text: string) => {', 'const classify = (text) => {');
code = code.replace('new Set<string>()', 'new Set()');
eval(code);

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '.vinext', 'coverage', '_generated', '.git']);
const SOURCE_EXT_RE = /\.(js|jsx|mjs|cjs|ts|tsx)$/;
function findFilesSkipping(root, matches, skip) {
  const found = [];
  const walk = (dir) => {
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
const carriers = [];
for (const dir of ['apps', 'packages']) {
  for (const file of findFilesSkipping(path.join(repo, dir), (n) => SOURCE_EXT_RE.test(n), SKIP_DIRS)) {
    if (/(eslint|oxlint)-disable/.test(fs.readFileSync(file, 'utf8'))) carriers.push(file);
  }
}
const rel = (abs) => path.relative(repo, abs);
const fixture = JSON.parse(fs.readFileSync(path.join(repo, 'scripts', '__tests__', 'fixtures', 'lint-disable-allowlist.json'), 'utf8'));
const byPath = new Map(fixture.entries.map((e) => [e.path, e]));
const carrierRel = carriers.map(rel).sort();
const fixtureRel = fixture.entries.map((e) => e.path).sort();

let bad = 0;
const unlisted = carrierRel.filter((p) => !byPath.has(p));
const stale = fixtureRel.filter((p) => !carrierRel.includes(p));
if (unlisted.length) { bad += unlisted.length; console.log('UNLISTED:', unlisted); }
if (stale.length) { bad += stale.length; console.log('STALE:', stale); }
let mismatch = 0;
for (const p of carrierRel) {
  const e = byPath.get(p);
  if (!e) continue;
  const cur = directiveKindsOfFile(fs.readFileSync(path.join(repo, p), 'utf8'));
  if (JSON.stringify(cur.kinds) !== JSON.stringify([...e.kinds].sort())) { mismatch++; console.log('KINDS', p, JSON.stringify(cur.kinds), 'vs recorded', JSON.stringify(e.kinds)); }
  if (cur.total !== e.directiveCount) { mismatch++; console.log('COUNT', p, cur.total, 'vs recorded', e.directiveCount); }
  if (cur.blocks !== e.blanketBlocks) { mismatch++; console.log('BLOCKS', p, cur.blocks, 'vs recorded', e.blanketBlocks); }
}
bad += mismatch;
console.log('carriers', carrierRel.length, 'fixture entries', fixtureRel.length, 'unlisted', unlisted.length, 'stale', stale.length, 'kind/count/block mismatches', mismatch);
// Report every non-whole-line directive form still in the tree, to confirm the guard sees the tree it claims.
let forms = { midLine: 0, multiLine: 0 };
for (const abs of carriers) {
  const content = fs.readFileSync(abs, 'utf8');
  for (const span of content.match(/\/\*[\s\S]*?\*\//g) || []) {
    if (/(?:eslint|oxlint)-disable(?:-next-line|-line)?/.test(span)) {
      if (span.includes('\n')) forms.multiLine++;
      else {
        const line = content.split('\n').find((l) => l.includes(span));
        if (line && line.trim() !== span && !line.trimStart().startsWith('/*')) forms.midLine++;
      }
    }
  }
}
console.log('tree disable-span forms: multiLine', forms.multiLine, 'midLine', forms.midLine);
console.log(bad === 0 ? 'ALLOWLIST MATCHES TREE EXACTLY (49 expected)' : bad + ' MISMATCHES');
process.exit(bad === 0 && carrierRel.length === 49 ? 0 : 1);
