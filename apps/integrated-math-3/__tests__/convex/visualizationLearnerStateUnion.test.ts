/**
 * FR-6 Red — Handler learner-state union must not include 'review_due'.
 *
 * At HEAD, both `student.ts` and `parent/visualization.ts` declare the
 * handler-local learner state union as:
 *   `"mastered" | "ready" | "blocked" | "review_due"`
 *
 * But no handler branch ever writes `"review_due"` — all placements are
 * classified into mastered (>=0.8) / ready (>=0.3) / blocked (<0.3).
 * The `"review_due"` member is dead/misleading.
 *
 * Per test-strategy §13 Task 2.3, the strategy decision is to **narrow
 * the union** (remove `review_due` from the handler boundary). The
 * downstream projection still accepts the broader union — this test
 * only checks the handler-local declarations.
 *
 * Red assertion: source files contain `'review_due'` in the union → FAIL.
 * After Green narrows the union, these files will no longer contain
 * `'review_due'` → PASS.
 *
 * This is a **complementary architecture lint** paired with the behavioral
 * fact that the handler never produces `review_due` (documented below).
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'path';

import { getStudentVisualizationHandler } from '@/convex/student';

function readSource(relativePath: string): string {
  return readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('FR-6 — handler learner-state union does not include review_due', () => {
  // Behavioral fact: the handler never produces 'review_due' regardless of
  // masteryEstimate input. This test is invariant (always passes) and
  // documents the behavioral contract.
  it('handler classifies placements only as mastered/ready/blocked (behavioral invariant)', async () => {
    // Seed placements across the full [0, 1] mastery range.
    const placements = [
      { masteryEstimate: 0.0, nodeId: 'n0' },
      { masteryEstimate: 0.15, nodeId: 'n1' },
      { masteryEstimate: 0.3, nodeId: 'n2' },
      { masteryEstimate: 0.5, nodeId: 'n3' },
      { masteryEstimate: 0.79, nodeId: 'n4' },
      { masteryEstimate: 0.8, nodeId: 'n5' },
      { masteryEstimate: 0.95, nodeId: 'n6' },
    ];

    const rowsByTable: Record<string, unknown[]> = {
      placement_results: placements.map((p, i) => ({
        _id: `placement_${i}`,
        _creationTime: 1_780_000_000_000 + i,
        studentId: 'profiles_test',
        ...p,
        confidence: 'medium' as const,
        source: 'placement',
        createdAt: 1_780_000_000_000 + i,
      })),
      student_misconception_state: [],
      student_competency: [],
    };

    const queryMock = vi.fn().mockImplementation((tableName: string) => {
      const rows = rowsByTable[tableName] ?? [];
      return {
        withIndex: vi.fn().mockImplementation(
          (
            _indexName: string,
            builder?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
          ) => {
            let filtered = [...rows];
            const eqChain = {
              eq: (field: string, value: unknown) => {
                filtered = filtered.filter(
                  (r) => (r as Record<string, unknown>)[field] === value,
                );
                return eqChain;
              },
            };
            if (builder) builder(eqChain);
            return {
              collect: () => Promise.resolve(filtered),
              first: () => Promise.resolve(filtered[0] ?? null),
              unique: () => Promise.resolve(filtered[0] ?? null),
            };
          },
        ),
        collect: () => Promise.resolve(rows),
        first: () => Promise.resolve(rows[0] ?? null),
        unique: () => Promise.resolve(rows[0] ?? null),
      };
    });

    const ctx = { db: { query: queryMock } };
    const result = await getStudentVisualizationHandler(
      ctx as unknown as Parameters<typeof getStudentVisualizationHandler>[0],
      { userId: 'profiles_test' as Parameters<typeof getStudentVisualizationHandler>[1]['userId'] },
    );

    // StudentVisualizationV1 partitions nodes into separate buckets
    // (mastered/ready/blocked/reviewDue/recommendedNext); gather states
    // from all of them to check the handler never emits 'review_due'.
    const allNodes = [
      ...result.mastered,
      ...result.ready,
      ...result.blocked,
      ...result.reviewDue,
      ...result.recommendedNext,
    ];
    const states = new Set(
      allNodes.map((n: { state?: string }) => n.state).filter(Boolean),
    );

    // The handler must never emit 'review_due'.
    expect(states).not.toContain('review_due');
  });

  // Source-level complement: the handler source files must not declare
  // 'review_due' in their handler-local union types.
  it('student.ts handler-local union does not contain review_due', () => {
    const src = readSource('../../convex/student.ts');
    // At HEAD, line 501: `Record<string, "mastered" | "ready" | "blocked" | "review_due">`
    // This assertion FAILS at HEAD.
    expect(src).not.toContain("'review_due'");
  });

  it('parent/visualization.ts handler-local union does not contain review_due', () => {
    const src = readSource('../../convex/parent/visualization.ts');
    // At HEAD, lines 56, 67, 126: union includes 'review_due'
    // This assertion FAILS at HEAD.
    expect(src).not.toContain("'review_due'");
  });
});
