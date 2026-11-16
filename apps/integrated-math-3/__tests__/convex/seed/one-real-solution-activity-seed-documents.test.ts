import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '@math-platform/math-content';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

import {
  buildIm3OneRealSolutionIndependentSeedDocument,
  buildIm3OneRealSolutionGuidedSeedDocument,
  buildIm3OneRealSolutionWorkedSeedDocument,
} from '@/convex/seed/seed_lesson_1_2';
import {
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

const NOW = Date.parse('2026-09-06T12:00:00.000Z');

describe('buildIm3OneRealSolutionWorkedSeedDocument', () => {
  it('builds the exact deterministic Worked activity document', () => {
    const first = buildIm3OneRealSolutionWorkedSeedDocument(NOW);
    const second = buildIm3OneRealSolutionWorkedSeedDocument(NOW);

    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Solve a quadratic equation with one real solution by graphing',
      description: 'Worked Example 1: Solve 10 - x^2 = 4x + 14 by graphing.',
      props: {
        equation: 'f(x) = x^2 + 4x + 4',
        variant: 'plot_from_equation',
        responseVariant: 'one_real_solution',
        originalEquation: '10 - x^2 = 4x + 14',
        domain: [-5, 1],
        range: [-1, 10],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solution'],
        rubric: [
          { criteria: 'Complete the five-value table.', points: 1, partId: 'table_values' },
          { criteria: 'Plot the five points.', points: 1, partId: 'placed_points' },
          { criteria: 'Identify the repeated-root solution.', points: 1, partId: 'solution' },
        ],
      },
      stableActivityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('builds the exact deterministic Guided activity document', () => {
    const generated = getGenerator('one-real-solution-graphing').generate({
      nodeId: IM3_ONE_REAL_SOLUTION_NODE,
      seed: 45,
      difficulty: 0.5,
    });

    expect(generated.data.rendererProps).toEqual({
      equation: 'f(x) = x^2 + 6x + 9',
      variant: 'plot_from_equation',
      responseVariant: 'one_real_solution',
      originalEquation: '7 - x^2 = 6x + 16',
      domain: [-6, 0],
      range: [-1, 10],
    });
    expect(Object.keys(generated.expectedAnswer)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(generated.expectedAnswer).toEqual({
      table_values: [
        { x: -5, y: 4 },
        { x: -4, y: 1 },
        { x: -3, y: 0 },
        { x: -2, y: 1 },
        { x: -1, y: 4 },
      ],
      placed_points: [
        { x: -5, y: 4 },
        { x: -4, y: 1 },
        { x: -3, y: 0 },
        { x: -2, y: 1 },
        { x: -1, y: 4 },
      ],
      solution: -3,
    });
    expect(generated.gradingMetadata.partMaxScores).toEqual({
      table_values: 1,
      placed_points: 1,
      solution: 1,
    });
    expect(Object.keys(generated.gradingMetadata.partGradingRules)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(generated.gradingMetadata.partGradingRules).toEqual({
      table_values: 'custom',
      placed_points: 'custom',
      solution: 'numeric_tolerance',
    });
    expect(generated.gradingMetadata.partTolerances).toEqual({ solution: 0.01 });

    const first = buildIm3OneRealSolutionGuidedSeedDocument(NOW);
    const second = buildIm3OneRealSolutionGuidedSeedDocument(NOW);

    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Guided practice: Solve a quadratic equation with one real solution by graphing',
      description: 'Guided practice for solving a quadratic equation with one real solution by graphing.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solution'],
        rubric: [
          { criteria: 'Complete the five-value table.', points: 1, partId: 'table_values' },
          { criteria: 'Plot the five points.', points: 1, partId: 'placed_points' },
          { criteria: 'Identify the repeated-root solution.', points: 1, partId: 'solution' },
        ],
      },
      stableActivityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first).not.toHaveProperty('learningEvidenceMode');
    expect(JSON.stringify(first.props)).not.toMatch(
      /expectedAnswer|partAnswers|table_values|placed_points|score|maxScore|isCorrect|correctness/,
    );
  });

  it('builds the exact deterministic Independent activity document', () => {
    const generated = getGenerator('one-real-solution-graphing').generate({
      nodeId: IM3_ONE_REAL_SOLUTION_NODE,
      seed: 0,
      difficulty: 0.5,
    });

    expect(generated.data.rendererProps).toEqual({
      equation: 'f(x) = x^2 + 2x + 1',
      variant: 'plot_from_equation',
      responseVariant: 'one_real_solution',
      originalEquation: '7 - x^2 = 2x + 8',
      domain: [-4, 2],
      range: [-1, 10],
    });
    expect(Object.keys(generated.expectedAnswer)).toEqual([
      'table_values',
      'placed_points',
      'solution',
    ]);
    expect(generated.expectedAnswer).toEqual({
      table_values: [
        { x: -3, y: 4 },
        { x: -2, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 4 },
      ],
      placed_points: [
        { x: -3, y: 4 },
        { x: -2, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 4 },
      ],
      solution: -1,
    });
    expect(generated.gradingMetadata.partMaxScores).toEqual({
      table_values: 1,
      placed_points: 1,
      solution: 1,
    });
    expect(generated.gradingMetadata.partGradingRules).toEqual({
      table_values: 'custom',
      placed_points: 'custom',
      solution: 'numeric_tolerance',
    });
    expect(generated.gradingMetadata.partTolerances).toEqual({ solution: 0.01 });

    const first = buildIm3OneRealSolutionIndependentSeedDocument(NOW);
    const second = buildIm3OneRealSolutionIndependentSeedDocument(NOW);

    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Independent practice: Solve a quadratic equation with one real solution by graphing',
      description: 'Independent practice for solving a quadratic equation with one real solution by graphing.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solution'],
        rubric: [
          { criteria: 'Complete the five-value table.', points: 1, partId: 'table_values' },
          { criteria: 'Plot the five points.', points: 1, partId: 'placed_points' },
          { criteria: 'Identify the repeated-root solution.', points: 1, partId: 'solution' },
        ],
      },
      stableActivityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_ONE_REAL_SOLUTION_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first).not.toHaveProperty('learningEvidenceMode');
    expect(JSON.stringify(first.props)).not.toMatch(
      /expectedAnswer|partAnswers|table_values|placed_points|score|maxScore|isCorrect|correctness/,
    );
  });
});
