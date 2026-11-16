import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { realZerosAndMultiplicitiesSchema } from '@math-platform/math-content';
import { generateTopic15RealZerosAndMultiplicitiesOutput } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import {
  PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot,
  type PrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState,
} from '@/components/student/PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(1);
const independentOutput = generateTopic15RealZerosAndMultiplicitiesOutput(2);
const guidedProps = realZerosAndMultiplicitiesSchema.parse(guidedOutput.data.rendererProps);
const independentProps = realZerosAndMultiplicitiesSchema.parse(independentOutput.data.rendererProps);
const KNOWLEDGE_STATE: PrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState = {
  nodeId: 'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form',
  title: 'Find real zeros and multiplicities from factored form',
  status: 'in_progress',
  readiness: 'ready',
};

const GUIDED_STEPS = [
  'Identify each factor that can make the function equal zero.',
  'Count the repeated factors for each zero.',
];
const FIELD_HELP = 'List the zeros in ascending order and give the multiplicity of each zero.';
const PRACTICE_ERROR = 'Unable to save the Topic 1.5 real zeros and multiplicities practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-5-real-zeros-and-multiplicities',
  score: 2,
  maxScore: 2,
  attemptOrdinal: 1,
  feedback: '2/2 real-zero and multiplicity responses matched the server rubric.',
} as const;
const EVIDENCE_SAVED = {
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
} as const;
const EVIDENCE_AWAITING = {
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
} as const;
const EVIDENCE_MASTERED = {
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
} as const;
const EVIDENCE_REPLAY = {
  ...EVIDENCE_MASTERED,
  delivery: 'replay',
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'new' },
} as const;
const EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY = {
  ...EVIDENCE_MASTERED,
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'replay' },
} as const;

const GUIDED_ANSWERS = {
  a: [
    { zero: -5, multiplicity: 3 },
    { zero: 0, multiplicity: 1 },
    { zero: 5, multiplicity: 2 },
  ],
  b: [
    { zero: 0, multiplicity: 2 },
    { zero: 5, multiplicity: 1 },
  ],
} as const;

const INDEPENDENT_ANSWERS = {
  a: [
    { zero: -2, multiplicity: 2 },
    { zero: 0, multiplicity: 2 },
    { zero: 4, multiplicity: 2 },
  ],
  b: [
    { zero: -3, multiplicity: 2 },
    { zero: 3, multiplicity: 3 },
  ],
} as const;

const AUTHORITY_KEYS = [
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
] as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
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
    expect(AUTHORITY_KEYS).not.toContain(key);
    expectNoAuthority(child);
  }
}

function fillPairs(
  answers: { a: readonly { zero: number; multiplicity: number }[]; b: readonly { zero: number; multiplicity: number }[] },
  addThirdRowForF = false,
): void {
  if (addThirdRowForF) fireEvent.click(screen.getByRole('button', { name: 'Add third row for f' }));
  for (const item of ['a', 'b'] as const) {
    const functionName = item === 'a' ? 'f' : 'g';
    answers[item].forEach((pair, index) => {
      fireEvent.change(screen.getByLabelText(`Zero for ${functionName} pair ${index + 1}`), {
        target: { value: String(pair.zero) },
      });
      fireEvent.change(screen.getByLabelText(`Multiplicity for ${functionName} pair ${index + 1}`), {
        target: { value: String(pair.multiplicity) },
      });
    });
  }
}

