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

// ============================================
// Verdict Map Type (FR1)
// ============================================

type EdgeVerdicts = { a?: CalibrationVerdict; b?: CalibrationVerdict };
export type VerdictMap = ReadonlyMap<string, EdgeVerdicts>;

// ============================================
// Observation Extraction (FR1)
// ============================================

export function extractObservations(verdicts: VerdictMap): CalibrationObservation[] {
  const observations: CalibrationObservation[] = [];
  for (const [studentId, v] of verdicts) {
    if (v.a !== undefined && v.b !== undefined) {
      observations.push({ studentId, a: v.a, b: v.b });
    }
  }
  return observations;
}

// ============================================
// Contingency Table (FR2)
// ============================================

export function buildContingencyTable(
  observations: ReadonlyArray<CalibrationObservation>,
): CalibrationContingencyTable {
  const table: CalibrationContingencyTable = {
    proficientAProficientB: 0,
    proficientANotProficientB: 0,
    notProficientAProficientB: 0,
    notProficientANotProficientB: 0,
  };
  for (const obs of observations) {
    if (obs.a && obs.b) table.proficientAProficientB++;
    else if (obs.a && !obs.b) table.proficientANotProficientB++;
    else if (!obs.a && obs.b) table.notProficientAProficientB++;
    else table.notProficientANotProficientB++;
  }
  return table;
}

export function computeNecessity(table: CalibrationContingencyTable): number {
  const notProfA = table.notProficientAProficientB + table.notProficientANotProficientB;
  if (notProfA === 0) return 0;
  return table.notProficientAProficientB / notProfA;
}

export function computeInformativeness(table: CalibrationContingencyTable): number {
  const profA = table.proficientAProficientB + table.proficientANotProficientB;
  const notProfA = table.notProficientAProficientB + table.notProficientANotProficientB;
  if (profA === 0 || notProfA === 0) return 0;
  const pBGivenA = table.proficientAProficientB / profA;
  const pBGivenNotA = table.notProficientAProficientB / notProfA;
  return pBGivenA - pBGivenNotA;
}

// ============================================
// Beta-Bernoulli Posterior (FR3)
// ============================================

export function posteriorMean(alpha: number, beta: number): number {
  if (alpha + beta === 0) return 0;
  return alpha / (alpha + beta);
}

export function posteriorVariance(alpha: number, beta: number): number {
  const ab = alpha + beta;
  if (ab === 0) return 0;
  return (alpha * beta) / (ab * ab * (ab + 1));
}

export function updatePosterior(
  state: EdgeCalibration,
  observation: CalibrationObservation,
  opts?: { now?: number },
): EdgeCalibration {
  let alpha = state.alpha;
  let beta = state.beta;
  if (observation.a && observation.b) {
    alpha++;
  } else if (observation.a && !observation.b) {
    beta++;
  }
  return {
    ...state,
    alpha,
    beta,
    lastUpdated: opts?.now ?? state.lastUpdated,
  };
}

// ============================================
// Recency Decay (FR4)
// ============================================

export function applyDecay(
  state: EdgeCalibration,
  lambda: number,
  now: number,
): EdgeCalibration {
  return {
    ...state,
    alpha: state.alpha * lambda,
    beta: state.beta * lambda,
    lastUpdated: now,
  };
}

// ============================================
// Variance Bucketing (FR3)
// ============================================

export function bucketVariance(
  variance: number,
  alpha?: number,
  beta?: number,
): string {
  if (alpha !== undefined && beta !== undefined && alpha + beta === 0) return 'none';
  if (variance >= 0.2) return 'low';
  if (variance >= 0.05) return 'medium';
  return 'high';
}

// ============================================
// Status Classification (FR5) — Confounding Guardrail
// ============================================

export function classifyStatus(
  verdicts: VerdictMap,
  state: EdgeCalibration,
): EdgeCalibration {
  const hasConfoundingBreaker = [...verdicts.values()].some(
    (v) => v.b !== undefined && v.a === undefined,
  );

  const hasPairedObs = [...verdicts.values()].some(
    (v) => v.a !== undefined && v.b !== undefined,
  );

  if (!hasConfoundingBreaker || !hasPairedObs) {
    return { ...state, status: 'untested' };
  }

  const mean = posteriorMean(state.alpha, state.beta);
  const totalEvidence = state.alpha + state.beta;

  if (mean > 0.5 && totalEvidence > 2) {
    return { ...state, status: 'confirmed' };
  }
  if (mean < 0.5 && totalEvidence > 2) {
    return { ...state, status: 'refuted' };
  }
  return { ...state, status: 'untested' };
}
