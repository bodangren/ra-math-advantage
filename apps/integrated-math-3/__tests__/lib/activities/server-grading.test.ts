import { describe, expect, it } from 'vitest';

import { buildPracticeSubmissionEnvelope } from '@math-platform/practice-core';
import { practiceSubmissionEnvelopeSchema, type PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import {
  buildIm3GuidedPilotSeedDocuments,
  buildIm3DomainRangeGuidedSeed2Documents,
  buildIm3DomainRangeIndependentSeed2Documents,
  buildIm3GraphGuidedSeed2Documents,
  buildIm3GraphIndependentSeed2Documents,
  buildIm3MaximumReadingGuidedSeedDocuments,
  buildIm3MaximumReadingIndependentSeedDocuments,
  buildIm3ProfitMaximumGuidedSeedDocuments,
  buildIm3ProfitMaximumIndependentSeedDocuments,
  buildIm3ProfitModelGuidedSeedDocuments,
  buildIm3ProfitModelIndependentSeedDocuments,
} from '@/convex/seed/seed_lesson_1_1';
import { gradeServerOwnedSubmission } from '@/lib/activities/server-grading';
import {
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID,
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_PILOT_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
} from '@/lib/practice/learning-evidence-pilot';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

type PilotActivity = {
  id: string;
  stableActivityId: string;
  masteryNodeId: string;
  componentKey: string;
  srsEligible: boolean;
  props: Record<string, unknown>;
  gradingConfig: {
    partIds: string[];
    rubric: Array<{ partId: string; points: number }>;
  };
};

const PILOT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-activity-document',
  stableActivityId: IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  masteryNodeId: IM3_PILOT_NODE,
  componentKey: 'graphing-explorer',
  srsEligible: false,
  props: {
    equation: 'y = x^2 - x + 2',
    variant: 'plot_from_equation',
    responseVariant: 'table_graph',
  },
  gradingConfig: {
    partIds: ['table_values', 'placed_points'],
    rubric: [
      { partId: 'table_values', points: 1 },
      { partId: 'placed_points', points: 1 },
    ],
  },
};

const PILOT_POINTS = [
  { x: -2, y: 8 },
  { x: -1, y: 4 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 4 },
];

const GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-guided-activity-document',
  ...buildIm3GuidedPilotSeedDocuments('activities:guided' as never, 123).activity,
  srsEligible: true,
};

const GUIDED_POINTS = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 1,
  difficulty: 0.5,
}).expectedAnswer.table_values as Array<{ x: number; y: number }>;

const EQUATION_RATE_NODE = 'math.im3.skill.1.1.calculate-average-rate-of-change-from-an-equation';
const EQUATION_RATE_PART_IDS = ['f_a', 'f_b', 'rate'] as const;
const EQUATION_RATE_GRADING_CONFIG = {
  partIds: [...EQUATION_RATE_PART_IDS],
  rubric: [
    { partId: 'f_a', points: 2 },
    { partId: 'f_b', points: 2 },
    { partId: 'rate', points: 3 },
  ],
};
const EQUATION_GUIDED_OUTPUT = getGenerator('average-rate-of-change').generate({
  nodeId: EQUATION_RATE_NODE,
  seed: 1,
  difficulty: 0.5,
});
const EQUATION_INDEPENDENT_OUTPUT = getGenerator('average-rate-of-change').generate({
  nodeId: EQUATION_RATE_NODE,
  seed: 2,
  difficulty: 0.5,
});
const EQUATION_GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-equation-guided-activity-document',
  stableActivityId: `${EQUATION_RATE_NODE}.guided_practice`,
  masteryNodeId: EQUATION_RATE_NODE,
  componentKey: 'rate-of-change-calculator',
  srsEligible: false,
  props: EQUATION_GUIDED_OUTPUT.data.rendererProps as Record<string, unknown>,
  gradingConfig: EQUATION_RATE_GRADING_CONFIG,
};
const EQUATION_INDEPENDENT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-equation-independent-activity-document',
  stableActivityId: `${EQUATION_RATE_NODE}.independent_practice`,
  masteryNodeId: EQUATION_RATE_NODE,
  componentKey: 'rate-of-change-calculator',
  srsEligible: false,
  props: EQUATION_INDEPENDENT_OUTPUT.data.rendererProps as Record<string, unknown>,
  gradingConfig: EQUATION_RATE_GRADING_CONFIG,
};

const DOMAIN_RANGE_NODE = 'math.im3.skill.1.1.state-the-domain-and-range-of-a-quadratic-from-its-graph';
const DOMAIN_RANGE_GRADING_CONFIG = {
  partIds: ['domain', 'range'],
  rubric: [
    { partId: 'domain', points: 1 },
    { partId: 'range', points: 1 },
  ],
};
const DOMAIN_RANGE_GUIDED_OUTPUT = getGenerator('quadratic-graph-analysis').generate({
  nodeId: DOMAIN_RANGE_NODE,
  seed: 1,
  difficulty: 0.5,
});
const DOMAIN_RANGE_INDEPENDENT_OUTPUT = getGenerator('quadratic-graph-analysis').generate({
  nodeId: DOMAIN_RANGE_NODE,
  seed: 0,
  difficulty: 0.5,
});
const DOMAIN_RANGE_GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-domain-range-guided-activity-document',
  stableActivityId: `${DOMAIN_RANGE_NODE}.guided_practice`,
  masteryNodeId: DOMAIN_RANGE_NODE,
  componentKey: 'graphing-explorer',
  srsEligible: true,
  props: DOMAIN_RANGE_GUIDED_OUTPUT.data.rendererProps as Record<string, unknown>,
  gradingConfig: DOMAIN_RANGE_GRADING_CONFIG,
};
const DOMAIN_RANGE_INDEPENDENT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-domain-range-independent-activity-document',
  stableActivityId: `${DOMAIN_RANGE_NODE}.independent_practice`,
  masteryNodeId: DOMAIN_RANGE_NODE,
  componentKey: 'graphing-explorer',
  srsEligible: true,
  props: DOMAIN_RANGE_INDEPENDENT_OUTPUT.data.rendererProps as Record<string, unknown>,
  gradingConfig: DOMAIN_RANGE_GRADING_CONFIG,
};
const DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-domain-range-guided-seed-2-activity-document',
  ...buildIm3DomainRangeGuidedSeed2Documents(
    'server-owned-im3-domain-range-guided-seed-2-activity-document' as never,
    123,
  ).activity,
};
const DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-domain-range-independent-seed-2-activity-document',
  ...buildIm3DomainRangeIndependentSeed2Documents(
    'server-owned-im3-domain-range-independent-seed-2-activity-document' as never,
    123,
  ).activity,
};
const MAXIMUM_READING_GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-maximum-reading-guided-activity-document',
  ...buildIm3MaximumReadingGuidedSeedDocuments(
    'server-owned-im3-maximum-reading-guided-activity-document' as never,
    123,
  ).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};
const MAXIMUM_READING_INDEPENDENT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-maximum-reading-independent-activity-document',
  ...buildIm3MaximumReadingIndependentSeedDocuments(
    'server-owned-im3-maximum-reading-independent-activity-document' as never,
    123,
  ).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};

const PROFIT_MODEL_GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-profit-model-guided-activity-document',
  ...buildIm3ProfitModelGuidedSeedDocuments('activities:profit-model-guided' as never, 123).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};
