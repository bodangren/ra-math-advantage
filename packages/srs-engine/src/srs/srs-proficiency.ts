/**
 * SRS Proficiency Utilities
 *
 * Functions for converting FSRS card state into objective proficiency evidence.
 */

import type { PracticeTimingBaseline } from "@math-platform/practice-core";
import type { EvidenceConfidence, PracticeVariantEvidence } from "./objective-proficiency";

/** FSRS retention-curve factor. */
export const FSRS_RETENTION_FACTOR = 19 / 81;

/** FSRS retention-curve exponent. */
export const FSRS_RETENTION_DECAY = -0.5;

/**
 * @deprecated Retained as an export-only compatibility alias. The v3
 * retention formula does not use a configurable stability scale factor.
 */
export const STABILITY_SCALE_FACTOR = 30;

export type ProficiencyCardInput = {
  stability: number;
  elapsedDays: number;
  difficulty: number;
  reps: number;
  lapses: number;
  variantKey: string;
  lastReviewMs?: number;
  reviewDurationMs?: number;
};

export type TimingBaselines = Record<string, PracticeTimingBaseline | undefined>;

/**
 * Derive fluency confidence from card timing data relative to baselines.
 * @param {ProficiencyCardInput[]} cards - Array of card inputs for a problem family
 * @param {TimingBaselines} baselines - Timing baselines keyed by problem family ID
 * @returns {{ confidence: EvidenceConfidence; timingReliable: boolean; baselineSampleCount: number }} - Confidence level, reliability flag, and baseline sample count
 */
function deriveFluencyConfidence(
  cards: ProficiencyCardInput[],
  baselines: TimingBaselines,
): { confidence: EvidenceConfidence; timingReliable: boolean; baselineSampleCount: number } {
  const variantKeys = [...new Set(cards.map((c) => c.variantKey))];
  let totalSampleCount = 0;
  let totalReviewedCards = 0;
  let reliableCount = 0;

  for (const vk of variantKeys) {
    const baseline = baselines[vk];
    if (!baseline || !baseline.minSamplesMet) continue;

    totalSampleCount += baseline.sampleCount;
    const pfCards = cards.filter((c) => c.variantKey === vk && c.reviewDurationMs !== undefined);
    totalReviewedCards += pfCards.length;

    for (const card of pfCards) {
      if (card.reviewDurationMs === undefined) continue;
      if (card.reviewDurationMs <= baseline.medianActiveMs) {
        reliableCount++;
      }
    }
  }

  const timingReliable = totalSampleCount > 0 && totalReviewedCards > 0;
  if (!timingReliable) {
    return { confidence: "none", timingReliable: false, baselineSampleCount: totalSampleCount };
  }

  const ratio = reliableCount / (totalReviewedCards || 1);
  if (ratio >= 0.8) {
    return { confidence: "high", timingReliable: true, baselineSampleCount: totalSampleCount };
  }
  if (ratio >= 0.5) {
    return { confidence: "medium", timingReliable: true, baselineSampleCount: totalSampleCount };
  }
  return { confidence: "low", timingReliable: true, baselineSampleCount: totalSampleCount };
}

/**
 * Convert FSRS stability and elapsed time to current retention probability.
 *
 * Formula: `(1 + (19 / 81) * elapsedDays / stability) ** -0.5`.
 * This yields exactly `R(S) = 0.9`.
 *
 * Invalid domain inputs fail closed to 0. Positive infinite stability is
 * treated as perfect retention, and positive infinite elapsed time as fully
 * decayed retention.
 *
 * @param {number} stability - FSRS stability in days
 * @param {number} elapsedDays - Non-negative elapsed time in days
 * @returns {number} Current retention probability in the inclusive range 0-1
 */
export function stabilityToRetention(stability: number, elapsedDays: number): number {
  if (Number.isNaN(stability) || stability <= 0) return 0;
  if (Number.isNaN(elapsedDays) || elapsedDays < 0) return 0;
  if (stability === Infinity) return 1;
  if (!Number.isFinite(stability)) return 0;
  if (elapsedDays === Infinity) return 0;
  if (!Number.isFinite(elapsedDays)) return 0;

  return (1 + (FSRS_RETENTION_FACTOR * elapsedDays) / stability) ** FSRS_RETENTION_DECAY;
}

/**
 * Compute objective live retention from reviewed practice-variant cards.
 *
 * Cards without review history (`reps = 0`) are excluded. `null` distinguishes
 * an objective with no review evidence from one whose reviewed evidence has
 * fully decayed.
 *
 * @param {ProficiencyCardInput[]} cards - Cards belonging to one objective
 * @returns {number | null} Minimum live retention, or null without reviewed cards
 */
export function objectiveLiveRetention(cards: ProficiencyCardInput[]): number | null {
  const reviewedRetentions = cards
    .filter((card) => card.reps >= 1)
    .map((card) => stabilityToRetention(card.stability, card.elapsedDays));

  if (reviewedRetentions.length === 0) return null;
  return Math.min(...reviewedRetentions);
}

/**
 * Aggregate SRS card states into practice variant evidence for objective proficiency calculation.
 *
 * Groups cards by variantKey and computes:
 * - retentionStrength: minimum live retention across reviewed cards in the variant
 * - practiceCoverage: proportion of cards with reps > 0
 * - fluencyConfidence: derived from timing relative to baselines
 * - baselineSampleCount: total samples across relevant baselines
 * - timingReliable: whether timing evidence is available and reliable
 */
export function aggregateCardsToEvidence(
  cards: ProficiencyCardInput[],
  baselines: TimingBaselines,
): PracticeVariantEvidence[] {
  if (cards.length === 0) return [];

  const byVariant = new Map<string, ProficiencyCardInput[]>();
  for (const card of cards) {
    const existing = byVariant.get(card.variantKey) ?? [];
    existing.push(card);
    byVariant.set(card.variantKey, existing);
  }

  const evidence: PracticeVariantEvidence[] = [];

  for (const [variantKey, familyCards] of byVariant) {
    const reviewedCards = familyCards.filter((c) => c.reps > 0);
    const retentionStrength = objectiveLiveRetention(reviewedCards) ?? 0;
    const practiceCoverage = familyCards.length > 0 ? reviewedCards.length / familyCards.length : 0;

    const fluency = deriveFluencyConfidence(familyCards, baselines);

    evidence.push({
      variantKey,
      retentionStrength: Math.round(retentionStrength * 100) / 100,
      practiceCoverage: Math.round(practiceCoverage * 100) / 100,
      fluencyConfidence: fluency.confidence,
      baselineSampleCount: fluency.baselineSampleCount,
      timingReliable: fluency.timingReliable,
    });
  }

  return evidence;
}
