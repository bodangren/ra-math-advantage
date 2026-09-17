import { describe, expect, it } from 'vitest';

import type { Id } from '@/convex/_generated/dataModel';
import {
  buildIm3CompareMaximumGuidedSeedDocuments,
  upsertIm3CompareMaximumGuidedActivity,
} from '@/convex/seed/seed_lesson_1_1';
import {
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
} from '@/lib/practice/learning-evidence-pilot';

describe('IM3 compare-maximum Guided activity upsert', () => {
  it('upserts the exact Guided activity by stable identity', async () => {
    const operations: string[] = [];
    let stored: Record<string, unknown> | undefined;
    const storedActivityId = 'activities:compare-maximum-guided' as Id<'activities'>;
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

    const firstId = await upsertIm3CompareMaximumGuidedActivity(ctx, 100);
    const secondId = await upsertIm3CompareMaximumGuidedActivity(ctx, 200);

    expect(firstId).toBe(storedActivityId);
    expect(secondId).toBe(storedActivityId);
    expect(operations).toEqual([
      'query:activities',
      'index:by_stable_activity_id',
      `eq:stableActivityId:${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}`,
      'unique',
      'insert:activities',
      'query:activities',
      'index:by_stable_activity_id',
      `eq:stableActivityId:${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}`,
      'unique',
      `patch:${storedActivityId}`,
    ]);
    expect(stored).toEqual({
      ...buildIm3CompareMaximumGuidedSeedDocuments(storedActivityId, 200).activity,
      createdAt: 100,
      _id: storedActivityId,
    });
    expect(stored).toMatchObject({
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true,
    });
    expect(operations.filter((operation) => (
      operation.includes('practice_variants') || operation.includes('practice_items')
    ))).toEqual([]);
  });
});
