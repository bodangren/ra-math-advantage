import { describe, expect, it } from 'vitest';

import type { MutationCtx } from '@/convex/_generated/server';
import { createServerOwnedSubmission } from '@/convex/activities';
import { buildIm3PilotSeedDocuments } from '@/convex/seed/seed_lesson_1_1';

const LEARNER_ID = 'profiles:lost-create-response-learner';
const ACTIVITY_ID = 'activities:lost-create-response-pilot';

type ServerOwnedSubmissionHandler = (ctx: MutationCtx, args: {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: {
    contractVersion: 'practice.v1';
    activityId: string;
    mode: 'independent_practice';
    status: 'submitted';
    attemptNumber: number;
    submittedAt: string;
    answers: Record<string, unknown>;
    parts: Array<{ partId: string; rawAnswer: unknown }>;
  };
}) => Promise<{ id: string; submissionId: string; score: number; maxScore: number }>;

const createHandler = (createServerOwnedSubmission as unknown as {
  _handler: ServerOwnedSubmissionHandler;
})._handler;

function makeContext() {
  const activity = {
    _id: ACTIVITY_ID,
    ...buildIm3PilotSeedDocuments(ACTIVITY_ID as never, 0).activity,
    componentKey: 'graphing-explorer' as string,
  };
  const submissions: Array<Record<string, unknown> & { _id: string }> = [];

  const ctx = {
    db: {
      get: async (id: string) => id === ACTIVITY_ID ? activity : null,
      query: (tableName: string) => {
        if (tableName !== 'activity_submissions') {
          throw new Error(`Unexpected table: ${tableName}`);
        }
        return {
          withIndex: (
            indexName: string,
            configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
          ) => {
            const conditions = new Map<string, unknown>();
            const index = {
              eq(field: string, value: unknown) {
                conditions.set(field, value);
                return index;
              },
            };
            configure(index);
            const selected = () => submissions.filter((submission) => (
              [...conditions].every(([field, value]) => submission[field] === value)
            ));

            if (indexName === 'by_user_activity_idempotency_key') {
              return {
                unique: async () => selected()[0] ?? null,
              };
            }

            if (indexName === 'by_user_activity_attempt_ordinal') {
              return {
                order: () => ({
                  first: async () => selected().at(-1) ?? null,
                }),
              };
            }

            throw new Error(`Unexpected index: ${indexName}`);
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        if (tableName !== 'activity_submissions') {
          throw new Error(`Unexpected write table: ${tableName}`);
        }
        const id = `activity_submissions:${submissions.length + 1}`;
        submissions.push({ _id: id, ...document });
        return id;
      },
    },
    scheduler: { runAfter: async () => undefined },
  } as unknown as MutationCtx;

  return { activity, ctx, submissions };
}

describe('IM3 server-owned submission lost-response recovery', () => {
  it('rejects an envelope whose activity identity does not match the server route', async () => {
    const { ctx, submissions } = makeContext();

    expect(() => createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-mismatched-activity-id',
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'activities:client-selected-other-activity',
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {},
        parts: [],
      },
    })).toThrow(/activityId must match/);
    expect(submissions).toHaveLength(0);
  });

  it('rejects an unknown server activity before grading or persistence', async () => {
    const { ctx, submissions } = makeContext();
    const unknownActivityId = 'activities:missing-im3-pilot';

    await expect(createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: unknownActivityId,
      idempotencyKey: 'im3-unknown-activity',
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: unknownActivityId,
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {},
        parts: [],
      },
    })).rejects.toThrow('Activity not found');
    expect(submissions).toHaveLength(0);
  });

  it('rejects known pilot identity with mismatched server metadata', async () => {
    const { activity, ctx, submissions } = makeContext();
    activity.srsEligible = false;

    await expect(createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-mismatched-pilot-metadata',
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: ACTIVITY_ID,
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {},
        parts: [],
      },
    })).rejects.toThrow(/pilot activity metadata/);
    expect(submissions).toHaveLength(0);
  });

});
