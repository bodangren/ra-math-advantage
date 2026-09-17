import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '@math-platform/math-content';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { Id } from '@/convex/_generated/dataModel';
import {
  buildIm3DomainRangeGuidedSeedDocuments,
  buildIm3DomainRangeIndependentSeedDocuments,
  buildIm3DomainRangeWorkedSeedDocument,
  upsertIm3DomainRangeGuidedActivity,
  upsertIm3DomainRangeGuidedPracticeItem,
  upsertIm3DomainRangeGuidedVariant,
  upsertIm3DomainRangeIndependentActivity,
  upsertIm3DomainRangeIndependentPracticeItem,
  upsertIm3DomainRangeIndependentVariant,
} from '@/convex/seed/seed_lesson_1_1';

const DOMAIN_RANGE_NODE = 'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
const DOMAIN_RANGE_WORKED_ACTIVITY_ID = `${DOMAIN_RANGE_NODE}.worked_example`;
const DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID = `${DOMAIN_RANGE_NODE}.independent_practice`;

const FORBIDDEN_PROP_KEYS = new Set([
  'answer',
  'answers',
  'correctAnswer',
  'expectedAnswer',
  'gradingRules',
  'gradingMetadata',
  'partAnswers',
  'finalAnswer',
  'solutionSteps',
  'isCorrect',
  'score',
  'maxScore',
]);

function expectNoForbiddenPropKeys(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoForbiddenPropKeys);
    return;
  }
  if (value === null || typeof value !== 'object') return;

  Object.entries(value).forEach(([key, nestedValue]) => {
    expect(FORBIDDEN_PROP_KEYS.has(key)).toBe(false);
    expectNoForbiddenPropKeys(nestedValue);
  });
}

describe('IM3 domain-and-range Worked seed', () => {
  it('builds the exact source-faithful activity without generated answer data', () => {
    const activity = buildIm3DomainRangeWorkedSeedDocument(100);

    expect(activity).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Graph a quadratic function by using a table',
      description: 'Graph f(x) = x^2 + 2x - 3 by using a table. State the domain and range.',
      props: {
        equation: 'f(x) = x^2 + 2x - 3',
        variant: 'plot_from_equation',
        responseVariant: 'domain_range',
        domain: [-5, 5],
        range: [-10, 10],
      },
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
      stableActivityId: DOMAIN_RANGE_WORKED_ACTIVITY_ID,
      masteryNodeId: DOMAIN_RANGE_NODE,
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
      createdAt: 100,
      updatedAt: 100,
    });
    expect(graphingExplorerSchema.parse(activity.props)).toEqual(activity.props);
    expectNoForbiddenPropKeys(activity.props);
    expect(Object.keys(activity)).not.toContain('expectedAnswer');
    expect(Object.keys(activity)).not.toContain('solutionSteps');
  });
});

