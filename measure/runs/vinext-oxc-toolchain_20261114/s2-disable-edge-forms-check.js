// Review A S2 r3 scratch: direct check of the F7 fix (commit 35ffb32b).
// Extracts the exact helper code from scripts/__tests__/oxc-toolchain-gates.test.ts
// (regexes at lines 903-905, stripDisableComments at 910-916, directiveKindsOfFile
// at 986-1007) and drives the briefed edge forms through both helpers.
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
// The extraction must have found the exact new regexes; otherwise stop.
if (!code.includes('const BLOCK_COMMENT_RE = /\\/\\*[\\s\\S]*?\\*\\//g;') ||
    !code.includes('const BLOCK_DISABLE_RE = /(?:eslint|oxlint)-disable(?:-next-line|-line)?/;') ||
    !code.includes('const TRAILING_DISABLE_RE = /\\s*\\/\\/\\s*(?:eslint|oxlint)-disable\\S*.*$/;')) {
  console.error('EXTRACT FAILED: the new regexes are not at the expected lines of the test file');
  process.exit(2);
}
eval(code);

let failures = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + ' -> ' + JSON.stringify(got) + (ok ? '' : '  want ' + JSON.stringify(want)));
};

// 1. mid-line block disable, eslint spelling, no rule list
check('mid-line block kinds', directiveKindsOfFile('const keep = 1; /* eslint-disable */\nexport const x = 2;\n'), { kinds: ['block'], total: 1, blocks: 1 });
check('mid-line block strip keeps code', stripDisableComments('const keep = 1; /* eslint-disable */\n'), 'const keep = 1; \n');

// 2. multi-line block disable, oxlint spelling, rule list
const multi = 'const a = 1;\n/* oxlint-disable\n   no-unused-vars */\nconst b = a;\n';
check('multi-line block kinds', directiveKindsOfFile(multi), { kinds: ['block'], total: 1, blocks: 1 });
check('multi-line block strip', stripDisableComments(multi), 'const a = 1;\n\nconst b = a;\n');

// 3. mid-line block with rule list and -- reason
check('mid-line block rule list kinds', directiveKindsOfFile('code(); /* eslint-disable no-unused-vars -- legacy */\n'), { kinds: ['block'], total: 1, blocks: 1 });
check('mid-line block rule list strip', stripDisableComments('code(); /* eslint-disable no-unused-vars -- legacy */\n'), 'code(); \n');

// 4. block spelling of disable-next-line, mid-line, both spellings
check('mid-line block next-line eslint', directiveKindsOfFile('code(); /* eslint-disable-next-line no-unused-vars */\nbad();\n'), { kinds: ['next-line'], total: 1, blocks: 0 });
check('mid-line block next-line oxlint', directiveKindsOfFile('code(); /* oxlint-disable-next-line no-unused-vars */\nbad();\n'), { kinds: ['next-line'], total: 1, blocks: 0 });
check('mid-line block next-line strip', stripDisableComments('code(); /* eslint-disable-next-line no-unused-vars */\nbad();\n'), 'code(); \nbad();\n');

// 5. block spelling of disable-line
check('mid-line block disable-line', directiveKindsOfFile('bad(); /* eslint-disable-line */\n'), { kinds: ['trailing'], total: 1, blocks: 0 });

// 6. whole-line JSX form still counts and strips
check('JSX block kinds', directiveKindsOfFile('export function C() {\n  return (\n    <div>\n      {/* eslint-disable */}\n      <img />\n    </div>\n  );\n}\n'), { kinds: ['block'], total: 1, blocks: 1 });
check('JSX block strip', stripDisableComments('{/* eslint-disable */}\n'), '{}\n');

// 7. a non-disable block comment must NOT count and must NOT strip
const plain = 'const a = 1; /* plain note about eslint rules */\n';
check('plain mid-line block not counted', directiveKindsOfFile(plain), { kinds: [], total: 0, blocks: 0 });
check('plain mid-line block not stripped', stripDisableComments(plain), plain);
const prose = '/* oxlint replaces eslint; the eslint config moved to .oxlintrc.json */\n';
check('prose block not counted', directiveKindsOfFile(prose), { kinds: [], total: 0, blocks: 0 });
check('prose block not stripped', stripDisableComments(prose), prose);

// 8. eslint-enable must NOT count and must NOT strip
const enable = '/* eslint-enable */\n';
check('enable not counted', directiveKindsOfFile(enable), { kinds: [], total: 0, blocks: 0 });
check('enable not stripped', stripDisableComments(enable), enable);

// 9. trailing // forms unchanged: next-line with rule list and -- reason
check('trailing next-line kinds', directiveKindsOfFile('code()\n// eslint-disable-next-line no-unused-vars -- reason\nbad()\n'), { kinds: ['next-line'], total: 1, blocks: 0 });
check('trailing next-line strip', stripDisableComments('// eslint-disable-next-line no-unused-vars -- reason\n'), '\n');
check('trailing disable-line strip', stripDisableComments('bad(); // eslint-disable-line\n'), 'bad();\n');
check('trailing oxlint-disable strip', stripDisableComments('// oxlint-disable\n'), '\n');

// 10. whole-line block disable (the pre-existing form) still works
check('whole-line block kinds', directiveKindsOfFile('/* eslint-disable react-hooks/exhaustive-deps */\n'), { kinds: ['block'], total: 1, blocks: 1 });

// 11. two block spans on one line count as two directives
check('two spans on one line', directiveKindsOfFile('/* eslint-disable */ code() /* eslint-disable-line */\n'), { kinds: ['block', 'trailing'], total: 2, blocks: 1 });

// 12. mixed: whole-line block plus a trailing // directive on another line
check('mixed kinds', directiveKindsOfFile('/* eslint-disable */\nbad(); // eslint-disable-line\n'), { kinds: ['block', 'trailing'], total: 2, blocks: 1 });

console.log(failures === 0 ? 'ALL EDGE FORMS PASS' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
