import type { PracticeSubmissionPart } from './contract';
import type { PracticeTimingFeatures } from './timing-baseline';
import {
  SRS_RATING_POLICY_VERSION,
  srsRatingInputV31Schema,
  srsRatingResultV31Schema,
  type RatingCapDecision,
  type SrsRatingInputV31,
  type SrsRatingResultV31,
  type TimingRatingDecision,
} from './v3-1-contracts';

export type { SrsRatingInputV31 } from './v3-1-contracts';

/**
 * FSRS-compatible rating for a practice attempt.
 *
 * - **Again**: Incorrect or misconception present.
 * - **Hard**: Correct but required hints or revealed steps.
 * - **Good**: Correct without assistance.
 * - **Easy**: Correct and fast relative to baseline.
 */
export type SrsRating = 'Again' | 'Hard' | 'Good' | 'Easy';

/**
 * Input payload for computing an SRS rating from practice evidence.
 *
 * @example
 * ```ts
 * const input: SrsRatingInput = {
 *   parts: [{ isCorrect: true, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: [] }],
 *   timingFeatures: { hasReliableTiming: true, speedBand: 'fast', confidence: 'high', reasons: [] },
 *   baselineSampleCount: 12,
 * };
 * ```
 */
export type SrsRatingInput = {
  /** Practice parts extracted from the submission envelope. */
  parts: Pick<
    PracticeSubmissionPart,
    'isCorrect' | 'hintsUsed' | 'revealStepsSeen' | 'misconceptionTags'
  >[];
  /** Derived timing features for the attempt. */
  timingFeatures: PracticeTimingFeatures;
  /** Number of baseline samples available for the problem family. */
  baselineSampleCount?: number;
};

/**
 * Result of computing a time-aware SRS rating.
 *
 * @example
 * ```ts
 * const result: SrsRatingResult = {
 *   rating: 'Easy',
 *   baseRating: 'Good',
 *   timingAdjusted: true,
 *   reasons: ['timing_fast', 'timing_upgraded_easy'],
 *   timingFeatures: { hasReliableTiming: true, speedBand: 'fast', baselineSampleCount: 12 },
 * };
 * ```
 */
export type SrsRatingResult = {
  /** Final rating after timing adjustments. */
  rating: SrsRating;
  /** Rating computed from correctness before timing is applied. */
  baseRating: SrsRating;
  /** Whether timing caused the final rating to differ from the base rating. */
  timingAdjusted: boolean;
  /** Human-readable audit reasons for the rating decision. */
  reasons: string[];
  /** Snapshot of timing evidence included for diagnostics. */
  timingFeatures?: {
    hasReliableTiming: boolean;
    timeRatio?: number;
    speedBand?: string;
    baselineSampleCount?: number;
  };
};

/**
 * Per-tag severity map for misconception-aware rating.
 *
 * Tags absent from the map default to `'minor'` (cap at Hard).
 * An empty map does NOT regress to the v1 "Again for any tag" behavior.
 */
export type SeverityByTag = Readonly<Record<string, 'minor' | 'severe'>>;

/**
 * Options for {@link computeBaseRating}.
 */
export type ComputeBaseRatingOptions = {
  /** Per-tag severity lookup. Absent tags default to `'minor'`. */
  severityByTag?: SeverityByTag;
};

/**
 * Compute a base SRS rating from practice submission parts.
 *
 * Rules (in order of priority):
 * 1. Any incorrect part → Again
 * 2. Misconception severity (when `options.severityByTag` is provided):
 *    a. Any severe tag → Again
 *    b. Any minor/unknown tag → Hard (cap)
 * 3. Any hints or reveal steps used → Hard
 * 4. All correct with no aids → Good
 * 5. No correctness data → Again (conservative default)
 *
 * Backward compatibility: when `options` is omitted entirely, the v1 behavior
 * is preserved (any misconception tag → Again).
 *
 * @example
 * ```ts
 * const base = computeBaseRating([
 *   { isCorrect: true, hintsUsed: 1, revealStepsSeen: 0, misconceptionTags: [] },
 * ]);
 * // base === 'Hard' because hints were used
 * ```
 */
