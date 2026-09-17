import { describe, expect, it } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { MutationCtx } from '@/convex/_generated/server';
import { createServerOwnedSubmission } from '@/convex/activities';
import {
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const LEARNER_ID = 'profiles:two-real-solutions-acceptance-learner';
const ACTIVITY_ID = 'activities:two-real-solutions-acceptance-guided';

type SubmissionData = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: 'guided_practice' | 'independent_practice';
  status: 'submitted' | 'draft';
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, unknown>;
  parts: Array<{
    partId: string;
    rawAnswer: unknown;
    isCorrect?: boolean;
    score?: number;
    maxScore?: number;
  }>;
  artifact: {
    graphState: {
      originalEquation: string;
      equation: string;
      tableValues: Array<{ x: number; y: number }>;
      placedPoints: Array<{ x: number; y: number }>;
      domain: [number, number];
      range: [number, number];
    };
  };
};

type ServerOwnedSubmissionHandler = (
  ctx: MutationCtx,
  args: {
    userId: string;
    activityId: string;
    idempotencyKey: string;
    submissionData: SubmissionData;
  },
) => Promise<{ id: string; submissionId: string; score: number; maxScore: number }>;

const createHandler = (createServerOwnedSubmission as unknown as {
  _handler: ServerOwnedSubmissionHandler;
})._handler;

const generated = getGenerator('two-real-solutions-graphing').generate({
  nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
  seed: 0,
  difficulty: 0.5,
});
const rendererProps = generated.data.rendererProps as {
  originalEquation: string;
  equation: string;
  domain: [number, number];
  range: [number, number];
};
const tableValues = generated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
const placedPoints = generated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
const solutions = generated.expectedAnswer.solutions as number[];
const independentGenerated = getGenerator('two-real-solutions-graphing').generate({
  nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
  seed: 2,
  difficulty: 0.5,
});
const independentRendererProps = independentGenerated.data.rendererProps as typeof rendererProps;
const independentTableValues = independentGenerated.expectedAnswer.table_values as Array<{ x: number; y: number }>;
const independentPlacedPoints = independentGenerated.expectedAnswer.placed_points as Array<{ x: number; y: number }>;
const independentSolutions = independentGenerated.expectedAnswer.solutions as number[];

type ActivityOverrides = {
  stableActivityId?: string;
  masteryNodeId?: string;
  componentKey?: string;
  srsEligible?: boolean;
  props?: typeof rendererProps;
};

type RejectionCase = {
  name: string;
  activityOverrides?: ActivityOverrides;
  submissionOverrides?: Partial<Pick<SubmissionData, 'mode' | 'status' | 'parts'>>;
  expectedError: string | RegExp;
};

type CanonicalRejectionCase = {
  name: string;
  submissionOverrides: Partial<Pick<SubmissionData, 'answers' | 'parts'>>;
  expectedError: string | RegExp;
};

