/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — frozen roster counts.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 the
 * 30-student class and 1,000-student school roster sizes are documented,
 * frozen, and pinned by the generator tests. They live in a fixture so
 * updates require a deliberate commit message rationale.
 */

/** Class-scale roster: 30 students, 1 class, 1 teacher. */
export const SCALE_STUDENT_COUNT_CLASS = 30 as const;

/** School-scale roster: 1,000 students, ~34 classes, ~34 teachers. */
export const SCALE_STUDENT_COUNT_SCHOOL = 1_000 as const;