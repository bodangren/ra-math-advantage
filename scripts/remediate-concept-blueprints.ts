// Concept blueprint remediation script.
// Reads all IM3 `blueprints.json` files, filters out `nodeId`s matching
// `/\.concept\./` (i.e., blueprint targets pointing at a concept node),
// and rewrites the JSON files.
//
// Concept nodes are aggregators that bundle multiple child skills. They are
// not valid direct blueprint targets — projections resolve them via
// `findChildSkills` / `selectSkill` in
// `@math-platform/knowledge-space-practice/projections/activity-map`.
//
// Usage:
//   npx tsx scripts/remediate-concept-blueprints.ts --dry-run   # show changes
//   npx tsx scripts/remediate-concept-blueprints.ts             # rewrite in place

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');
const CONCEPT_NODE_ID_PATTERN = /\.concept\./;

interface Blueprint {
  nodeId: string;
  [k: string]: unknown;
}

interface BlueprintFile {
  blueprints: Blueprint[];
  [k: string]: unknown;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

function findBlueprintFiles(): string[] {
  const out: string[] = [];
  const root = path.join(REPO_ROOT, 'apps/integrated-math-3');
  walk(root, out);
  return out;
}

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name === 'blueprints.json') {
      out.push(full);
    }
  }
}

function removeConceptBlueprints(file: string): { removed: number; kept: number } {
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = JSON.parse(raw) as BlueprintFile;
  if (!Array.isArray(parsed.blueprints)) {
    return { removed: 0, kept: 0 };
  }

  const before = parsed.blueprints.length;
  const kept = parsed.blueprints.filter((bp) => !CONCEPT_NODE_ID_PATTERN.test(bp.nodeId));
  const removed = before - kept.length;

  if (removed === 0) {
    return { removed: 0, kept: before };
  }

  parsed.blueprints = kept;

  if (!dryRun) {
    fs.writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8');
  }

  return { removed, kept: kept.length };
}

function main() {
  const files = findBlueprintFiles();
  let totalRemoved = 0;
  let totalFiles = 0;

  for (const file of files) {
    const { removed } = removeConceptBlueprints(file);
    if (removed > 0) {
      totalFiles += 1;
      totalRemoved += removed;
      const rel = path.relative(REPO_ROOT, file);
      console.log(`${dryRun ? '[dry-run] would remove' : 'removed'} ${removed} concept blueprint(s) from ${rel}`);
    }
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}done — ${totalRemoved} concept blueprint(s) across ${totalFiles} file(s)`,
  );
}

main();