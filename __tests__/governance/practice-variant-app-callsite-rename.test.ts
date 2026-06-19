/**
 * Phase 4 — Docs & Doctor (Track 7: Practice-Variant Rename)
 *
 * Focused follow-up audit: the P3 scope covered cards.ts, processReview.ts,
 * submissionSrs.ts, and lib/srs/convexCardStore.ts. The daily-practice flow
 * also depends on objectiveProficiency.ts, queue/queue.ts, and
 * timing_baseline.ts, plus their supporting callers. The Convex schema already
 * renamed timing_baselines and srs_cards to use variantKey / by_variant /
 * by_student_and_variant; source code that still references the legacy field
 * or index names is inconsistent and will fail at runtime.
 *
 * This test asserts that the daily-practice app-layer call sites do not carry
 * the legacy identifiers. Migrations and test files are excluded because they
 * intentionally reference the old names.
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

const SOURCE_FILES = [
  'apps/integrated-math-3/convex/objectiveProficiency.ts',
  'apps/integrated-math-3/convex/queue/queue.ts',
  'apps/integrated-math-3/convex/teacher/srs_mutations.ts',
  'apps/integrated-math-3/convex/efficacy/cohort.ts',
  'apps/integrated-math-3/convex/seed/seed_practice_items.ts',
  'apps/integrated-math-3/convex/seed/seed_problem_families.ts',
  'apps/integrated-math-3/convex/seed/validate_blueprint.ts',
  'apps/integrated-math-3/components/teacher/TeacherObjectiveDiagnosticCard.tsx',
] as const;

interface StaleMatch {
  file: string;
  line: string;
}

function findStaleNameMatches(): StaleMatch[] {
  const pattern =
    '\\b(ProblemFamily|problemFamilyId|problem_families|by_problem_family|by_problemFamilyId|minProblemFamilies)\\b';
  const matches: StaleMatch[] = [];
  for (const file of SOURCE_FILES) {
    const filePath = resolve(REPO_ROOT, file);
    const result = spawnSync('grep', ['-nE', pattern, filePath], {
      encoding: 'utf-8',
    });
    if (result.status === 0 && result.stdout.trim()) {
      for (const rawLine of result.stdout.split('\n').filter(Boolean)) {
        const colonIdx = rawLine.indexOf(':');
        if (colonIdx === -1) continue;
        matches.push({
          file: relative(REPO_ROOT, filePath),
          line: rawLine.slice(colonIdx + 1),
        });
      }
    }
  }
  return matches;
}

describe('practice-variant app-layer call sites', () => {
  it('daily-practice source files have zero legacy problemFamily* identifiers', () => {
    const matches = findStaleNameMatches();
    if (matches.length > 0) {
      const summary = matches.map((m) => `  ${m.file}:${m.line}`).join('\n');
      throw new Error(
        `Found ${matches.length} stale problemFamily* identifier(s) in app-layer daily-practice source:\n${summary}\n` +
          `These call sites must be renamed to variantKey / practice_variants / by_variant / by_variantKey.`,
      );
    }
    expect(matches).toEqual([]);
  });
});
