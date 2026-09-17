import { describe, expect, it } from 'vitest';

import type { Id } from '@/convex/_generated/dataModel';
import {
  buildIm3TwoRealSolutionsWorkedSeedDocument,
} from '@/convex/seed/seed_lesson_1_2';
import * as seedLesson12 from '@/convex/seed/seed_lesson_1_2';
import {
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

type OptionalWorkedUpsert = ((ctx: never, now: number) => Promise<Id<'activities'>>) | undefined;

describe('IM3 two-real-solutions Worked activity upsert', () => {
  it('upserts the two-real-solutions Worked activity by stable identity and preserves createdAt', async () => {
    const upsertWorkedActivity = (
      seedLesson12 as { upsertIm3TwoRealSolutionsWorkedActivity?: OptionalWorkedUpsert }
    ).upsertIm3TwoRealSolutionsWorkedActivity;
    expect(typeof upsertWorkedActivity).toBe('function');
    if (typeof upsertWorkedActivity !== 'function') return;

    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedActivityId = 'activities:two-real-solutions-worked' as Id<'activities'>;
    const ctx = {
      db: {
        query(table: string) {
          operations.push(`query:${table}`);
          return {
            withIndex(index: string, callback: (query: {
              eq: (field: string, value: unknown) => unknown;
            }) => unknown) {
              operations.push(`index:${index}`);
              callback({
                eq: (field: string, value: unknown) => {
                  operations.push(`eq:${field}:${String(value)}`);
                  return undefined;
                },
              });
              return {
                unique: async () => {
                  operations.push('unique');
                  return stored ? { ...stored, _id: storedActivityId } : null;
                },
              };
            },
          };
        },
        insert: async (table: string, document: Record<string, unknown>) => {
          operations.push(`insert:${table}`);
          stored = { ...document, _id: storedActivityId };
          return storedActivityId;
        },
        patch: async (id: Id<'activities'>, document: Record<string, unknown>) => {
          operations.push(`patch:${id}`);
          stored = { ...stored, ...document, _id: id };
        },
      },
    } as never;

    const firstId = await upsertWorkedActivity(ctx, 100);
    const secondId = await upsertWorkedActivity(ctx, 200);

    expect(firstId).toBe(storedActivityId);
    expect(secondId).toBe(storedActivityId);
    expect(operations).toEqual([
      'query:activities',
      'index:by_stable_activity_id',
      `eq:stableActivityId:${IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID}`,
      'unique',
      'insert:activities',
      'query:activities',
      'index:by_stable_activity_id',
      `eq:stableActivityId:${IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID}`,
      'unique',
      `patch:${storedActivityId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3TwoRealSolutionsWorkedSeedDocument(200),
      createdAt: 100,
      _id: storedActivityId,
    });
    expect(stored).toMatchObject({
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
    });
    expect(operations.filter((operation) => (
      operation.includes('practice_variants') || operation.includes('practice_items')
    ))).toEqual([]);
  });
});