describe('PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the exact optional knowledge state when provided', () => {
    render(
      <PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot knowledgeState={KNOWLEDGE_STATE} />,
    );

    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
  });

  it('omits the knowledge-state block when no state is provided', () => {
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);

    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('renders Guided seed 1 and creates the exact raw practice envelope', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Real Zeros and Multiplicities' })).toBeTruthy();
    expect(screen.getByText(guidedProps.prompt)).toBeTruthy();
    expect(screen.getByLabelText('f(x) = 3(x+5)^3x(x-5)^2')).toBeTruthy();
    expect(screen.getByLabelText('g(x) = -x^2(x-5)')).toBeTruthy();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expectNoAuthority(guidedProps);

    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit).toBeDisabled();
    fillPairs(GUIDED_ANSWERS, true);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(10);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(screen.getByText('Your practice was saved.')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    const init = call[1] as RequestInit;
    expect(init.method).toBe('POST');
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
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toStrictEqual(GUIDED_ANSWERS);
    expect(envelope.parts).toStrictEqual([
      { partId: 'a', rawAnswer: GUIDED_ANSWERS.a },
      { partId: 'b', rawAnswer: GUIDED_ANSWERS.b },
    ]);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(requestBody(fetchMock.mock.calls[1] as unknown[]));
  });

  it('renders Independent seed 2 without guidance and creates its exact raw practice envelope', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_AWAITING));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Real Zeros and Multiplicities' })).toBeTruthy();
    expect(screen.getByText(independentProps.prompt)).toBeTruthy();
    expect(screen.getByLabelText('f(x) = 4(x+2)^2x^2(x-4)^2')).toBeTruthy();
    expect(screen.getByLabelText('g(x) = (x+3)^2(x-3)^3')).toBeTruthy();
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expectNoAuthority(independentProps);

    const submit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(submit).toBeDisabled();
    fillPairs(INDEPENDENT_ANSWERS, true);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(screen.getByText('Complete this skill with your teacher before using Mastery Advantage.')).toBeTruthy();
    const envelope = requestBody(fetchMock.mock.calls[0] as unknown[]);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(envelope.answers).toStrictEqual(INDEPENDENT_ANSWERS);
    expect(envelope.parts).toStrictEqual([
      { partId: 'a', rawAnswer: INDEPENDENT_ANSWERS.a },
      { partId: 'b', rawAnswer: INDEPENDENT_ANSWERS.b },
    ]);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('retries a failed create with the identical body and key', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: 'private detail' }, 500))
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private detail');
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = (firstCall[1] as RequestInit).body;
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
  });

  it('blocks duplicate clicks while create is in flight', async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveCreate(response(SERVER_RESULT));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('blocks duplicate clicks while evidence is in flight', async () => {
    let resolveEvidence!: (value: Response) => void;
    const pendingEvidence = new Promise<Response>((resolve) => { resolveEvidence = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockReturnValueOnce(pendingEvidence);
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolveEvidence(response(EVIDENCE_SAVED));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows mastery after a valid evidence response and accepts replay delivery', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_REPLAY));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('retries evidence only after delivery failure and preserves the opaque submission', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private evidence detail');
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
    const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
    const retry = screen.getByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(retry);

    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(requestBody(fetchMock.mock.calls[2] as unknown[]));
  });

  it.each([
    ['non-OK response', response({ error: 'private detail' }, 500)],
    ['invalid JSON', new Response('{', { status: 200 })],
    ['non-object result', response([])],
    ['extra result field', response({ ...SERVER_RESULT, hidden: true })],
    ['missing result field', response({ ...SERVER_RESULT, feedback: undefined })],
    ['blank submission ID', response({ ...SERVER_RESULT, submissionId: ' ' })],
    ['non-string submission ID', response({ ...SERVER_RESULT, submissionId: 1 })],
    ['invalid score', response({ ...SERVER_RESULT, score: 3 })],
    ['fractional score', response({ ...SERVER_RESULT, score: 1.5 })],
    ['invalid max score', response({ ...SERVER_RESULT, maxScore: 1 })],
    ['invalid ordinal', response({ ...SERVER_RESULT, attemptOrdinal: 0 })],
    ['fractional ordinal', response({ ...SERVER_RESULT, attemptOrdinal: 1.5 })],
    ['invalid feedback', response({ ...SERVER_RESULT, feedback: 1 })],
  ] as const)('shows one safe error for %s', async (_label, result) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(result);
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private detail');
    expect(screen.queryByText(/Server score:/)).toBeNull();
    const retry = screen.getByRole('button', { name: 'Retry submission' }) as HTMLButtonElement;
    expect(retry).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['non-object evidence', () => response([])],
    ['invalid evidence JSON', () => new Response('{', { status: 200 })],
    ['extra outer evidence field', () => response({ ...EVIDENCE_SAVED, hidden: true })],
    ['missing outer evidence field', () => response({ ...EVIDENCE_SAVED, persisted: undefined })],
    ['wrong outer boolean type', () => response({ ...EVIDENCE_SAVED, persisted: 'true' })],
    ['extra decision field', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, hidden: true } })],
    ['missing decision field', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, reason: undefined } })],
    ['wrong decision boolean type', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, eligible: 'false' } })],
    ['unknown reason', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, reason: 'private' } })],
    ['unknown exposure state', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, exposureState: 'unknown' } })],
    ['unknown idempotency', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, idempotency: 'unknown' } })],
    ['unknown delivery', () => response({ ...EVIDENCE_SAVED, delivery: 'unknown' })],
    ['non-OK evidence response', () => response({ error: 'private evidence detail' }, 500)],
  ] as const)('keeps the opaque submission for %s and retries evidence only', async (_label, makeEvidenceResponse) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(makeEvidenceResponse())
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private evidence detail');
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(screen.queryByText(/Your practice was saved\./)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expect(requestBody(fetchMock.mock.calls[2] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(requestBody(fetchMock.mock.calls[1] as unknown[]));
    expectNoAuthority(requestBody(fetchMock.mock.calls[2] as unknown[]));
  });

  it('uses only the create and evidence URLs and does not send authority', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(INDEPENDENT_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([CREATE_URL, EVIDENCE_URL]);
    for (const call of fetchMock.mock.calls) expectNoAuthority(requestBody(call as unknown[]));
  });

  it('accepts a new delivery with replay idempotency independently', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY));
    render(<PrecalculusTopic15RealZerosAndMultiplicitiesPracticePilot />);
    fillPairs(GUIDED_ANSWERS, true);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(requestBody(fetchMock.mock.calls[1] as unknown[])).toStrictEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });
});
