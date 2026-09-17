import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { generateTopic13RatePatternClassification } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic13RatePatternClassificationPracticePilot } from '@/components/student/PrecalculusTopic13RatePatternClassificationPracticePilot';
import {
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedVariant = generateTopic13RatePatternClassification(1);
const independentVariant = generateTopic13RatePatternClassification(2);
const GUIDED_STEPS = [
  'Find each input width.',
  'Divide each output change by its input width.',
  'Compare the average rates and their second divided differences.',
  'Classify each function.',
];
const FIELD_HELP = 'Compute average rates using the actual input widths. Equal first divided differences fit a line. Equal nonzero second divided differences fit a quadratic.';
const WORKED_FINAL_ANSWER = 'a) quadratic; b) linear; c) quadratic.';
const CREATE_URL = '/api/activities/precalculus-topic-1-3-rate-pattern-classification/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
  title: 'Classify linear vs quadratic from rate patterns',
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

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function malformedJsonResponse(): Response {
  return new Response('{', { status: 200, headers: { 'content-type': 'application/json' } });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function assertTables(cases: readonly { id: string; functionName: string; xValues: readonly number[]; yValues: readonly number[] }[]): void {
  const formatValue = (value: number) => Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  const tables = screen.getAllByRole('table');
  expect(tables).toHaveLength(3);
  for (const tableCase of cases) {
    const table = screen.getByRole('table', { name: `Case ${tableCase.id}: ${tableCase.functionName}` });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toBe(`x${tableCase.xValues.map(formatValue).join('')}`);
    expect(rows[1]?.textContent).toBe(`${tableCase.functionName}(x)${tableCase.yValues.map(formatValue).join('')}`);
  }
}

function chooseClassification(caseId: 'a' | 'b' | 'c', label: string): void {
  fireEvent.click(within(screen.getByRole('group', { name: `Classify case ${caseId}` })).getByRole('radio', { name: label }));
}

function classificationLabel(value: string): string {
  return value === 'cannot_determine'
    ? 'Cannot determine'
    : value[0]!.toUpperCase() + value.slice(1);
}

function chooseAnswers(answers: Record<'a' | 'b' | 'c', string>): void {
  for (const caseId of ['a', 'b', 'c'] as const) chooseClassification(caseId, classificationLabel(answers[caseId]));
}

function createResult(
  submissionId = 'activity_submissions:rate-pattern-practice',
  score = 3,
) {
  return {
    submissionId,
    score,
    maxScore: 3,
    attemptOrdinal: 1,
    feedback: `${score}/3 rate-pattern classifications matched the server rubric.`,
  };
}

function expectNoAuthority(value: unknown): void {
  const serialized = JSON.stringify(value);
  for (const key of [
    'correctClassifications',
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
    'differences',
    'secondDifferences',
    'classification',
    'correctClassification',
    'score',
    'maxScore',
    'vertexX',
    'relationship',
    'solution',
  ]) {
    expect(serialized).not.toContain(`"${key}"`);
  }
}

describe('PrecalculusTopic13RatePatternClassificationPracticePilot', () => {
  it('renders Guided seed 1, state, and the exact raw two-stage submission flow', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:rate-pattern-guided')))
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Classify Rate Patterns' })).toBeTruthy();
    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getByText(guidedVariant.prompt)).toBeTruthy();
    assertTables(guidedVariant.cases);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expect(screen.getAllByRole('group')).toHaveLength(3);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();
    expectNoAuthority(guidedVariant);
    expect(screen.queryByText(/correctClassifications|expectedAnswer|gradingMetadata|solutionSteps|finalAnswer|vertexX/i)).toBeNull();

    chooseAnswers({ a: 'linear', b: 'quadratic', c: 'neither' });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 3/3')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('3/3 rate-pattern classifications matched the server rubric.');
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
    expect(envelope).toStrictEqual({
      contractVersion: 'practice.v1',
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: expect.any(Number),
      submittedAt: expect.any(String),
      answers: { a: 'linear', b: 'quadratic', c: 'neither' },
      parts: [
        { partId: 'a', rawAnswer: 'linear' },
        { partId: 'b', rawAnswer: 'quadratic' },
        { partId: 'c', rawAnswer: 'neither' },
      ],
    });
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthority(envelope);

    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe(EVIDENCE_URL);
    expect(requestBody(evidenceCall)).toStrictEqual({ submissionId: 'activity_submissions:rate-pattern-guided' });
    expect(Object.keys(requestBody(evidenceCall))).toEqual(['submissionId']);
  });

  it('uses Independent seed 2 with no Guided or Worked content and preserves a raw zero score', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:rate-pattern-independent', 0)))
      .mockResolvedValueOnce(response(awaitingEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Classify Rate Patterns' })).toBeTruthy();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
    assertTables(independentVariant.cases);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(WORKED_FINAL_ANSWER)).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expectNoAuthority(independentVariant);

    const answers = { a: 'linear', b: 'quadratic', c: 'neither' } as const;
    chooseAnswers(answers);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Server score: 0/3')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('0/3 rate-pattern classifications matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');

    const createCall = fetchMock.mock.calls[0] as unknown[];
    const envelope = requestBody(createCall);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(envelope.answers).toEqual(answers);
    expect(envelope.parts).toEqual([
      { partId: 'a', rawAnswer: 'linear' },
      { partId: 'b', rawAnswer: 'quadratic' },
      { partId: 'c', rawAnswer: 'neither' },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthority(envelope);
  });

  it('keeps the default Guided mode and omits the optional knowledge state', () => {
    render(<PrecalculusTopic13RatePatternClassificationPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Classify Rate Patterns' })).toBeTruthy();
    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('retries the same create body and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response(createResult('activity_submissions:rate-pattern-retry')))
      .mockResolvedValueOnce(response({ error: 'evidence failed' }, 500))
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot />);
    chooseAnswers({ a: 'linear', b: 'quadratic', c: 'neither' });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
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
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toStrictEqual({ submissionId: 'activity_submissions:rate-pattern-retry' });
  });

  it('blocks duplicate clicks while the create request is saving', async () => {
    let resolveCreate!: (value: Response) => void;
    const createResponse = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot />);
    chooseAnswers({ a: 'linear', b: 'quadratic', c: 'neither' });
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(createResult('activity_submissions:rate-pattern-duplicate')));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['HTTP error', response({ error: 'private detail' }, 500)],
    ['non-object JSON', response(['submission-id'])],
    ['malformed JSON', malformedJsonResponse()],
    ['blank submission ID', response({ submissionId: ' ', score: 3, maxScore: 3, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid score', response({ submissionId: 'submission', score: 4, maxScore: 3, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid max score', response({ submissionId: 'submission', score: 3, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback' })],
    ['invalid attempt ordinal', response({ submissionId: 'submission', score: 3, maxScore: 3, attemptOrdinal: 0, feedback: 'feedback' })],
    ['blank feedback', response({ submissionId: 'submission', score: 3, maxScore: 3, attemptOrdinal: 1, feedback: ' ' })],
    ['extra result field', response({ ...createResult(), answer: 'quadratic' })],
  ])('blocks evidence and shows a safe retry for malformed create result: %s', async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot />);
    chooseAnswers({ a: 'linear', b: 'quadratic', c: 'neither' });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.3 rate-pattern classification practice.');
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
      .mockResolvedValueOnce(response(createResult('activity_submissions:rate-pattern-evidence-retry')))
      .mockResolvedValueOnce(malformedEvidence instanceof Response ? malformedEvidence : response(malformedEvidence))
      .mockResolvedValueOnce(response(savedEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13RatePatternClassificationPracticePilot />);
    chooseAnswers({ a: 'linear', b: 'quadratic', c: 'neither' });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({ submissionId: 'activity_submissions:rate-pattern-evidence-retry' });
  });
});
