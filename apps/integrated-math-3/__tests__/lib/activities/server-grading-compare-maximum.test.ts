import { describe, expect, it } from 'vitest';

import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from '@math-platform/practice-core/contract';
import { parseQuadratic } from '@math-platform/graphing-core';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

import {
  gradeServerOwnedSubmission,
  type ServerOwnedActivity,
} from '@/lib/activities/server-grading';
import {
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
} from '@/lib/practice/learning-evidence-pilot';

type Choice = 'first' | 'second';

const comparisonGenerator = getGenerator('quadratic-graph-analysis');
const guidedOutput = comparisonGenerator.generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 0,
  difficulty: 0.5,
});
const independentOutput = comparisonGenerator.generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 1,
  difficulty: 0.5,
});

function rendererProps(output: typeof guidedOutput): Record<string, unknown> {
  return output.data.rendererProps as Record<string, unknown>;
}

const guidedProps = rendererProps(guidedOutput);
const independentProps = rendererProps(independentOutput);

function maximumFromEquation(equation: unknown): number {
  if (typeof equation !== 'string') throw new Error('Expected an equation string');
  const coefficients = parseQuadratic(equation);
  if (!coefficients) throw new Error('Expected a parser-supported quadratic');
  return coefficients.c - coefficients.b ** 2 / (4 * coefficients.a);
}

function opposite(choice: Choice): Choice {
  return choice === 'first' ? 'second' : 'first';
}

const guidedFirstMaximum = maximumFromEquation(guidedProps.equation);
const guidedSecondMaximum = maximumFromEquation(guidedProps.comparisonEquation);
const independentFirstMaximum = maximumFromEquation(independentProps.equation);
const independentSecondMaximum = maximumFromEquation(independentProps.comparisonEquation);
const guidedWinner: Choice = guidedFirstMaximum > guidedSecondMaximum ? 'first' : 'second';
const independentWinner: Choice = independentFirstMaximum > independentSecondMaximum
  ? 'first'
  : 'second';

const guidedActivity: ServerOwnedActivity = {
  id: 'server-owned-im3-compare-maximum-guided-activity-document',
  stableActivityId: IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
  componentKey: 'graphing-explorer',
  srsEligible: true,
  props: guidedProps,
  gradingConfig: {
    partIds: ['greater_maximum'],
    rubric: [{ partId: 'greater_maximum', points: 1 }],
  },
};

const independentActivity: ServerOwnedActivity = {
  id: 'activities:server-owned-im3-compare-maximum-independent-activity-document',
  stableActivityId: IM3_COMPARE_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  masteryNodeId: IM3_COMPARE_MAXIMUM_NODE,
  componentKey: 'graphing-explorer',
  srsEligible: true,
  props: independentProps,
  gradingConfig: {
    partIds: ['greater_maximum'],
    rubric: [{ partId: 'greater_maximum', points: 1 }],
  },
};

function makeEnvelope(
  mode: 'guided_practice' | 'independent_practice',
  choice: Choice,
  rawChoice: Choice = choice,
): PracticeSubmissionEnvelope {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: 'client-supplied-compare-maximum-activity-id',
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-09-05T10:00:00.000Z',
    answers: { greater_maximum: choice },
    parts: [{
      partId: 'greater_maximum',
      rawAnswer: rawChoice,
      hintsUsed: 1,
      changedCount: 2,
    }],
  });
}

function withActivity(
  activity: ServerOwnedActivity,
  changes: Partial<ServerOwnedActivity> & { props?: Record<string, unknown> },
): ServerOwnedActivity {
  return {
    ...activity,
    ...changes,
    props: changes.props ? { ...activity.props, ...changes.props } : activity.props,
  };
}

