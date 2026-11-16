import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
} from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot } from '@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot';
import {
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedVariant = generateTopic12QuadraticNegativeRateIntervalChoice(1);
const independentVariant = generateTopic12QuadraticNegativeRateIntervalChoice(2);
const guidedAnswer = (generateTopic12QuadraticNegativeRateIntervalChoiceOutput(1).expectedAnswer as { selectedOptionId: string }).selectedOptionId;
const independentAnswer = (generateTopic12QuadraticNegativeRateIntervalChoiceOutput(2).expectedAnswer as { selectedOptionId: string }).selectedOptionId;
const guidedSteps = [
  'Identify that the negative quadratic coefficient makes the parabola open downward.',
  'Find the vertex with x = -b/(2a).',
  'Use the right side of the vertex as the negative-rate interval.',
  'Select the one true statement.',
];
const fieldHelp = 'A downward-opening quadratic has a negative rate of change to the right of its vertex.';
const CREATE_URL = '/api/activities/precalculus-topic-1-2-quadratic-negative-rate-interval/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  title: 'Determine negative-rate intervals for quadratics',
  status: 'in_progress' as const,
  readiness: 'ready' as const,
};

const eligibleEvidence = {
  persisted: true,
  masteryApplied: true,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
};
const savedEvidence = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: false,
    reason: 'ungraded_evidence',
    masteryBearing: false,
  },
};
const awaitingEvidence = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'awaiting_teacher_exposure',
    eligible: false,
    reason: 'awaiting_teacher_exposure',
    masteryBearing: false,
  },
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function malformedJsonResponse() {
  return new Response('{', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function optionText(option: { rateSign: string; startInput: number; endInput: number }) {
  const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(3);
  return `k has a ${option.rateSign} rate of change on ${format(option.startInput)} ≤ x ≤ ${format(option.endInput)}.`;
}

function expectNoAuthorityKeys(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of [
    'correctOptionId',
    'correctAnswer',
    'answerKey',
    'hidden',
    'authority',
    'expectedAnswer',
    'gradingMetadata',
    'solutionSteps',
    'finalAnswer',
    'isCorrect',
    'correctness',
    'score',
    'maxScore',
    'vertexX',
    'relationship',
    'solution',
    'slope',
    'derivative',
  ]) {
    expect(serialized).not.toContain(`"${key}"`);
  }
}

function chooseOption(label: string) {
  const radio = screen.getAllByRole('radio').find((candidate) => (
    (candidate as HTMLInputElement).value === label
  ));
  expect(radio).toBeDefined();
  fireEvent.click(radio!);
}

function clickSubmit() {
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
}

function createResult(submissionId = 'activity_submissions:quadratic-negative-rate-practice', score = 1) {
  return {
    submissionId,
    score,
    maxScore: 1,
    attemptOrdinal: 1,
    feedback: `${score}/1 quadratic negative-rate interval selections matched the server rubric.`,
  };
}

describe('PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot', () => {
  it('renders the generated Guided variant and sends a strict raw envelope', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult()))
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Identify Negative-Rate Intervals' })).toBeTruthy();
    expect(screen.getByText('Determine negative-rate intervals for quadratics')).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getByText(guidedVariant.prompt)).toBeTruthy();
    for (const option of guidedVariant.options) expect(screen.getByText(optionText(option))).toBeTruthy();
    for (const step of guidedSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(fieldHelp)).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expect(screen.queryByText(/correctOptionId|expectedAnswer|gradingMetadata|solutionSteps|finalAnswer|vertexX/i)).toBeNull();

    chooseOption(guidedAnswer);
    clickSubmit();

    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 quadratic negative-rate interval selections matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe(CREATE_URL);
    const createInit = createCall[1] as RequestInit;
    expect(createInit.method).toBe('POST');
    expect(new Headers(createInit.headers).get('content-type')).toBe('application/json');
    const key = new Headers(createInit.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
    const envelope = requestBody(createCall);
    expect(envelope).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      answers: { selectedOptionId: guidedAnswer },
      parts: [{ partId: 'selectedOptionId', rawAnswer: guidedAnswer }],
    });
    expect(Object.keys(envelope)).toEqual([
      'contractVersion',
      'activityId',
      'mode',
      'status',
      'attemptNumber',
      'submittedAt',
      'answers',
      'parts',
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthorityKeys(envelope);
    expect(JSON.stringify(envelope)).not.toMatch(/"(correctAnswer|expectedAnswer|gradingMetadata|solutionSteps|slope|derivative)"\s*:/);

    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe(EVIDENCE_URL);
    expect(requestBody(evidenceCall)).toStrictEqual({ submissionId: 'activity_submissions:quadratic-negative-rate-practice' });
    expect(Object.keys(requestBody(evidenceCall))).toEqual(['submissionId']);
  });

  it('does not render the knowledge state without the optional prop', () => {
    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);

    expect(screen.queryByText('Determine negative-rate intervals for quadratics')).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('shows a server zero score and awaiting-teacher message', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:quadratic-negative-rate-zero', 0)))
      .mockResolvedValueOnce(response(awaitingEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);
    chooseOption('A');
    clickSubmit();

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('0/1 quadratic negative-rate interval selections matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');
  });

  it('renders the exact seed-2 Independent variant without Guided or Worked leakage', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:quadratic-negative-rate-independent')))
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Identify Negative-Rate Intervals' })).toBeTruthy();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
    for (const option of independentVariant.options) expect(screen.getByText(optionText(option))).toBeTruthy();
    expect(screen.queryByText(guidedSteps[0])).toBeNull();
    expect(screen.queryByText(guidedSteps[1])).toBeNull();
    expect(screen.queryByText(guidedSteps[2])).toBeNull();
    expect(screen.queryByText(guidedSteps[3])).toBeNull();
    expect(screen.queryByText(fieldHelp)).toBeNull();
    for (const step of generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0).solutionSteps as Array<{ description: string }>) {
      expect(screen.queryByText(step.description)).toBeNull();
    }
    expect(screen.queryByText('Option D is correct because the rate is negative to the right of the vertex.')).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expectNoAuthorityKeys(independentVariant);

    chooseOption(independentAnswer);
    clickSubmit();
    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe(CREATE_URL);
    const envelope = requestBody(createCall);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(envelope.answers).toEqual({ selectedOptionId: independentAnswer });
    expect(envelope.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: independentAnswer }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthorityKeys(envelope);
    expect(JSON.stringify(envelope)).not.toMatch(/"(correctAnswer|expectedAnswer|gradingMetadata|solutionSteps|slope|derivative)"\s*:/);
  });

  it('retries the same create envelope and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response(createResult('activity_submissions:quadratic-negative-rate-retry')))
      .mockResolvedValueOnce(response({ error: 'evidence failed' }, 500))
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);
    chooseOption(guidedAnswer);
    clickSubmit();
    await screen.findByRole('button', { name: 'Retry submission' });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');
    const firstBody = (firstCall[1] as RequestInit).body;

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[3]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toStrictEqual({ submissionId: 'activity_submissions:quadratic-negative-rate-retry' });
  });

  it('blocks duplicate clicks while the create request is saving', async () => {
    let resolveCreate!: (value: Response) => void;
    const createResponse = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);
    chooseOption(guidedAnswer);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(createResult('activity_submissions:quadratic-negative-rate-duplicate')));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['HTTP error', response({ error: 'private detail' }, 500)],
    ['non-object JSON', response(['submission-id'])],
    ['malformed JSON', malformedJsonResponse()],
    ['blank submission ID', response({ submissionId: ' ', score: 1, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid score', response({ submissionId: 'submission', score: 2, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid max score', response({ submissionId: 'submission', score: 1, maxScore: 2, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid attempt ordinal', response({ submissionId: 'submission', score: 1, maxScore: 1, attemptOrdinal: 0, feedback: 'feedback' })],
    ['blank feedback', response({ submissionId: 'submission', score: 1, maxScore: 1, attemptOrdinal: 1, feedback: ' ' })],
    ['extra result field', response({ ...createResult(), answer: 'D' })],
  ])('blocks evidence and shows a safe retry state for malformed create result: %s', async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);
    chooseOption(guidedAnswer);
    clickSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 quadratic negative-rate interval practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('private detail');
  });

  it.each([
    ['missing outer fields', {}],
    ['extra outer field', { ...eligibleEvidence, extra: true }],
    ['wrong boolean type', { ...eligibleEvidence, masteryApplied: 'yes' }],
    ['missing decision field', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: undefined } }],
    ['extra decision field', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, extra: true } }],
    ['unknown reason', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: 'unknown' } }],
    ['unknown exposure state', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, exposureState: 'pending' } }],
    ['invalid delivery value', { ...eligibleEvidence, delivery: 'invalid' }],
    ['non-OK response', response({ error: 'private evidence detail' }, 500)],
  ])('keeps the opaque submission and retries only evidence for malformed evidence: %s', async (_label, malformedEvidence) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:quadratic-negative-rate-evidence-retry')))
      .mockResolvedValueOnce(malformedEvidence instanceof Response ? malformedEvidence : response(malformedEvidence))
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalPracticePilot />);
    chooseOption(guidedAnswer);
    clickSubmit();
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({ submissionId: 'activity_submissions:quadratic-negative-rate-evidence-retry' });
  });
});
