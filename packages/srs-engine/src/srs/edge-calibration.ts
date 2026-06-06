/**
 * Edge Calibration Types
 *
 * Track 3: Edge Calibration Loop.
 *
 * Domain-neutral type definitions for the Beta-Bernoulli edge calibration
 * system. These types are the contract surface for Phase 2 (calibration core)
 * and Phase 3 (persistence / review queue).
 *
 * The calibration status enum is intentionally distinct from `ReviewStatus`
 * in `@math-platform/knowledge-space-core` — see the status-distinctness
 * tests for the rationale.
 */

// ============================================
// Calibration Status (FR5)
// ============================================

/**
 * The three calibration statuses defined by spec FR5.
 *
 * - `confirmed` — evidence supports the authored edge
 * - `refuted`   — evidence contradicts the authored edge
 * - `untested`  — no student has attempted B without a verdict on A (confounding guardrail)
 */
export type CalibrationStatus = 'confirmed' | 'refuted' | 'untested';

/**
 * Readonly tuple of all valid `CalibrationStatus` values.
 * Used for exhaustive iteration and runtime validation.
 */
export const CALIBRATION_STATUS_VALUES: readonly CalibrationStatus[] = [
  'confirmed',
  'refuted',
  'untested',
] as const;

// ============================================
// Calibration Verdict & Observation (FR1)
// ============================================

/**
 * A single proficiency verdict — `true` = proficient, `false` = not proficient.
 */
export type CalibrationVerdict = boolean;

/**
 * A paired observation for one student on an edge A → B.
 * Both `a` and `b` are boolean proficiency verdicts.
 */
export type CalibrationObservation = {
  studentId: string;
  a: CalibrationVerdict;
  b: CalibrationVerdict;
};

// ============================================
// Contingency Table (FR2)
// ============================================

/**
 * The 2×2 contingency table for an edge A → B.
 * Each field is a count of students in that quadrant.
 */
export type CalibrationContingencyTable = {
  proficientAProficientB: number;
  proficientANotProficientB: number;
  notProficientAProficientB: number;
  notProficientANotProficientB: number;
};

// ============================================
// Edge Calibration Record (FR3, FR7)
// ============================================

/**
 * Per-edge Beta-Bernoulli calibration state.
 *
 * `alpha` and `beta` are the posterior parameters of the Beta distribution
 * modelling edge necessity. `status` reflects the current evidence assessment.
 */
export type EdgeCalibration = {
  edgeId: string;
  alpha: number;
  beta: number;
  status: CalibrationStatus;
  lastUpdated: number;
};

// ============================================
// Necessity / Informativeness Result (FR2)
// ============================================

/**
 * The computed calibration statistics for a single edge.
 *
 * - `necessity`       = 1 − P(proficient B | not proficient A)
 * - `informativeness` = P(proficient B | proficient A) − P(proficient B | not proficient A)
 * - `sampleSize`      = total observations used
 * - `status`          = derived CalibrationStatus from the evidence
 */
export type CalibrationNecessityResult = {
  edgeId: string;
  necessity: number;
  informativeness: number;
  sampleSize: number;
  status: CalibrationStatus;
};

// ============================================
// Review Queue Item (FR6)
// ============================================

/**
 * An edge flagged for human review because its calibrated posterior diverges
 * from the authored weight/confidence beyond the configured threshold.
 *
 * Carries the full contingency table and both authored and calibrated
 * weight/confidence for side-by-side comparison.
 */
export type CalibrationReviewQueueItem = {
  edgeId: string;
  contingencyTable: CalibrationContingencyTable;
  authoredWeight: number;
  authoredConfidence: string;
  calibratedWeight: number;
  calibratedConfidence: string;
  necessity: number;
  informativeness: number;
  divergence: number;
  flaggedAt: number;
};
