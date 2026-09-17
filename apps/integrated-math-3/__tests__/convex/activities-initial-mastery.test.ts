import { describe, expect, it, vi } from 'vitest';
import { submitActivity } from '@/convex/activities';
import type { MutationCtx } from '@/convex/_generated/server';
import type { Id } from '@/convex/_generated/dataModel';

const activityId = 'activities:initial-mastery' as Id<'activities'>;
const studentId = 'profiles:initial-mastery' as Id<'profiles'>;

describe('initial competency from server grading', () => {
  it.each([
    ['999', 0],
    ['2', 100],
  ] as const)('records the server score for first answer %s', async (answer, masteryLevel) => {
    const insert = vi.fn(async (table: string) => `${table}:saved`);
    const query = {
      withIndex: () => query,
      order: () => query,
      unique: async () => null,
      first: async () => null,
    };
    // This stub models a first submission with no existing competency or replay.
    const ctx = {
      db: {
        get: async () => ({
          _id: activityId,
          componentKey: 'fill-in-the-blank',
          standardId: 'competency_standards:initial-mastery',
          props: {
            blanks: [{ id: 'answer', correctAnswer: '2' }],
            gradingRules: [{ partId: 'answer', ruleType: 'exact_match', maxScore: 1 }],
          },
        }),
        query: () => query,
        insert,
      },
      scheduler: { runAfter: vi.fn(async () => 'scheduled') },
    } as unknown as MutationCtx;
    // Convex exposes the registered handler for isolated mutation tests.
    const handler = (submitActivity as unknown as {
      _handler: (ctx: MutationCtx, args: {
        userId: Id<'profiles'>;
        activityId: Id<'activities'>;
        idempotencyKey: string;
        submissionData: Record<string, unknown>;
      }) => Promise<{ score: number; maxScore: number }>;
    })._handler;
    const result = await handler(ctx, {
      userId: studentId,
      activityId,
      idempotencyKey: 'first-submission',
      submissionData: {
        contractVersion: 'practice.v1', activityId,
        mode: 'independent_practice', status: 'submitted',
        attemptNumber: 1, submittedAt: '2026-09-07T00:00:00.000Z',
        answers: { answer }, parts: [{ partId: 'answer', rawAnswer: answer }],
      },
    });
    expect(result).toMatchObject({ score: masteryLevel / 100, maxScore: 1 });
    expect(insert).toHaveBeenCalledWith('student_competency', expect.objectContaining({
      studentId, masteryLevel,
    }));
  });
});
