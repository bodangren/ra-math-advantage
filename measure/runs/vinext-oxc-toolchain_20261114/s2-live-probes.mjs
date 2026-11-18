// Review A r4 live probes (audit at 54aa79e3): which spellings and cases does
// oxlint 1.93.0 honor, and do the tokenizer helpers strip the two F1r3/F2r3
// forms so the stripped copies surface the finding? Probes live under
// apps/integrated-math-3/ because the root config only lints apps/ and
// packages/ paths. The folder is removed at the end.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PROBE_DIR = path.join(REPO_ROOT, 'apps', 'integrated-math-3', '.rev-a-r4-probes');
fs.rmSync(PROBE_DIR, { recursive: true, force: true });
fs.mkdirSync(PROBE_DIR, { recursive: true });

// The exact committed helpers, extracted from the test file under audit.
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
const { stripDisableComments, directiveKindsOfFile } = new Function(
  'ts',
  js + '\nreturn { stripDisableComments, directiveKindsOfFile };',
)(ts);

const runOxlint = (file) => {
  const r = spawnSync(
    'npx',
    ['--no-install', 'oxlint', '--config', path.join(REPO_ROOT, '.oxlintrc.json'), '--max-warnings', '0', file],
    { cwd: REPO_ROOT, encoding: 'utf8', timeout: 120000 },
  );
  return { status: r.status, output: (r.stdout || '') + (r.stderr || '') };
};

const write = (name, content) => {
  const file = path.join(PROBE_DIR, name);
  fs.writeFileSync(file, content);
  return file;
};

let failed = 0;
const check = (name, cond, detail) => {
  if (cond) console.log(`ok   ${name}`);
  else {
    failed += 1;
    console.log(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
};

// --- The two F1r3/F2r3 forms, stripped copies must surface the finding. ---
const fixed = [
  ['crlf-trailing.ts', 'const keep = 1;\r\nconst unused = 2; // eslint-disable-line\r\nexport { keep };\r\n'],
  ['crlf-next.ts', 'const keep = 1;\r\n// eslint-disable-next-line\r\nconst unused = 2;\r\nexport { keep };\r\n'],
  [
    'swallow.ts',
    'const s = "a /* b";\n/* eslint-disable */\nconst unused = 2;\nexport { s };\n',
  ],
  ['jsx-wrap.tsx', 'export function P() {\n  {/* eslint-disable */} const unused = 2;\n  return <div />;\n}\n'],
];
for (const [name, content] of fixed) {
  const hidden = runOxlint(write(name, content));
  check(`${name}: oxlint honors the disable (original exits 0)`, hidden.status === 0, JSON.stringify(hidden));
  const stripped = stripDisableComments(content, name);
  const copy = write(name.replace('.', '-stripped.'), stripped);
  const surfaced = runOxlint(copy);
  check(
    `${name}: stripped copy surfaces no-unused-vars`,
    surfaced.status !== 0 && surfaced.output.includes('no-unused-vars') && !surfaced.output.includes('Unterminated'),
    JSON.stringify(surfaced).slice(0, 300),
  );
}

// --- Prefilter: spellings and cases. If oxlint honors a form, the helpers
// must count it (else the carrier scan misses the file). If oxlint rejects a
// form, counting it is only a conservative over-count. ---
const spellings = [
  ['upper-next.ts', '// ESLINT-DISABLE-NEXT-LINE\nconst unused = 1;\nexport {};\n'],
  ['mixed-next.ts', '// Eslint-Disable-Next-Line\nconst unused = 1;\nexport {};\n'],
  ['upper-block.ts', '/* ESLINT-DISABLE */\nconst unused = 1;\nexport {};\n'],
  ['space1.ts', '/* eslint -disable */\nconst unused = 1;\nexport {};\n'],
  ['space2.ts', '/* eslint- disable */\nconst unused = 1;\nexport {};\n'],
  ['nospace-line.ts', 'const unused = 1;//eslint-disable-line\nexport {};\n'],
  ['oxlint-upper.ts', '/* OXLINT-DISABLE */\nconst unused = 1;\nexport {};\n'],
  ['jsdoc-block.ts', '/** eslint-disable */\nconst unused = 1;\nexport {};\n'],
  ['jsx-text-line.tsx', 'export function P() {\n  return <div>// eslint-disable-next-line</div>;\n}\nconst unused = 1;\n'],
  ['jsx-text-block.tsx', 'export function P() {\n  return <div>/* eslint-disable */</div>;\n}\nconst unused = 1;\n'],
];
for (const [name, content] of spellings) {
  const run = runOxlint(write(name, content));
  const honored = run.status === 0;
  const counted = directiveKindsOfFile(content, name).total;
  console.log(
    `     ${name}: oxlint honors=${honored} (exit ${run.status}) helpers counted=${counted}` +
      (honored ? '' : ` finding=${run.output.includes('no-unused-vars') ? 'no-unused-vars' : run.output.split('\n')[0] || 'none'}`),
  );
  if (honored) {
    check(`${name}: oxlint honors it, so the helpers must count it`, counted >= 1, 'helpers counted 0');
  }
}

fs.rmSync(PROBE_DIR, { recursive: true, force: true });
console.log(`LIVE PROBES: ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
