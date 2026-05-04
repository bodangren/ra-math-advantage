import { describe, it, expect, beforeEach } from 'vitest';
import { toConvexActivityId } from '@math-platform/practice-core';
import type {
  SubmissionSrsInput,
  SubmissionSrsResultSuccess,
  SubmissionSrsResultSkipped,
  SubmissionSrsResultError,
} from '@math-platform/srs-engine';
import { InMemorySubmissionSrsAdapter } from '@math-platform/srs-engine';
import type { PracticeSubmissionEnvelope } from '@math-platform/srs-engine';

const mockNow = '2026-04-16T12:00:00.000Z';

function makeSubmission(
  overrides: Partial<PracticeSubmissionEnvelope> = {}
): PracticeSubmissionEnvelope {
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

describe('SubmissionSrsAdapter', () => {
  let adapter: InMemorySubmissionSrsAdapter;

  beforeEach(() => {
    adapter = new InMemorySubmissionSrsAdapter();
  });

  describe('processSubmission returns SubmissionSrsResult for valid input', () => {
    it('returns success result when blueprint exists and card processing succeeds', async () => {
      adapter.getResolver().register('activity-1', {
        problemFamilyId: 'pf-1',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission(),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-1'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('card' in result)) return;
      expect(result.card.problemFamilyId).toBe('pf-1');
      expect(result.card.studentId).toBe('student-1');
    });

    it('creates new card with state "new" for first-seen problem family', async () => {
      adapter.getResolver().register('activity-1', {
        problemFamilyId: 'pf-new',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission(),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-1'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('card' in result)) return;
      expect(result.reviewLog.stateBefore.state).toBe('new');
      expect(result.reviewLog.stateBefore.reps).toBe(0);
      expect(result.reviewLog.stateBefore.lapses).toBe(0);
    });

    it('persists card after processing', async () => {
      adapter.getResolver().register('activity-1', {
        problemFamilyId: 'pf-persist',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission(),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-1'),
      };

      await adapter.processSubmission(input);

      const cardStore = adapter.getCardStore();
      const studentCards = await cardStore.getCardsByStudent('student-1');
      const savedCard = studentCards.find((c) => c.problemFamilyId === 'pf-persist');
      expect(savedCard).not.toBeNull();
    });

    it('persists review log entry after processing', async () => {
      adapter.getResolver().register('activity-1', {
        problemFamilyId: 'pf-log',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission(),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-1'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('reviewLog' in result)) return;
      expect(result.reviewLog.reviewId).toMatch(/^rev_/);
    });
  });

  describe('processSubmission returns skipped: true when no blueprint exists', () => {
    it('returns skipped result when activity has no blueprint', async () => {
      const input: SubmissionSrsInput = {
        submission: makeSubmission({ activityId: toConvexActivityId('unknown-activity') }),
        studentId: 'student-1',
        activityId: toConvexActivityId('unknown-activity'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(false);
      expect(result.skipped).toBe(true);
      if (!('reason' in result)) return;
      expect(result.reason).toBe('no_blueprint');
    });

    it('does not create card when blueprint is missing', async () => {
      const input: SubmissionSrsInput = {
        submission: makeSubmission({ activityId: toConvexActivityId('unknown-activity') }),
        studentId: 'student-1',
        activityId: toConvexActivityId('unknown-activity'),
      };

      await adapter.processSubmission(input);

      const cardStore = adapter.getCardStore();
      const cards = await cardStore.getCardsByStudent('student-1');
      expect(cards).toHaveLength(0);
    });
  });

  describe('processSubmission returns error result without throwing', () => {
    it('catches errors and returns error result', async () => {
      adapter.getResolver().register('activity-error', {
        problemFamilyId: 'pf-error',
        objectiveId: 'obj-1',
      });

      const brokenAdapter = new (class extends InMemorySubmissionSrsAdapter {
        async processSubmissionInternal(): Promise<never> {
          throw new Error('simulated failure');
        }
      })();

      const input: SubmissionSrsInput = {
        submission: makeSubmission({ activityId: toConvexActivityId('activity-error') }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-error'),
      };

      const result = await brokenAdapter.processSubmission(input);

      expect(result.ok).toBe(false);
      expect(result.skipped).toBe(false);
      if ('error' in result) {
        expect(result.error).toBe('simulated failure');
      }
    });

    it('submission still succeeds even when SRS processing throws', async () => {
      adapter.getResolver().register('activity-safe', {
        problemFamilyId: 'pf-safe',
        objectiveId: 'obj-1',
      });

      const safeSubmission = makeSubmission({ activityId: toConvexActivityId('activity-safe') });
      const input: SubmissionSrsInput = {
        submission: safeSubmission,
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-safe'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
    });
  });

  describe('adapter accepts injected dependencies', () => {
    it('uses injected resolver to look up problem family', async () => {
      adapter.getResolver().register('activity-custom', {
        problemFamilyId: 'pf-custom',
        objectiveId: 'obj-custom',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission({ activityId: toConvexActivityId('activity-custom') }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-custom'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('card' in result)) return;
      expect(result.card.problemFamilyId).toBe('pf-custom');
      expect(result.card.objectiveId).toBe('obj-custom');
    });

    it('uses injected baseline resolver when available', async () => {
      adapter.getResolver().register('activity-timing', {
        problemFamilyId: 'pf-timing',
        objectiveId: 'obj-1',
      });

      adapter.getBaselineResolver().setBaseline('pf-timing', {
        problemFamilyId: 'pf-timing',
        sampleCount: 20,
        medianActiveMs: 5000,
        lastComputedAt: mockNow,
        minSamplesMet: true,
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission({
          activityId: toConvexActivityId('activity-timing'),
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
        }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-timing'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('reviewLog' in result)) return;
      expect(result.reviewLog.evidence.baseRating).toBe('Good');
    });

    it('derives timing features from baseline', async () => {
      adapter.getResolver().register('activity-fast', {
        problemFamilyId: 'pf-fast',
        objectiveId: 'obj-1',
      });

      adapter.getBaselineResolver().setBaseline('pf-fast', {
        problemFamilyId: 'pf-fast',
        sampleCount: 20,
        medianActiveMs: 20_000,
        lastComputedAt: mockNow,
        minSamplesMet: true,
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission({
          activityId: toConvexActivityId('activity-fast'),
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
        }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-fast'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('reviewLog' in result)) return;
      expect(result.reviewLog.evidence.baseRating).toBe('Good');
      expect(result.reviewLog.evidence.timingAdjusted).toBe(true);
    });

    it('persists misconceptionTags in review log evidence when present', async () => {
      adapter.getResolver().register('activity-misconception', {
        problemFamilyId: 'pf-misconception',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission({
          activityId: toConvexActivityId('activity-misconception'),
          parts: [
            { partId: 'part1', rawAnswer: 'wrong', isCorrect: false, misconceptionTags: ['sign-error'] },
            { partId: 'part2', rawAnswer: 'wrong2', isCorrect: false, misconceptionTags: ['sign-error', 'distribution-error'] },
          ],
        }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-misconception'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('reviewLog' in result)) return;
      expect(result.reviewLog.evidence.misconceptionTags).toContain('sign-error');
      expect(result.reviewLog.evidence.misconceptionTags).toContain('distribution-error');
      expect(result.reviewLog.evidence.misconceptionTags).toHaveLength(2);
    });

    it('omits misconceptionTags from evidence when none are present', async () => {
      adapter.getResolver().register('activity-clean', {
        problemFamilyId: 'pf-clean',
        objectiveId: 'obj-1',
      });

      const input: SubmissionSrsInput = {
        submission: makeSubmission({
          activityId: toConvexActivityId('activity-clean'),
          parts: [{ partId: 'part1', rawAnswer: 'answer', isCorrect: true }],
        }),
        studentId: 'student-1',
        activityId: toConvexActivityId('activity-clean'),
      };

      const result = await adapter.processSubmission(input);

      expect(result.ok).toBe(true);
      if (result.skipped || !('reviewLog' in result)) return;
      expect(result.reviewLog.evidence.misconceptionTags).toBeUndefined();
    });
  });
});

describe('SubmissionSrsResult types', () => {
  it('success result has correct shape', () => {
    const result: SubmissionSrsResultSuccess = {
      ok: true,
      skipped: false,
      card: {
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
      },
      reviewLog: {
        reviewId: 'rev_123',
        rating: 'Good',
        evidence: {
          baseRating: 'Good',
          timingAdjusted: false,
          reasons: [],
        },
        stateBefore: {
          stability: 5,
          difficulty: 4,
          state: 'new',
          reps: 0,
          lapses: 0,
        },
        stateAfter: {
          stability: 5,
          difficulty: 4,
          state: 'review',
          reps: 1,
          lapses: 0,
        },
        reviewedAt: mockNow,
      },
    };

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.card.cardId).toBe('card-1');
  });

  it('skipped result has correct shape', () => {
    const result: SubmissionSrsResultSkipped = {
      ok: false,
      skipped: true,
      reason: 'no_blueprint',
    };

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('no_blueprint');
  });

  it('error result has correct shape', () => {
    const result: SubmissionSrsResultError = {
      ok: false,
      skipped: false,
      error: 'something went wrong',
    };

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.error).toBe('something went wrong');
  });
});