export function computeBaseRating(
  parts: SrsRatingInput['parts'],
  options?: ComputeBaseRatingOptions,
): SrsRating {
  if (parts.length === 0) {
    return 'Again';
  }

  let allCorrect = true;
  let hasAid = false;
  let hasSevere = false;
  let hasMinor = false;

  for (const part of parts) {
    if (part.isCorrect === false) {
      return 'Again';
    }

    if (part.misconceptionTags && part.misconceptionTags.length > 0) {
      if (options) {
        // v2 severity-aware path
        for (const tag of part.misconceptionTags) {
          const severity = options.severityByTag?.[tag] ?? 'minor';
          if (severity === 'severe') {
            hasSevere = true;
          } else {
            hasMinor = true;
          }
        }
      } else {
        // v1 backward-compatible path: any tag → Again
        return 'Again';
      }
    }

    if ((part.hintsUsed ?? 0) > 0 || (part.revealStepsSeen ?? 0) > 0) {
      hasAid = true;
    }

    if (part.isCorrect !== true) {
      allCorrect = false;
    }
  }

  if (!allCorrect) {
    return 'Again';
  }

  // v2 precedence: severe > minor (cap) > hints > Good
  if (hasSevere) {
    return 'Again';
  }

  if (hasMinor) {
    return 'Hard';
  }

  if (hasAid) {
    return 'Hard';
  }

  return 'Good';
}

/**
 * Apply timing features as a conservative modifier to a base SRS rating.
 *
 * Timing never overrides correctness:
 * - Again stays Again regardless of timing
 * - Hard stays Hard regardless of timing (already penalized for hints/reveals)
 * - Good may become Easy (fast + reliable) or Hard (slow/very_slow + reliable)
 *
 * @example
 * ```ts
 * const timingResult = applyTimingToRating('Good', {
 *   hasReliableTiming: true,
 *   speedBand: 'fast',
 *   confidence: 'high',
 *   reasons: [],
 * });
 * // timingResult.rating === 'Easy'
 * // timingResult.timingAdjusted === true
 * ```
 */
export function applyTimingToRating(
  baseRating: SrsRating,
  timingFeatures: PracticeTimingFeatures,
): Pick<SrsRatingResult, 'rating' | 'timingAdjusted' | 'reasons'> {
  const reasons: string[] = [];

  if (!timingFeatures.hasReliableTiming) {
    reasons.push('timing_ignored_unreliable');
    return { rating: baseRating, timingAdjusted: false, reasons };
  }

  if (timingFeatures.speedBand && timingFeatures.speedBand !== 'expected') {
    reasons.push(`timing_${timingFeatures.speedBand}`);
  }

  if (baseRating === 'Again') {
    return { rating: 'Again', timingAdjusted: false, reasons };
  }

  if (baseRating === 'Good') {
    if (timingFeatures.speedBand === 'fast') {
      reasons.push('timing_upgraded_easy');
      return { rating: 'Easy', timingAdjusted: true, reasons };
    }
    if (timingFeatures.speedBand === 'slow' || timingFeatures.speedBand === 'very_slow') {
      reasons.push('timing_downgraded_hard');
      return { rating: 'Hard', timingAdjusted: true, reasons };
    }
  }

  if (baseRating === 'Hard') {
    // Timing cannot upgrade Hard because hints/reveals already indicate supported work
    return { rating: 'Hard', timingAdjusted: false, reasons };
  }

  return { rating: baseRating, timingAdjusted: false, reasons };
}

/**
 * Map a practice submission and its timing features to a time-aware SRS rating.
 *
 * Returns the final rating, the base rating before timing, whether timing modified
 * the result, and an audit trail of reasons.
 *
 * @example
 * ```ts
 * const result = mapPracticeToSrsRating({
 *   parts: [{ isCorrect: true, hintsUsed: 0, revealStepsSeen: 0, misconceptionTags: [] }],
 *   timingFeatures: { hasReliableTiming: true, speedBand: 'expected', confidence: 'high', reasons: [] },
 * });
 * // result.rating === 'Good'
 * // result.baseRating === 'Good'
 * // result.timingAdjusted === false
 * ```
 */
export function mapPracticeToSrsRating(input: SrsRatingInput): SrsRatingResult {
  const baseRating = computeBaseRating(input.parts);
  const timingResult = applyTimingToRating(baseRating, input.timingFeatures);

  return {
    rating: timingResult.rating,
    baseRating,
    timingAdjusted: timingResult.timingAdjusted,
    reasons: timingResult.reasons,
    timingFeatures: {
      hasReliableTiming: input.timingFeatures.hasReliableTiming,
      timeRatio: input.timingFeatures.timeRatio,
      speedBand: input.timingFeatures.speedBand,
      baselineSampleCount: input.baselineSampleCount,
    },
  };
}

