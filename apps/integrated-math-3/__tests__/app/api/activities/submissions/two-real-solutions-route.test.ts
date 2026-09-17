import { describe, expect, it, vi } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';

import { IM3_TWO_REAL_SOLUTIONS_NODE } from '@/lib/practice/learning-evidence-pilot';

const mocks = vi.hoisted(() => ({
  fetchInternalMutation: vi.fn(),
  requireStudentRequestClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: mocks.requireStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.fetchInternalMutation,
  internal: {
    activities: {
      createServerOwnedSubmission: 'internal.activities.createServerOwnedSubmission',
    },
  },
}));

const generator = getGenerator('two-real-solutions-graphing');
const output = generator.generate({
  nodeId: IM3_TWO_REAL_SOLUTIONS_NODE,
  seed: 0,
  difficulty: 0.5,
});
const rendererProps = output.data.rendererProps as {
  originalEquation: string;
  equation: string;
  points: Array<[number, number]>;
  domain: number[];
  range: number[];
};
const expectedAnswer = output.expectedAnswer as {
  table_values: Array<{ x: number; y: number }>;
  placed_points: Array<{ x: number; y: number }>;
  solutions: number[];
};
const activityId = 'activities:two-real-solutions-guided-route';
const userId = 'authenticated-im3-learner';
const idempotencyKey = 'im3-two-real-solutions-guided-route-key';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/activities/submissions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

async function loadPost(): Promise<(request: Request) => Promise<Response>> {
  const route = await vi.importActual<Record<string, unknown>>(
    '@/app/api/activities/submissions/route',
  );
  if (typeof route.POST !== 'function') throw new Error('POST is not exported');
  return route.POST as (request: Request) => Promise<Response>;
}

