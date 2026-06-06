import type { PracticeSubmissionEnvelope, PracticeTimingSummary } from '../practice/contract';
import type { PracticeTimingBaseline } from '../practice/timing-baseline';
import { deriveTimingFeatures } from '../practice/timing-baseline';
import { mapPracticeToSrsRating } from '../practice/srs-rating';
import { createCard, reviewCard } from './scheduler';
import type { SrsCardState } from '@math-platform/srs-engine';
import type { SrsReviewLog, SrsReviewResult } from './contract';

/**
 * Processes practice submission
 * @param envelope - envelope
 * @param cardState - card state
 * @param timing - timing
 * @param baseline - baseline
 * @param studentId - Student identifier
 * @returns Function result
 */
export function processPracticeSubmission(
  envelope: PracticeSubmissionEnvelope,
  cardState: SrsCardState | null,
  timing?: PracticeTimingSummary,
  baseline?: PracticeTimingBaseline,
  studentId?: string,
): SrsReviewResult {
  const effectiveTiming = timing ?? envelope.timing;
  const timingFeatures = effectiveTiming
    ? deriveTimingFeatures(effectiveTiming, baseline)
    : { hasReliableTiming: false, confidence: 'low' as const, reasons: ['timing_missing'] };

  const ratingResult = mapPracticeToSrsRating({
    parts: envelope.parts.map((p) => ({
      isCorrect: p.isCorrect,
      hintsUsed: p.hintsUsed,
      revealStepsSeen: p.revealStepsSeen,
      misconceptionTags: p.misconceptionTags,
    })),
    timingFeatures,
  });

  if (!studentId && !cardState?.studentId) {
    throw new Error('studentId is required when no existing card state is provided');
  }
  const effectiveStudentId = studentId ?? cardState!.studentId;

  if (!cardState) {
    const now = new Date().toISOString();
    const newCard = createCard({
      studentId: effectiveStudentId,
      objectiveId: envelope.activityId,
      problemFamilyId: envelope.activityId,
      now,
    });
    const reviewedCard = reviewCard(newCard, ratingResult.rating, now);

    const reviewLog: SrsReviewLog = {
      problemFamilyId: reviewedCard.problemFamilyId,
      studentId: reviewedCard.studentId,
      rating: ratingResult.rating,
      scheduledAt: Date.now(),
      reviewedAt: Date.now(),
      elapsedDays: 0,
      scheduledDays: reviewedCard.scheduledDays,
      reviewDurationMs: effectiveTiming?.wallClockMs,
      timingConfidence: timingFeatures.confidence,
    };

    return {
      card: reviewedCard,
      reviewLog,
      rating: ratingResult.rating,
    };
  }

  const now = new Date().toISOString();
  const reviewedCard = reviewCard(cardState, ratingResult.rating, now);

  const lastReviewDate = cardState.lastReview ? new Date(cardState.lastReview) : new Date(cardState.createdAt);
  const reviewedAtMs = Date.now();
  const elapsedDays = Math.floor((reviewedAtMs - lastReviewDate.getTime()) / (24 * 60 * 60 * 1000));
  const scheduledDays = Math.floor((new Date(reviewedCard.dueDate).getTime() - reviewedAtMs) / (24 * 60 * 60 * 1000));

  const reviewLog: SrsReviewLog = {
    problemFamilyId: reviewedCard.problemFamilyId,
    studentId: reviewedCard.studentId,
    rating: ratingResult.rating,
    scheduledAt: Date.now(),
    reviewedAt: Date.now(),
    elapsedDays,
    scheduledDays,
    reviewDurationMs: effectiveTiming?.wallClockMs,
    timingConfidence: timingFeatures.confidence,
  };

  return {
    card: reviewedCard,
    reviewLog,
    rating: ratingResult.rating,
  };
}