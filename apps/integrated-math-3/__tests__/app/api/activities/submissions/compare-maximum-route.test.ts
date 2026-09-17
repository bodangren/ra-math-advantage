import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { IM3_COMPARE_MAXIMUM_NODE } from '@/lib/practice/learning-evidence-pilot';

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

const compareMaximumGenerator = getGenerator('quadratic-graph-analysis');
const guidedOutput = compareMaximumGenerator.generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 0,
  difficulty: 0.5,
});
const independentOutput = compareMaximumGenerator.generate({
  nodeId: IM3_COMPARE_MAXIMUM_NODE,
  seed: 1,
  difficulty: 0.5,
});

type CompareOutput = typeof guidedOutput;
type CompareMode = 'guided_practice' | 'independent_practice';
type Choice = 'first' | 'second';
type CompareEnvelope = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: CompareMode;
  status: 'submitted';
  attemptNumber: 1;
  submittedAt: string;
  answers: { greater_maximum: Choice };
  parts: [{ partId: 'greater_maximum'; rawAnswer: Choice }];
};

const SERVER_LEARNER_ID = 'authenticated-im3-learner';

function makeEnvelope(
  output: CompareOutput,
  activityId: string,
  mode: CompareMode,
  choice = output.expectedAnswer.greater_maximum as Choice,
): CompareEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: '2026-09-05T10:00:00.000Z',
    answers: { greater_maximum: choice },
    parts: [{ partId: 'greater_maximum', rawAnswer: choice }],
  };
}

function makeRequest(body: unknown, idempotencyKey: string): Request {
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

describe('POST /api/activities/submissions compare-maximum envelope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStudentRequestClaims.mockResolvedValue({
      sub: SERVER_LEARNER_ID,
      role: 'student',
    });
    mocks.fetchInternalMutation.mockResolvedValue({
      submissionId: 'server-owned-compare-maximum-submission',
      score: 1,
      maxScore: 1,
    });
  });

  it.each([
    ['Guided seed 0', guidedOutput, 'activities:compare-maximum-guided-route', 'guided_practice'],
    ['Independent seed 1', independentOutput, 'activities:compare-maximum-independent-route', 'independent_practice'],
  ] as const)('accepts the exact %s compare-maximum envelope', async (
    _label,
    output,
    activityId,
    mode,
  ) => {
    const POST = await loadPost();
    const envelope = makeEnvelope(output, activityId, mode);
    const idempotencyKey = `im3-compare-maximum-${mode}-route-key`;
    const response = await POST(makeRequest(envelope, idempotencyKey));

    expect(response.status).toBe(200);
    expect(envelope).not.toHaveProperty('score');
    expect(envelope).not.toHaveProperty('maxScore');
    expect(envelope).not.toHaveProperty('isCorrect');
    expect(mocks.fetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.createServerOwnedSubmission',
      {
        userId: SERVER_LEARNER_ID,
        activityId,
        submissionData: envelope,
        idempotencyKey,
      },
    );
  });

  it('accepts the opposite valid choice and leaves correctness to the server', async () => {
    const POST = await loadPost();
    const correctChoice = guidedOutput.expectedAnswer.greater_maximum as Choice;
    const oppositeChoice: Choice = correctChoice === 'first' ? 'second' : 'first';
    const envelope = makeEnvelope(
      guidedOutput,
      'activities:compare-maximum-opposite-route',
      'guided_practice',
      oppositeChoice,
    );
    const response = await POST(makeRequest(envelope, 'im3-compare-maximum-opposite-key'));

    expect(response.status).toBe(200);
    expect(mocks.fetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['answer/part mismatch', (envelope: CompareEnvelope) => ({
      ...envelope,
      parts: [{
        partId: 'greater_maximum',
        rawAnswer: envelope.answers.greater_maximum === 'first' ? 'second' : 'first',
      }],
    })],
    ['invalid choice', (envelope: CompareEnvelope) => ({
      ...envelope,
      answers: { greater_maximum: 'neither' },
      parts: [{ partId: 'greater_maximum', rawAnswer: 'neither' }],
    })],
    ['non-string choice', (envelope: CompareEnvelope) => ({
      ...envelope,
      answers: { greater_maximum: 1 },
      parts: [{ partId: 'greater_maximum', rawAnswer: 1 }],
    })],
    ['wrong answer key', (envelope: CompareEnvelope) => ({
      ...envelope,
      answers: { greaterMaximum: 'first' },
    })],
    ['wrong part ID', (envelope: CompareEnvelope) => ({
      ...envelope,
      parts: [{ partId: 'maximum_value', rawAnswer: 'first' }],
    })],
    ['duplicate part', (envelope: CompareEnvelope) => ({
      ...envelope,
      parts: [envelope.parts[0], envelope.parts[0]],
    })],
    ['missing part', (envelope: CompareEnvelope) => ({ ...envelope, parts: [] })],
    ['extra part', (envelope: CompareEnvelope) => ({
      ...envelope,
      parts: [...envelope.parts, { partId: 'extra', rawAnswer: 'first' }],
    })],
    ['missing answer', (envelope: CompareEnvelope) => ({ ...envelope, answers: {} })],
    ['extra answer', (envelope: CompareEnvelope) => ({
      ...envelope,
      answers: { ...envelope.answers, extra: 'first' },
    })],
    ['worked_example mode', (envelope: CompareEnvelope) => ({
      ...envelope,
      mode: 'worked_example',
    })],
    ['graded status', (envelope: CompareEnvelope) => ({
      ...envelope,
      status: 'graded',
    })],
  ] as const)('rejects %s before the internal mutation', async (_label, change) => {
    const POST = await loadPost();
    const envelope = change(makeEnvelope(
      guidedOutput,
      'activities:compare-maximum-guard-route',
      'guided_practice',
    ));
    const response = await POST(makeRequest(envelope, `im3-compare-maximum-guard-${_label}`));

    expect(response.status).toBe(400);
    expect(mocks.fetchInternalMutation).not.toHaveBeenCalled();
  });
});
