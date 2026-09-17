import { describe, expect, it } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { graphingExplorerSchema } from '@math-platform/math-content/schemas/graphing-explorer';
import {
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
} from '@/lib/practice/learning-evidence-pilot';
import {
  buildIm3CompareMaximumGuidedSeedDocuments,
} from '@/convex/seed/seed_lesson_1_1';

const ACTIVITY_ID = 'activities:compare-maximum-guided-seed-0';
const NOW = Date.parse('2026-08-20T08:30:00.000Z');

describe('buildIm3CompareMaximumGuidedSeedDocuments', () => {
  it('returns the accepted deterministic Guided seed-0 documents', () => {
    const generated = getGenerator('quadratic-graph-analysis').generate({
      nodeId: IM3_COMPARE_MAXIMUM_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const generatedProps = graphingExplorerSchema.parse(generated.data.rendererProps);

    expect(generated.expectedAnswer).toEqual({ greater_maximum: 'second' });
    expect(Object.keys(generated.gradingMetadata.partMaxScores)).toEqual(['greater_maximum']);
    expect(generated.gradingMetadata.partMaxScores).toEqual({ greater_maximum: 1 });
    expect(generated.gradingMetadata.partGradingRules).toEqual({ greater_maximum: 'exact_match' });

    const first = buildIm3CompareMaximumGuidedSeedDocuments(ACTIVITY_ID as never, NOW);
    const second = buildIm3CompareMaximumGuidedSeedDocuments(ACTIVITY_ID as never, NOW);

    expect(first).toEqual(second);
    expect(first.activity).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Guided comparison of quadratic maximum values',
      description: 'Guided practice for comparing the maximum values of quadratic functions.',
      props: generatedProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ['greater_maximum'],
        rubric: [{
          criteria: 'Identify the function with the greater maximum.',
          partId: 'greater_maximum',
          points: 1,
        }],
      },
      stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first.variant).toEqual({
      variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      componentKey: 'graphing-explorer',
      displayName: 'Guided comparison of quadratic maximum values',
      description: 'Guided practice for comparing the maximum values of quadratic functions.',
      objectiveIds: [IM3_COMPARE_MAXIMUM_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID },
    });
    expect(first.item).toEqual({
      practiceItemId: `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId: ACTIVITY_ID,
      variantKey: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      variantLabel: 'Seed 0',
    });
  });
});
