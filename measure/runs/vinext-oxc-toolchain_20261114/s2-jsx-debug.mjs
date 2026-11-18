// Review A r4 debug: how does the TypeScript TSX scanner treat disable text in
// JSX text position, and how does a block comment with a // line inside classify.
import * as ts from 'typescript';

const forms = [
  ['jsx-text-block.tsx', 'export function P() {\n  return <div>/* eslint-disable */</div>;\n}\nconst unused = 1;\n'],
  ['jsx-text-line.tsx', 'export function P() {\n  return <div>// eslint-disable-next-line</div>;\n}\nconst unused = 1;\n'],
  ['jsx-text-line-lf.tsx', 'const a = <div>\n// eslint-disable-next-line\n</div>;\n'],
  ['block-with-line-inside.ts', '/* eslint-disable\n// eslint-disable-next-line\n*/\nconst unused = 2;\nexport {};\n'],
];

for (const [name, content] of forms) {
  const sf = ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ranges = [];
  const seen = new Set();
  const add = (pos, end) => {
    const key = `${pos}-${end}`;
    if (seen.has(key)) return;
    seen.add(key);
    ranges.push({ pos, end, text: JSON.stringify(content.slice(pos, end)) });
  };
  const visit = (node) => {
    for (const r of ts.getLeadingCommentRanges(content, node.getFullStart()) ?? []) add(r.pos, r.end);
    for (const r of ts.getTrailingCommentRanges(content, node.getEnd()) ?? []) add(r.pos, r.end);
    for (const child of node.getChildren(sf)) visit(child);
  };
  visit(sf);
  const kinds = [];
  sf.forEachChild(function walk(n) {
    kinds.push(ts.SyntaxKind[n.kind]);
    n.forEachChild(walk);
  });
  console.log(name, 'ranges:', JSON.stringify(ranges));
  console.log('  top kinds:', kinds.join(','));
}