const RATING_ORDER: readonly SrsRating[] = ['Again', 'Hard', 'Good', 'Easy'];

function lowerRating(left: SrsRating, right: SrsRating): SrsRating {
  return RATING_ORDER.indexOf(left) <= RATING_ORDER.indexOf(right) ? left : right;
}

function correctnessRatingV31(parts: SrsRatingInputV31['parts']): {
  allCorrect: boolean;
  rating: SrsRating;
  reason: string;
} {
  const correctCount = parts.filter(({ isCorrect }) => isCorrect).length;

  if (correctCount === parts.length) {
    return { allCorrect: true, rating: 'Good', reason: 'correctness_all' };
  }
  if (correctCount === 0) {
    return { allCorrect: false, rating: 'Again', reason: 'correctness_none' };
  }
  return { allCorrect: false, rating: 'Hard', reason: 'correctness_partial' };
}

function hintCapV31(parts: SrsRatingInputV31['parts']): RatingCapDecision | null {
  const hintsUsed = parts.reduce((total, part) => total + part.hintsUsed, 0);
  if (hintsUsed === 0) return null;

  return hintsUsed <= 2
    ? { stage: 'hint', maxRating: 'Good', applied: true, reason: 'hints_1_2' }
    : { stage: 'hint', maxRating: 'Hard', applied: true, reason: 'hints_3_plus' };
}

function revealCapV31(parts: SrsRatingInputV31['parts']): RatingCapDecision | null {
  const totalRevealSteps = parts.reduce((total, part) => total + part.totalRevealSteps, 0);
  const revealStepsSeen = parts.reduce((total, part) => total + part.revealStepsSeen, 0);
  const allRevealed = totalRevealSteps > 0 && revealStepsSeen === totalRevealSteps;
  if (allRevealed) {
    return { stage: 'reveal', maxRating: 'Again', applied: true, reason: 'reveal_all' };
  }
  if (parts.some(({ revealStepsSeen }) => revealStepsSeen > 0)) {
    return { stage: 'reveal', maxRating: 'Hard', applied: true, reason: 'reveal_partial' };
  }
  return null;
}

function misconceptionCapV31(input: SrsRatingInputV31): RatingCapDecision | null {
  const tags = input.parts.flatMap(({ misconceptionTags }) => misconceptionTags);
  if (tags.length === 0) return null;

  const hasSevere = tags.some((tag) => input.severityByTag[tag] === 'severe');
  return hasSevere
    ? { stage: 'misconception', maxRating: 'Again', applied: true, reason: 'severe' }
    : { stage: 'misconception', maxRating: 'Hard', applied: true, reason: 'minor' };
}

