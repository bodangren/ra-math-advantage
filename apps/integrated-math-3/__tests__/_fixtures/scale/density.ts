/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — frozen density constants.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §2 these
 * values encode "density realism": per-student card count, review-log depth,
 * and submission count must match published-curriculum module size. They live
 * in a fixture (not in the implementation) so updates require a deliberate
 * commit message rationale and regenerated expected-row-count snapshots.
 */

/**
 * SRS cards per student at realistic density. Mirrors a 9-module curriculum
 * with ~2 active objectives per lesson and ~20 active cards at any time.
 */
export const SCALE_CARDS_PER_STUDENT = 20 as const;

/**
 * Review-log entries per card. Average depth ~3 reviews per card matches a
 * 4-week rolling retention window used by the daily-practice queue.
 */
export const SCALE_REVIEWS_PER_CARD = 3 as const;

/**
 * Activity submissions per student. Sized to surface heatmap/gradebook
 * workload without making `study_sessions` dominate the docs-read budget.
 */
export const SCALE_SUBMISSIONS_PER_STUDENT = 12 as const;

/**
 * Classes per 1,000-student school. 1000 / 30 = 33.3 — round up to 34 so
 * every class is a full 30-student section (no partial tail).
 */
export const SCALE_CLASSES_PER_SCHOOL = 34 as const;

/**
 * Teachers per 1,000-student school. One teacher per class (matches K-12
 * homeroom model used by the IM3 dashboard).
 */
export const SCALE_TEACHERS_PER_SCHOOL = 34 as const;