describe('IM3 compare-maximum server grading', () => {
  it('grades correct and opposite Guided and Independent choices from server-owned equations', () => {
    expect(guidedFirstMaximum).not.toBe(guidedSecondMaximum);
    expect(independentFirstMaximum).not.toBe(independentSecondMaximum);
    expect(guidedWinner).not.toBe(independentWinner);
    expect(guidedWinner).toBe('second');
    expect(independentWinner).toBe('first');

    for (const [activity, mode, winner] of [
      [guidedActivity, 'guided_practice', guidedWinner],
      [independentActivity, 'independent_practice', independentWinner],
    ] as const) {
      const correctResult = gradeServerOwnedSubmission(
        activity,
        makeEnvelope(mode, winner),
      );
      expect(correctResult).toMatchObject({
        score: 1,
        maxScore: 1,
        masteryContractVersion: 'learning-evidence.v1',
        submissionData: {
          activityId: activity.id,
          mode,
          status: 'graded',
          parts: [{
            partId: 'greater_maximum',
            rawAnswer: winner,
            isCorrect: true,
            score: 1,
            maxScore: 1,
            hintsUsed: 1,
            changedCount: 2,
          }],
        },
      });

      const oppositeResult = gradeServerOwnedSubmission(
        activity,
        makeEnvelope(mode, opposite(winner)),
      );
      expect(oppositeResult).toMatchObject({
        score: 0,
        maxScore: 1,
        submissionData: {
          activityId: activity.id,
          mode,
          status: 'graded',
          parts: [{
            partId: 'greater_maximum',
            rawAnswer: opposite(winner),
            isCorrect: false,
            score: 0,
            maxScore: 1,
            hintsUsed: 1,
            changedCount: 2,
          }],
        },
      });
    }
  });

  it('uses the raw greater_maximum part as authority over the answers map', () => {
    const envelope = makeEnvelope(
      'guided_practice',
      guidedWinner,
      opposite(guidedWinner),
    );
    const result = gradeServerOwnedSubmission(guidedActivity, envelope);

    expect(result).toMatchObject({ score: 0, maxScore: 1 });
    expect(result.submissionData.parts[0]?.rawAnswer).toBe(opposite(guidedWinner));
  });

  it('grades an exact activity without eligibility without a mastery contract', () => {
    const { srsEligible: omittedEligibility, ...activityWithoutEligibility } = guidedActivity;
    expect(omittedEligibility).toBe(true);
    const result = gradeServerOwnedSubmission(
      activityWithoutEligibility,
      makeEnvelope('guided_practice', guidedWinner),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 1 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['stable-ID lookalike', withActivity(guidedActivity, { stableActivityId: `${IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike` }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong node', withActivity(guidedActivity, { masteryNodeId: `${IM3_COMPARE_MAXIMUM_NODE}.lookalike` }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong component', withActivity(guidedActivity, { componentKey: 'step-by-step-solver' }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong mode', guidedActivity, makeEnvelope('independent_practice', guidedWinner)],
    ['wrong variant', withActivity(guidedActivity, { props: { variant: 'plot_from_equation' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong responseVariant', withActivity(guidedActivity, { props: { responseVariant: 'maximum_value' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['inconsistent comparison answer', withActivity(guidedActivity, { props: { comparisonAnswer: opposite(guidedWinner) } }), makeEnvelope('guided_practice', guidedWinner)],
    ['malformed first equation', withActivity(guidedActivity, { props: { equation: 'not a quadratic' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['malformed comparison equation', withActivity(guidedActivity, { props: { comparisonEquation: 'not a quadratic' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['upward first quadratic', withActivity(guidedActivity, { props: { equation: 'y = x^2' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['upward comparison quadratic', withActivity(guidedActivity, { props: { comparisonEquation: 'y = x^2' } }), makeEnvelope('guided_practice', guidedWinner)],
    ['equal maxima', withActivity(guidedActivity, {
      props: {
        comparisonEquation: guidedProps.equation,
        vertex: [
          -((parseQuadratic(guidedProps.equation as string)?.b ?? 0)
            / (2 * (parseQuadratic(guidedProps.equation as string)?.a ?? 1))),
          maximumFromEquation(guidedProps.equation),
        ],
        yIntercept: [0, parseQuadratic(guidedProps.equation as string)?.c ?? 0],
      },
    }), makeEnvelope('guided_practice', guidedWinner)],
    ['inconsistent g vertex', withActivity(guidedActivity, { props: { vertex: [99, 99] } }), makeEnvelope('guided_practice', guidedWinner)],
    ['inconsistent g y-intercept', withActivity(guidedActivity, { props: { yIntercept: [0, 99] } }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong rubric part', withActivity(guidedActivity, {
      gradingConfig: { partIds: ['other'], rubric: [{ partId: 'other', points: 1 }] },
    }), makeEnvelope('guided_practice', guidedWinner)],
    ['wrong rubric points', withActivity(guidedActivity, {
      gradingConfig: { partIds: ['greater_maximum'], rubric: [{ partId: 'greater_maximum', points: 2 }] },
    }), makeEnvelope('guided_practice', guidedWinner)],
  ])('keeps %s as an ordinary ungraded submitted record', (_label, activity, envelope) => {
    const result = gradeServerOwnedSubmission(activity, envelope);

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
    expect(result.submissionData.parts).toEqual([{
      partId: 'greater_maximum',
      rawAnswer: guidedWinner,
      hintsUsed: 1,
      changedCount: 2,
    }]);
    expect(result.submissionData).not.toHaveProperty('isCorrect');
    expect(result.submissionData).not.toHaveProperty('score');
    expect(result.submissionData).not.toHaveProperty('maxScore');
  });

  it('does not change unrelated graphing-explorer grading behavior', () => {
    const activity: ServerOwnedActivity = {
      id: 'server-owned-unrelated-compare-activity',
      stableActivityId: 'unrelated.compare.activity',
      masteryNodeId: 'unrelated.compare.node',
      componentKey: 'graphing-explorer',
      srsEligible: true,
      props: {
        equation: 'y = x^2 + 1',
        variant: 'plot_from_equation',
        responseVariant: 'table_graph',
      },
      gradingConfig: {
        partIds: ['greater_maximum'],
        rubric: [{ partId: 'greater_maximum', points: 1 }],
      },
    };
    const result = gradeServerOwnedSubmission(
      activity,
      makeEnvelope('guided_practice', guidedWinner),
    );

    expect(result.submissionData.status).toBe('submitted');
    expect(result.score).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
  });
});