function makeContext(overrides: ActivityOverrides = {}) {
  const activity = {
    _id: ACTIVITY_ID,
    componentKey: 'graphing-explorer' as const,
    displayName: 'Find two numbers with a given sum and product by graphing',
    props: rendererProps,
    gradingConfig: {
      autoGrade: true,
      passingScore: 3,
      partialCredit: true,
      partIds: ['table_values', 'placed_points', 'solutions'],
      rubric: [
        { criteria: 'Complete the table.', partId: 'table_values', points: 1 },
        { criteria: 'Plot the points.', partId: 'placed_points', points: 1 },
        { criteria: 'Identify the solutions.', partId: 'solutions', points: 1 },
      ],
    },
    stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
    masteryNodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
    srsEligible: true,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
  const submissions: Array<Record<string, unknown> & { _id: string }> = [];
  const ctx = {
    db: {
      get: async (id: string) => id === ACTIVITY_ID ? activity : null,
      query: (tableName: string) => {
        if (tableName !== 'activity_submissions') {
          throw new Error(`Unexpected table: ${tableName}`);
        }
        return {
          withIndex: (
            indexName: string,
            configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
          ) => {
            const conditions = new Map<string, unknown>();
            const index = {
              eq(field: string, value: unknown) {
                conditions.set(field, value);
                return index;
              },
            };
            configure(index);
            const selected = () => submissions.filter((submission) => (
              [...conditions].every(([field, value]) => submission[field] === value)
            ));

            if (indexName === 'by_user_activity_idempotency_key') {
              return { unique: async () => selected()[0] ?? null };
            }
            if (indexName === 'by_user_activity_attempt_ordinal') {
              return {
                order: () => ({ first: async () => selected().at(-1) ?? null }),
              };
            }
            throw new Error(`Unexpected index: ${indexName}`);
          },
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        if (tableName !== 'activity_submissions') {
          throw new Error(`Unexpected write table: ${tableName}`);
        }
        const id = `activity_submissions:${submissions.length + 1}`;
        submissions.push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;

  return { ctx, submissions };
}

describe('IM3 two-real-solutions Convex acceptance', () => {
  it('accepts the exact Guided activity and persists the server-owned grade', async () => {
    const { ctx, submissions } = makeContext();
    const submissionData = {
      contractVersion: 'practice.v1' as const,
      activityId: ACTIVITY_ID,
      mode: 'guided_practice' as const,
      status: 'submitted' as const,
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:00:00.000Z',
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: tableValues },
        { partId: 'placed_points', rawAnswer: placedPoints },
        { partId: 'solutions', rawAnswer: solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues,
          placedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
    };

    const result = await createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-two-real-solutions-guided-acceptance',
      submissionData,
    });

    expect(result).toEqual({
      id: 'activity_submissions:1',
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
    });
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-two-real-solutions-guided-acceptance',
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
    });
    const storedSubmissionData = submissions[0].submissionData as {
      activityId: string;
      status: string;
      attemptNumber: number;
      parts: Array<{
        partId: string;
        rawAnswer: unknown;
        score: number;
        maxScore: number;
        isCorrect: boolean;
      }>;
    };
    expect(storedSubmissionData).toMatchObject({
      activityId: ACTIVITY_ID,
      status: 'graded',
      attemptNumber: 1,
    });
    expect(storedSubmissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: tableValues, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'placed_points', rawAnswer: placedPoints, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'solutions', rawAnswer: solutions, score: 1, maxScore: 1, isCorrect: true },
    ]);
    for (const field of ['submittedAt', 'createdAt', 'updatedAt', 'gradedAt']) {
      expect(typeof submissions[0][field]).toBe('number');
    }
  });

  const rejectionCases: RejectionCase[] = [
    {
      name: 'nested isCorrect false',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues, isCorrect: false },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: 'Two-real-solutions submissions must not contain client grading fields',
    },
    {
      name: 'nested score 0',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues, score: 0 },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: 'Two-real-solutions submissions must not contain client grading fields',
    },
    {
      name: 'nested maxScore 1',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues, maxScore: 1 },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: 'Two-real-solutions submissions must not contain client grading fields',
    },
    {
      name: 'wrong stable activity ID',
      activityOverrides: {
        stableActivityId: 'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing.guided_practice-lookalike',
      },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'missing mastery node ID',
      activityOverrides: { masteryNodeId: undefined },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'wrong mastery node ID',
      activityOverrides: { masteryNodeId: 'math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing' },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'wrong component key',
      activityOverrides: { componentKey: 'fill-in-the-blank' },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'srsEligible false',
      activityOverrides: { srsEligible: false },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'Guided ID with independent_practice mode',
      submissionOverrides: { mode: 'independent_practice' },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'Independent ID with guided_practice mode',
      activityOverrides: {
        stableActivityId: 'math.im3.skill.1.2.find-two-numbers-with-given-sum-and-product-by-graphing.independent_practice',
      },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
    {
      name: 'non-submitted status',
      submissionOverrides: { status: 'draft' },
      expectedError: /IM3 pilot activity metadata does not match the approved server-owned create mapping/,
    },
  ];

  it.each(rejectionCases)('rejects two-real submission with $name', async ({ name, activityOverrides, submissionOverrides, expectedError }) => {
    const { ctx, submissions } = makeContext(activityOverrides);
    const submissionData: SubmissionData = {
      contractVersion: 'practice.v1',
      activityId: ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:00:00.000Z',
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: tableValues },
        { partId: 'placed_points', rawAnswer: placedPoints },
        { partId: 'solutions', rawAnswer: solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues,
          placedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
      ...submissionOverrides,
    };

    await expect(createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: `im3-two-real-solutions-rejection-${name}`,
      submissionData,
    })).rejects.toThrow(expectedError);
    expect(submissions).toHaveLength(0);
  });

  const canonicalRejectionCases: CanonicalRejectionCase[] = [
    {
      name: 'missing part',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'placed_points', rawAnswer: placedPoints },
        ],
      },
      expectedError: 'IM3 mastery submissions must contain exactly one canonical part per answer',
    },
    {
      name: 'duplicate part ID',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'solutions', rawAnswer: solutions },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: 'IM3 mastery submissions must contain exactly one canonical part per answer',
    },
    {
      name: 'extra part',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions },
          { partId: 'extra', rawAnswer: 'unexpected' },
        ],
      },
      expectedError: 'IM3 mastery submissions must contain exactly one canonical part per answer',
    },
    {
      name: 'missing answer key',
      submissionOverrides: {
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
        },
      },
      expectedError: 'IM3 mastery submissions must contain exactly the canonical answer keys',
    },
    {
      name: 'extra answer key',
      submissionOverrides: {
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions,
          extra: 'unexpected',
        },
      },
      expectedError: 'IM3 mastery submissions must contain exactly the canonical answer keys',
    },
    {
      name: 'answer/raw mismatch',
      submissionOverrides: {
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: [solutions[0]] },
        ],
      },
      expectedError: /rawAnswer must match its answer/,
    },
    {
      name: 'four-row table_values',
      submissionOverrides: {
        answers: { table_values: tableValues.slice(0, 4), placed_points: placedPoints, solutions },
        parts: [
          { partId: 'table_values', rawAnswer: tableValues.slice(0, 4) },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: /IM3 mastery pilot did not produce a server grade/,
    },
    {
      name: 'non-finite placed point coordinate',
      submissionOverrides: {
        answers: {
          table_values: tableValues,
          placed_points: placedPoints.map((point, index) => (
            index === 0 ? { ...point, y: Number.NaN } : point
          )),
          solutions,
        },
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          {
            partId: 'placed_points',
            rawAnswer: placedPoints.map((point, index) => (
              index === 0 ? { ...point, y: Number.NaN } : point
            )),
          },
          { partId: 'solutions', rawAnswer: solutions },
        ],
      },
      expectedError: /IM3 mastery pilot did not produce a server grade/,
    },
    {
      name: 'one-number solutions',
      submissionOverrides: {
        answers: { table_values: tableValues, placed_points: placedPoints, solutions: solutions.slice(0, 1) },
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: solutions.slice(0, 1) },
        ],
      },
      expectedError: /IM3 mastery pilot did not produce a server grade/,
    },
    {
      name: 'non-number solution',
      submissionOverrides: {
        answers: {
          table_values: tableValues,
          placed_points: placedPoints,
          solutions: [solutions[0], String(solutions[1])],
        },
        parts: [
          { partId: 'table_values', rawAnswer: tableValues },
          { partId: 'placed_points', rawAnswer: placedPoints },
          { partId: 'solutions', rawAnswer: [solutions[0], String(solutions[1])] },
        ],
      },
      expectedError: /IM3 mastery pilot did not produce a server grade/,
    },
  ];

  it.each(canonicalRejectionCases)('rejects canonical two-real submission with $name', async ({ name, submissionOverrides, expectedError }) => {
    const { ctx, submissions } = makeContext();
    const submissionData: SubmissionData = {
      contractVersion: 'practice.v1',
      activityId: ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:00:00.000Z',
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: tableValues },
        { partId: 'placed_points', rawAnswer: placedPoints },
        { partId: 'solutions', rawAnswer: solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues,
          placedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
      ...submissionOverrides,
    };

    await expect(createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: `im3-two-real-solutions-canonical-rejection-${name}`,
      submissionData,
    })).rejects.toThrow(expectedError);
    expect(submissions).toHaveLength(0);
  });

  it('accepts the exact Independent activity and persists the server-owned grade', async () => {
    const { ctx, submissions } = makeContext({
      props: independentRendererProps,
      stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
    });
    const submissionData: SubmissionData = {
      contractVersion: 'practice.v1',
      activityId: ACTIVITY_ID,
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:01:00.000Z',
      answers: {
        table_values: independentTableValues,
        placed_points: independentPlacedPoints,
        solutions: independentSolutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: independentTableValues },
        { partId: 'placed_points', rawAnswer: independentPlacedPoints },
        { partId: 'solutions', rawAnswer: independentSolutions },
      ],
      artifact: {
        graphState: {
          originalEquation: independentRendererProps.originalEquation,
          equation: independentRendererProps.equation,
          tableValues: independentTableValues,
          placedPoints: independentPlacedPoints,
          domain: independentRendererProps.domain,
          range: independentRendererProps.range,
        },
      },
    };

    const result = await createHandler(ctx, {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-two-real-solutions-independent-acceptance',
      submissionData,
    });

    expect(result).toEqual({
      id: 'activity_submissions:1',
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
    });
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
    });
    const storedSubmissionData = submissions[0].submissionData as {
      activityId: string;
      status: string;
      attemptNumber: number;
      parts: Array<{
        partId: string;
        rawAnswer: unknown;
        score: number;
        maxScore: number;
        isCorrect: boolean;
      }>;
    };
    expect(storedSubmissionData).toMatchObject({
      activityId: ACTIVITY_ID,
      status: 'graded',
      attemptNumber: 1,
    });
    expect(storedSubmissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: independentTableValues, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'placed_points', rawAnswer: independentPlacedPoints, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'solutions', rawAnswer: independentSolutions, score: 1, maxScore: 1, isCorrect: true },
    ]);
  });

  it('replays the exact Guided request with one idempotent receipt', async () => {
    const { ctx, submissions } = makeContext();
    const submissionData: SubmissionData = {
      contractVersion: 'practice.v1',
      activityId: ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:02:00.000Z',
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: tableValues },
        { partId: 'placed_points', rawAnswer: placedPoints },
        { partId: 'solutions', rawAnswer: solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues,
          placedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
    };
    const request = {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-two-real-solutions-guided-idempotent',
      submissionData,
    };

    const firstReceipt = await createHandler(ctx, request);
    const secondReceipt = await createHandler(ctx, request);

    expect(secondReceipt).toEqual(firstReceipt);
    expect(firstReceipt).toEqual({
      id: 'activity_submissions:1',
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
    });
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
    });
    const storedSubmissionData = submissions[0].submissionData as {
      status: string;
      attemptNumber: number;
      parts: Array<{
        partId: string;
        rawAnswer: unknown;
        score: number;
        maxScore: number;
        isCorrect: boolean;
      }>;
    };
    expect(storedSubmissionData).toMatchObject({
      status: 'graded',
      attemptNumber: 1,
    });
    expect(storedSubmissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: tableValues, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'placed_points', rawAnswer: placedPoints, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'solutions', rawAnswer: solutions, score: 1, maxScore: 1, isCorrect: true },
    ]);
  });

  it('rejects a conflicting Guided request that reuses an idempotency key', async () => {
    const { ctx, submissions } = makeContext();
    const submissionData: SubmissionData = {
      contractVersion: 'practice.v1',
      activityId: ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:03:00.000Z',
      answers: {
        table_values: tableValues,
        placed_points: placedPoints,
        solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: tableValues },
        { partId: 'placed_points', rawAnswer: placedPoints },
        { partId: 'solutions', rawAnswer: solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues,
          placedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
    };
    const request = {
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      idempotencyKey: 'im3-two-real-solutions-guided-conflict',
      submissionData,
    };
    await createHandler(ctx, request);

    const conflictingSubmissionData = {
      ...submissionData,
      answers: {
        ...submissionData.answers,
        solutions: [999, 1000],
      },
      parts: submissionData.parts.map((part) => (
        part.partId === 'solutions'
          ? { ...part, rawAnswer: [999, 1000] }
          : part
      )),
    };

    await expect(createHandler(ctx, {
      ...request,
      submissionData: conflictingSubmissionData,
    })).rejects.toThrow(/^idempotency_conflict$/);
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      masteryContractVersion: 'learning-evidence.v1',
    });
    const storedSubmissionData = submissions[0].submissionData as {
      status: string;
      attemptNumber: number;
      parts: Array<{
        partId: string;
        rawAnswer: unknown;
        score: number;
        maxScore: number;
        isCorrect: boolean;
      }>;
    };
    expect(storedSubmissionData).toMatchObject({
      status: 'graded',
      attemptNumber: 1,
    });
    expect(storedSubmissionData.parts).toEqual([
      { partId: 'table_values', rawAnswer: tableValues, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'placed_points', rawAnswer: placedPoints, score: 1, maxScore: 1, isCorrect: true },
      { partId: 'solutions', rawAnswer: solutions, score: 1, maxScore: 1, isCorrect: true },
    ]);
  });
});
