// Review A r4 (S2, audit at 54aa79e3): direct check of the committed tokenizer
// helpers in scripts/__tests__/oxc-toolchain-gates.test.ts. The script extracts
// the exact helper source from the test file, strips the type annotations with
// the installed typescript 6.0.3 (ts.transpileModule), and runs the briefed
// edge forms against the real code under audit. No copy is re-typed by hand.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TEST_FILE = path.join(REPO_ROOT, 'scripts', '__tests__', 'oxc-toolchain-gates.test.ts');
const src = fs.readFileSync(TEST_FILE, 'utf8');

const marker = (text) => {
  const at = src.indexOf(text);
  if (at < 0) throw new Error(`marker not found: ${text.slice(0, 60)}`);
  return at;
};

// Region 1: DISABLE_TEXT_RE .. stripDisableComments (before SOURCE_EXT_RE).
const r1Start = marker('// A disable directive is text');
const r1End = marker('// The source extensions that the root config');
// Region 2: directiveKindsOfFile (before the allow-list pin comment).
const r2Start = marker('// The directive kinds of one file');
const r2End = marker('// The pin of one allow-list');
const helperSource = src.slice(r1Start, r1End) + '\n' + src.slice(r2Start, r2End);

// Sanity: the extracted text is the committed helper code, not something else.
for (const needle of [
  'const DISABLE_TEXT_RE',
  'function scriptKindForFile',
  'function disableCommentRanges',
  'function stripDisableComments',
  'function directiveKindsOfFile',
]) {
  if (!helperSource.includes(needle)) throw new Error(`helper missing from extraction: ${needle}`);
}

const js = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const factory = new Function('ts', js + '\nreturn { disableCommentRanges, stripDisableComments, directiveKindsOfFile };');
const { disableCommentRanges, stripDisableComments, directiveKindsOfFile } = factory(ts);

