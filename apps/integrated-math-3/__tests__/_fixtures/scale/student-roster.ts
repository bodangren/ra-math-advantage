/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — frozen roster counts.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 the
 * 30-student class and 1,000-student school roster sizes are documented,
 * frozen, and pinned by the generator tests. They live in a fixture so
 * updates require a deliberate commit message rationale.
 */

export {
  SCALE_STUDENT_COUNT_CLASS,
  SCALE_STUDENT_COUNT_SCHOOL,
} from '@/lib/scale/constants';