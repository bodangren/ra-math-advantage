import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { generateTopic13ConcavityFromRateChange } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic13ConcavityPracticePilot } from '@/components/student/PrecalculusTopic13ConcavityPracticePilot';
import {
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedVariant = generateTopic13ConcavityFromRateChange(1);
const independentVariant = generateTopic13ConcavityFromRateChange(2);
const GUIDED_STEPS = [
  'Check whether the input widths are equal.',
  'Find the first differences.',
  'Decide whether the first differences increase, decrease, or reverse direction.',
  "Classify the function's concavity.",
];
const FIELD_HELP = 'Increasing first differences indicate concave up. Decreasing first differences indicate concave down.';
const CREATE_URL = '/api/activities/precalculus-topic-1-3-concavity/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  title: 'Determine concavity from rate-of-change behavior',
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

function assertTable(variant: typeof guidedVariant): void {
  const table = screen.getByRole('table', { name: `${variant.functionName}(x) values` });
  const rows = within(table).getAllByRole('row');
  expect(rows).toHaveLength(2);
  const formatValue = (value: number) => Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  expect(rows[0]?.textContent).toBe(`x${variant.xValues.map(formatValue).join('')}`);
  expect(rows[1]?.textContent).toBe(`${variant.functionName}(x)${variant.yValues.map(formatValue).join('')}`);
}

function choose(label: string): void {
  fireEvent.click(screen.getByRole('radio', { name: label }));
}

function expectNoAuthority(value: unknown): void {
  const keys = new Set<string>();
  const collect = (current: unknown) => {
    if (Array.isArray(current)) {
      current.forEach(collect);
      return;
    }
    if (!current || typeof current !== 'object') return;
    Object.entries(current).forEach(([key, child]) => {
      keys.add(key);
      collect(child);
    });
  };
  collect(value);
  for (const key of [
    'correctClassification',
    'correctAnswer',
    'answerKey',
    'authority',
    'hidden',
    'expectedAnswer',
    'gradingMetadata',
    'solutionSteps',
    'steps',
    'finalAnswer',
    'isCorrect',
    'correctness',
    'score',
    'maxScore',
    'differences',
    'secondDifferences',
    'vertexX',
    'solution',
  ]) expect(keys).not.toContain(key);
}

function createResult(submissionId = 'activity_submissions:concavity-practice', score = 1) {
  return {
    submissionId,
    score,
    maxScore: 1,
    attemptOrdinal: 1,
    feedback: `${score}/1 concavity classifications matched the server rubric.`,
  };
}

describe('PrecalculusTopic13ConcavityPracticePilot', () => {
  it('renders Guided seed 1, bounded state, and the exact raw two-stage flow', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:concavity-guided')))
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Determine Concavity' })).toBeTruthy();
    expect(screen.getByText(guidedVariant.prompt)).toBeTruthy();
    assertTable(guidedVariant);
    expectNoAuthority(guidedVariant);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();
    choose('Concave down');
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 concavity classifications matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe(CREATE_URL);
    const createInit = createCall[1] as RequestInit;
    expect(new Headers(createInit.headers).get('content-type')).toBe('application/json');
    const key = new Headers(createInit.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
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
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.status).toBe('submitted');
    expect(envelope.answers).toStrictEqual({ classification: 'concave_down' });
    expect(envelope.parts).toStrictEqual([{ partId: 'classification', rawAnswer: 'concave_down' }]);
    expect(typeof envelope.attemptNumber).toBe('number');
    expect(Number(envelope.attemptNumber)).toBeGreaterThan(0);
    expect(typeof envelope.submittedAt).toBe('string');
    expect(Number.isFinite(Date.parse(String(envelope.submittedAt)))).toBe(true);
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthority(envelope);

    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: 'activity_submissions:concavity-guided',
    });
  });

  it('uses Independent seed 2 with no Guided or Worked content and shows a server zero score', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:concavity-independent', 0)))
      .mockResolvedValueOnce(response(awaitingEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Determine Concavity' })).toBeTruthy();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
    assertTable(independentVariant);
    expectNoAuthority(independentVariant);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(/The first differences/)).toBeNull();
    expect(screen.queryByText(/concave up\./)).toBeNull();
    expect(screen.queryByText(/correctClassification|expectedAnswer|gradingMetadata|solutionSteps|finalAnswer/i)).toBeNull();

    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();
    choose('Neither');
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');
    const envelope = requestBody(fetchMock.mock.calls[0] as unknown[]);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(envelope.answers).toStrictEqual({ classification: 'neither' });
    expect(envelope.parts).toStrictEqual([{ partId: 'classification', rawAnswer: 'neither' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(envelope)).not.toThrow();
    expectNoAuthority(envelope);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
  });

  it('keeps the default Guided mode and omits the optional state display', () => {
    render(<PrecalculusTopic13ConcavityPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Determine Concavity' })).toBeTruthy();
    expect(screen.queryByText(/Mastery state:/)).toBeNull();
    expect(screen.queryByText(/Readiness:/)).toBeNull();
  });

  it('retries create with the same body and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'temporary private detail' }, 500))
      .mockResolvedValueOnce(response(createResult('activity_submissions:concavity-retry')))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response({ ...awaitingEvidence, delivery: 'replay', decision: { ...awaitingEvidence.decision, idempotency: 'replay' } }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot />);
    choose('Concave up');
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('button', { name: 'Retry submission' });

    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');
    const firstBody = (firstCall[1] as RequestInit).body;
    expect(JSON.stringify(firstCall)).not.toContain('temporary private detail');
    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: 'activity_submissions:concavity-retry',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher'));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toStrictEqual({
      submissionId: 'activity_submissions:concavity-retry',
    });
  });

  it('blocks duplicate clicks while create is saving', async () => {
    let resolveCreate!: (value: Response) => void;
    const createResponse = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValueOnce(response(eligibleEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot />);
    choose('Concave up');
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveCreate(response(createResult('activity_submissions:concavity-duplicate')));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['malformed JSON', malformedJsonResponse()],
    ['non-object JSON', response(['submission'])],
    ['extra create result field', response({ ...createResult(), internal: 'private' })],
    ['blank submission ID', response({ ...createResult(), submissionId: ' ' })],
    ['invalid score', response({ ...createResult(), score: 2 })],
    ['invalid max score', response({ ...createResult(), maxScore: 2 })],
    ['invalid attempt ordinal', response({ ...createResult(), attemptOrdinal: 0 })],
    ['blank feedback', response({ ...createResult(), feedback: ' ' })],
  ])('blocks evidence and shows a safe retry for invalid create result: %s', async (_label, createResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot />);
    choose('Concave up');
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to save the Topic 1.3 concavity practice.',
    );
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('private');
  });

  it.each([
    ['malformed JSON', malformedJsonResponse()],
    ['extra evidence field', response({ ...eligibleEvidence, internal: 'private' })],
    ['wrong boolean type', response({ ...eligibleEvidence, masteryApplied: 'yes' })],
    ['missing decision field', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: undefined } })],
    ['unknown reason', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, reason: 'unknown' } })],
    ['unknown exposure state', response({ ...eligibleEvidence, decision: { ...eligibleEvidence.decision, exposureState: 'pending' } })],
    ['invalid delivery value', response({ ...eligibleEvidence, delivery: 'invalid' })],
    ['non-OK response', response({ error: 'private evidence detail' }, 500)],
  ])('keeps the opaque submission and retries only evidence for invalid evidence: %s', async (_label, evidenceResponse) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(createResult('activity_submissions:concavity-evidence-retry')))
      .mockResolvedValueOnce(evidenceResponse)
      .mockResolvedValueOnce(response(awaitingEvidence));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityPracticePilot />);
    choose('Concave up');
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: 'activity_submissions:concavity-evidence-retry',
    });
    expect(JSON.stringify(fetchMock.mock.calls[1])).not.toContain('private evidence detail');
  });
});