const PROFIT_MODEL_GUIDED_BLANKS = PROFIT_MODEL_GUIDED_ACTIVITY.props.blanks as Array<{
  id: string;
  correctAnswer: string;
}>;
const PROFIT_MODEL_INDEPENDENT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-profit-model-independent-activity-document',
  ...buildIm3ProfitModelIndependentSeedDocuments(
    'activities:profit-model-independent' as never,
    123,
  ).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};
const PROFIT_MODEL_INDEPENDENT_BLANKS = PROFIT_MODEL_INDEPENDENT_ACTIVITY.props.blanks as Array<{
  id: string;
  correctAnswer: string;
}>;

const PROFIT_MAXIMUM_GUIDED_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-profit-maximum-guided-activity-document',
  ...buildIm3ProfitMaximumGuidedSeedDocuments('activities:profit-maximum-guided' as never, 123).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};
const PROFIT_MAXIMUM_GUIDED_BLANKS = PROFIT_MAXIMUM_GUIDED_ACTIVITY.props.blanks as Array<{
  id: string;
  correctAnswer: string;
}>;
const PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-profit-maximum-independent-activity-document',
  ...buildIm3ProfitMaximumIndependentSeedDocuments(
    'activities:profit-maximum-independent' as never,
    123,
  ).activity,
  // Eligibility is an explicit input for these grading tests.
  srsEligible: false,
};
const PROFIT_MAXIMUM_INDEPENDENT_BLANKS = PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY.props.blanks as Array<{
  id: string;
  correctAnswer: string;
}>;
const GRAPH_GUIDED_SEED_2_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-graph-guided-seed-2-activity-document',
  ...buildIm3GraphGuidedSeed2Documents('activities:graph-guided-seed-2' as never, 123, {
    nodeReviewStatus: 'approved',
    blueprintReviewStatus: 'approved',
  }).activity,
};
const GRAPH_GUIDED_SEED_2_OUTPUT = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 2,
  difficulty: 0.5,
});
const GRAPH_GUIDED_SEED_2_POINTS = GRAPH_GUIDED_SEED_2_OUTPUT.expectedAnswer.table_values as Array<{
  x: number;
  y: number;
}>;
const GRAPH_INDEPENDENT_SEED_2_ACTIVITY: PilotActivity = {
  id: 'server-owned-im3-graph-independent-seed-2-activity-document',
  ...buildIm3GraphIndependentSeed2Documents('activities:graph-independent-seed-2' as never, 123, {
    nodeReviewStatus: 'approved',
    blueprintReviewStatus: 'approved',
  }).activity,
};
const GRAPH_INDEPENDENT_SEED_2_OUTPUT = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 3,
  difficulty: 0.5,
});
const GRAPH_INDEPENDENT_SEED_2_POINTS = GRAPH_INDEPENDENT_SEED_2_OUTPUT.expectedAnswer.table_values as Array<{
  x: number;
  y: number;
}>;

function makeEquationEnvelope(
  answers: Record<string, unknown>,
  mode: 'guided_practice' | 'independent_practice',
) {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: 'client-supplied-equation-rate-activity-id',
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers,
    parts: EQUATION_RATE_PART_IDS.map((partId) => ({
      partId,
      rawAnswer: answers[partId],
    })),
  });
}

function makeDomainRangeEnvelope(
  mode: 'guided_practice' | 'independent_practice',
  partAnswers: { domain: unknown; range: unknown },
  answerValues = partAnswers,
) {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: 'client-supplied-domain-range-activity-id',
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers: answerValues,
    parts: [
      {
        partId: 'domain',
        rawAnswer: partAnswers.domain,
        isCorrect: false,
        score: 99,
        maxScore: 99,
      },
      {
        partId: 'range',
        rawAnswer: partAnswers.range,
        isCorrect: false,
        score: 99,
        maxScore: 99,
      },
    ],
  });
}

function makePilotActivity(
  overrides: Partial<PilotActivity> = {},
) {
  return { ...PILOT_ACTIVITY, ...overrides };
}

function makePilotEnvelope(
  tableValues: unknown = PILOT_POINTS,
  placedPoints: unknown = PILOT_POINTS,
  parts = [
    {
      partId: 'table_values',
      rawAnswer: tableValues,
      isCorrect: false,
      score: 0,
      maxScore: 0,
      misconceptionTags: ['forged'],
    },
    {
      partId: 'placed_points',
      rawAnswer: placedPoints,
      isCorrect: false,
      score: 0,
      maxScore: 0,
      misconceptionTags: ['forged'],
    },
  ],
  mode: 'independent_practice' | 'guided_practice' = 'independent_practice',
) {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: 'client-supplied-activity-id',
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers: {
      tableValues,
      placedPoints,
    },
    artifact: { equation: 'y = -100x^2 + 999' },
    parts,
  });
}

const FILL_IN_ACTIVITY = {
  id: 'server-owned-fill-in-activity-document',
  componentKey: 'fill-in-the-blank',
  props: {
    blanks: [
      { id: 'price', correctAnswer: '12' },
      { id: 'sales', correctAnswer: '680' },
    ],
  },
  gradingConfig: {
    rubric: [
      { partId: 'price', points: 1 },
      { partId: 'sales', points: 1 },
    ],
  },
} as const;

function makeFillInEnvelope(
  answers: Record<string, unknown>,
  parts = Object.entries(answers).map(([partId, rawAnswer]) => ({
    partId,
    rawAnswer,
  })),
) {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: 'practice.v1',
    activityId: 'client-supplied-fill-in-activity-id',
    mode: 'guided_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers,
    parts,
  });
}

