import { describe, expect, it, vi } from 'vitest';

import {
  resolveQueueItems,
  type ResolvedQueueItem,
} from '@/convex/queue/queue';
import {
  buildIm3DomainRangeGuidedSeedDocuments,
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeedDocuments,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3EquationRateGuidedSeedDocuments,
  buildIm3EquationRateIndependentSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
  buildIm3ProfitModelGuidedSeedDocuments,
} from '@/convex/seed/seed_lesson_1_1';
import {
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionGuidedPracticeSeedDocuments,
  buildIm3OneRealSolutionIndependentSeedDocument,
  buildIm3OneRealSolutionIndependentPracticeSeedDocuments,
} from '@/convex/seed/seed_lesson_1_2';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY,
  IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
} from '@/lib/practice/learning-evidence-pilot';
import type { QueueItem } from '@math-platform/srs-engine';

const baseQueueItem = {
  card: { variantKey: 'pilot-variant' },
  objectivePriority: 'essential',
  isOverdue: false,
  daysOverdue: 0,
} as unknown as QueueItem;

function makeContext(
  activity: Record<string, unknown>,
  exposure = false,
  practiceItem = {
    activityId: 'activities:pilot',
    variantKey: 'pilot-variant',
  },
  observedNodeIds: string[] = [],
) {
  const query = vi.fn((table: string) => {
    if (table === 'practice_items') {
      return {
        withIndex: vi.fn(() => ({
          first: vi.fn(async () => ({
            _id: 'practice-item-1',
            ...practiceItem,
            practiceItemId: `${practiceItem.variantKey}:pilot`,
            variantLabel: 'Pilot A',
          })),
        })),
      };
    }
    if (table === 'learning_evidence') {
      return {
        withIndex: vi.fn((_indexName: string, indexQuery: (query: unknown) => unknown) => {
          const queryBuilder = {
            eq: vi.fn((_field: string, value: unknown) => {
              if (_field === 'nodeId') observedNodeIds.push(String(value));
              return queryBuilder;
            }),
          };
          indexQuery(queryBuilder);
          return {
          take: vi.fn(async () => (exposure ? [{ origin: 'teacher_led' }] : [])),
          };
        }),
      };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    db: {
      query,
      get: vi.fn(async () => activity),
    },
  };
}

describe('IM3 resolved practice queue identity', () => {
  it('injects the database activity ID for every resolved activity', async () => {
    const activity = {
      _id: 'activities:pilot',
      componentKey: 'step-by-step-solver',
      props: { problemType: 'factoring' },
    };

    const result = await resolveQueueItems(
      makeContext(activity) as never,
      [baseQueueItem],
      'profiles:student',
    );

    expect(result).toHaveLength(1);
    expect((result[0] as ResolvedQueueItem).props).toMatchObject({
      problemType: 'factoring',
      activityId: 'activities:pilot',
    });
  });

  it('filters the exact pilot before exposure and injects its identity after exposure', async () => {
    const activity = {
      _id: 'activities:pilot',
      componentKey: 'graphing-explorer',
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
      props: { variant: 'plot_from_equation', equation: 'y = x^2 - 4' },
    };

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false) as never,
      [baseQueueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const afterExposure = await resolveQueueItems(
      makeContext(activity, true) as never,
      [baseQueueItem],
      'profiles:student',
    );
    expect(afterExposure[0]?.props).toMatchObject({
      activityId: 'activities:pilot',
      stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
    });
  });

  it('filters the exact Guided pilot before exposure and injects its identity after exposure', async () => {
    const activity = {
      _id: 'activities:pilot',
      componentKey: 'graphing-explorer',
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
      props: { variant: 'plot_from_equation', responseVariant: 'table_graph' },
    };

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false) as never,
      [baseQueueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const afterExposure = await resolveQueueItems(
      makeContext(activity, true) as never,
      [baseQueueItem],
      'profiles:student',
    );
    expect(afterExposure[0]?.props).toMatchObject({
      activityId: 'activities:pilot',
      stableActivityId: IM3_GUIDED_PRACTICE_ACTIVITY_ID,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
    });
  });

  it('keeps a Guided lookalike ordinary without pilot identity fields', async () => {
    const activity = {
      _id: 'activities:pilot',
      componentKey: 'graphing-explorer',
      stableActivityId: `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}-lookalike`,
      masteryNodeId: IM3_PILOT_NODE,
      srsEligible: true,
      props: { variant: 'plot_from_equation', responseVariant: 'table_graph' },
    };

    const result = await resolveQueueItems(
      makeContext(activity, true) as never,
      [baseQueueItem],
      'profiles:student',
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.props).toMatchObject({ activityId: 'activities:pilot' });
    expect(result[0]?.props).not.toHaveProperty('stableActivityId');
    expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
    expect(result[0]?.props).not.toHaveProperty('srsEligible');
  });

  const equationRateCases = [
    {
      label: 'Guided',
      documents: buildIm3EquationRateGuidedSeedDocuments('activities:equation-guided' as never, 0),
      physicalActivityId: 'activities:equation-guided',
      stableActivityId: IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
    },
    {
      label: 'Independent',
      documents: buildIm3EquationRateIndependentSeedDocuments('activities:equation-independent' as never, 0),
      physicalActivityId: 'activities:equation-independent',
      stableActivityId: IM3_EQUATION_RATE_INDEPENDENT_ACTIVITY_ID,
    },
  ] as const;

  it.each(equationRateCases)(
    'filters exact equation-rate $label before exposure and injects trusted identity after exposure',
    async ({ documents, physicalActivityId, stableActivityId }) => {
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: stableActivityId },
      } as QueueItem;

      const beforeExposure = await resolveQueueItems(
        makeContext(
          activity,
          false,
          documents.item,
        ) as never,
        [queueItem],
        'profiles:student',
      );
      expect(beforeExposure).toEqual([]);

      const observedNodeIds: string[] = [];
      const afterExposure = await resolveQueueItems(
        makeContext(
          activity,
          true,
          documents.item,
          observedNodeIds,
        ) as never,
        [queueItem],
        'profiles:student',
      );
      expect(afterExposure[0]).toMatchObject({
        componentKey: 'rate-of-change-calculator',
        props: {
          ...documents.activity.props,
          activityId: physicalActivityId,
          stableActivityId,
          masteryNodeId: IM3_EQUATION_RATE_NODE,
          srsEligible: true,
        },
      });
      expect(observedNodeIds).toEqual([IM3_EQUATION_RATE_NODE]);
    },
  );

  const domainRangeCases = [
    {
      label: 'Guided',
      documents: buildIm3DomainRangeGuidedSeedDocuments('activities:domain-range-guided' as never, 0),
      physicalActivityId: 'activities:domain-range-guided',
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
    },
    {
      label: 'Guided seed 2',
      documents: buildIm3DomainRangeGuidedSeed2Documents('activities:domain-range-guided-seed-2' as never, 0),
      physicalActivityId: 'activities:domain-range-guided-seed-2',
      stableActivityId: IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
    },
    {
      label: 'Independent',
      documents: buildIm3DomainRangeIndependentSeedDocuments('activities:domain-range-independent' as never, 0),
      physicalActivityId: 'activities:domain-range-independent',
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
    },
    {
      label: 'Independent seed 2',
      documents: buildIm3DomainRangeIndependentSeed2Documents('activities:domain-range-independent-seed-2' as never, 0),
      physicalActivityId: 'activities:domain-range-independent-seed-2',
      stableActivityId: IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
    },
  ] as const;

  it.each(domainRangeCases)(
    'filters exact domain-range $label before exposure and injects trusted identity after exposure',
    async ({ documents, physicalActivityId, stableActivityId }) => {
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;

      const beforeExposure = await resolveQueueItems(
        makeContext(
          activity,
          false,
          documents.item,
        ) as never,
        [queueItem],
        'profiles:student',
      );
      expect(beforeExposure).toEqual([]);

      const observedNodeIds: string[] = [];
      const afterExposure = await resolveQueueItems(
        makeContext(
          activity,
          true,
          documents.item,
          observedNodeIds,
        ) as never,
        [queueItem],
        'profiles:student',
      );
      expect(afterExposure[0]).toMatchObject({
        componentKey: 'graphing-explorer',
        props: {
          ...documents.activity.props,
          activityId: physicalActivityId,
          stableActivityId,
          masteryNodeId: IM3_DOMAIN_RANGE_NODE,
          srsEligible: true,
        },
      });
      expect(observedNodeIds).toEqual([IM3_DOMAIN_RANGE_NODE]);
    },
  );

  const maximumReadingCases = [
    {
      label: 'Guided',
      documents: buildIm3MaximumReadingGuidedSeedDocuments('activities:maximum-reading-guided' as never, 0),
      physicalActivityId: 'activities:maximum-reading-guided',
      stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
    },
    {
      label: 'Independent',
      documents: buildIm3MaximumReadingIndependentSeedDocuments('activities:maximum-reading-independent' as never, 0),
      physicalActivityId: 'activities:maximum-reading-independent',
      stableActivityId: IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    },
  ] as const;

  it.each(maximumReadingCases)(
    'filters exact maximum-reading $label before exposure and injects trusted identity after exposure',
    async ({ documents, physicalActivityId, stableActivityId }) => {
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;

      const beforeExposure = await resolveQueueItems(
        makeContext(activity, false, documents.item) as never,
        [queueItem],
        'profiles:student',
      );
      expect(beforeExposure).toEqual([]);

      const observedNodeIds: string[] = [];
      const afterExposure = await resolveQueueItems(
        makeContext(activity, true, documents.item, observedNodeIds) as never,
        [queueItem],
        'profiles:student',
      );
      expect(afterExposure[0]).toMatchObject({
        componentKey: 'graphing-explorer',
        props: {
          ...documents.activity.props,
          activityId: physicalActivityId,
          stableActivityId,
          masteryNodeId: IM3_MAXIMUM_READING_NODE,
          srsEligible: true,
        },
      });
      expect(observedNodeIds).toEqual([IM3_MAXIMUM_READING_NODE]);
    },
  );

  const maximumReadingGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_MAXIMUM_READING_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(maximumReadingGuardCases)(
    'keeps maximum-reading Guided $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:maximum-reading-guided-guard';
      const documents = buildIm3MaximumReadingGuidedSeedDocuments(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(activity, true, documents.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({ activityId: physicalActivityId });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  it('filters the exact one-real-solution Guided card before exposure and injects trusted identity after exposure', async () => {
    const physicalActivityId = 'activities:one-real-solution-guided';
    const activityDocument = buildIm3OneRealSolutionGuidedSeedDocument(45);
    const practiceItemDocument = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
      physicalActivityId as never,
      45,
    );
    const activity = {
      _id: physicalActivityId,
      ...activityDocument,
    };
    const queueItem = {
      ...baseQueueItem,
      card: { variantKey: practiceItemDocument.item.variantKey },
    } as QueueItem;

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false, practiceItemDocument.item) as never,
      [queueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const observedNodeIds: string[] = [];
    const afterExposure = await resolveQueueItems(
      makeContext(activity, true, practiceItemDocument.item, observedNodeIds) as never,
      [queueItem],
      'profiles:student',
    );
    expect(afterExposure[0]).toMatchObject({
      componentKey: 'graphing-explorer',
      props: {
        ...activityDocument.props,
        activityId: physicalActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
    expect(observedNodeIds).toEqual([IM3_ONE_REAL_SOLUTION_NODE]);
  });

  const oneRealSolutionGuidedGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_ONE_REAL_SOLUTION_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(oneRealSolutionGuidedGuardCases)(
    'keeps one-real-solution Guided $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:one-real-solution-guided-guard';
      const activityDocument = buildIm3OneRealSolutionGuidedSeedDocument(45);
      const practiceItemDocument = buildIm3OneRealSolutionGuidedPracticeSeedDocuments(
        physicalActivityId as never,
        45,
      );
      const activity = {
        _id: physicalActivityId,
        ...activityDocument,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: practiceItemDocument.item.variantKey },
      } as QueueItem;

      const result = await resolveQueueItems(
        makeContext(activity, true, practiceItemDocument.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toEqual({
        ...activityDocument.props,
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  it('filters the exact one-real-solution Independent card before exposure and injects trusted identity after exposure', async () => {
    const physicalActivityId = 'activities:one-real-solution-independent';
    const activityDocument = buildIm3OneRealSolutionIndependentSeedDocument(0);
    const practiceItemDocument = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
      physicalActivityId as never,
      0,
    );
    const activity = {
      _id: physicalActivityId,
      ...activityDocument,
    };
    const queueItem = {
      ...baseQueueItem,
      card: { variantKey: practiceItemDocument.item.variantKey },
    } as QueueItem;

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false, practiceItemDocument.item) as never,
      [queueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const observedNodeIds: string[] = [];
    const afterExposure = await resolveQueueItems(
      makeContext(activity, true, practiceItemDocument.item, observedNodeIds) as never,
      [queueItem],
      'profiles:student',
    );
    expect(afterExposure[0]).toMatchObject({
      componentKey: 'graphing-explorer',
      props: {
        ...activityDocument.props,
        activityId: physicalActivityId,
        stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
        srsEligible: true,
      },
    });
    expect(observedNodeIds).toEqual([IM3_ONE_REAL_SOLUTION_NODE]);
  });

  const oneRealSolutionIndependentGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_ONE_REAL_SOLUTION_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(oneRealSolutionIndependentGuardCases)(
    'keeps one-real-solution Independent $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:one-real-solution-independent-guard';
      const activityDocument = buildIm3OneRealSolutionIndependentSeedDocument(0);
      const practiceItemDocument = buildIm3OneRealSolutionIndependentPracticeSeedDocuments(
        physicalActivityId as never,
        0,
      );
      const activity = {
        _id: physicalActivityId,
        ...activityDocument,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: practiceItemDocument.item.variantKey },
      } as QueueItem;

      const result = await resolveQueueItems(
        makeContext(activity, true, practiceItemDocument.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toEqual({
        ...activityDocument.props,
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  const domainRangeGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(domainRangeGuardCases)(
    'keeps domain-range $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:domain-range-guard';
      const documents = buildIm3DomainRangeGuidedSeedDocuments(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(
          activity,
          true,
          documents.item,
        ) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  const domainRangeSeed2GuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(domainRangeSeed2GuardCases)(
    'keeps exact domain-range Guided seed-2 $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:domain-range-guided-seed-2-guard';
      const documents = buildIm3DomainRangeGuidedSeed2Documents(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: IM3_DOMAIN_RANGE_GUIDED_SEED_2_VARIANT_KEY },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(activity, true, documents.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({ activityId: physicalActivityId });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  const domainRangeIndependentSeed2GuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_DOMAIN_RANGE_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'rate-of-change-calculator' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(domainRangeIndependentSeed2GuardCases)(
    'keeps exact domain-range Independent seed-2 $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:domain-range-independent-seed-2-guard';
      const documents = buildIm3DomainRangeIndependentSeed2Documents(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(activity, true, documents.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({ activityId: physicalActivityId });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  it('filters the exact profit-model Guided activity before exposure and injects trusted identity after exposure', async () => {
    const physicalActivityId = 'activities:profit-model-guided';
    const documents = buildIm3ProfitModelGuidedSeedDocuments(physicalActivityId as never, 0);
    const activity = {
      _id: physicalActivityId,
      ...documents.activity,
      srsEligible: true,
    };
    const queueItem = {
      ...baseQueueItem,
      card: { variantKey: documents.item.variantKey },
    } as QueueItem;

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false, documents.item) as never,
      [queueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const observedNodeIds: string[] = [];
    const afterExposure = await resolveQueueItems(
      makeContext(activity, true, documents.item, observedNodeIds) as never,
      [queueItem],
      'profiles:student',
    );
    expect(afterExposure[0]).toMatchObject({
      componentKey: 'fill-in-the-blank',
      props: {
        ...documents.activity.props,
        activityId: physicalActivityId,
        stableActivityId: IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        srsEligible: true,
      },
    });
    expect(observedNodeIds).toEqual([IM3_PROFIT_MODEL_NODE]);
  });

  it('filters the exact profit-model Independent activity before exposure and injects trusted identity after exposure', async () => {
    const physicalActivityId = 'activities:profit-model-independent';
    const documents = buildIm3ProfitModelIndependentSeedDocuments(physicalActivityId as never, 0);
    const activity = {
      _id: physicalActivityId,
      ...documents.activity,
      srsEligible: true,
    };
    const queueItem = {
      ...baseQueueItem,
      card: { variantKey: documents.item.variantKey },
    } as QueueItem;

    const beforeExposure = await resolveQueueItems(
      makeContext(activity, false, documents.item) as never,
      [queueItem],
      'profiles:student',
    );
    expect(beforeExposure).toEqual([]);

    const observedNodeIds: string[] = [];
    const afterExposure = await resolveQueueItems(
      makeContext(activity, true, documents.item, observedNodeIds) as never,
      [queueItem],
      'profiles:student',
    );
    expect(afterExposure[0]).toMatchObject({
      componentKey: 'fill-in-the-blank',
      props: {
        ...documents.activity.props,
        activityId: physicalActivityId,
        stableActivityId: IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
        masteryNodeId: IM3_PROFIT_MODEL_NODE,
        srsEligible: true,
      },
    });
    expect(observedNodeIds).toEqual([IM3_PROFIT_MODEL_NODE]);
  });

  const profitModelGuidedGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'graphing-explorer' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(profitModelGuidedGuardCases)(
    'keeps profit-model Guided $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:profit-model-guided-guard';
      const documents = buildIm3ProfitModelGuidedSeedDocuments(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        srsEligible: true,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(activity, true, documents.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  const profitModelIndependentGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'graphing-explorer' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(profitModelIndependentGuardCases)(
    'keeps profit-model Independent $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:profit-model-independent-guard';
      const documents = buildIm3ProfitModelIndependentSeedDocuments(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        srsEligible: true,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: documents.item.variantKey },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(activity, true, documents.item) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );

  const equationRateGuardCases = [
    {
      label: 'stable-ID lookalike',
      overrides: { stableActivityId: `${IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID}-lookalike` },
    },
    {
      label: 'wrong node',
      overrides: { masteryNodeId: `${IM3_EQUATION_RATE_NODE}-lookalike` },
    },
    {
      label: 'wrong component',
      overrides: { componentKey: 'graphing-explorer' },
    },
    {
      label: 'ineligible',
      overrides: { srsEligible: false },
    },
  ] as const;

  it.each(equationRateGuardCases)(
    'keeps equation-rate $label ordinary without trusted identity fields',
    async ({ overrides }) => {
      const physicalActivityId = 'activities:equation-guard';
      const stableActivityId = IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID;
      const documents = buildIm3EquationRateGuidedSeedDocuments(physicalActivityId as never, 0);
      const activity = {
        _id: physicalActivityId,
        ...documents.activity,
        ...overrides,
      };
      const queueItem = {
        ...baseQueueItem,
        card: { variantKey: stableActivityId },
      } as QueueItem;
      const result = await resolveQueueItems(
        makeContext(
          activity,
          true,
          { activityId: physicalActivityId, variantKey: stableActivityId },
        ) as never,
        [queueItem],
        'profiles:student',
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.props).toMatchObject({
        activityId: physicalActivityId,
      });
      expect(result[0]?.props).not.toHaveProperty('stableActivityId');
      expect(result[0]?.props).not.toHaveProperty('masteryNodeId');
      expect(result[0]?.props).not.toHaveProperty('srsEligible');
    },
  );
});
