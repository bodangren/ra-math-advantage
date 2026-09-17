import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rateSignAndTrendFromGraphSchema } from '@math-platform/math-content';
import { generateTopic14RateSignAndTrendOutput } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic14RateSignAndTrendPracticePilot } from '@/components/student/PrecalculusTopic14RateSignAndTrendPracticePilot';
import {
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedOutput = generateTopic14RateSignAndTrendOutput(1);
const independentOutput = generateTopic14RateSignAndTrendOutput(2);
const guidedProps = rateSignAndTrendFromGraphSchema.parse(guidedOutput.data.rendererProps);
const independentProps = rateSignAndTrendFromGraphSchema.parse(independentOutput.data.rendererProps);
const GUIDED_STEPS = [
  'Determine whether h rises or falls on the interval.',
  'Determine whether the rate of change increases or decreases as x increases.',
];
const FIELD_HELP = 'A positive rate means h rises. A decreasing rate means the graph flattens as x increases.';
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_NODE_ID,
  title: 'Describe rate-of-change behavior on intervals using precise language',
  status: 'in_progress',
  readiness: 'ready',
} as const;
const PRACTICE_ERROR = 'Unable to save the Topic 1.4 rate sign and trend practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-4-rate-sign-and-trend/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-4-rate-sign-and-trend',
  score: 2,
  maxScore: 2,
  attemptOrdinal: 1,
  feedback: '2/2 rate sign and trend responses matched the server rubric.',
} as const;
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
const savedEvidence = {
  persisted: true,
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

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const invalidJsonResponse = new Response('{', {
  status: 200,
  headers: { 'content-type': 'application/json' },
});

function expectedAnswers(output: typeof guidedOutput): { rateSign: string; rateTrend: string } {
  return output.expectedAnswer as { rateSign: string; rateTrend: string };
}

function chooseAnswers(answers: { rateSign: string; rateTrend: string }): void {
  fireEvent.click(screen.getByLabelText(answers.rateSign === 'positive' ? 'Positive rate' : 'Negative rate'));
  fireEvent.click(screen.getByLabelText(
    answers.rateTrend === 'increasing' ? 'Increasing rate trend' : 'Decreasing rate trend',
  ));
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect([
      'answer',
      'answerKey',
      'correctAnswer',
      'correctAnswers',
      'expectedAnswer',
      'grading',
      'gradingMetadata',
      'normalizedAnswer',
      'solution',
      'solutionSteps',
      'steps',
      'finalAnswer',
      'authority',
      'score',
      'maxScore',
      'isCorrect',
      'correctness',
    ]).not.toContain(key);
    expectNoAuthority(child);
  }
}

describe('PrecalculusTopic14RateSignAndTrendPracticePilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the provided bounded knowledge state', () => {
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
  });

  it('does not render a knowledge state when it is omitted', () => {
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);

    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('renders Guided seed 1 and submits the exact raw practice envelope', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(eligibleEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Rate Sign and Trend' })).toBeTruthy();
    expect(screen.getByText(guidedProps.prompt)).toBeTruthy();
    const table = screen.getByRole('table', { name: 'Graph data for h' });
    for (const point of guidedProps.points) {
      expect(table.textContent).toContain(String(point.x));
      expect(table.textContent).toContain(String(point.y));
    }
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expectNoAuthority(guidedProps);

    const answers = expectedAnswers(guidedOutput);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();
    chooseAnswers(answers);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Mastery Advantage updated your practice record.'));
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(SERVER_RESULT.feedback);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    const init = call[1] as RequestInit;
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    expect(new Headers(init.headers).get('Idempotency-Key')).toEqual(expect.any(String));
    expect(new Headers(init.headers).get('Idempotency-Key')).not.toBe('');
    const envelope = requestBody(call);
    expect(Object.keys(envelope).sort()).toEqual([
      'activityId',
      'answers',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ]);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_GUIDED_ACTIVITY_ID);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toStrictEqual(answers);
    expect(envelope.parts).toStrictEqual([
      { partId: 'rateSign', rawAnswer: answers.rateSign },
      { partId: 'rateTrend', rawAnswer: answers.rateTrend },
    ]);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(requestBody(fetchMock.mock.calls[1] as unknown[]));
  });

  it('renders Independent seed 2 without guidance and submits raw choices', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(awaitingEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Rate Sign and Trend' })).toBeTruthy();
    expect(screen.getByText(independentProps.prompt)).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Graph data for h' })).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expectNoAuthority(independentProps);
    chooseAnswers(expectedAnswers(independentOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.'));
    const call = fetchMock.mock.calls[0] as unknown[];
    const envelope = requestBody(call);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('shows the saved message when evidence is introduced without mastery', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Your practice was saved.'));
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(SERVER_RESULT.feedback);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a failed create with the same body and key', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: 'private detail' }, 500))
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = (firstCall[1] as RequestInit).body;
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('blocks duplicate clicks while create is in flight', async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockReset()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(eligibleEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveCreate(response(SERVER_RESULT));
    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Mastery Advantage updated your practice record.'));
  });

  it('retries evidence only with the opaque submission ID', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response(eligibleEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Mastery Advantage updated your practice record.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({ submissionId: SERVER_RESULT.submissionId });
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({ submissionId: SERVER_RESULT.submissionId });
  });

  it.each([
    ['non-object result', ['submission']],
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['invalid score', { ...SERVER_RESULT, score: 3 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 1 }],
    ['invalid ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['blank feedback', { ...SERVER_RESULT, feedback: ' ' }],
  ] as const)('fails safely for a %s', async (_label, result) => {
    const fetchMock = vi.mocked(fetch).mockReset().mockResolvedValueOnce(response(result));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    expect(screen.queryByText(/Server score:/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect((await screen.findByRole('alert')).textContent).not.toContain(JSON.stringify(result));
  });

  it.each([
    ['non-object result', ['evidence']],
    ['invalid JSON response', invalidJsonResponse],
    ['extra outer field', { ...eligibleEvidence, hidden: true }],
    ['wrong boolean type', { ...eligibleEvidence, masteryApplied: 'yes' }],
    ['missing decision field', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: undefined } }],
    ['extra decision field', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, extra: true } }],
    ['unknown reason', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: 'unknown' } }],
    ['unknown exposure', { ...eligibleEvidence, decision: { ...eligibleEvidence.decision, exposureState: 'pending' } }],
    ['invalid delivery value', { ...eligibleEvidence, delivery: 'invalid' }],
    ['non-OK response', response({ error: 'private evidence detail' }, 500)],
  ] as const)('retains the opaque submission for malformed evidence: %s', async (_label, result) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(result instanceof Response ? result : response(result))
      .mockResolvedValueOnce(response(eligibleEvidence));
    render(<PrecalculusTopic14RateSignAndTrendPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('button', { name: 'Retry evidence delivery' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getAllByRole('status')[1]).toHaveTextContent('Mastery Advantage updated your practice record.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({ submissionId: SERVER_RESULT.submissionId });
  });
});
