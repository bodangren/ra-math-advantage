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

/** School-scale roster: 1,020 students, 34 classes, 34 teachers. 1020 = 34 × 30 — every class is a full 30-student section. */
export const SCALE_STUDENT_COUNT_SCHOOL = 1_020 as const;