describe('gradeServerOwnedSubmission', () => {
  it('grades the wrapped FillInTheBlank answer, not its client correctness flag', () => {
    const result = gradeServerOwnedSubmission(FILL_IN_ACTIVITY, makeFillInEnvelope({
      price: { answer: '12', isCorrect: false, usedWordBank: true },
      sales: { answer: 'wrong', isCorrect: true, usedWordBank: false },
    }));

    expect(result).toMatchObject({
      score: 1,
      maxScore: 2,
      submissionData: {
        status: 'graded',
        parts: [
          { partId: 'price', rawAnswer: '12', isCorrect: true, score: 1 },
          { partId: 'sales', rawAnswer: 'wrong', isCorrect: false, score: 0 },
        ],
      },
    });
  });

  it('continues to grade scalar fill-in answers', () => {
    const result = gradeServerOwnedSubmission(
      FILL_IN_ACTIVITY,
      makeFillInEnvelope({ price: '12', sales: '680' }),
    );

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
  });

  it('gives missing answers no credit', () => {
    const result = gradeServerOwnedSubmission(
      FILL_IN_ACTIVITY,
      makeFillInEnvelope({}, []),
    );

    expect(result).toMatchObject({ score: 0, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'price', rawAnswer: null, isCorrect: false, score: 0, maxScore: 1 },
      { partId: 'sales', rawAnswer: null, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it('gives an unknown rubric part no credit', () => {
    const activity = {
      ...FILL_IN_ACTIVITY,
      gradingConfig: {
        rubric: [
          ...FILL_IN_ACTIVITY.gradingConfig.rubric,
          { partId: 'unknown', points: 1 },
        ],
      },
    };
    const result = gradeServerOwnedSubmission(
      activity,
      makeFillInEnvelope({ price: '12' }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 3 });
    expect(result.submissionData.parts.at(-1)).toMatchObject({
      partId: 'unknown',
      rawAnswer: null,
      isCorrect: false,
      score: 0,
    });
  });

  it.each([
    ['a malformed blank', [{ id: 'price', correctAnswer: '' }]],
    ['duplicate blank IDs', [
      { id: 'price', correctAnswer: '12' },
      { id: 'price', correctAnswer: '13' },
    ]],
  ])('returns the ordinary ungraded result for %s', (_label, blanks) => {
    const activity = {
      ...FILL_IN_ACTIVITY,
      props: { blanks },
    };

    expect(() => gradeServerOwnedSubmission(activity, makeFillInEnvelope({ price: '12' })))
      .not.toThrow();
    const result = gradeServerOwnedSubmission(activity, makeFillInEnvelope({ price: '12' }));
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it('grades exact table and point arrays in different orders', () => {
    const result = gradeServerOwnedSubmission(
      PILOT_ACTIVITY,
      makePilotEnvelope([...PILOT_POINTS].reverse(), [
        PILOT_POINTS[2],
        PILOT_POINTS[4],
        PILOT_POINTS[0],
        PILOT_POINTS[3],
        PILOT_POINTS[1],
      ]),
    );

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(result.submissionData).toMatchObject({
      activityId: PILOT_ACTIVITY.id,
      status: 'graded',
      parts: [
        { partId: 'table_values', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
  });

  it('accepts graph points at the inclusive 0.25 tolerance', () => {
    const placedPoints = PILOT_POINTS.map(({ x, y }) => ({ x: x + 0.25, y: y - 0.25 }));
    const result = gradeServerOwnedSubmission(
      PILOT_ACTIVITY,
      makePilotEnvelope(PILOT_POINTS, placedPoints),
    );

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
  });

  it('gives one point for one correct part', () => {
    const wrongTable = PILOT_POINTS.map((point, index) => (
      index === 0 ? { ...point, y: point.y + 1 } : point
    ));
    const result = gradeServerOwnedSubmission(
      PILOT_ACTIVITY,
      makePilotEnvelope(wrongTable, PILOT_POINTS),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      expect.objectContaining({ partId: 'table_values', isCorrect: false, score: 0, maxScore: 1 }),
      expect.objectContaining({ partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 }),
    ]);
  });

  it.each([
    ['missing', []],
    ['extra', [...PILOT_POINTS, { x: 3, y: 8 }]],
  ])('gives no credit for %s graph points', (_label, placedPoints) => {
    const result = gradeServerOwnedSubmission(
      PILOT_ACTIVITY,
      makePilotEnvelope(PILOT_POINTS, placedPoints),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts[1]).toMatchObject({
      partId: 'placed_points',
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
  });

  it('ignores forged client grading fields and artifact equations', () => {
    const result = gradeServerOwnedSubmission(PILOT_ACTIVITY, makePilotEnvelope());

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      expect.objectContaining({ partId: 'table_values', rawAnswer: PILOT_POINTS, isCorrect: true, score: 1, maxScore: 1 }),
      expect.objectContaining({ partId: 'placed_points', rawAnswer: PILOT_POINTS, isCorrect: true, score: 1, maxScore: 1 }),
    ]);
    expect(result.submissionData.parts.every((part) => (
      part.misconceptionTags === undefined
      && part.score !== 0
      && part.maxScore === 1
    ))).toBe(true);
  });

  it.each([
    ['malformed equation', {
      props: { ...PILOT_ACTIVITY.props, equation: 'y = x + 2' },
    }],
    ['missing rubric part', {
      gradingConfig: {
        partIds: ['table_values'],
        rubric: [{ partId: 'table_values', points: 1 }],
      },
    }],
    ['duplicate rubric part', {
      gradingConfig: {
        partIds: ['table_values', 'table_values'],
        rubric: [
          { partId: 'table_values', points: 1 },
          { partId: 'table_values', points: 1 },
        ],
      },
    }],
    ['zero-point rubric part', {
      gradingConfig: {
        partIds: ['table_values', 'placed_points'],
        rubric: [
          { partId: 'table_values', points: 0 },
          { partId: 'placed_points', points: 1 },
        ],
      },
    }],
    ['extra rubric part', {
      gradingConfig: {
        partIds: ['table_values', 'placed_points', 'extra'],
        rubric: [
          { partId: 'table_values', points: 1 },
          { partId: 'placed_points', points: 1 },
          { partId: 'extra', points: 1 },
        ],
      },
    }],
  ])('rejects pilot canonical server data with %s', (_label, overrides) => {
    expect(() => gradeServerOwnedSubmission(
      makePilotActivity(overrides),
      makePilotEnvelope(),
    )).toThrow(/canonical server grading data/i);
  });

  it('grades an ineligible exact pilot without a mastery contract', () => {
    const result = gradeServerOwnedSubmission(PILOT_ACTIVITY, makePilotEnvelope());

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('marks an eligible exact pilot as mastery-bearing', () => {
    const result = gradeServerOwnedSubmission(
      makePilotActivity({ srsEligible: true }),
      makePilotEnvelope(),
    );

    expect(result.masteryContractVersion).toBe('learning-evidence.v1');
  });

  it.each([
    ['same-suffix lookalike', makePilotActivity({ stableActivityId: `${IM3_PILOT_NODE}.lookalike` })],
    ['wrong node', makePilotActivity({ masteryNodeId: `${IM3_PILOT_NODE}.lookalike` })],
    ['wrong component', makePilotActivity({ componentKey: 'step-by-step-solver' })],
  ])('does not mark %s as mastery-bearing', (_label, activity) => {
    const result = gradeServerOwnedSubmission(activity, makePilotEnvelope());
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not mark the exact pilot in the wrong mode as mastery-bearing', () => {
    const envelope = practiceSubmissionEnvelopeSchema.parse({
      ...makePilotEnvelope(),
      mode: 'assessment',
    });
    const result = gradeServerOwnedSubmission(PILOT_ACTIVITY, envelope);
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades the exact Guided pilot from its seeded two-part contract', () => {
    const result = gradeServerOwnedSubmission(
      GUIDED_ACTIVITY,
      makePilotEnvelope(GUIDED_POINTS, [...GUIDED_POINTS].reverse(), undefined, 'guided_practice'),
    );

    expect(result).toMatchObject({ score: 2, maxScore: 2 });
    expect(result.submissionData).toMatchObject({
      activityId: GUIDED_ACTIVITY.id,
      mode: 'guided_practice',
      status: 'graded',
      parts: [
        { partId: 'table_values', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    expect(result.masteryContractVersion).toBe('learning-evidence.v1');
  });

  it('gives partial credit for the exact Guided pilot', () => {
    const wrongTable = GUIDED_POINTS.map((point, index) => (
      index === 0 ? { ...point, y: point.y + 1 } : point
    ));
    const result = gradeServerOwnedSubmission(
      GUIDED_ACTIVITY,
      makePilotEnvelope(wrongTable, GUIDED_POINTS, undefined, 'guided_practice'),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      expect.objectContaining({ partId: 'table_values', isCorrect: false, score: 0, maxScore: 1 }),
      expect.objectContaining({ partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 }),
    ]);
  });

  it('does not treat a lookalike Guided identity as the canonical pilot', () => {
    const result = gradeServerOwnedSubmission(
      { ...GUIDED_ACTIVITY, stableActivityId: `${IM3_GUIDED_PRACTICE_ACTIVITY_ID}.lookalike` },
      makePilotEnvelope(GUIDED_POINTS, GUIDED_POINTS, undefined, 'guided_practice'),
    );

    expect(result.score).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not grade the exact Guided identity in Independent mode', () => {
    const result = gradeServerOwnedSubmission(
      GUIDED_ACTIVITY,
      makePilotEnvelope(GUIDED_POINTS, GUIDED_POINTS),
    );

    expect(result.score).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades the exact graph Independent seed-2 activity from its stored equation', () => {
    expect(GRAPH_INDEPENDENT_SEED_2_ACTIVITY.props).toMatchObject({
      equation: 'y = x^2 - x + 2',
      variant: 'plot_from_equation',
      responseVariant: 'table_graph',
    });
    expect(GRAPH_INDEPENDENT_SEED_2_POINTS).toEqual([
      { x: -2, y: 8 },
      { x: -1, y: 4 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
    ]);

    const result = gradeServerOwnedSubmission(
      GRAPH_INDEPENDENT_SEED_2_ACTIVITY,
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: GRAPH_INDEPENDENT_SEED_2_ACTIVITY.id,
        mode: 'independent_practice',
        status: 'graded',
        parts: [
          { partId: 'table_values', isCorrect: true, score: 1, maxScore: 1 },
          { partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 },
        ],
      },
    });
    expect(result.submissionData.answers).toEqual({
      tableValues: GRAPH_INDEPENDENT_SEED_2_POINTS,
      placedPoints: GRAPH_INDEPENDENT_SEED_2_POINTS,
    });
  });

  it('gives partial credit for the exact graph Independent seed-2 activity', () => {
    const wrongTable = GRAPH_INDEPENDENT_SEED_2_POINTS.map((point, index) => (
      index === 0 ? { ...point, y: point.y + 1 } : point
    ));
    const result = gradeServerOwnedSubmission(
      GRAPH_INDEPENDENT_SEED_2_ACTIVITY,
      makePilotEnvelope(wrongTable, GRAPH_INDEPENDENT_SEED_2_POINTS),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      expect.objectContaining({ partId: 'table_values', isCorrect: false, score: 0, maxScore: 1 }),
      expect.objectContaining({ partId: 'placed_points', isCorrect: true, score: 1, maxScore: 1 }),
    ]);
  });

  const graphIndependentSeed2Guards: Array<[
    string,
    PilotActivity,
    PracticeSubmissionEnvelope,
  ]> = [
    [
      'lookalike stable ID',
      { ...GRAPH_INDEPENDENT_SEED_2_ACTIVITY, stableActivityId: `${IM3_GRAPH_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike` },
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
    ],
    [
      'wrong node',
      { ...GRAPH_INDEPENDENT_SEED_2_ACTIVITY, masteryNodeId: `${IM3_PILOT_NODE}.lookalike` },
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
    ],
    [
      'wrong component',
      { ...GRAPH_INDEPENDENT_SEED_2_ACTIVITY, componentKey: 'fill-in-the-blank' },
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
    ],
    [
      'false eligibility',
      { ...GRAPH_INDEPENDENT_SEED_2_ACTIVITY, srsEligible: false },
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
    ],
    [
      'wrong mode',
      GRAPH_INDEPENDENT_SEED_2_ACTIVITY,
      makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS, undefined, 'guided_practice'),
    ],
    [
      'draft status',
      GRAPH_INDEPENDENT_SEED_2_ACTIVITY,
      practiceSubmissionEnvelopeSchema.parse({
        ...makePilotEnvelope(GRAPH_INDEPENDENT_SEED_2_POINTS, GRAPH_INDEPENDENT_SEED_2_POINTS),
        status: 'draft',
      }),
    ],
  ];

  it.each(graphIndependentSeed2Guards)('keeps graph Independent seed-2 %s on the ordinary ungraded path', (_label, activity, envelope) => {
    const result = gradeServerOwnedSubmission(activity, envelope);
    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it('grades the seed-1 equation-rate Guided activity from server-owned props', () => {
    expect(EQUATION_GUIDED_ACTIVITY.props).toEqual({
      sourceType: 'function',
      data: { expression: 'f(x) = x^2 - 3x - 4' },
      interval: { start: -4, end: -1 },
    });
    expect(EQUATION_GUIDED_OUTPUT.expectedAnswer).toEqual({ f_a: 24, f_b: 0, rate: -8 });

    const result = gradeServerOwnedSubmission(
      EQUATION_GUIDED_ACTIVITY,
      makeEquationEnvelope({ f_a: 24, f_b: 0, rate: -8 }, 'guided_practice'),
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(result.submissionData).toMatchObject({ status: 'graded', mode: 'guided_practice' });
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.parts).toEqual([
      { partId: 'f_a', rawAnswer: 24, isCorrect: true, score: 2, maxScore: 2 },
      { partId: 'f_b', rawAnswer: 0, isCorrect: true, score: 2, maxScore: 2 },
      { partId: 'rate', rawAnswer: -8, isCorrect: true, score: 3, maxScore: 3 },
    ]);
  });

  it('grades the seed-2 equation-rate Independent activity from server-owned props', () => {
    expect(EQUATION_INDEPENDENT_ACTIVITY.props).toEqual({
      sourceType: 'function',
      data: { expression: 'f(x) = -2x^2 + 2x - 2' },
      interval: { start: 0, end: 4 },
    });
    expect(EQUATION_INDEPENDENT_OUTPUT.expectedAnswer).toEqual({ f_a: -2, f_b: -26, rate: -6 });

    const result = gradeServerOwnedSubmission(
      EQUATION_INDEPENDENT_ACTIVITY,
      makeEquationEnvelope({ f_a: -2, f_b: -26, rate: -6 }, 'independent_practice'),
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(result.submissionData).toMatchObject({ status: 'graded', mode: 'independent_practice' });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['Guided', EQUATION_GUIDED_ACTIVITY, makeEquationEnvelope({ f_a: 24, f_b: 0, rate: -8 }, 'guided_practice')],
    ['Independent', EQUATION_INDEPENDENT_ACTIVITY, makeEquationEnvelope({ f_a: -2, f_b: -26, rate: -6 }, 'independent_practice')],
  ])('marks eligible exact equation-rate %s grading as mastery-bearing', (_label, activity, envelope) => {
    const result = gradeServerOwnedSubmission(
      { ...activity, srsEligible: true },
      envelope,
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(result.masteryContractVersion).toBe('learning-evidence.v1');
  });

  it('applies the equation-rate rubric points to mixed responses', () => {
    const result = gradeServerOwnedSubmission(
      EQUATION_GUIDED_ACTIVITY,
      makeEquationEnvelope({ f_a: 999, f_b: 0, rate: -8 }, 'guided_practice'),
    );

    expect(result).toMatchObject({ score: 5, maxScore: 7 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'f_a', rawAnswer: 999, isCorrect: false, score: 0, maxScore: 2 },
      { partId: 'f_b', rawAnswer: 0, isCorrect: true, score: 2, maxScore: 2 },
      { partId: 'rate', rawAnswer: -8, isCorrect: true, score: 3, maxScore: 3 },
    ]);
  });

  it('accepts the numeric tolerance boundary for equation-rate answers', () => {
    const result = gradeServerOwnedSubmission(
      EQUATION_GUIDED_ACTIVITY,
      makeEquationEnvelope({ f_a: 24.01, f_b: 0.01, rate: -7.99 }, 'guided_practice'),
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
  });

  it.each([
    ['source type', { props: { sourceType: 'table' } }],
    ['function data', { props: { data: { expression: '' } } }],
    ['interval', { props: { interval: { start: -4, end: -4 } } }],
    ['rubric part IDs', {
      gradingConfig: {
        partIds: ['f_a', 'f_b', 'extra'],
        rubric: [
          { partId: 'f_a', points: 2 },
          { partId: 'f_b', points: 2 },
          { partId: 'extra', points: 3 },
        ],
      },
    }],
    ['rubric points', {
      gradingConfig: {
        partIds: ['f_a', 'f_b', 'rate'],
        rubric: [
          { partId: 'f_a', points: 1 },
          { partId: 'f_b', points: 2 },
          { partId: 'rate', points: 3 },
        ],
      },
    }],
  ])('fails closed for malformed equation-rate %s data', (_label, overrides) => {
    const activity = {
      ...EQUATION_GUIDED_ACTIVITY,
      ...overrides,
      props: {
        ...EQUATION_GUIDED_ACTIVITY.props,
        ...('props' in overrides ? overrides.props : {}),
      },
    };
    const result = gradeServerOwnedSubmission(
      activity,
      makeEquationEnvelope({ f_a: 24, f_b: 0, rate: -8 }, 'guided_practice'),
    );

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it('grades equation-rate responses without client answer or grading fields in props', () => {
    const result = gradeServerOwnedSubmission(
      EQUATION_INDEPENDENT_ACTIVITY,
      makeEquationEnvelope({ f_a: -2, f_b: -26, rate: -6 }, 'independent_practice'),
    );

    expect(EQUATION_INDEPENDENT_ACTIVITY.props).toEqual({
      sourceType: 'function',
      data: { expression: 'f(x) = -2x^2 + 2x - 2' },
      interval: { start: 0, end: 4 },
    });
    expect(result.score).toBe(7);
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    [
      'Guided',
      DOMAIN_RANGE_GUIDED_ACTIVITY,
      'guided_practice' as const,
      'y = x^2 - x - 2',
      { relation: 'gte', boundary: -2.25 },
    ],
    [
      'Independent',
      DOMAIN_RANGE_INDEPENDENT_ACTIVITY,
      'independent_practice' as const,
      'y = -x^2 - 1',
      { relation: 'lte', boundary: -1 },
    ],
  ])('grades the seed-backed domain-and-range %s activity from server-owned props', (
    _label,
    activity,
    mode,
    equation,
    range,
  ) => {
    expect(activity.props).toMatchObject({
      equation,
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
    });
    const result = gradeServerOwnedSubmission(
      activity,
      makeDomainRangeEnvelope(mode, { domain: 'all_real_numbers', range }),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: activity.id,
        mode,
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: range, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('grades the exact eligible domain-range Guided seed-2 activity with a mastery contract', () => {
    expect(DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY.props).toMatchObject({
      equation: 'y = -x^2 + x - 1',
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
    });
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY,
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: -0.75 },
      }),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY.id,
        mode: 'guided_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'lte', boundary: -0.75 }, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('grades one point when domain-range Guided seed-2 has the wrong boundary', () => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY,
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: -1 },
      }),
    );

    expect(result).toMatchObject({
      score: 1,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: { activityId: DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY.id, status: 'graded' },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'lte', boundary: -1 }, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it('grades the exact eligible domain-range Independent seed-2 activity with a mastery contract', () => {
    expect(DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY.stableActivityId)
      .toBe(IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID);
    expect(DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY.props).toMatchObject({
      equation: 'y = x^2 - x + 2',
      variant: 'plot_from_equation',
      responseVariant: 'domain_range',
    });
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY,
      makeDomainRangeEnvelope('independent_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: 1.75 },
      }),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY.id,
        mode: 'independent_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'gte', boundary: 1.75 }, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('grades one point when domain-range Independent seed-2 has the wrong boundary', () => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY,
      makeDomainRangeEnvelope('independent_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: 2 },
      }),
    );

    expect(result).toMatchObject({
      score: 1,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: { activityId: DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY.id, status: 'graded' },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'gte', boundary: 2 }, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  const domainRangeIndependentSeed2GuardFixtures = [
    ['stable-ID lookalike', { stableActivityId: `${IM3_DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY_ID}.lookalike` }, {}],
    ['wrong node', { masteryNodeId: `${DOMAIN_RANGE_NODE}.lookalike` }, {}],
    ['wrong component', { componentKey: 'rate-of-change-calculator' }, {}],
    ['srsEligible false', { srsEligible: false }, {}],
    ['Guided mode', {}, { mode: 'guided_practice' }],
    ['draft status', {}, { status: 'draft' }],
  ] as const;

  it.each(domainRangeIndependentSeed2GuardFixtures)(
    'fails closed for domain-range Independent seed-2 %s',
    (_label, activityOverrides, envelopeOverrides) => {
      const mode = 'mode' in envelopeOverrides ? envelopeOverrides.mode : 'independent_practice' as const;
      const activity = { ...DOMAIN_RANGE_INDEPENDENT_SEED_2_ACTIVITY, ...activityOverrides };
      const envelope: PracticeSubmissionEnvelope = {
        ...makeDomainRangeEnvelope(mode, {
          domain: 'all_real_numbers',
          range: { relation: 'gte', boundary: 1.75 },
        }),
        ...envelopeOverrides,
      };
      const result = gradeServerOwnedSubmission(activity, envelope);

      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      expect(result.submissionData.status).toBe('submitted');
      expect(result.submissionData.parts).toEqual([
        { partId: 'domain', rawAnswer: 'all_real_numbers' },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: 1.75 } },
      ]);
    },
  );

  const domainRangeGuidedSeed2GuardFixtures = [
    ['stable-ID lookalike', { stableActivityId: `${IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` }, {}],
    ['wrong node', { masteryNodeId: `${DOMAIN_RANGE_NODE}.lookalike` }, {}],
    ['wrong component', { componentKey: 'rate-of-change-calculator' }, {}],
    ['srsEligible false', { srsEligible: false }, {}],
    ['Independent mode', {}, { mode: 'independent_practice' }],
    ['non-submitted status', {}, { status: 'draft' }],
  ] as const;

  it.each(domainRangeGuidedSeed2GuardFixtures)(
    'fails closed for domain-range Guided seed-2 %s',
    (_label, activityOverrides, envelopeOverrides) => {
      const mode = 'mode' in envelopeOverrides ? envelopeOverrides.mode : 'guided_practice' as const;
      const activity = { ...DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY, ...activityOverrides };
      const envelope: PracticeSubmissionEnvelope = {
        ...makeDomainRangeEnvelope(mode, {
          domain: 'all_real_numbers',
          range: { relation: 'lte', boundary: -0.75 },
        }),
        ...envelopeOverrides,
      };
      const result = gradeServerOwnedSubmission(activity, envelope);

      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      expect(result.submissionData.status).toBe('submitted');
      expect(result.submissionData.parts).toEqual([
        { partId: 'domain', rawAnswer: 'all_real_numbers' },
        { partId: 'range', rawAnswer: { relation: 'lte', boundary: -0.75 } },
      ]);
    },
  );

  it.each([
    ['Guided', MAXIMUM_READING_GUIDED_ACTIVITY, 'guided_practice' as const, -1, 'y = -x^2 - 1'],
    ['Independent', MAXIMUM_READING_INDEPENDENT_ACTIVITY, 'independent_practice' as const, 2, 'y = -x^2 + 2'],
  ])('grades exact maximum-reading %s responses from server-owned props', (
    _label,
    activity,
    mode,
    maximum,
    equation,
  ) => {
    expect(activity.props).toMatchObject({
      equation,
      variant: 'plot_from_equation',
      responseVariant: 'maximum_value',
    });
    expect(activity.stableActivityId).toBe(
      mode === 'guided_practice'
        ? IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID
        : IM3_MAXIMUM_READING_INDEPENDENT_ACTIVITY_ID,
    );
    expect(activity.masteryNodeId).toBe(IM3_MAXIMUM_READING_NODE);
    expect(activity.props).not.toHaveProperty('expectedAnswer');
    const result = gradeServerOwnedSubmission(
      activity,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode,
        answers: { maximum_value: maximum },
        parts: [{
          partId: 'maximum_value',
          rawAnswer: maximum,
          isCorrect: false,
          score: 99,
          maxScore: 99,
        }],
        analytics: { isCorrect: false, score: 0, maxScore: 0 },
      }),
    );

    expect(result).toMatchObject({
      score: 1,
      maxScore: 1,
      submissionData: {
        activityId: activity.id,
        mode,
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'maximum_value', rawAnswer: maximum, isCorrect: true, score: 1, maxScore: 1 },
    ]);
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades maximum-reading responses from the raw maximum_value part', () => {
    const result = gradeServerOwnedSubmission(
      MAXIMUM_READING_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'guided_practice',
        answers: { maximum_value: 999 },
        parts: [{
          partId: 'maximum_value',
          rawAnswer: -1,
          isCorrect: false,
          score: 0,
          maxScore: 0,
        }],
        analytics: { isCorrect: false, score: 999, maxScore: 999 },
      }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 1 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'maximum_value', rawAnswer: -1, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('grades an incorrect maximum-reading response', () => {
    const result = gradeServerOwnedSubmission(
      MAXIMUM_READING_INDEPENDENT_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'independent_practice',
        answers: { maximum_value: 0 },
        parts: [{ partId: 'maximum_value', rawAnswer: 0 }],
      }),
    );

    expect(result).toMatchObject({ score: 0, maxScore: 1 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'maximum_value', rawAnswer: 0, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it('grades a maximum-reading response at the tolerance boundary', () => {
    const result = gradeServerOwnedSubmission(
      MAXIMUM_READING_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'guided_practice',
        answers: { maximum_value: -1.001 },
        parts: [{ partId: 'maximum_value', rawAnswer: -1.001 }],
      }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 1 });
    expect(result.submissionData.parts[0]).toMatchObject({
      partId: 'maximum_value',
      isCorrect: true,
      score: 1,
      maxScore: 1,
    });
  });

  it('gives a missing maximum-reading response no credit', () => {
    const result = gradeServerOwnedSubmission(
      MAXIMUM_READING_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'guided_practice',
        answers: {},
        parts: [],
      }),
    );

    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(1);
    expect(result.submissionData.parts).toEqual([
      { partId: 'maximum_value', rawAnswer: null, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it('returns the maximum-reading mastery contract only for eligible activity', () => {
    const ineligibleResult = gradeServerOwnedSubmission(
      MAXIMUM_READING_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'guided_practice',
        answers: { maximum_value: -1 },
        parts: [{ partId: 'maximum_value', rawAnswer: -1 }],
      }),
    );
    const eligibleResult = gradeServerOwnedSubmission(
      { ...MAXIMUM_READING_GUIDED_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: 'guided_practice',
        answers: { maximum_value: -1 },
        parts: [{ partId: 'maximum_value', rawAnswer: -1 }],
      }),
    );

    expect(ineligibleResult.masteryContractVersion).toBeUndefined();
    expect(eligibleResult.masteryContractVersion).toBe('learning-evidence.v1');
  });

  it('keeps answer authority out of maximum-reading renderer props', () => {
    const forbiddenKeys = /answer|answers|correctAnswer|expectedAnswer|gradingRules|gradingMetadata|partAnswers|finalAnswer|solutionSteps|isCorrect|score|maxScore/;
    expect(JSON.stringify(MAXIMUM_READING_GUIDED_ACTIVITY.props)).not.toMatch(forbiddenKeys);
    expect(JSON.stringify(MAXIMUM_READING_INDEPENDENT_ACTIVITY.props)).not.toMatch(forbiddenKeys);
  });

  const maximumReadingGraderGuards: ReadonlyArray<readonly [
    string,
    Partial<PilotActivity>,
    Partial<PracticeSubmissionEnvelope>,
  ]> = [
    ['lookalike stable ID', { stableActivityId: IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID + '.lookalike' }, {}],
    ['wrong node', { masteryNodeId: IM3_MAXIMUM_READING_NODE + '.lookalike' }, {}],
    ['wrong component', { componentKey: 'fill-in-the-blank' }, {}],
    ['wrong mode', {}, { mode: 'independent_practice' }],
    ['draft status', {}, { status: 'draft' as never }],
    ['wrong variant', { props: { variant: 'quadratic_features' } }, {}],
    ['wrong response variant', { props: { responseVariant: 'domain_range' } }, {}],
    ['malformed equation', { props: { equation: 'y = x + 2' } }, {}],
    ['upward quadratic', { props: { equation: 'y = x^2 + 2' } }, {}],
    ['wrong rubric part ID', {
      gradingConfig: { partIds: ['other'], rubric: [{ partId: 'other', points: 1 }] },
    }, {}],
    ['wrong rubric points', {
      gradingConfig: { partIds: ['maximum_value'], rubric: [{ partId: 'maximum_value', points: 2 }] },
    }, {}],
  ];

  it.each(maximumReadingGraderGuards)(
    'fails closed for maximum-reading %s',
    (_label, activityOverrides, envelopeOverrides) => {
      const activity = {
        ...MAXIMUM_READING_GUIDED_ACTIVITY,
        ...activityOverrides,
        props: {
          ...MAXIMUM_READING_GUIDED_ACTIVITY.props,
          ...('props' in activityOverrides ? activityOverrides.props : {}),
        },
      };
      const envelope = buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-maximum-reading-activity-id',
        mode: envelopeOverrides.mode ?? 'guided_practice',
        status: envelopeOverrides.status ?? 'submitted',
        answers: { maximum_value: -1 },
        parts: [{ partId: 'maximum_value', rawAnswer: -1 }],
      });
      const result = gradeServerOwnedSubmission(activity, envelope);

      expect(result.score).toBeUndefined();
      expect(result.maxScore).toBeUndefined();
      expect(result.masteryContractVersion).toBeUndefined();
      expect(result.submissionData.status).toBe('submitted');
      expect(result.submissionData.parts).toEqual([
        { partId: 'maximum_value', rawAnswer: -1 },
      ]);
    },
  );

  it('applies one point to a mixed domain-and-range response', () => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_ACTIVITY,
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -2 },
      }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'all_real_numbers', isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'gte', boundary: -2 }, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it.each([
    ['wrong relation', { relation: 'lte', boundary: -2.25 }],
    ['wrong boundary', { relation: 'gte', boundary: -2 }],
  ])('rejects a domain-and-range response with %s', (_label, range) => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_ACTIVITY,
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range,
      }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts[1]).toMatchObject({
      partId: 'range',
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
  });

  it('grades raw domain-and-range parts instead of forged client answers or scores', () => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_ACTIVITY,
      makeDomainRangeEnvelope(
        'guided_practice',
        { domain: 'wrong', range: { relation: 'lte', boundary: 999 } },
        { domain: 'all_real_numbers', range: { relation: 'gte', boundary: -2.25 } },
      ),
    );

    expect(result).toMatchObject({ score: 0, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'domain', rawAnswer: 'wrong', isCorrect: false, score: 0, maxScore: 1 },
      { partId: 'range', rawAnswer: { relation: 'lte', boundary: 999 }, isCorrect: false, score: 0, maxScore: 1 },
    ]);
  });

  it.each([
    ['wrong stable ID', { stableActivityId: `${DOMAIN_RANGE_NODE}.guided_practice.lookalike` }],
    ['wrong node', { masteryNodeId: `${DOMAIN_RANGE_NODE}.lookalike` }],
    ['wrong component', { componentKey: 'rate-of-change-calculator' }],
    ['wrong response variant', { props: { responseVariant: 'table_graph' } }],
    ['wrong renderer variant', { props: { variant: 'quadratic_features' } }],
    ['malformed equation', { props: { equation: 'y = x + 2' } }],
    ['malformed rubric IDs', {
      gradingConfig: {
        partIds: ['domain', 'other'],
        rubric: [
          { partId: 'domain', points: 1 },
          { partId: 'other', points: 1 },
        ],
      },
    }],
    ['malformed rubric points', {
      gradingConfig: {
        partIds: ['domain', 'range'],
        rubric: [
          { partId: 'domain', points: 2 },
          { partId: 'range', points: 1 },
        ],
      },
    }],
    ['wrong mode', { mode: 'independent_practice' as const }],
  ])('fails closed for malformed domain-and-range %s data', (_label, overrides) => {
    const activity = {
      ...DOMAIN_RANGE_GUIDED_ACTIVITY,
      ...overrides,
      props: {
        ...DOMAIN_RANGE_GUIDED_ACTIVITY.props,
        ...('props' in overrides ? overrides.props : {}),
      },
    };
    const mode = 'mode' in overrides ? overrides.mode : 'guided_practice' as const;
    const result = gradeServerOwnedSubmission(
      activity,
      makeDomainRangeEnvelope(mode, {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -2.25 },
      }),
    );

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it.each([
    ['missing boundary', { relation: 'gte' }],
    ['extra range key', { relation: 'gte', boundary: -2.25, extra: true }],
    ['non-finite boundary', { relation: 'gte', boundary: Infinity }],
  ])('fails closed for malformed domain-and-range raw %s data', (_label, range) => {
    const result = gradeServerOwnedSubmission(
      DOMAIN_RANGE_GUIDED_ACTIVITY,
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range,
      }),
    );

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it('keeps answer authority out of domain-and-range renderer props', () => {
    const forbiddenKeys = /answer|answers|gradingRules|gradingMetadata|partAnswers|solutionSteps|correctAnswer|expectedAnswer|finalAnswer|isCorrect|score|maxScore/;
    expect(JSON.stringify(DOMAIN_RANGE_GUIDED_ACTIVITY.props)).not.toMatch(forbiddenKeys);
    expect(JSON.stringify(DOMAIN_RANGE_INDEPENDENT_ACTIVITY.props)).not.toMatch(forbiddenKeys);
  });

  it('does not special-case an unrelated graphing domain-and-range activity', () => {
    const result = gradeServerOwnedSubmission(
      {
        ...DOMAIN_RANGE_GUIDED_ACTIVITY,
        id: 'server-owned-unrelated-domain-range-activity-document',
        stableActivityId: 'math.im3.skill.unrelated.guided_practice',
        masteryNodeId: 'math.im3.skill.unrelated',
      },
      makeDomainRangeEnvelope('guided_practice', {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -2.25 },
      }),
    );

    expect(result.score).toBeUndefined();
    expect(result.maxScore).toBeUndefined();
    expect(result.masteryContractVersion).toBeUndefined();
    expect(result.submissionData.status).toBe('submitted');
  });

  it('grades the seeded profit-model answers from trusted blanks, not forged client fields', () => {
    const profitModelNode = 'math.im3.skill.1.1.build-and-simplify-a-quadratic-profit-model-from-context';
    const stableActivityId = `${profitModelNode}.independent_practice`;
    const storedActivity = {
      id: 'activities:profit-model-independent',
      ...buildIm3ProfitModelIndependentSeedDocuments(
        'activities:profit-model-independent' as never,
        123,
      ).activity,
    };
    const blanks = storedActivity.props.blanks;
    const answers = Object.fromEntries(blanks.map((blank) => [
      blank.id,
      { answer: blank.correctAnswer, isCorrect: false, usedWordBank: true },
    ]));
    const forgedParts = blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: false,
      score: 0,
      maxScore: 0,
    }));
    const makeEnvelope = (nextAnswers: Record<string, unknown>) => buildPracticeSubmissionEnvelope({
      activityId: 'client-supplied-profit-model-id',
      mode: 'independent_practice',
      answers: nextAnswers,
      parts: forgedParts,
      analytics: { isCorrect: false, score: 0, maxScore: 0 },
    });

    expect(storedActivity).toMatchObject({
      stableActivityId,
      masteryNodeId: profitModelNode,
    });
    const correctResult = gradeServerOwnedSubmission(storedActivity, makeEnvelope(answers));

    expect(correctResult).toMatchObject({ score: 7, maxScore: 7 });
    expect(correctResult.submissionData.parts).toEqual(blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));

    const firstBlank = blanks[0];
    if (!firstBlank) throw new Error('Expected the profit-model activity to have blanks');
    const changedAnswers = {
      ...answers,
      [firstBlank.id]: { answer: '__wrong-answer__', isCorrect: false, usedWordBank: true },
    };
    const partialResult = gradeServerOwnedSubmission(storedActivity, makeEnvelope(changedAnswers));

    expect(partialResult).toMatchObject({ score: 6, maxScore: 7 });
    expect(partialResult.submissionData.parts[0]).toMatchObject({
      partId: firstBlank.id,
      rawAnswer: '__wrong-answer__',
      isCorrect: false,
      score: 0,
      maxScore: 1,
    });
  });

  it('grades the exact eligible profit-model Guided activity with a mastery contract', () => {
    const blanks = PROFIT_MODEL_GUIDED_BLANKS;
    const answers = Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer]));
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_GUIDED_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-guided-id',
        mode: 'guided_practice',
        answers,
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
        analytics: { isCorrect: false, score: 0, maxScore: 0 },
      }),
    );

    expect(result).toMatchObject({
      score: 7,
      maxScore: 7,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: PROFIT_MODEL_GUIDED_ACTIVITY.id,
        mode: 'guided_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual(blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));
  });

  it('grades the exact eligible profit-model Independent seed-2 activity with a mastery contract', () => {
    const blanks = PROFIT_MODEL_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_INDEPENDENT_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
        analytics: { isCorrect: false, score: 0, maxScore: 0 },
      }),
    );

    expect(result).toMatchObject({
      score: 7,
      maxScore: 7,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: PROFIT_MODEL_INDEPENDENT_ACTIVITY.id,
        mode: 'independent_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual(blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));
  });

  it('grades the exact ineligible profit-model Independent seed-2 activity without a mastery contract', () => {
    const blanks = PROFIT_MODEL_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      PROFIT_MODEL_INDEPENDENT_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['lookalike stable ID', { stableActivityId: `${IM3_PROFIT_MODEL_INDEPENDENT_ACTIVITY_ID}.lookalike` }],
    ['wrong node', { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike` }],
    ['wrong component', { componentKey: 'graphing-explorer' }],
  ])('does not mark profit-model Independent %s as mastery-bearing', (_label, overrides) => {
    const blanks = PROFIT_MODEL_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_INDEPENDENT_ACTIVITY, ...overrides, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not mark the exact profit-model Independent activity in the wrong mode as mastery-bearing', () => {
    const blanks = PROFIT_MODEL_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_INDEPENDENT_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-independent-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades the exact ineligible profit-model Guided activity without a mastery contract', () => {
    const blanks = PROFIT_MODEL_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      PROFIT_MODEL_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-guided-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 7, maxScore: 7 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['lookalike stable ID', { stableActivityId: `${IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID}.lookalike` }],
    ['wrong node', { masteryNodeId: `${IM3_PROFIT_MODEL_NODE}.lookalike` }],
    ['wrong component', { componentKey: 'graphing-explorer' }],
  ])('does not mark profit-model Guided %s as mastery-bearing', (_label, overrides) => {
    const blanks = PROFIT_MODEL_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_GUIDED_ACTIVITY, ...overrides, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-guided-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not mark the exact profit-model Guided activity in the wrong mode as mastery-bearing', () => {
    const blanks = PROFIT_MODEL_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MODEL_GUIDED_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-model-guided-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades the exact eligible graph Guided seed-2 activity with a mastery contract', () => {
    const result = gradeServerOwnedSubmission(
      { ...GRAPH_GUIDED_SEED_2_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-graph-guided-seed-2-id',
        mode: 'guided_practice',
        answers: { tableValues: GRAPH_GUIDED_SEED_2_POINTS, placedPoints: GRAPH_GUIDED_SEED_2_POINTS },
        parts: [
          { partId: 'table_values', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
          { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
        ],
      }),
    );

    expect(result).toMatchObject({
      score: 2,
      maxScore: 2,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: GRAPH_GUIDED_SEED_2_ACTIVITY.id,
        mode: 'guided_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
      { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  it('grades incorrect graph Guided seed-2 parts from the stored equation', () => {
    const incorrectTableValues = GRAPH_GUIDED_SEED_2_POINTS.map((point, index) => (
      index === 0 ? { ...point, y: point.y + 1 } : point
    ));
    const result = gradeServerOwnedSubmission(
      { ...GRAPH_GUIDED_SEED_2_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-graph-guided-seed-2-id',
        mode: 'guided_practice',
        answers: { tableValues: incorrectTableValues, placedPoints: GRAPH_GUIDED_SEED_2_POINTS },
        parts: [
          { partId: 'table_values', rawAnswer: incorrectTableValues },
          { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
        ],
      }),
    );

    expect(result).toMatchObject({ score: 1, maxScore: 2 });
    expect(result.submissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: incorrectTableValues, isCorrect: false, score: 0, maxScore: 1 },
      { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS, isCorrect: true, score: 1, maxScore: 1 },
    ]);
  });

  const graphGuidedSeed2GraderGuards: ReadonlyArray<readonly [
    string,
    Partial<PilotActivity>,
    Partial<PracticeSubmissionEnvelope>,
  ]> = [
    ['lookalike stable ID', { stableActivityId: `${IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID}.lookalike` }, {}],
    ['wrong node', { masteryNodeId: `${IM3_PILOT_NODE}.lookalike` }, {}],
    ['wrong component', { componentKey: 'fill-in-the-blank' }, {}],
    ['srsEligible false', { srsEligible: false }, {}],
    ['wrong mode', {}, { mode: 'independent_practice' }],
    ['wrong status', {}, { status: 'draft' }],
  ];

  it.each(graphGuidedSeed2GraderGuards)(
    'does not mark graph Guided seed-2 %s as mastery-bearing', (_label, activityOverrides, envelopeOverrides) => {
      const result = gradeServerOwnedSubmission(
        { ...GRAPH_GUIDED_SEED_2_ACTIVITY, srsEligible: true, ...activityOverrides },
        buildPracticeSubmissionEnvelope({
          activityId: 'client-supplied-graph-guided-seed-2-id',
          mode: envelopeOverrides.mode ?? 'guided_practice',
          status: envelopeOverrides.status ?? 'submitted',
          answers: { tableValues: GRAPH_GUIDED_SEED_2_POINTS, placedPoints: GRAPH_GUIDED_SEED_2_POINTS },
          parts: [
            { partId: 'table_values', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
            { partId: 'placed_points', rawAnswer: GRAPH_GUIDED_SEED_2_POINTS },
          ],
        }),
      );

      expect(result.masteryContractVersion).toBeUndefined();
    },
  );

  it('grades the exact eligible maximum-profit Guided activity with a mastery contract', () => {
    const blanks = PROFIT_MAXIMUM_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_GUIDED_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-guided-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: PROFIT_MAXIMUM_GUIDED_ACTIVITY.id,
        mode: 'guided_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual(blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));
  });

  it('grades the ineligible maximum-profit Guided activity without a mastery contract', () => {
    const blanks = PROFIT_MAXIMUM_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      PROFIT_MAXIMUM_GUIDED_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-guided-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['lookalike stable ID', { stableActivityId: `${IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID}.lookalike` }],
    ['wrong node', { masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike` }],
    ['wrong component', { componentKey: 'graphing-explorer' }],
  ])('does not mark maximum-profit Guided %s as mastery-bearing', (_label, overrides) => {
    const blanks = PROFIT_MAXIMUM_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_GUIDED_ACTIVITY, ...overrides, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-guided-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not mark the exact maximum-profit Guided activity in the wrong mode as mastery-bearing', () => {
    const blanks = PROFIT_MAXIMUM_GUIDED_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_GUIDED_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-guided-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('grades the exact eligible maximum-profit Independent activity with a mastery contract', () => {
    const blanks = PROFIT_MAXIMUM_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
      submissionData: {
        activityId: PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY.id,
        mode: 'independent_practice',
        status: 'graded',
      },
    });
    expect(result.submissionData.parts).toEqual(blanks.map((blank) => ({
      partId: blank.id,
      rawAnswer: blank.correctAnswer,
      isCorrect: true,
      score: 1,
      maxScore: 1,
    })));
  });

  it('grades the ineligible maximum-profit Independent activity without a mastery contract', () => {
    const blanks = PROFIT_MAXIMUM_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY,
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(result.masteryContractVersion).toBeUndefined();
  });

  it.each([
    ['lookalike stable ID', { stableActivityId: `${IM3_PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY_ID}.lookalike` }],
    ['wrong node', { masteryNodeId: `${IM3_PROFIT_MAXIMUM_NODE}.lookalike` }],
    ['wrong component', { componentKey: 'graphing-explorer' }],
  ])('does not mark maximum-profit Independent %s as mastery-bearing', (_label, overrides) => {
    const blanks = PROFIT_MAXIMUM_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY, ...overrides, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-independent-id',
        mode: 'independent_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result.masteryContractVersion).toBeUndefined();
  });

  it('does not mark the exact maximum-profit Independent activity in the wrong mode as mastery-bearing', () => {
    const blanks = PROFIT_MAXIMUM_INDEPENDENT_BLANKS;
    const result = gradeServerOwnedSubmission(
      { ...PROFIT_MAXIMUM_INDEPENDENT_ACTIVITY, srsEligible: true },
      buildPracticeSubmissionEnvelope({
        activityId: 'client-supplied-profit-maximum-independent-id',
        mode: 'guided_practice',
        answers: Object.fromEntries(blanks.map((blank) => [blank.id, blank.correctAnswer])),
        parts: blanks.map((blank) => ({ partId: blank.id, rawAnswer: blank.correctAnswer })),
      }),
    );

    expect(result).toMatchObject({ score: 3, maxScore: 3 });
    expect(result.masteryContractVersion).toBeUndefined();
  });
});
