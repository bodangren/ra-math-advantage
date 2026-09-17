import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '@math-platform/math-content';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { Id } from '@/convex/_generated/dataModel';
import {
  buildIm3DomainRangeGuidedSeed2Documents,
  upsertIm3DomainRangeGuidedSeed2Activity,
  upsertIm3DomainRangeGuidedSeed2PracticeItem,
  upsertIm3DomainRangeGuidedSeed2Variant,
} from '@/convex/seed/seed_lesson_1_1';
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const ACTIVITY_ID = 'activities:domain-range-guided-seed-2' as Id<'activities'>;
const NOW = 100;

const FORBIDDEN_PROP_KEYS = new Set([
  'answer',
  'answers',
  'correctAnswer',
  'expectedAnswer',
  'gradingRules',
  'gradingMetadata',
  'canonicalAnswers',
]);

function expectNoForbiddenPropKeys(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(expectNoForbiddenPropKeys);
    return;
  }
  Object.entries(value).forEach(([key, nestedValue]) => {
    expect(FORBIDDEN_PROP_KEYS.has(key)).toBe(false);
    expectNoForbiddenPropKeys(nestedValue);
  });
}

function makeUniqueContext(table: 'activities' | 'practice_variants', existing?: Record<string, unknown>) {
  const operations: string[] = [];
  let stored = existing;
  const storedId = existing?._id ?? `${table}:domain-range-guided-seed-2`;
  const ctx = {
    db: {
      query(queryTable: string) {
        operations.push(`query:${queryTable}`);
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
              unique: async () => stored && { ...stored, _id: storedId },
            };
          },
        };
      },
      insert: async (queryTable: string, document: Record<string, unknown>) => {
        operations.push(`insert:${queryTable}`);
        stored = document;
        return storedId;
      },
      patch: async (id: string, document: Record<string, unknown>) => {
        operations.push(`patch:${id}`);
        stored = document;
      },
    },
  } as never;
  return { ctx, operations, getStored: () => stored };
}

function makePracticeItemContext(rows: Record<string, unknown>[] = []) {
  const operations: string[] = [];
  let storedRows = rows;
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
              take: async () => (
                index === 'by_variantKey'
                  ? storedRows.filter((row) => row.variantKey === IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY)
                  : storedRows.filter((row) => String(row.activityId) === String(ACTIVITY_ID))
              ),
            };
          },
        };
      },
      insert: async (table: string, document: Record<string, unknown>) => {
        operations.push(`insert:${table}`);
        storedRows = [{ ...document, _id: 'practice_items:domain-range-guided-seed-2' }];
        return 'practice_items:domain-range-guided-seed-2';
      },
      patch: async (id: string, document: Record<string, unknown>) => {
        operations.push(`patch:${id}`);
        storedRows = [{ ...document, _id: id }];
      },
    },
  } as never;
  return { ctx, operations, getStoredRows: () => storedRows };
}

