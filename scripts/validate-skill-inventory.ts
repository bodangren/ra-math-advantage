#!/usr/bin/env npx tsx
/**
 * Validate committed draft-nodes.json files against the knowledge-space.v1 schema.
 *
 * Usage:
 *   npx tsx scripts/validate-skill-inventory.ts
 *   npx tsx scripts/validate-skill-inventory.ts im3
 *
 * Exits non-zero if any node fails validation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { knowledgeSpaceNodeSchema } from '../packages/knowledge-space-core/src/schemas';

const REPO_ROOT = path.resolve(__dirname, '..');

const COURSE_PATHS: Record<string, string> = {
  im1: 'apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json',
  im2: 'apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json',
  im3: 'apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json',
  precalc: 'apps/pre-calculus/curriculum/skill-graph/draft-nodes.json',
};

function validateCourse(course: string, filePath: string): number {
  if (!fs.existsSync(filePath)) {
    console.error(`  MISSING: ${filePath}`);
    return 1;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
  const nodes: unknown[] = Array.isArray(raw)
    ? raw
    : (raw as Record<string, unknown[]>).nodes ?? [];

  let failures = 0;
  for (const node of nodes) {
    const result = knowledgeSpaceNodeSchema.safeParse(node);
    if (!result.success) {
      const id = (node as Record<string, unknown>).id ?? '(no id)';
      console.error(`  FAIL [${course}] ${id}`);
      for (const issue of result.error.issues) {
        console.error(`    ${issue.path.join('.')}: ${issue.message}`);
      }
      failures++;
    }
  }

  if (failures === 0) {
    console.log(`  OK  [${course}] ${nodes.length} nodes`);
  } else {
    console.error(`  FAIL [${course}] ${failures}/${nodes.length} nodes invalid`);
  }

  return failures;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const courses = args.length > 0 ? args : Object.keys(COURSE_PATHS);

  let totalFailures = 0;

  for (const course of courses) {
    const rel = COURSE_PATHS[course];
    if (!rel) {
      console.error(`Unknown course: ${course}. Use im1, im2, im3, or precalc.`);
      process.exit(1);
    }
    totalFailures += validateCourse(course, path.join(REPO_ROOT, rel));
  }

  if (totalFailures > 0) {
    console.error(`\n${totalFailures} validation error(s) — fix before committing.`);
    process.exit(1);
  }

  console.log(`\nAll nodes valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
