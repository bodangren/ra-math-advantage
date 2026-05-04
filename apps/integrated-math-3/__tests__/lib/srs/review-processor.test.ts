import { describe, it, expect, vi } from 'vitest';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { SrsCardState, PracticeSubmissionEnvelope } from '@math-platform/srs-engine';

vi.mock('@math-platform/srs-engine/scheduler', () => ({
  reviewCard: vi.fn((card, rating, now) => ({
    ...card,
    stability: rating === 'Again' ? card.stability * 0.5 : card.stability * 1.5,
    difficulty: rating === 'Again' ? card.difficulty + 1 : Math.max(card.difficulty - 0.5, 1),
    state: rating === 'Again' ? 'relearning' : 'review',
    reps: card.reps + 1,
    lapses: rating === 'Again' ? card.lapses + 1 : card.lapses,
    dueDate: now ?? new Date().toISOString(),
    lastReview: now ?? new Date().toISOString(),
    updatedAt: now ?? new Date().toISOString(),
  })),
}));

import { processReview } from '@math-platform/srs-engine';
import { reviewCard } from '@math-platform/srs-engine/scheduler';

const mockNow = '2026-04-16T12:00:00.000Z';

function makeSubmission(overrides: Partial<PracticeSubmissionEnvelope> = {}): PracticeSubmissionEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId: toConvexActivityId('activity-1'),
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: mockNow,
    answers: { part1: 'answer' },
    parts: [
      {
        partId: 'part1',
        rawAnswer: 'answer',
        normalizedAnswer: 'answer',
        isCorrect: true,
      },
    ],
    ...overrides,
  } as PracticeSubmissionEnvelope;
}

function makeCard(overrides: Partial<SrsCardState> = {}): SrsCardState {
  return {
    cardId: 'card-1',
    studentId: 'student-1',
    objectiveId: 'obj-1',
    problemFamilyId: 'pf-1',
    stability: 5,
    difficulty: 4,
    state: 'review',
    dueDate: mockNow,
    elapsedDays: 5,
    scheduledDays: 5,
    reps: 5,
    lapses: 0,
    lastReview: mockNow,
    createdAt: mockNow,
    updatedAt: mockNow,
    ...overrides,
  };
}

describe('processReview', () => {
  it('incorrect submission causes Again rating and relearning state', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'wrong', isCorrect: false }],
    });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.rating).toBe('Again');
    expect(result.updatedCard.state).toBe('relearning');
    expect(result.updatedCard.lapses).toBe(card.lapses + 1);
    expect(result.reviewLog.rating).toBe('Again');
  });

  it('correct submission with no hints advances with Good rating', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
    });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.rating).toBe('Good');
    expect(result.updatedCard.state).toBe('review');
    expect(result.reviewLog.rating).toBe('Good');
  });

  it('correct submission with hints advances with Hard rating', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true, hintsUsed: 1 }],
    });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.rating).toBe('Hard');
    expect(result.updatedCard.state).toBe('review');
    expect(result.reviewLog.rating).toBe('Hard');
  });

  it('fast timing with correct answer upgrades Good to Easy', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
      timing: {
        startedAt: mockNow,
        submittedAt: mockNow,
        wallClockMs: 5000,
        activeMs: 5000,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high',
      },
    });
    const baseline = {
      problemFamilyId: 'pf-1',
      sampleCount: 20,
      medianActiveMs: 20_000,
      lastComputedAt: mockNow,
      minSamplesMet: true,
    };

    const result = processReview({ card, submission, baseline, now: mockNow });

    expect(result.rating).toBe('Easy');
    const standardEvidence = result.reviewLog.evidence as { baseRating: string; timingAdjusted: boolean; reasons: string[] };
    expect(standardEvidence.baseRating).toBe('Good');
    expect(standardEvidence.timingAdjusted).toBe(true);
    expect(standardEvidence.reasons).toContain('timing_upgraded_easy');
  });

  it('missing timing does not block review processing', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
      timing: undefined,
    });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.rating).toBe('Good');
    const evidence1 = result.reviewLog.evidence as { timingAdjusted: boolean; reasons: string[] };
    expect(evidence1.timingAdjusted).toBe(false);
    expect(evidence1.reasons).toContain('timing_missing');
  });

  it('review log captures before and after state', () => {
    const card = makeCard({ stability: 3.5, difficulty: 5, reps: 2, lapses: 1 });
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
    });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.reviewLog.stateBefore).toEqual({
      stability: 3.5,
      difficulty: 5,
      state: 'review',
      reps: 2,
      lapses: 1,
    });
    expect(result.reviewLog.stateAfter).toEqual({
      stability: result.updatedCard.stability,
      difficulty: result.updatedCard.difficulty,
      state: result.updatedCard.state,
      reps: result.updatedCard.reps,
      lapses: result.updatedCard.lapses,
    });
  });

  it('review log captures evidence with baseRating and reasons', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: false }],
    });

    const result = processReview({ card, submission, now: mockNow });

    const evidence2 = result.reviewLog.evidence as { baseRating: string; timingAdjusted: boolean; reasons: string[] };
    expect(evidence2.baseRating).toBe('Again');
    expect(evidence2.timingAdjusted).toBe(false);
    expect(evidence2.reasons.length).toBeGreaterThan(0);
  });

  it('uses activityId and attemptNumber as submissionId', () => {
    const card = makeCard();
    const submission = makeSubmission({ activityId: toConvexActivityId('act-42'), attemptNumber: 3 });

    const result = processReview({ card, submission, now: mockNow });

    expect(result.reviewLog.submissionId).toBe('act-42-3');
  });

  it('preserves card metadata through the review', () => {
    const card = makeCard({ studentId: 's-99', objectiveId: 'obj-77', problemFamilyId: 'pf-12' });
    const submission = makeSubmission();

    const result = processReview({ card, submission, now: mockNow });

    expect(result.updatedCard.studentId).toBe('s-99');
    expect(result.updatedCard.objectiveId).toBe('obj-77');
    expect(result.updatedCard.problemFamilyId).toBe('pf-12');
    expect(result.updatedCard.cardId).toBe('card-1');
  });

  it('calls reviewCard with the computed rating and now timestamp', () => {
    const card = makeCard();
    const submission = makeSubmission({
      parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
    });

    processReview({ card, submission, now: mockNow });

    expect(reviewCard).toHaveBeenCalledWith(card, 'Good', mockNow);
  });

  it('sets reviewedAt to now in the review log', () => {
    const card = makeCard();
    const submission = makeSubmission();

    const result = processReview({ card, submission, now: mockNow });

    expect(result.reviewLog.reviewedAt).toBe(mockNow);
  });

  it('generates unique reviewIds for separate calls', () => {
    const card = makeCard();
    const submission = makeSubmission();

    const result1 = processReview({ card, submission, now: mockNow });
    const result2 = processReview({ card, submission, now: mockNow });

    expect(result1.reviewLog.reviewId).not.toBe(result2.reviewLog.reviewId);
  });
});