let failed = 0;
let ran = 0;
const check = (name, cond, detail) => {
  ran += 1;
  if (!cond) {
    failed += 1;
    console.log(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
};

// Each case: [name, fileName, content, assertions over kinds and strip].
const cases = [
  {
    name: 'crlf trailing // eslint-disable-line',
    file: 'p.ts',
    content: 'const keep = 1;\r\nconst unused = 2; // eslint-disable-line\r\nexport { keep };\r\n',
    kinds: { total: 1, kinds: ['trailing'], blocks: 0 },
    strip: (s) =>
      !/disable/.test(s) && s.includes('const unused = 2;') && (s.match(/\r\n/g) || []).length === 3,
  },
  {
    name: 'crlf // eslint-disable-next-line',
    file: 'p.ts',
    content: 'const keep = 1;\r\n// eslint-disable-next-line\r\nconst unused = 2;\r\nexport { keep };\r\n',
    kinds: { total: 1, kinds: ['next-line'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'crlf next-line with rule list and reason',
    file: 'p.ts',
    content: '// eslint-disable-next-line no-unused-vars -- reason\r\nconst unused = 1;\r\nexport {};\r\n',
    kinds: { total: 1, kinds: ['next-line'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 1;'),
  },
  {
    name: 'in-string /* above a real disable (F2r3)',
    file: 'p.ts',
    content: 'const s = "a /* b";\n/* eslint-disable */\nconst unused = 2;\nexport { s };\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) =>
      s.includes('const s = "a /* b";') &&
      !/eslint-disable/.test(s) &&
      s.includes('const unused = 2;'),
  },
  {
    name: 'disable text in a string literal (F3r3, must not count)',
    file: 'p.ts',
    content: 'const s = "/* eslint-disable */";\nconst unused = 2;\nexport { s };\n',
    kinds: { total: 0, kinds: [], blocks: 0 },
    strip: (s) => s === 'const s = "/* eslint-disable */";\nconst unused = 2;\nexport { s };\n',
  },
  {
    name: 'disable text in a template literal (F3r3, must not count)',
    file: 'p.ts',
    content: 'const t = `/* eslint-disable */`;\nconst unused = 2;\nexport default t;\n',
    kinds: { total: 0, kinds: [], blocks: 0 },
    strip: (s) => s === 'const t = `/* eslint-disable */`;\nconst unused = 2;\nexport default t;\n',
  },
  {
    // Actual behavior (verified live 2026-11-19, oxlint 1.93.0): oxlint does NOT
    // honor this form (jsx text, finding stays reported), but the TS trivia
    // functions re-scan JSX text with the standard scanner, so the helpers DO
    // count it. Conservative over-count, same accepted direction as F3r3. The
    // helper comment at test line 920 claims JSX text never counts; that claim
    // is false (Review A finding).
    name: 'disable text in JSX text position (counted: conservative over-count)',
    file: 'p.tsx',
    content: 'export function P() {\n  return <div>// eslint-disable-next-line</div>;\n}\nconst unused = 1;\n',
    kinds: { total: 1, kinds: ['next-line'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('<div>') && s.includes('const unused = 1;'),
  },
  {
    name: 'mid-line block, eslint spelling',
    file: 'p.ts',
    content: '/* keep */ const a = 1; /* eslint-disable */ const unused = 2;\nexport { a };\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => s.includes('/* keep */') && s.includes('const a = 1;') && !/eslint-disable/.test(s),
  },
  {
    name: 'mid-line block, oxlint spelling',
    file: 'p.ts',
    content: 'const a = 1; /* oxlint-disable */ const unused = 2;\nexport { a };\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/oxlint-disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'multi-line block with rule list and reason',
    file: 'p.ts',
    content: '/* eslint-disable\n   no-unused-vars -- the reason\n */\nconst unused = 2;\nexport {};\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/disable/.test(s) && (s.match(/\n/g) || []).length === 5,
  },
  {
    name: 'block spelling of disable-next-line with rule list and reason',
    file: 'p.ts',
    content: '/* eslint-disable-next-line no-unused-vars -- r */\nconst unused = 2;\nexport {};\n',
    kinds: { total: 1, kinds: ['next-line'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'block spelling of disable-line',
    file: 'p.ts',
    content: 'const unused = 2; /* eslint-disable-line */\nexport {};\n',
    kinds: { total: 1, kinds: ['trailing'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'trailing // eslint-disable-line with rule list and reason',
    file: 'p.ts',
    content: 'const unused = 2; // eslint-disable-line no-unused-vars -- reason\nexport {};\n',
    kinds: { total: 1, kinds: ['trailing'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'JSX expression container disable (tsx)',
    file: 'p.tsx',
    content: 'export function P() {\n  {/* eslint-disable */} const unused = 2;\n  return <div />;\n}\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/eslint-disable/.test(s) && s.includes('const unused = 2;') && s.includes('{'),
  },
  {
    // Actual behavior: one range (the whole block, counted once — the old code
    // counted twice), but classify() tests the whole comment text, so the
    // blanket block that contains the literal text 'disable-next-line' inside
    // is labeled 'next-line', not 'block' (Review A finding: kind label can
    // misreport). The count and the strip stay correct, so no hidden fault can
    // escape the sweep; the kinds label alone is wrong.
    name: '// disable inside a block comment counts once (kind label misreports)',
    file: 'p.ts',
    content: '/* eslint-disable\n// eslint-disable-next-line\n*/\nconst unused = 2;\nexport {};\n',
    kinds: { total: 1, kinds: ['next-line'], blocks: 0 },
    strip: (s) => !/disable/.test(s),
  },
  {
    name: 'crlf whole-line block',
    file: 'p.ts',
    content: 'const keep = 1;\r\n/* eslint-disable */\r\nconst unused = 2;\r\nexport { keep };\r\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/disable/.test(s) && (s.match(/\r\n/g) || []).length === 4,
  },
  {
    name: 'multi-line block with CRLF inside',
    file: 'p.ts',
    content: '/* eslint-disable\r\n */\nconst unused = 1;\nexport {};\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 1;') && s.includes('\r\n'),
  },
  {
    name: 'trailing // eslint-disable-line parsed as TSX',
    file: 'p.tsx',
    content: 'const unused = 2; // eslint-disable-line\nexport {};\n',
    kinds: { total: 1, kinds: ['trailing'], blocks: 0 },
    strip: (s) => !/disable/.test(s) && s.includes('const unused = 2;'),
  },
  {
    name: 'block disable at end of file (EOF trivia)',
    file: 'p.ts',
    content: 'const a = 1;\n/* eslint-disable */\n',
    kinds: { total: 1, kinds: ['block'], blocks: 1 },
    strip: (s) => !/disable/.test(s) && s.includes('const a = 1;'),
  },
];

for (const c of cases) {
  const kinds = directiveKindsOfFile(c.content, c.file);
  check(
    `${c.name}: kinds total`,
    kinds.total === c.kinds.total,
    `got total=${kinds.total} kinds=${JSON.stringify(kinds.kinds)} blocks=${kinds.blocks}`,
  );
  check(
    `${c.name}: kinds set`,
    JSON.stringify(kinds.kinds) === JSON.stringify(c.kinds.kinds),
    `got ${JSON.stringify(kinds.kinds)} want ${JSON.stringify(c.kinds.kinds)}`,
  );
  check(`${c.name}: blocks`, kinds.blocks === c.kinds.blocks, `got ${kinds.blocks}`);
  const stripped = stripDisableComments(c.content, c.file);
  check(`${c.name}: strip`, c.strip(stripped), `stripped=${JSON.stringify(stripped)}`);
}

// Prefilter behavior: a file without disable text returns no ranges and the
// strip is a no-op; a file with disable text returns ranges.
check(
  'prefilter: no disable text -> no ranges',
  disableCommentRanges('p.ts', 'const a = 1; // plain comment\n').length === 0,
);
check(
  'prefilter: disable text -> ranges found',
  disableCommentRanges('p.ts', '// eslint-disable-next-line\nconst a = 1;\n').length === 1,
);
check(
  'prefilter: strip is a no-op without disable text',
  stripDisableComments('const a = 1; /* keep */\n', 'p.ts') === 'const a = 1; /* keep */\n',
);

// The strip preserves the line count and keeps \r for the CRLF forms.
const crlf = 'const keep = 1;\r\nconst unused = 2; // eslint-disable-line\r\nexport { keep };\r\n';
const strippedCrlf = stripDisableComments(crlf, 'p.ts');
check(
  'crlf strip keeps every line break',
  strippedCrlf.split('\n').length === crlf.split('\n').length && strippedCrlf.includes('\r'),
  JSON.stringify(strippedCrlf),
);

console.log(`EDGE FORMS: ${ran} checks, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