function timingDecisionV31(
  input: SrsRatingInputV31,
  ratingBeforeTiming: SrsRating,
  allCorrect: boolean,
  hasCap: boolean,
): { decision: TimingRatingDecision; rating: SrsRating } {
  if (input.timing === undefined) {
    return {
      decision: {
        eligible: false,
        confidence: 'low',
        baselineSampleCount: 0,
        partDecisions: [],
        adjustment: 'none',
        changedRating: false,
        reasons: ['timing_ineligible', 'timing_absent'],
      },
      rating: ratingBeforeTiming,
    };
  }

  const timing = input.timing;
  const confidenceEligible = timing.confidence !== 'low';
  const partDecisions: TimingRatingDecision['partDecisions'] = [];
  const eligibilityReasons: string[] = [];
  let minimumSampleCount = Number.POSITIVE_INFINITY;
  let hasUnavailablePart = false;

  if (!confidenceEligible) eligibilityReasons.push('timing_confidence_low');

  for (const { partId } of input.parts) {
    const activeMs = timing.perPartMs[partId];
    const baseline = timing.baselinesByPart[partId];
    if (baseline) minimumSampleCount = Math.min(minimumSampleCount, baseline.sampleCount);

    let zScore: number | null = null;
    let band: 'fast' | 'expected' | 'slow' | 'unavailable' = 'unavailable';

    if (activeMs === undefined || baseline === undefined) {
      hasUnavailablePart = true;
      eligibilityReasons.push(
        baseline === undefined ? 'timing_baseline_missing' : 'timing_measurement_missing',
      );
    } else if (baseline.sampleCount < 10) {
      hasUnavailablePart = true;
      eligibilityReasons.push('timing_baseline_samples_insufficient');
    } else if (baseline.stdDevMs <= 0) {
      hasUnavailablePart = true;
      eligibilityReasons.push('timing_baseline_stddev_unavailable');
    } else {
      zScore = (activeMs - baseline.meanMs) / baseline.stdDevMs;
      band = zScore <= -1 ? 'fast' : zScore >= 2 ? 'slow' : 'expected';
    }

    partDecisions.push({ partId, zScore, band });
  }

  const baselineSampleCount = Number.isFinite(minimumSampleCount) ? minimumSampleCount : 0;
  const eligible = confidenceEligible && !hasUnavailablePart;
  if (!eligible) {
    return {
      decision: {
        eligible: false,
        confidence: timing.confidence,
        baselineSampleCount,
        partDecisions,
        adjustment: 'none',
        changedRating: false,
        reasons: [...new Set(['timing_ineligible', ...eligibilityReasons])],
      },
      rating: ratingBeforeTiming,
    };
  }

  const allFast = partDecisions.every(({ band }) => band === 'fast');
  const anySlow = partDecisions.some(({ band }) => band === 'slow');
  let rating = ratingBeforeTiming;
  let adjustment: TimingRatingDecision['adjustment'] = 'none';
  const reasons: string[] = [];

  if (allFast && allCorrect && !hasCap && ratingBeforeTiming === 'Good') {
    rating = 'Easy';
    adjustment = 'upgrade_to_easy';
    reasons.push('timing_fast', 'timing_upgraded_easy');
  } else if (anySlow && ratingBeforeTiming !== 'Again') {
    rating = RATING_ORDER[RATING_ORDER.indexOf(ratingBeforeTiming) - 1];
    adjustment = 'downgrade_one_step';
    reasons.push('timing_slow', 'timing_downgraded_one_step');
  } else {
    reasons.push(allFast ? 'timing_fast_capped' : 'timing_expected');
  }

  return {
    decision: {
      eligible: true,
      confidence: timing.confidence,
      baselineSampleCount,
      partDecisions,
      adjustment,
      changedRating: rating !== ratingBeforeTiming,
      reasons,
    },
    rating,
  };
}

/**
 * Apply the normative v3.1 staged practice-to-SRS rating policy.
 *
 * Stages are correctness, summed hint cap, reveal cap, reliable timing, then
 * misconception severity. Input and output are parsed through strict versioned
 * schemas so malformed evidence fails closed instead of silently changing a
 * learner's schedule.
 */
export function mapPracticeToSrsRatingV31(input: SrsRatingInputV31): SrsRatingResultV31 {
  const parsed = srsRatingInputV31Schema.parse(input);
  const correctness = correctnessRatingV31(parsed.parts);
  const hint = hintCapV31(parsed.parts);
  const reveal = revealCapV31(parsed.parts);

  let ratingBeforeTiming = correctness.rating;
  for (const cap of [hint, reveal]) {
    if (cap) ratingBeforeTiming = lowerRating(ratingBeforeTiming, cap.maxRating);
  }

  const timing = timingDecisionV31(
    parsed,
    ratingBeforeTiming,
    correctness.allCorrect,
    hint !== null || reveal !== null,
  );
  const misconception = misconceptionCapV31(parsed);
  const rating = misconception
    ? lowerRating(timing.rating, misconception.maxRating)
    : timing.rating;
  const effectiveCap = [hint, reveal, misconception]
    .filter((cap): cap is RatingCapDecision => cap !== null)
    .reduce<SrsRating | null>(
      (effective, cap) => effective === null ? cap.maxRating : lowerRating(effective, cap.maxRating),
      null,
    );
  const reasons = [
    correctness.reason,
    hint?.reason,
    reveal?.reason,
    ...timing.decision.reasons,
    misconception?.reason,
  ].filter((reason): reason is string => reason !== undefined);

  return srsRatingResultV31Schema.parse({
    policyVersion: SRS_RATING_POLICY_VERSION,
    rating,
    baseRating: correctness.rating,
    caps: {
      hint,
      reveal,
      misconception,
      effective: effectiveCap,
    },
    timingDecision: timing.decision,
    timingAdjusted: timing.decision.changedRating,
    misconceptionCapped: misconception !== null,
    reasons,
  });
}
