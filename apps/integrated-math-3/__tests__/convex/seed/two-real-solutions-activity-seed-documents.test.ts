import { describe, expect, it } from 'vitest';

import { graphingExplorerSchema } from '@math-platform/math-content';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

import * as seedLesson12 from '@/convex/seed/seed_lesson_1_2';
import {
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

const NOW = Date.parse('2026-09-07T12:00:00.000Z');
type OptionalSeedBuilder = ((now: number) => Record<string, unknown>) | undefined;

describe('two-real-solutions Worked seed document', () => {
  it('defines the exact source-faithful Worked activity document', () => {
    const buildWorkedSeedDocument = (
      seedLesson12 as { buildIm3TwoRealSolutionsWorkedSeedDocument?: OptionalSeedBuilder }
    ).buildIm3TwoRealSolutionsWorkedSeedDocument;
    expect(typeof buildWorkedSeedDocument).toBe('function');
    if (typeof buildWorkedSeedDocument !== 'function') return;

    const generated = getGenerator('two-real-solutions-graphing').generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 0,
      difficulty: 0.5,
    });
    const first = buildWorkedSeedDocument(NOW);
    const second = buildWorkedSeedDocument(NOW);

    expect(generated.data.rendererProps).toEqual({
      equation: 'f(x) = x^2 - 24x + 143',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(24 - x) = 143',
      points: [[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]],
      domain: [8, 16],
      range: [-2, 8],
      sum: 24,
      product: 143,
    });
    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Find two numbers with a given sum and product by graphing',
      description: 'Worked Example 2: Find two real numbers with a sum of 24 and a product of 143 by graphing.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solutions'],
        rubric: [
          { criteria: 'Complete the five-value table.', partId: 'table_values', points: 1 },
          { criteria: 'Plot the five points.', partId: 'placed_points', points: 1 },
          { criteria: 'Identify both solutions.', partId: 'solutions', points: 1 },
        ],
      },
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_WORKED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      learningEvidenceMode: 'worked_example',
      srsEligible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(JSON.stringify(first.props)).not.toMatch(
      /"(?:expectedAnswer|partAnswers|table_values|placed_points|solutions|score|maxScore|isCorrect|correctness)"\s*:/,
    );
  });

  it('defines the exact Guided activity document', () => {
    const buildGuidedSeedDocument = (
      seedLesson12 as { buildIm3TwoRealSolutionsGuidedSeedDocument?: OptionalSeedBuilder }
    ).buildIm3TwoRealSolutionsGuidedSeedDocument;
    expect(typeof buildGuidedSeedDocument).toBe('function');
    if (typeof buildGuidedSeedDocument !== 'function') return;

    const generated = getGenerator('two-real-solutions-graphing').generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 5,
      difficulty: 0.5,
    });
    const first = buildGuidedSeedDocument(NOW);
    const second = buildGuidedSeedDocument(NOW);

    expect(generated.data.rendererProps).toEqual({
      equation: 'f(x) = x^2 - 26x + 168',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(26 - x) = 168',
      points: [[11, 3], [12, 0], [13, -1], [14, 0], [15, 3]],
      domain: [9, 17],
      range: [-2, 8],
      sum: 26,
      product: 168,
    });
    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Guided practice: Find two numbers with a given sum and product by graphing',
      description: 'Guided practice for finding two real numbers with a given sum and product by graphing.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solutions'],
        rubric: [
          { criteria: 'Complete the five-value table.', partId: 'table_values', points: 1 },
          { criteria: 'Plot the five points.', partId: 'placed_points', points: 1 },
          { criteria: 'Identify both solutions.', partId: 'solutions', points: 1 },
        ],
      },
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first).not.toHaveProperty('learningEvidenceMode');
    expect(JSON.stringify(first.props)).not.toMatch(
      /"(?:expectedAnswer|partAnswers|table_values|placed_points|solutions|score|maxScore|isCorrect|correctness)"\s*:/,
    );
  });

  it('defines the exact Independent activity document', () => {
    const buildIndependentSeedDocument = (
      seedLesson12 as { buildIm3TwoRealSolutionsIndependentSeedDocument?: OptionalSeedBuilder }
    ).buildIm3TwoRealSolutionsIndependentSeedDocument;
    expect(typeof buildIndependentSeedDocument).toBe('function');
    if (typeof buildIndependentSeedDocument !== 'function') return;

    const generated = getGenerator('two-real-solutions-graphing').generate({
      nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      seed: 2,
      difficulty: 0.5,
    });
    const first = buildIndependentSeedDocument(NOW);
    const second = buildIndependentSeedDocument(NOW);

    expect(generated.data.rendererProps).toEqual({
      equation: 'f(x) = x^2 - 16x + 60',
      variant: 'plot_from_equation',
      responseVariant: 'two_real_solutions',
      originalEquation: 'x(16 - x) = 60',
      points: [[6, 0], [7, -3], [8, -4], [9, -3], [10, 0]],
      domain: [4, 12],
      range: [-5, 5],
      sum: 16,
      product: 60,
    });
    expect(first).toEqual(second);
    expect(graphingExplorerSchema.parse(first.props)).toEqual(first.props);
    expect(first).toEqual({
      componentKey: 'graphing-explorer',
      displayName: 'Independent practice: Find two numbers with a given sum and product by graphing',
      description: 'Independent practice for finding two real numbers with a sum and product by graphing.',
      props: generated.data.rendererProps,
      gradingConfig: {
        autoGrade: true,
        passingScore: 3,
        partialCredit: true,
        partIds: ['table_values', 'placed_points', 'solutions'],
        rubric: [
          { criteria: 'Complete the five-value table.', partId: 'table_values', points: 1 },
          { criteria: 'Plot the five points.', partId: 'placed_points', points: 1 },
          { criteria: 'Identify both solutions.', partId: 'solutions', points: 1 },
        ],
      },
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
      masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
      srsEligible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    expect(first).not.toHaveProperty('learningEvidenceMode');
    expect(JSON.stringify(first.props)).not.toMatch(
      /"(?:expectedAnswer|partAnswers|table_values|placed_points|solutions|score|maxScore|isCorrect|correctness)"\s*:/,
    );
  });
});
