/**
 * SRS Proficiency Utilities
 *
 * Functions for converting FSRS card state into objective proficiency evidence.
 */

import type { PracticeTimingBaseline } from './timing-baseline';
import type { EvidenceConfidence, ProblemFamilyEvidence } from './objective-proficiency';

export const STABILITY_SCALE_FACTOR = 30;

export type SrsCardState = {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  problemFamilyId: string;
  lastReviewMs?: number;
  reviewDurationMs?: number;
};

export type TimingBaselines = Record<string, PracticeTimingBaseline | undefined>;

function deriveFluencyConfidence(
  cards: SrsCardState[],
  baselines: TimingBaselines
): { confidence: EvidenceConfidence; timingReliable: boolean; baselineSampleCount: number } {
  const problemFamilyIds = [...new Set(cards.map((c) => c.problemFamilyId))];
  let totalSampleCount = 0;
  let totalReviewedCards = 0;
  let reliableCount = 0;

  for (const pfId of problemFamilyIds) {
    const baseline = baselines[pfId];
    if (!baseline || !baseline.minSamplesMet) continue;

    totalSampleCount += baseline.sampleCount;
    const pfCards = cards.filter((c) => c.problemFamilyId === pfId && c.reviewDurationMs !== undefined);
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
    return { confidence: 'none', timingReliable: false, baselineSampleCount: totalSampleCount };
  }

  const ratio = reliableCount / (totalReviewedCards || 1);
  if (ratio >= 0.8) {
    return { confidence: 'high', timingReliable: true, baselineSampleCount: totalSampleCount };
  }
  if (ratio >= 0.5) {
    return { confidence: 'medium', timingReliable: true, baselineSampleCount: totalSampleCount };
  }
  return { confidence: 'low', timingReliable: true, baselineSampleCount: totalSampleCount };
}

/**
 * Normalize FSRS stability (unbounded float, in days) to a 0-1 retention strength.
 *
 * Formula: 1 - (1 / (1 + stability / scaleFactor))
 *
 * Examples with default scaleFactor of 30:
 * - stability 0   -> 0.0
 * - stability 30  -> 0.5
 * - stability 90  -> 0.75
 * - stability 300 -> ~0.909
 */
export function stabilityToRetention(stability: number, scaleFactor: number = STABILITY_SCALE_FACTOR): number {
  if (Number.isNaN(stability)) return 0;
  if (stability === Infinity) return 1;
  if (stability <= 0) return 0;
  return 1 - 1 / (1 + stability / scaleFactor);
}

/**
 * Aggregate SRS card states into problem family evidence for objective proficiency calculation.
 *
 * Groups cards by problemFamilyId and computes:
 * - retentionStrength: average of stabilityToRetention across cards in the family
 * - practiceCoverage: proportion of cards with reps > 0
 * - fluencyConfidence: derived from timing relative to baselines
 * - baselineSampleCount: total samples across relevant baselines
 * - timingReliable: whether timing evidence is available and reliable
 */
export function aggregateCardsToEvidence(
  cards: SrsCardState[],
  baselines: TimingBaselines
): ProblemFamilyEvidence[] {
  if (cards.length === 0) return [];

  const byFamily = new Map<string, SrsCardState[]>();
  for (const card of cards) {
    const existing = byFamily.get(card.problemFamilyId) ?? [];
    existing.push(card);
    byFamily.set(card.problemFamilyId, existing);
  }

  const evidence: ProblemFamilyEvidence[] = [];

  for (const [problemFamilyId, familyCards] of byFamily) {
    const retentions = familyCards.map((c) => stabilityToRetention(c.stability));
    const retentionStrength = retentions.length > 0
      ? retentions.reduce((a, b) => a + b, 0) / retentions.length
      : 0;

    const reviewedCards = familyCards.filter((c) => c.reps > 0);
    const practiceCoverage = familyCards.length > 0
      ? reviewedCards.length / familyCards.length
      : 0;

    const fluency = deriveFluencyConfidence(familyCards, baselines);

    evidence.push({
      problemFamilyId,
      retentionStrength: Math.round(retentionStrength * 100) / 100,
      practiceCoverage: Math.round(practiceCoverage * 100) / 100,
      fluencyConfidence: fluency.confidence,
      baselineSampleCount: fluency.baselineSampleCount,
      timingReliable: fluency.timingReliable,
    });
  }

  return evidence;
}