describe('POST /api/activities/submissions two-real-solutions envelope', () => {
  it('accepts the exact Guided component envelope and forwards it to Convex', async () => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: userId,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: 'server-owned-two-real-solutions-submission',
      score: 3,
      maxScore: 3,
    });

    const envelope = {
      contractVersion: 'practice.v1',
      activityId,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:30:00.000Z',
      answers: {
        table_values: expectedAnswer.table_values,
        placed_points: expectedAnswer.placed_points,
        solutions: expectedAnswer.solutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: expectedAnswer.table_values },
        { partId: 'placed_points', rawAnswer: expectedAnswer.placed_points },
        { partId: 'solutions', rawAnswer: expectedAnswer.solutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues: expectedAnswer.table_values,
          placedPoints: expectedAnswer.placed_points,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
    } as const;
    const response = await (await loadPost())(makeRequest(envelope));

    expect(response.status).toBe(200);
    expect(envelope).not.toHaveProperty('normalizedAnswer');
    expect(envelope).not.toHaveProperty('isCorrect');
    expect(envelope).not.toHaveProperty('score');
    expect(envelope).not.toHaveProperty('maxScore');
    expect(Object.keys(envelope)).toEqual([
      'contractVersion',
      'activityId',
      'mode',
      'status',
      'attemptNumber',
      'submittedAt',
      'answers',
      'parts',
      'artifact',
    ]);
    expect(Object.keys(envelope.answers)).toEqual([
      'table_values',
      'placed_points',
      'solutions',
    ]);
    expect(envelope.parts.map((part) => part.partId)).toEqual([
      'table_values',
      'placed_points',
      'solutions',
    ]);
    for (const part of envelope.parts) {
      expect(Object.keys(part)).toEqual(['partId', 'rawAnswer']);
      expect(part).not.toHaveProperty('isCorrect');
      expect(part).not.toHaveProperty('score');
      expect(part).not.toHaveProperty('maxScore');
    }
    expect(Object.keys(envelope.artifact.graphState)).toEqual([
      'originalEquation',
      'equation',
      'tableValues',
      'placedPoints',
      'domain',
      'range',
    ]);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId,
        activityId,
        submissionData: envelope,
        idempotencyKey,
      },
    );
  });

  it('rejects malformed two-real values and nested client grade fields', async () => {
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: userId,
      role: 'student',
    });
    const validAnswers = {
      table_values: expectedAnswer.table_values,
      placed_points: expectedAnswer.placed_points,
      solutions: expectedAnswer.solutions,
    };
    const validParts = [
      { partId: 'table_values', rawAnswer: expectedAnswer.table_values },
      { partId: 'placed_points', rawAnswer: expectedAnswer.placed_points },
      { partId: 'solutions', rawAnswer: expectedAnswer.solutions },
    ];
    const buildEnvelope = (
      answers: Record<string, unknown> = validAnswers,
      parts: Array<Record<string, unknown>> = validParts,
    ) => ({
      contractVersion: 'practice.v1',
      activityId,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:35:00.000Z',
      answers,
      parts,
    });
    const malformedCases: Array<[string, Record<string, unknown>]> = [
      ['four table rows', buildEnvelope(
        { ...validAnswers, table_values: expectedAnswer.table_values.slice(0, 4) },
        [{ ...validParts[0], rawAnswer: expectedAnswer.table_values.slice(0, 4) }, validParts[1], validParts[2]],
      )],
      ['null point coordinate', buildEnvelope(
        {
          ...validAnswers,
          placed_points: [{ x: null, y: expectedAnswer.placed_points[0].y }, ...expectedAnswer.placed_points.slice(1)],
        },
        [{ ...validParts[0] }, {
          ...validParts[1],
          rawAnswer: [{ x: null, y: expectedAnswer.placed_points[0].y }, ...expectedAnswer.placed_points.slice(1)],
        }, validParts[2]],
      )],
      ['extra point key', buildEnvelope(
        {
          ...validAnswers,
          placed_points: expectedAnswer.placed_points.map((point) => ({ ...point, label: 'extra' })),
        },
        [validParts[0], {
          ...validParts[1],
          rawAnswer: expectedAnswer.placed_points.map((point) => ({ ...point, label: 'extra' })),
        }, validParts[2]],
      )],
      ['one solution number', buildEnvelope(
        { ...validAnswers, solutions: expectedAnswer.solutions.slice(0, 1) },
        [validParts[0], validParts[1], { ...validParts[2], rawAnswer: expectedAnswer.solutions.slice(0, 1) }],
      )],
      ['non-number solution', buildEnvelope(
        { ...validAnswers, solutions: [expectedAnswer.solutions[0], '13'] },
        [validParts[0], validParts[1], { ...validParts[2], rawAnswer: [expectedAnswer.solutions[0], '13'] }],
      )],
      ['answer and raw mismatch', buildEnvelope(
        validAnswers,
        [{
          ...validParts[0],
          rawAnswer: expectedAnswer.table_values.map((point, index) => (
            index === 0 ? { ...point, y: point.y + 1 } : point
          )),
        }, validParts[1], validParts[2]],
      )],
      ['nested isCorrect', buildEnvelope(validAnswers, [{ ...validParts[0], isCorrect: false }, validParts[1], validParts[2]])],
      ['nested score', buildEnvelope(validAnswers, [{ ...validParts[0], score: 0 }, validParts[1], validParts[2]])],
      ['nested maxScore', buildEnvelope(validAnswers, [{ ...validParts[0], maxScore: 1 }, validParts[1], validParts[2]])],
    ];

    const POST = await loadPost();
    for (const [label, envelope] of malformedCases) {
      mocks.fetchInternalMutation.mockClear();
      const response = await POST(makeRequest(envelope));

      expect(response.status, label).toBe(400);
      expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
    }
  });

  it('forwards structurally valid incorrect two-real values without grading', async () => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: userId,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: 'server-owned-two-real-solutions-incorrect-submission',
      score: 0,
      maxScore: 3,
    });

    const wrongTableValues = expectedAnswer.table_values.map((point) => ({
      x: point.x,
      y: point.y + 100,
    }));
    const wrongPlacedPoints = expectedAnswer.placed_points.map((point) => ({
      x: point.x + 100,
      y: point.y + 100,
    }));
    const wrongSolutions = [999, 1000];
    const envelope = {
      contractVersion: 'practice.v1',
      activityId,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-09-07T10:40:00.000Z',
      answers: {
        table_values: wrongTableValues,
        placed_points: wrongPlacedPoints,
        solutions: wrongSolutions,
      },
      parts: [
        { partId: 'table_values', rawAnswer: wrongTableValues },
        { partId: 'placed_points', rawAnswer: wrongPlacedPoints },
        { partId: 'solutions', rawAnswer: wrongSolutions },
      ],
      artifact: {
        graphState: {
          originalEquation: rendererProps.originalEquation,
          equation: rendererProps.equation,
          tableValues: wrongTableValues,
          placedPoints: wrongPlacedPoints,
          domain: rendererProps.domain,
          range: rendererProps.range,
        },
      },
    } as const;
    const response = await (await loadPost())(makeRequest(envelope));

    expect(response.status).toBe(200);
    expect(envelope).not.toHaveProperty('normalizedAnswer');
    expect(envelope).not.toHaveProperty('isCorrect');
    expect(envelope).not.toHaveProperty('score');
    expect(envelope).not.toHaveProperty('maxScore');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId,
        activityId,
        submissionData: envelope,
        idempotencyKey,
      },
    );
  });
});