describe('IM3 domain-and-range Guided seed', () => {
  it('builds deterministic linked documents from generator seed 1', () => {
    const activityId = 'activities:domain-range-guided' as Id<'activities'>;
    const first = buildIm3DomainRangeGuidedSeedDocuments(activityId, 100);
    const second = buildIm3DomainRangeGuidedSeedDocuments(activityId, 100);
    const generated = getGenerator('quadratic-graph-analysis').generate({
      nodeId: DOMAIN_RANGE_NODE,
      seed: 1,
      difficulty: 0.5,
    });

    expect(first).toEqual(second);
    expect(first.activity).toMatchObject({
      componentKey: 'graphing-explorer',
      displayName: 'Guided domain and range from a quadratic graph',
      description: 'Use the graph of a quadratic function to state its domain and range.',
      props: {
        equation: 'y = x^2 - x - 2',
        variant: 'plot_from_equation',
        responseVariant: 'domain_range',
        domain: [-5, 5],
        range: [-10, 10],
      },
      stableActivityId: `${DOMAIN_RANGE_NODE}.guided_practice`,
      masteryNodeId: DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: 100,
      updatedAt: 100,
    });
    expect(first.activity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 2,
      partialCredit: true,
      partIds: Object.keys(generated.expectedAnswer),
      rubric: Object.keys(generated.expectedAnswer).map((partId) => ({
        criteria: `Correct ${partId}`,
        partId,
        points: generated.gradingMetadata.partMaxScores[partId],
      })),
    });
    expect(first.variant).toEqual({
      variantKey: `${DOMAIN_RANGE_NODE}.guided_practice`,
      legacyProblemFamilyId: `${DOMAIN_RANGE_NODE}.guided_practice`,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 100,
      componentKey: 'graphing-explorer',
      displayName: 'Guided domain and range from a quadratic graph',
      description: 'Use the graph to state the domain and range of the quadratic.',
      objectiveIds: [DOMAIN_RANGE_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: `${DOMAIN_RANGE_NODE}.guided_practice` },
    });
    expect(first.item).toEqual({
      practiceItemId: `${DOMAIN_RANGE_NODE}.guided_practice:seed-1`,
      activityId,
      variantKey: `${DOMAIN_RANGE_NODE}.guided_practice`,
      legacyProblemFamilyId: `${DOMAIN_RANGE_NODE}.guided_practice`,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 100,
      variantLabel: 'Seed 1',
    });
    expect(first.activity.props).toEqual(generated.data.rendererProps);
    expect(graphingExplorerSchema.parse(first.activity.props)).toEqual(first.activity.props);
    expectNoForbiddenPropKeys(first.activity.props);
  });

  it('exposes the Guided database upserts with the exact function arity', () => {
    expect(upsertIm3DomainRangeGuidedActivity).toHaveLength(2);
    expect(upsertIm3DomainRangeGuidedVariant).toHaveLength(2);
    expect(upsertIm3DomainRangeGuidedPracticeItem).toHaveLength(3);
    expect(upsertIm3DomainRangeIndependentActivity).toHaveLength(2);
    expect(upsertIm3DomainRangeIndependentVariant).toHaveLength(2);
    expect(upsertIm3DomainRangeIndependentPracticeItem).toHaveLength(3);
  });
});

describe('IM3 domain-and-range Independent seed', () => {
  it('builds deterministic linked documents from generator seed 0', () => {
    const activityId = 'activities:domain-range-independent' as Id<'activities'>;
    const first = buildIm3DomainRangeIndependentSeedDocuments(activityId, 100);
    const second = buildIm3DomainRangeIndependentSeedDocuments(activityId, 100);
    const generated = getGenerator('quadratic-graph-analysis').generate({
      nodeId: DOMAIN_RANGE_NODE,
      seed: 0,
      difficulty: 0.5,
    });

    expect(first).toEqual(second);
    expect(generated.data.rendererProps).toEqual({
      equation: 'y = -x^2 - 1',
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
      domain: [-5, 5],
      range: [-10, 10],
    });
    expect(generated.expectedAnswer).toEqual({
      domain: 'all_real_numbers',
      range: { relation: 'lte', boundary: -1 },
    });
    expect(first.activity).toMatchObject({
      componentKey: 'graphing-explorer',
      displayName: 'Independent domain and range from a quadratic graph',
      description: 'Independent practice for domain and range from a quadratic graph.',
      props: generated.data.rendererProps,
      stableActivityId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: DOMAIN_RANGE_NODE,
      srsEligible: true,
      createdAt: 100,
      updatedAt: 100,
    });
    expect(first.activity.gradingConfig).toEqual({
      autoGrade: true,
      passingScore: 2,
      partialCredit: true,
      partIds: ['domain', 'range'],
      rubric: [
        { criteria: 'Correct domain', partId: 'domain', points: 1 },
        { criteria: 'Correct range', partId: 'range', points: 1 },
      ],
    });
    expect(first.variant).toEqual({
      variantKey: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 100,
      componentKey: 'graphing-explorer',
      displayName: 'Independent domain and range from a quadratic graph',
      description: 'Practice stating the domain and range of a quadratic.',
      objectiveIds: [DOMAIN_RANGE_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID },
    });
    expect(first.item).toEqual({
      practiceItemId: `${DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID}:seed-0`,
      activityId,
      variantKey: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: DOMAIN_RANGE_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 100,
      variantLabel: 'Seed 0',
    });
    expect(graphingExplorerSchema.parse(first.activity.props)).toEqual(first.activity.props);
    expectNoForbiddenPropKeys(first.activity.props);
  });
});
