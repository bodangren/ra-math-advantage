import { describe, expect, it } from 'vitest';
import {
  buildPracticeSubmissionEnvelope,
  type SrsRatingInputV31,
} from '@math-platform/practice-core';
import { createMockSrsCard } from '../srs/fixtures';
import { processReview } from '../srs/review-processor';

const now = '2026-07-10T00:00:00.000Z';

function submission(options: { withTiming?: boolean } = {}) {
  const timing = options.withTiming
    ? {
        startedAt: '2026-07-09T23:59:59.600Z',
        submittedAt: now,
        wallClockMs: 400,
        activeMs: 400,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high' as const,
      }
    : undefined;
  return {
    ...buildPracticeSubmissionEnvelope({
      activityId: 'activity-review-processor',
      mode: 'independent_practice',
      submittedAt: now,
      answers: { q1: 4 },
      timing,
    }),
    parts: [{
      partId: 'q1',
      rawAnswer: 4,
      normalizedAnswer: '4',
      isCorrect: true,
      hintsUsed: 0,
      revealStepsSeen: 0,
      misconceptionTags: [],
    }],
  };
}

describe('processReview', () => {
  it('updates a card and records an immutable audit entry without timing', () => {
    const card = createMockSrsCard({
      cardId: 'card-review-1',
      studentId: 'student-1',
      objectiveId: 'objective-1',
      variantKey: 'variant-1',
      createdAt: now,
      updatedAt: now,
      dueDate: now,
    });

    const result = processReview({ card, submission: submission(), now });

    expect(result.rating).toBe('Good');
    expect(result.updatedCard.cardId).toBe(card.cardId);
    expect(result.updatedCard.reps).toBe(1);
    expect(result.reviewLog.reviewId).toMatch(/^rev_[0-9a-f]{32}$/);
    expect(result.reviewLog.submissionId).toBe('activity-review-processor-1');
    expect(result.reviewLog.evidence).toMatchObject({
      baseRating: 'Good',
      timingAdjusted: false,
    });
    expect('reasons' in result.reviewLog.evidence
      ? result.reviewLog.evidence.reasons
      : []).toContain('timing_missing');
    expect(card.reps).toBe(0);
  });

  it('uses a reliable timing baseline to upgrade a fast correct review', () => {
    const card = createMockSrsCard({
      cardId: 'card-review-2',
      dueDate: now,
      createdAt: now,
      updatedAt: now,
    });
    const result = processReview({
      card,
      submission: submission({ withTiming: true }),
      baseline: {
        variantKey: card.variantKey,
        sampleCount: 20,
        medianActiveMs: 1_000,
        lastComputedAt: now,
        minSamplesMet: true,
      },
      now,
    });

    expect(result.rating).toBe('Easy');
    expect(result.reviewLog.evidence).toMatchObject({
      baseRating: 'Good',
      timingAdjusted: true,
      reasons: expect.arrayContaining(['timing_upgraded_easy']),
    });
    expect(result.reviewLog.stateAfter.reps).toBe(1);
  });

  it('uses the explicit v3.1 rating seam when enriched evidence is supplied', () => {
    const card = createMockSrsCard({
      cardId: 'card-review-v31',
      dueDate: now,
      createdAt: now,
      updatedAt: now,
    });
    const enrichedSubmission = submission();
    enrichedSubmission.parts[0].hintsUsed = 1;
    const ratingInputV31: SrsRatingInputV31 = {
      parts: [{
        partId: 'q1',
        isCorrect: true,
        hintsUsed: 1,
        revealStepsSeen: 0,
        totalRevealSteps: 3,
        misconceptionTags: [],
      }],
      severityByTag: {},
    };

    const result = processReview({
      card,
      submission: enrichedSubmission,
      ratingInputV31,
      now,
    });

    expect(result.rating).toBe('Good');
    expect(result.reviewLog.evidence).toMatchObject({
      baseRating: 'Good',
      timingAdjusted: false,
      reasons: expect.arrayContaining(['hints_1_2', 'timing_absent']),
    });
  });

  it('keeps legacy review callers on the legacy mapper by default', () => {
    const card = createMockSrsCard({
      cardId: 'card-review-legacy',
      dueDate: now,
      createdAt: now,
      updatedAt: now,
    });
    const legacySubmission = submission();
    legacySubmission.parts[0].hintsUsed = 1;

    const result = processReview({ card, submission: legacySubmission, now });

    expect(result.rating).toBe('Hard');
    expect('reasons' in result.reviewLog.evidence
      ? result.reviewLog.evidence.reasons
      : []).toContain('timing_missing');
  });
});
