import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '@math-platform/math-content';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { Id } from '@/convex/_generated/dataModel';
import {
  buildIm3SymmetryGuidedSeedDocuments,
  buildIm3SymmetryIndependentSeedDocuments,
  buildIm3SymmetryWorkedSeedDocument,
} from '@/convex/seed/seed_lesson_1_1';
import {
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

const ACTIVITY_ID = 'activities:symmetry-seed' as Id<'activities'>;
const NOW = 100;

describe('IM3 symmetry seed documents', () => {
  it('builds exact deterministic Worked, Guided, and Independent documents', () => {
    const generator = getGenerator('quadratic-graph-analysis');
    const guidedGenerated = generator.generate({
      nodeId: IM3_SYMMETRY_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const independentGenerated = generator.generate({
      nodeId: IM3_SYMMETRY_NODE,
      seed: 1,
      difficulty: 0.5,
    });

    expect(guidedGenerated.data.rendererProps).toEqual({
      equation: 'y = 2x^2 - 8x + 11',
      variant: 'plot_from_equation',
      responseVariant: 'symmetry_graph',
      vertex: [2, 3],
      yIntercept: [0, 11],
      domain: [-3, 7],
      range: [0, 20],
    });
    expect(guidedGenerated.expectedAnswer).toEqual({
      placed_points: [{ x: 2, y: 3 }, { x: 0, y: 11 }, { x: 4, y: 11 }],
    });
    expect(guidedGenerated.gradingMetadata).toEqual({
      partAnswers: {
        placed_points: [{ x: 2, y: 3 }, { x: 0, y: 11 }, { x: 4, y: 11 }],
      },
      partMaxScores: { placed_points: 1 },
      partGradingRules: { placed_points: 'custom' },
    });
    expect(independentGenerated.data.rendererProps).toEqual({
      equation: 'y = 3x^2 - 6x + 1',
      variant: 'plot_from_equation',
      responseVariant: 'symmetry_graph',
      vertex: [1, -2],
      yIntercept: [0, 1],
      domain: [-3, 7],
      range: [-5, 5],
    });
    expect(independentGenerated.expectedAnswer).toEqual({
      placed_points: [{ x: 1, y: -2 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
    });
    expect(independentGenerated.gradingMetadata).toEqual({
      partAnswers: {
        placed_points: [{ x: 1, y: -2 }, { x: 0, y: 1 }, { x: 2, y: 1 }],
      },
      partMaxScores: { placed_points: 1 },
      partGradingRules: { placed_points: 'custom' },
    });

    const worked = buildIm3SymmetryWorkedSeedDocument(NOW);
    const workedAgain = buildIm3SymmetryWorkedSeedDocument(NOW);
    const guided = buildIm3SymmetryGuidedSeedDocuments(ACTIVITY_ID, NOW);
    const guidedAgain = buildIm3SymmetryGuidedSeedDocuments(ACTIVITY_ID, NOW);
    const independent = buildIm3SymmetryIndependentSeedDocuments(ACTIVITY_ID, NOW);
    const independentAgain = buildIm3SymmetryIndependentSeedDocuments(ACTIVITY_ID, NOW);

    expect(worked).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Graph a quadratic from a vertex and y-intercept by using symmetry',
      description: 'Graph a quadratic function from its vertex and y-intercept by using symmetry.',
      props: {
        equation: 'g(x) = -3x^2 + 6x - 1',
        variant: 'plot_from_equation',
        responseVariant: 'symmetry_graph',
        vertex: [1, 2],
        yIntercept: [0, -1],
        domain: [-3, 5],
        range: [-10, 5],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ['placed_points'],
        rubric: [{
          criteria: 'Place the vertex, the y-intercept, and the reflected point.',
          partId: 'placed_points',
          points: 1,
        }],
      },
      stableActivityId: IM3_SYMMETRY_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(worked).toEqual(workedAgain);
    expect(graphingExplorerSchema.parse(worked.props)).toEqual(worked.props);

    expect(guided).toEqual(guidedAgain);
    expect(guided.activity).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Guided graph from a vertex and y-intercept by symmetry',
      description: 'Use a vertex and y-intercept to graph a quadratic by symmetry.',
      props: guidedGenerated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ['placed_points'],
        rubric: [{
          criteria: 'Place the vertex, the y-intercept, and the reflected point.',
          partId: 'placed_points',
          points: 1,
        }],
      },
      stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(guided.variant).toEqual({
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      componentKey: 'graphing-explorer',
      displayName: 'Guided graph from a vertex and y-intercept by symmetry',
      description: 'Use a vertex and y-intercept to graph a quadratic by symmetry.',
      objectiveIds: [IM3_SYMMETRY_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID },
    });
    expect(guided.item).toEqual({
      practiceItemId: `${IM3_SYMMETRY_GUIDED_ACTIVITY_ID}:seed-0`,
      activityId: ACTIVITY_ID,
      variantKey: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      variantLabel: 'Seed 0',
    });
    expect(graphingExplorerSchema.parse(guided.activity.props)).toEqual(guided.activity.props);

    expect(independent).toEqual(independentAgain);
    expect(independent).not.toEqual(guided);
    expect(independent.activity).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Independent graph from a vertex and y-intercept by symmetry',
      description: 'Independent practice for graphing a quadratic by symmetry.',
      props: independentGenerated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 1,
        partialCredit: false,
        partIds: ['placed_points'],
        rubric: [{
          criteria: 'Place the vertex, the y-intercept, and the reflected point.',
          partId: 'placed_points',
          points: 1,
        }],
      },
      stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_SYMMETRY_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(independent.variant).toEqual({
      variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      componentKey: 'graphing-explorer',
      displayName: 'Independent graph from a vertex and y-intercept by symmetry',
      description: 'Independent practice for graphing a quadratic by symmetry.',
      objectiveIds: [IM3_SYMMETRY_NODE],
      difficulty: 'standard',
      metadata: { stableActivityId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID },
    });
    expect(independent.item).toEqual({
      practiceItemId: `${IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID}:seed-1`,
      activityId: ACTIVITY_ID,
      variantKey: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      legacyProblemFamilyId: IM3_SYMMETRY_INDEPENDENT_ACTIVITY_ID,
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: NOW,
      variantLabel: 'Seed 1',
    });
    expect(graphingExplorerSchema.parse(independent.activity.props))
      .toEqual(independent.activity.props);

    const guidedProps = graphingExplorerSchema.parse(guidedGenerated.data.rendererProps);
    const independentProps = graphingExplorerSchema.parse(
      independentGenerated.data.rendererProps,
    );
    expect(Object.keys(guided.activity.props).sort()).toEqual(Object.keys(guidedProps).sort());
    expect(Object.keys(independent.activity.props).sort())
      .toEqual(Object.keys(independentProps).sort());
    for (const props of [worked.props, guided.activity.props, independent.activity.props]) {
      expect(JSON.stringify(props)).not.toMatch(
        /"(expectedAnswer|answers|placed_points|score|maxScore|isCorrect|correctness)"/,
      );
    }
  });
});
