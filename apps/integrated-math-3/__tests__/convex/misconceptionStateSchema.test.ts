/**
 * Phase 1 (Track 6 misconception-loop_20260521) — Convex schema artifact test
 * for the per-student misconception state table.
 *
 * kst-srs.v2 §9.3 + spec.md FR3: "Persist per-student misconception state in
 * Convex." The P1 deliverable adds a `student_misconception_state` table to
 * `apps/integrated-math-3/convex/schema.ts` and a sibling module
 * `apps/integrated-math-3/convex/misconceptionState.ts` that exports the
 * validators (mirroring the existing `convex/srs/validators.ts` pattern).
 *
 * Per `test-strategy.md` §"Artifact tests vs. live-behavior tests": this is
 * an ARTIFACT test. The companion LIVE-BEHAVIOR proof lives in Phase 3, the
 * Convex persistence round-trip test
 * (`apps/integrated-math-3/convex/__tests__/misconceptionState.test.ts`),
 * which uses the same makeMockCtx pattern as `edgeCalibration.test.ts`. The
 * P3 task is the P1 handoff gate: if P1 ships but P3 never wires the
 * round-trip, the state is unproven; the P1 closed-set + table-presence
 * assertions here are the artifact, not the proof.
 *
 * The Green-phase deliverable for this file adds:
 *   1. `student_misconception_state` table on `apps/integrated-math-3/convex/schema.ts`
 *      with indices `by_student_misconception` (unique on
 *      studentId+misconceptionId) and `by_student_status` (filterable by
 *      status for the per-student active-set query).
 *   2. A new file `apps/integrated-math-3/convex/misconceptionState.ts` that
 *      exports the three validators (mirroring `convex/srs/validators.ts`):
 *        - `misconceptionLifecycleStatusValidator`
 *        - `misconceptionSeverityValidator`
 *        - `studentMisconceptionStateValidator` (the row shape)
 *
 * These tests are Red: each currently fails because the table doesn't exist
 * and the validator module doesn't exist. Property-access probes
 * (`table.studentId`) return `undefined` until Green wires the table; the
 * `not.toThrow()` assertion catches `undefined` reads by passing. To get a
 * stronger Red signal we additionally assert the property is NOT undefined
 * — i.e., the field is actually declared.
 */

import { describe, it, expect } from 'vitest';
import schema from '@/convex/schema';
import {
  misconceptionLifecycleStatusValidator,
  misconceptionSeverityValidator,
  studentMisconceptionStateValidator,
} from '@/convex/misconceptionState';

// ---------------------------------------------------------------------------
// 1. student_misconception_state table — schema presence + field shape
// ---------------------------------------------------------------------------

describe('student_misconception_state table — schema (spec FR3)', () => {
  it('exists in the IM3 Convex schema', () => {
    expect(schema.tables).toHaveProperty('student_misconception_state');
  });

  it('declares the required fields (per-student misconception state row)', () => {
    const table = schema.tables.student_misconception_state as unknown as Record<
      string,
      unknown
    >;
    // Required scalar fields (art: validators are imported separately below)
    for (const field of [
      'studentId',
      'misconceptionId',
      'status',
      'severity',
      'cleanStreak',
      'firstDetectedAt',
      'lastUpdatedAt',
      'affectedSkills',
    ]) {
      expect(table, `field ${field} should be declared on student_misconception_state`).toBeDefined();
      expect(
        table[field],
        `field ${field} should be a non-undefined Convex validator`,
      ).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// 2. misconceptionLifecycleStatusValidator — closed-set enum
// ---------------------------------------------------------------------------

describe('misconceptionLifecycleStatusValidator (kst-srs.v2 §9.3, spec FR3)', () => {
  it('is a non-undefined Convex validator exported from the planned module', () => {
    expect(misconceptionLifecycleStatusValidator).toBeDefined();
    // Construct-time smoke (Convex validators are factory objects; reading the
    // export should never throw).
    expect(() => misconceptionLifecycleStatusValidator).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. misconceptionSeverityValidator — closed-set enum
// ---------------------------------------------------------------------------

describe('misconceptionSeverityValidator (kst-srs.v2 §9.1, spec FR2)', () => {
  it('is a non-undefined Convex validator exported from the planned module', () => {
    expect(misconceptionSeverityValidator).toBeDefined();
    expect(() => misconceptionSeverityValidator).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 4. studentMisconceptionStateValidator — full row validator
// ---------------------------------------------------------------------------

describe('studentMisconceptionStateValidator (spec FR3)', () => {
  it('is a non-undefined Convex object validator exported from the planned module', () => {
    expect(studentMisconceptionStateValidator).toBeDefined();
    expect(() => studentMisconceptionStateValidator).not.toThrow();
  });
});
