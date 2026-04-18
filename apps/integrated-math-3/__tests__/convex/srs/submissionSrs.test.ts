import { describe, it, expect, vi } from 'vitest';
import {
  processSubmissionSrsHandler,
} from '@/convex/srs/submissionSrs';
import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx } from '@/convex/_generated/server';

const mockNow = '2026-04-16T12:00:00.000Z';

function makeMockCtx(overrides: {
  practiceItem?: {
    _id: Id<'practice_items'>;
    activityId: Id<'activities'>;
    problemFamilyId: string;
    practiceItemId: string;
    variantLabel: string;
  } | null;
  problemFamily?: {
    _id: Id<'problem_families'>;
    problemFamilyId: string;
    componentKey: string;
    displayName: string;
    description: string;
    objectiveIds: string[];
    difficulty: string;
  } | null;
  baseline?: {
    _id: Id<'timing_baselines'>;
    problemFamilyId: string;
    sampleCount: number;
    medianActiveMs: number;
    lastComputedAt: string;
    minSamplesMet: boolean;
  } | null;
} = {}) {
  const { practiceItem, problemFamily, baseline } = overrides;

  const mockQuery = {
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockImplementation(() => {
        const indexName = mockQuery.withIndex.mock.calls[mockQuery.withIndex.mock.calls.length - 1][0];
        if (indexName === 'by_activityId') return Promise.resolve(practiceItem ?? null);
        if (indexName === 'by_problemFamilyId') return Promise.resolve(problemFamily ?? null);
        if (indexName === 'by_problem_family') return Promise.resolve(baseline ?? null);
        return Promise.resolve(null);
      }),
    }),
  };

  const mockRunMutation = vi.fn().mockResolvedValue(undefined);
  const mockRunQuery = vi.fn().mockResolvedValue(null);

  return {
    db: {
      query: vi.fn().mockReturnValue(mockQuery),
    },
    runMutation: mockRunMutation,
    runQuery: mockRunQuery,
    mockQuery,
    mockRunMutation,
    mockRunQuery,
  };
}

function makeSubmissionEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: 'practice.v1',
    activityId: 'act-1',
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
  };
}

describe('processSubmissionSrsHandler', () => {
  it('returns skipped when no practice item exists for activity', async () => {
    const ctx = makeMockCtx({ practiceItem: null });

    const result = await processSubmissionSrsHandler(
      ctx as unknown as MutationCtx,
      {
        studentId: 'student-1',
        activityId: 'act-1',
        submission: makeSubmissionEnvelope(),
      }
    );

    expect(result).toEqual({ ok: false, skipped: true, reason: 'no_blueprint' });
  });

  it('returns skipped when practice item exists but problem family is missing', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        problemFamilyId: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      problemFamily: null,
    });

    const result = await processSubmissionSrsHandler(
      ctx as unknown as MutationCtx,
      {
        studentId: 'student-1',
        activityId: 'act-1',
        submission: makeSubmissionEnvelope(),
      }
    );

    expect(result).toEqual({ ok: false, skipped: true, reason: 'no_blueprint' });
  });

  it('processes submission and returns success when blueprint exists', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        problemFamilyId: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      problemFamily: {
        _id: 'pf-doc-1' as Id<'problem_families'>,
        problemFamilyId: 'pf-1',
        componentKey: 'step-by-step-solver',
        displayName: 'Test Family',
        description: 'Test description',
        objectiveIds: ['obj-1'],
        difficulty: 'standard',
      },
    });

    ctx.mockRunQuery.mockResolvedValue(null);

    const result = await processSubmissionSrsHandler(
      ctx as unknown as MutationCtx,
      {
        studentId: 'student-1',
        activityId: 'act-1',
        submission: makeSubmissionEnvelope(),
      }
    );

    expect(result.ok).toBe(true);
    if (!result.ok || result.skipped) return;
    expect(result.cardId).toMatch(/^card_/);
    expect(result.reviewId).toMatch(/^rev_/);

    expect(ctx.mockRunMutation).toHaveBeenCalledTimes(3);
  });

  it('catches adapter errors and returns error result without throwing', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        problemFamilyId: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      problemFamily: {
        _id: 'pf-doc-1' as Id<'problem_families'>,
        problemFamilyId: 'pf-1',
        componentKey: 'step-by-step-solver',
        displayName: 'Test Family',
        description: 'Test description',
        objectiveIds: ['obj-1'],
        difficulty: 'standard',
      },
    });

    ctx.mockRunQuery.mockRejectedValue(new Error('store failure'));

    const result = await processSubmissionSrsHandler(
      ctx as unknown as MutationCtx,
      {
        studentId: 'student-1',
        activityId: 'act-1',
        submission: makeSubmissionEnvelope(),
      }
    );

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(false);
    if ('error' in result) {
      expect(result.error).toContain('store failure');
    }
  });

  it('looks up timing baseline when available', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        problemFamilyId: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      problemFamily: {
        _id: 'pf-doc-1' as Id<'problem_families'>,
        problemFamilyId: 'pf-1',
        componentKey: 'step-by-step-solver',
        displayName: 'Test Family',
        description: 'Test description',
        objectiveIds: ['obj-1'],
        difficulty: 'standard',
      },
      baseline: {
        _id: 'bl-1' as Id<'timing_baselines'>,
        problemFamilyId: 'pf-1',
        sampleCount: 20,
        medianActiveMs: 5000,
        lastComputedAt: mockNow,
        minSamplesMet: true,
      },
    });

    ctx.mockRunQuery.mockResolvedValue(null);

    const result = await processSubmissionSrsHandler(
      ctx as unknown as MutationCtx,
      {
        studentId: 'student-1',
        activityId: 'act-1',
        submission: makeSubmissionEnvelope({
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
      }
    );

    expect(result.ok).toBe(true);
    if (!result.ok || result.skipped) return;
    expect(result.cardId).toMatch(/^card_/);
  });
});
