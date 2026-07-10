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
    variantKey: string;
    practiceItemId: string;
    variantLabel: string;
  } | null;
  practiceVariant?: {
    _id: Id<'practice_variants'>;
    variantKey: string;
    componentKey: string;
    displayName: string;
    description: string;
    objectiveIds: string[];
    difficulty: string;
  } | null;
  baseline?: {
    _id: Id<'timing_baselines'>;
    variantKey: string;
    sampleCount: number;
    medianActiveMs: number;
    p25ActiveMs: number;
    p75ActiveMs: number;
    p90ActiveMs: number;
    lastComputedAt: string;
    minSamplesMet: boolean;
  } | null;
} = {}) {
  const { practiceItem, practiceVariant, baseline } = overrides;
  const tableRows: Record<string, unknown> = {
    practice_items: practiceItem ?? null,
    practice_variants: practiceVariant ?? null,
    competency_standards: null,
    objective_policies: null,
    timing_baselines: baseline ?? null,
  };
  const mockQuery = vi.fn((table: string) => ({
    withIndex: vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(tableRows[table] ?? null),
    }),
  }));

  const mockInsert = vi.fn().mockResolvedValue('card-doc-1' as Id<'srs_cards'>);
  const mockReplace = vi.fn().mockResolvedValue(undefined);
  const mockRunMutation = vi.fn().mockResolvedValue(undefined);
  const mockRunQuery = vi.fn().mockResolvedValue(null);

  return {
    db: {
      query: mockQuery,
      insert: mockInsert,
      replace: mockReplace,
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

  it('returns skipped when practice item exists but practice variant is missing', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        variantKey: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      practiceVariant: null,
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
        variantKey: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      practiceVariant: {
        _id: 'pf-doc-1' as Id<'practice_variants'>,
        variantKey: 'pf-1',
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
    expect(result.cardId).toBe('card-doc-1');
    expect(result.reviewId).toMatch(/^rev_/);

    expect(ctx.mockRunMutation).not.toHaveBeenCalled();
  });

  it('catches adapter errors and returns error result without throwing', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        variantKey: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      practiceVariant: {
        _id: 'pf-doc-1' as Id<'practice_variants'>,
        variantKey: 'pf-1',
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

  it('uses atomic saveCardAndReview to avoid separate runMutation calls', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        variantKey: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      practiceVariant: {
        _id: 'pf-doc-1' as Id<'practice_variants'>,
        variantKey: 'pf-1',
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
    // Direct DB inserts via processReviewHandler should have been called
    expect(ctx.db.insert).toHaveBeenCalled();
    expect(ctx.mockRunMutation).not.toHaveBeenCalled();
  });

  it('looks up timing baseline when available', async () => {
    const ctx = makeMockCtx({
      practiceItem: {
        _id: 'pi-1' as Id<'practice_items'>,
        activityId: 'act-1' as Id<'activities'>,
        variantKey: 'pf-1',
        practiceItemId: 'pi-1',
        variantLabel: 'A',
      },
      practiceVariant: {
        _id: 'pf-doc-1' as Id<'practice_variants'>,
        variantKey: 'pf-1',
        componentKey: 'step-by-step-solver',
        displayName: 'Test Family',
        description: 'Test description',
        objectiveIds: ['obj-1'],
        difficulty: 'standard',
      },
      baseline: {
        _id: 'bl-1' as Id<'timing_baselines'>,
        variantKey: 'pf-1',
        sampleCount: 20,
        medianActiveMs: 5000,
        p25ActiveMs: 3000,
        p75ActiveMs: 7000,
        p90ActiveMs: 9000,
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
    expect(result.cardId).toBe('card-doc-1');
  });
});
