import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic14PolynomialExtremaFromGraphOutput } from '@math-platform/math-content/knowledge-space';
import { polynomialExtremaFromGraphSchema } from '@math-platform/math-content';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic14PolynomialExtremaPracticePilot } from '@/components/student/PrecalculusTopic14PolynomialExtremaPracticePilot';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedOutput = generateTopic14PolynomialExtremaFromGraphOutput(1);
const independentOutput = generateTopic14PolynomialExtremaFromGraphOutput(2);
const guidedProps = polynomialExtremaFromGraphSchema.parse(guidedOutput.data.rendererProps);
const independentProps = polynomialExtremaFromGraphSchema.parse(independentOutput.data.rendererProps);
const GUIDED_STEPS = [
  'Find where the graph changes from decreasing to increasing.',
  'Find where the graph changes from increasing to decreasing.',
  'Compare the displayed y-values to identify the absolute minimum.',
];
const FIELD_HELP = 'A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.';
const PRACTICE_ERROR = 'Unable to save the Topic 1.4 polynomial extrema practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-4-polynomial-extrema/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_NODE_ID,
  title: 'Identify relative and absolute extrema from graphs',
  status: 'in_progress' as const,
  readiness: 'ready' as const,
} as const;
const ANSWER_IDS = [
  'relative_minimum_x',
  'relative_maximum_x',
  'absolute_minimum_x',
] as const;
const ANSWER_LABELS = {
  relative_minimum_x: 'Relative minimum x-value',
  relative_maximum_x: 'Relative maximum x-value',
  absolute_minimum_x: 'Absolute minimum x-value',
} as const;
const RAW_ANSWERS = {
  relative_minimum_x: ' 1 ',
  relative_maximum_x: '4.0',
  absolute_minimum_x: 'not-sure',
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

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createResult(score = 3) {
  return {
    submissionId: 'activity_submissions:polynomial-extrema-practice',
    score,
    maxScore: 3,
    attemptOrdinal: 1,
    feedback: `${score}/3 extrema responses matched the server rubric.`,
  };
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function fillAnswers(values: Record<string, string> = RAW_ANSWERS): void {
  for (const answerId of ANSWER_IDS) {
    fireEvent.change(screen.getByLabelText(ANSWER_LABELS[answerId]), {
      target: { value: values[answerId] },
    });
  }
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

describe('PrecalculusTopic14PolynomialExtremaPracticePilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Guided seed 1 graph data, guidance, state, and raw submission', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(createResult(3)))
      .mockResolvedValueOnce(response(eligibleEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Identify Extrema from a Graph' })).toBeTruthy();
    expect(screen.getByText(guidedProps.prompt)).toBeTruthy();
    expect(screen.getByRole('img', { name: /Graph of polynomial g.*domain/ })).toBeTruthy();
    const table = screen.getByRole('table', { name: 'Graph data for polynomial g' });
    for (const point of guidedProps.points) {
      expect(table.textContent).toContain(String(point.x));
      expect(table.textContent).toContain(String(point.y));
    }
    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expectNoAuthority(guidedProps);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();

    fillAnswers();
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 3/3')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('3/3 extrema responses matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe(CREATE_URL);
    const createInit = createCall[1] as RequestInit;
    expect(new Headers(createInit.headers).get('content-type')).toBe('application/json');
    expect(new Headers(createInit.headers).get('Idempotency-Key')).toEqual(expect.any(String));
    expect(new Headers(createInit.headers).get('Idempotency-Key')).not.toBe('');
    const envelope = requestBody(createCall);
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
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_GUIDED_ACTIVITY_ID);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toStrictEqual(RAW_ANSWERS);
    expect(envelope.parts).toStrictEqual(ANSWER_IDS.map((partId) => ({
      partId,
      rawAnswer: RAW_ANSWERS[partId],
    })));
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: createResult().submissionId,
    });
  });

  it('renders Independent seed 2 without guidance and displays a zero score', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(createResult(0)))
      .mockResolvedValueOnce(response(awaitingEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Identify Extrema from a Graph' })).toBeTruthy();
    for (const point of independentProps.points) {
      expect(screen.getByRole('table', { name: 'Graph data for polynomial g' }).textContent).toContain(String(point.y));
    }
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expectNoAuthority(independentProps);
    fillAnswers({ relative_minimum_x: '2', relative_maximum_x: '5', absolute_minimum_x: 'bad' });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 0/3')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');
    const envelope = requestBody(fetchMock.mock.calls[0] as unknown[]);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expectNoAuthority(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses Guided mode by default and omits the optional state', () => {
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    expect(screen.getByRole('heading', { name: 'Guided Practice: Identify Extrema from a Graph' })).toBeTruthy();
    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
  });

  it('retries a failed create with the same body and key, then delivers evidence', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: 'private create detail' }, 500))
      .mockResolvedValueOnce(response(createResult(2)))
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = (firstCall[1] as RequestInit).body;
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() => expect(screen.getByText('Server score: 2/3')).toBeTruthy());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries evidence only after a delivery failure', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(createResult(3)))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual(requestBody(fetchMock.mock.calls[2] as unknown[]));
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: createResult().submissionId,
    });
  });

  it('blocks duplicate clicks during create', async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    fillAnswers();
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveCreate(response(createResult(3)));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['non-object JSON', response(['submission'])],
    ['extra result field', response({ ...createResult(), hidden: true })],
    ['blank submission ID', response({ ...createResult(), submissionId: ' ' })],
    ['invalid score', response({ ...createResult(), score: 4 })],
    ['invalid maximum', response({ ...createResult(), maxScore: 2 })],
    ['invalid attempt ordinal', response({ ...createResult(), attemptOrdinal: 0 })],
    ['blank feedback', response({ ...createResult(), feedback: ' ' })],
  ])('rejects malformed create result: %s', async (_label, serverResponse) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(serverResponse);
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(PRACTICE_ERROR);
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ['non-object JSON', response(['evidence'])],
    ['extra evidence field', response({ ...eligibleEvidence, hidden: true })],
    ['wrong boolean type', response({ ...eligibleEvidence, masteryApplied: 'yes' })],
    ['missing decision field', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: undefined } })],
    ['extra decision field', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, extra: true } })],
    ['unknown reason', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: 'unknown' } })],
    ['unknown exposure state', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, exposureState: 'pending' } })],
    ['invalid delivery value', response({ ...eligibleEvidence, delivery: 'invalid' })],
    ['non-OK response', response({ error: 'private evidence detail' }, 500)],
  ])('retains opaque submission for malformed evidence: %s', async (_label, malformedEvidence) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(createResult(3)))
      .mockResolvedValueOnce(malformedEvidence instanceof Response ? malformedEvidence : response(malformedEvidence))
      .mockResolvedValueOnce(response(savedEvidence));
    render(<PrecalculusTopic14PolynomialExtremaPracticePilot />);
    fillAnswers();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    expect(screen.getByText('Server score: 3/3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: createResult().submissionId,
    });
  });
});
