// Concept blueprint remediation script.
// Reads all blueprint artifacts in the repo (`activity-map.json` files
// under `curriculum/implementation/practice-v1/` AND legacy
// `blueprints.json` files under `curriculum/skill-graph/`), filters out
// `nodeId`s/`activityId`s matching `/\.concept\./` (i.e., blueprint
// targets pointing at a concept node), and rewrites the JSON files.
//
// Concept nodes are aggregators that bundle multiple child skills. They
// are not valid direct blueprint targets — projections resolve them via
// `findChildSkills` / `selectSkill` in
// `@math-platform/knowledge-space-practice/projections/activity-map`.
//
// FR-12 fix: the original script only walked `apps/integrated-math-3/`
// and only matched files literally named `blueprints.json`. The real
// blueprint artifact (per the original
// `precalc-alignment-concept-taxonomy_20260510` track) is the
// `activity-map.json` files under `curriculum/implementation/practice-v1/`
// across all apps. The new `findBlueprintFiles` walks the configured
// `scanRoots` and matches the activity-map shape (with `activities[]`)
// AND the legacy blueprints shape (with `blueprints[]`).
//
// Usage:
//   npx tsx scripts/remediate-concept-blueprints.ts --dry-run   # show changes
//   npx tsx scripts/remediate-concept-blueprints.ts             # rewrite in place

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '..');
export const CONCEPT_NODE_ID_PATTERN = /\.concept\./;

export interface Blueprint {
  nodeId: string;
  [k: string]: unknown;
}

export interface ActivityRow {
  activityId: string;
  [k: string]: unknown;
}

export interface BlueprintFile {
  blueprints?: Blueprint[];
  activities?: ActivityRow[];
  [k: string]: unknown;
}

export interface ScanOptions {
  repoRoot: string;
  scanRoots: string[]; // e.g. ['apps']
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * Default include globs relative to each scan root. The activity-map
 * artifact (per the precalc-alignment-concept-taxonomy track notes) is
 * the primary target; the legacy `blueprints.json` files are kept for
 * back-compat with the IM3 module-N shards.
 */
export const DEFAULT_INCLUDE_GLOBS = [
  '**/curriculum/implementation/practice-v1/activity-map.json',
  '**/curriculum/skill-graph/blueprints.json',
  '**/curriculum/skill-graph/**/blueprints.json',
];

/**
 * Find all blueprint artifact files under the given scan roots. The
 * scan covers both the practice-v1 `activity-map.json` shape (which
 * holds the per-period activity rows) and the legacy
 * `curriculum/skill-graph/blueprints.json` files (and module-N shards).
 */
export function findBlueprintFiles(opts: ScanOptions): string[] {
  const out: string[] = [];
  for (const root of opts.scanRoots) {
    const abs = path.join(opts.repoRoot, root);
    if (!fs.existsSync(abs)) continue;
    walk(abs, out);
  }
  return out;
}

function walk(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && isBlueprintArtifact(entry.name)) {
      out.push(full);
    }
  }
}

function isBlueprintArtifact(name: string): boolean {
  if (name === 'blueprints.json') return true;
  if (name === 'activity-map.json') return true;
  return false;
}

/**
 * Count how many rows in a parsed blueprint file target a concept
 * node (per the `CONCEPT_NODE_ID_PATTERN`). Inspects both the legacy
 * `blueprints[].nodeId` shape and the activity-map
 * `activities[].activityId` shape.
 */
export function countConceptBlueprints(parsed: BlueprintFile): number {
  let n = 0;
  for (const bp of parsed.blueprints ?? []) {
    if (CONCEPT_NODE_ID_PATTERN.test(bp.nodeId)) n += 1;
  }
  for (const act of parsed.activities ?? []) {
    if (CONCEPT_NODE_ID_PATTERN.test(act.activityId)) n += 1;
  }
  return n;
}

/**
 * Remove concept-targeting rows from a parsed blueprint file. Returns
 * the count of removed rows and the kept row counts per shape. The
 * file is NOT written; the caller decides whether to persist.
 */
export function removeConceptBlueprints(parsed: BlueprintFile): {
  removed: number;
  keptBlueprints: number;
  keptActivities: number;
} {
  let removed = 0;
  let keptBlueprints = 0;
  let keptActivities = 0;

  if (Array.isArray(parsed.blueprints)) {
    const before = parsed.blueprints.length;
    const kept = parsed.blueprints.filter(
      (bp) => !CONCEPT_NODE_ID_PATTERN.test(bp.nodeId),
    );
    removed += before - kept.length;
    keptBlueprints = kept.length;
    parsed.blueprints = kept;
  }

  if (Array.isArray(parsed.activities)) {
    const before = parsed.activities.length;
    const kept = parsed.activities.filter(
      (act) => !CONCEPT_NODE_ID_PATTERN.test(act.activityId),
    );
    removed += before - kept.length;
    keptActivities = kept.length;
    parsed.activities = kept;
  }

  return { removed, keptBlueprints, keptActivities };
}

export interface RemediateSummary {
  filesScanned: number;
  filesWithConceptBlueprints: number;
  totalRemoved: number;
  artifacts: Array<{ path: string; removed: number }>;
}

/**
 * Run the remediation across all blueprint artifacts under the scan
 * roots. Returns a summary; if `dryRun` is false, the files are
 * rewritten in place. The function does NOT log; the CLI wrapper does.
 */
export function remediate(opts: {
  repoRoot: string;
  scanRoots: string[];
  dryRun: boolean;
}): RemediateSummary {
  const files = findBlueprintFiles({
    repoRoot: opts.repoRoot,
    scanRoots: opts.scanRoots,
  });
  const summary: RemediateSummary = {
    filesScanned: files.length,
    filesWithConceptBlueprints: 0,
    totalRemoved: 0,
    artifacts: [],
  };
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as BlueprintFile;
    const { removed } = removeConceptBlueprints(parsed);
    if (removed > 0) {
      summary.filesWithConceptBlueprints += 1;
      summary.totalRemoved += removed;
      summary.artifacts.push({ path: file, removed });
      if (!opts.dryRun) {
        fs.writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8');
      }
    }
  }
  return summary;
}

export function main(): void {
  const summary = remediate({
    repoRoot: REPO_ROOT,
    scanRoots: ['apps'],
    dryRun,
  });
  for (const art of summary.artifacts) {
    const rel = path.relative(REPO_ROOT, art.path);
    console.log(
      `${dryRun ? '[dry-run] would remove' : 'removed'} ${art.removed} concept blueprint(s) from ${rel}`,
    );
  }
  console.log(
    `${dryRun ? '[dry-run] ' : ''}scanned ${summary.filesScanned} file(s); done — ${summary.totalRemoved} concept blueprint(s) across ${summary.filesWithConceptBlueprints} file(s)`,
  );
}

// Only run main when invoked as a CLI (not when imported for tests).
// The `process.argv[1]` check distinguishes a `tsx scripts/...` invocation
// from an import-driven test run.
const isCliInvocation =
  process.argv[1] != null &&
  (process.argv[1].endsWith('remediate-concept-blueprints.ts') ||
    process.argv[1].endsWith('remediate-concept-blueprints.js'));
if (isCliInvocation) {
  main();
}