describe('IM3 domain-and-range Guided seed 2', () => {
  it('builds deterministic generated documents with exact identities and grading', () => {
    const first = buildIm3DomainRangeGuidedSeed2Documents(ACTIVITY_ID, NOW);
    const second = buildIm3DomainRangeGuidedSeed2Documents(ACTIVITY_ID, NOW);
    const seedOne = getGenerator('quadratic-graph-analysis').generate({
      nodeId: IM3_DOMAIN_RANGE_NODE,
      seed: 1,
      difficulty: 0.5,
    });
    const generated = getGenerator('quadratic-graph-analysis').generate({
      nodeId: IM3_DOMAIN_RANGE_NODE,
      seed: 2,
      difficulty: 0.5,
    });

    expect(IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID).toBe(
      `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}:seed-2`,
    );
    expect(IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY).toBe(
      `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}:seed-2`,
    );
    expect(first).toEqual(second);
    expect(generated.data.rendererProps).toEqual({
      equation: 'y = -x^2 + x - 1',
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(generated.expectedAnswer).toEqual({
      domain: 'all_real_numbers',
      range: { relation: 'lte', boundary: -0.75 },
    });
    expect((generated.data.rendererProps as { equation: string }).equation).not.toBe(
      (seedOne.data.rendererProps as { equation: string }).equation,
    );
    expect(first.activity).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Guided domain and range from a quadratic graph',
      description: 'Use the graph of a quadratic function to state its domain and range.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 2,
        partialCredit: true,
        partIds: ['domain', 'range'],
        rubric: [
          { criteria: 'Correct domain', partId: 'domain', points: 1 },
          { criteria: 'Correct range', partId: 'range', points: 1 },
        ],
      },
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first.variant).toEqual({
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      componentKey: 'graphing-explorer',
      displayName: 'Guided domain and range from a quadratic graph',
      description: 'Use the graph to state the domain and range of the quadratic.',
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID },
    });
    expect(first.item).toEqual({
      practiceItemId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      activityId: ACTIVITY_ID,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      variantLabel: 'Seed 2',
    });
    expect(graphingExplorerSchema.parse(first.activity.props)).toEqual(first.activity.props);
    expectNoForbiddenPropKeys(first.activity.props);
  });

  it('exposes the new upserts with the existing arity', () => {
    expect(upsertIm3DomainRangeGuidedSeed2Activity).toHaveLength(2);
    expect(upsertIm3DomainRangeGuidedSeed2Variant).toHaveLength(2);
    expect(upsertIm3DomainRangeGuidedSeed2PracticeItem).toHaveLength(3);
  });

  it('converges activity, variant, and practice-item upserts', async () => {
    const activityContext = makeUniqueContext('activities');
    const activityId = await upsertIm3DomainRangeGuidedSeed2Activity(activityContext.ctx, NOW);
    await upsertIm3DomainRangeGuidedSeed2Activity(activityContext.ctx, NOW + 1);
    expect(activityId).toBe('activities:domain-range-guided-seed-2');
    expect(activityContext.operations.filter((operation) => operation.startsWith('insert:'))).toEqual([
      'insert:activities',
    ]);
    expect(activityContext.operations.filter((operation) => operation.startsWith('patch:'))).toHaveLength(1);
    expect(activityContext.getStored()).toMatchObject({
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
      masteryNodeId: IM3_DOMAIN_RANGE_NODE,
    });

    const variantContext = makeUniqueContext('practice_variants');
    const variantId = await upsertIm3DomainRangeGuidedSeed2Variant(variantContext.ctx, NOW);
    await upsertIm3DomainRangeGuidedSeed2Variant(variantContext.ctx, NOW + 1);
    expect(variantId).toBe('practice_variants:domain-range-guided-seed-2');
    expect(variantContext.operations.filter((operation) => operation.startsWith('insert:'))).toEqual([
      'insert:practice_variants',
    ]);
    expect(variantContext.operations.filter((operation) => operation.startsWith('patch:'))).toHaveLength(1);
    expect(variantContext.getStored()).toMatchObject({
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      objectiveIds: [IM3_DOMAIN_RANGE_NODE],
    });

    const itemContext = makePracticeItemContext();
    const itemId = await upsertIm3DomainRangeGuidedSeed2PracticeItem(itemContext.ctx, ACTIVITY_ID, NOW);
    const secondItemId = await upsertIm3DomainRangeGuidedSeed2PracticeItem(
      itemContext.ctx,
      ACTIVITY_ID,
      NOW + 1,
    );
    expect(itemId).toBe('practice_items:domain-range-guided-seed-2');
    expect(secondItemId).toBe(itemId);
    expect(itemContext.getStoredRows()).toHaveLength(1);
    expect(itemContext.operations.filter((operation) => operation.startsWith('insert:'))).toEqual([
      'insert:practice_items',
    ]);
    expect(itemContext.operations.filter((operation) => operation.startsWith('patch:'))).toHaveLength(1);
    expect(itemContext.getStoredRows()[0]).toMatchObject({
      practiceItemId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      activityId: ACTIVITY_ID,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
    });
  });

  it('rejects a conflicting practice-item mapping before writes', async () => {
    const context = makePracticeItemContext([{
      _id: 'practice_items:conflict',
      practiceItemId: 'wrong-item',
      activityId: 'activities:wrong' as Id<'activities'>,
      variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      legacyProblemFamilyId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
      variantLabel: 'Seed 2',
    }]);

    await expect(
      upsertIm3DomainRangeGuidedSeed2PracticeItem(context.ctx, ACTIVITY_ID, NOW),
    ).rejects.toThrow('Duplicate or conflicting IM3 domain-range Guided seed-2 practice-item mapping');
    expect(context.operations.filter((operation) => operation.startsWith('insert:'))).toEqual([]);
    expect(context.operations.filter((operation) => operation.startsWith('patch:'))).toEqual([]);
  });
});
