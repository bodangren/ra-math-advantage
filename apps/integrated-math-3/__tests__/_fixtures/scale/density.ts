/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — frozen density constants.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 these
 * values encode "density realism": per-student card count, review-log depth,
 * and submission count must match published-curriculum module size. They live
 * in a fixture (not in the implementation) so updates require a deliberate
 * commit message rationale and regenerated expected-row-count snapshots.
 */

export {
  SCALE_CARDS_PER_STUDENT,
  SCALE_CLASSES_PER_SCHOOL,
  SCALE_REVIEWS_PER_CARD,
  SCALE_SUBMISSIONS_PER_STUDENT,
  SCALE_TEACHERS_PER_SCHOOL,
} from '@/lib/scale/constants';