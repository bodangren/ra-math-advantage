import { describe, expect, it } from 'vitest';
import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core';
import { InMemorySubmissionSrsAdapter } from '../srs/submission-srs-adapter';

function makeSubmission(options: { timing?: boolean; misconception?: boolean } = {}) {
  return {
    ...buildPracticeSubmissionEnvelope({
      activityId: 'activity-1',
      mode: 'independent_practice',
      answers: { q1: 4 },
      timing: options.timing ? {
        startedAt: '2026-07-10T00:00:00.000Z',
        submittedAt: '2026-07-10T00:00:00.400Z',
        wallClockMs: 400,
        activeMs: 400,
        idleMs: 0,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high',
      } : undefined,
    }),
    parts: [{
      partId: 'q1',
      rawAnswer: 4,
      isCorrect: true,
      hintsUsed: 0,
      revealStepsSeen: 0,
      misconceptionTags: options.misconception ? ['sign-error', 'sign-error'] : [],
    }],
  };
}

describe('InMemorySubmissionSrsAdapter', () => {
  it('skips submissions without a registered practice variant', async () => {
    const adapter = new InMemorySubmissionSrsAdapter();
    await expect(adapter.processSubmission({
      submission: makeSubmission(),
      studentId: 'student-1',
      activityId: 'missing',
    })).resolves.toEqual({ ok: false, skipped: true, reason: 'no_blueprint' });
  });

  it('creates, reviews, and persists a card and audit log', async () => {
    const adapter = new InMemorySubmissionSrsAdapter();
    adapter.getResolver().register('activity-1', {
      variantKey: 'variant-1',
      objectiveId: 'objective-1',
    });

    const result = await adapter.processSubmission({
      submission: makeSubmission({ misconception: true }),
      studentId: 'student-1',
      activityId: 'activity-1',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.card).toMatchObject({
      studentId: 'student-1',
      objectiveId: 'objective-1',
      variantKey: 'variant-1',
      reps: 1,
    });
    expect(result.reviewLog.evidence.misconceptionTags).toEqual(['sign-error']);
    expect(result.reviewLog.evidence.reasons).toContain('timing_missing');
    await expect(adapter.getCardStore().getCardByStudentAndVariant(
      'student-1',
      'variant-1',
    )).resolves.toEqual(result.card);
    await expect(adapter.getReviewLogStore().getReviewsByStudent('student-1'))
      .resolves.toHaveLength(1);
  });

  it('reuses an existing card and applies a reliable timing baseline', async () => {
    const adapter = new InMemorySubmissionSrsAdapter();
    adapter.getResolver().register('activity-1', {
      variantKey: 'variant-1',
      objectiveId: 'objective-1',
    });
    adapter.getBaselineResolver().setBaseline('variant-1', {
      variantKey: 'variant-1',
      sampleCount: 20,
      medianActiveMs: 1_000,
      minSamplesMet: true,
      lastComputedAt: '2026-07-10T00:00:00.000Z',
    });

    const first = await adapter.processSubmission({
      submission: makeSubmission(),
      studentId: 'student-1',
      activityId: 'activity-1',
    });
    const second = await adapter.processSubmission({
      submission: makeSubmission({ timing: true }),
      studentId: 'student-1',
      activityId: 'activity-1',
    });

    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.card.cardId).toBe(first.card.cardId);
    expect(second.card.reps).toBe(2);
    expect(second.reviewLog.rating).toBe('Easy');
    await expect(adapter.getReviewLogStore().getReviewsByCard(first.card.cardId))
      .resolves.toHaveLength(2);
  });

  it('returns structured errors from resolver failures', async () => {
    const adapter = new InMemorySubmissionSrsAdapter();
    adapter.getResolver().resolve = async () => {
      throw new Error('resolver unavailable');
    };

    await expect(adapter.processSubmission({
      submission: makeSubmission(),
      studentId: 'student-1',
      activityId: 'activity-1',
    })).resolves.toEqual({
      ok: false,
      skipped: false,
      error: 'resolver unavailable',
    });
  });
});
