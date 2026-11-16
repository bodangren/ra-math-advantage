import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { polynomialEndBehaviorSchema } from '@math-platform/math-content';
import { generateTopic14PolynomialEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic14PolynomialEndBehaviorPracticePilot } from '@/components/student/PrecalculusTopic14PolynomialEndBehaviorPracticePilot';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const guidedOutput = generateTopic14PolynomialEndBehaviorOutput(1);
const independentOutput = generateTopic14PolynomialEndBehaviorOutput(2);
const guidedProps = polynomialEndBehaviorSchema.parse(guidedOutput.data.rendererProps);
const independentProps = polynomialEndBehaviorSchema.parse(independentOutput.data.rendererProps);
const GUIDED_STEPS = [
  'Identify whether the degree is even or odd.',
  'Identify whether the leading coefficient is positive or negative.',
  'Use the degree parity and leading-coefficient sign to determine both ends.',
];
const FIELD_HELP = 'An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.';
const KNOWLEDGE_STATE = {
  nodeId: 'math.precalc.skill.1.4.determine-end-behavior-from-leading-term',
  title: 'Determine polynomial end behavior from the leading term',
  status: 'in_progress',
  readiness: 'ready',
} as const;
const PRACTICE_ERROR = 'Unable to save the Topic 1.4 polynomial end behavior practice.';
const CREATE_URL = '/api/activities/precalculus-topic-1-4-polynomial-end-behavior/submissions';
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic-1-4-polynomial-end-behavior',
  score: 2,
  maxScore: 2,
  attemptOrdinal: 1,
  feedback: '2/2 polynomial end-behavior responses matched the server rubric.',
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
const EVIDENCE_SAVED = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: false,
    reason: 'teacher_led',
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
const EVIDENCE_REPLAY = {
  ...EVIDENCE_MASTERED,
  delivery: 'replay',
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'replay' },
} as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedAnswers(output: typeof guidedOutput): { leftEnd: string; rightEnd: string } {
  return output.expectedAnswer as { leftEnd: string; rightEnd: string };
}

function leadingTermLabel(props: typeof guidedProps): string {
  const coefficient = props.leadingTerm.coefficient;
  const coefficientText = coefficient === 1 ? '' : coefficient === -1 ? '-' : String(coefficient);
  return `Leading term ${coefficientText}x^${props.leadingTerm.exponent}`;
}

function chooseAnswers(answers: { leftEnd: string; rightEnd: string }): void {
  const groups = screen.getAllByRole('group');
  fireEvent.click(within(groups[0]!).getByLabelText(
    answers.leftEnd === 'positive_infinity' ? 'Positive infinity' : 'Negative infinity',
  ));
  fireEvent.click(within(groups[1]!).getByLabelText(
    answers.rightEnd === 'positive_infinity' ? 'Positive infinity' : 'Negative infinity',
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

describe('PrecalculusTopic14PolynomialEndBehaviorPracticePilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders Guided seed 1 and creates the exact raw practice envelope', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Polynomial End Behavior' })).toBeTruthy();
    expect(screen.getByText(guidedProps.prompt)).toBeTruthy();
    expect(screen.getByLabelText(leadingTermLabel(guidedProps))).toBeTruthy();
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expectNoAuthority(guidedProps);

    const submit = screen.getByRole('button', { name: 'Submit answer' });
    expect(submit).toBeDisabled();
    const answers = expectedAnswers(guidedOutput);
    chooseAnswers(answers);
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy();
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
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_GUIDED_ACTIVITY_ID);
    expect(envelope.mode).toBe('guided_practice');
    expect(envelope.answers).toStrictEqual(answers);
    expect(envelope.parts).toStrictEqual([
      { partId: 'leftEnd', rawAnswer: answers.leftEnd },
      { partId: 'rightEnd', rawAnswer: answers.rightEnd },
    ]);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(JSON.parse(String((evidenceCall[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(JSON.parse(String((evidenceCall[1] as RequestInit).body)));
  });

  it('renders Independent seed 2 without guidance and creates its exact raw envelope', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Polynomial End Behavior' })).toBeTruthy();
    expect(screen.getByText(independentProps.prompt)).toBeTruthy();
    expect(screen.getByLabelText(leadingTermLabel(independentProps))).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expectNoAuthority(independentProps);

    const answers = expectedAnswers(independentOutput);
    chooseAnswers(answers);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Server score: 2/2')).toBeTruthy());

    const call = fetchMock.mock.calls[0] as unknown[];
    const envelope = requestBody(call);
    expect(envelope.activityId).toBe(PRECALCULUS_TOPIC_14_POLYNOMIAL_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID);
    expect(envelope.mode).toBe('independent_practice');
    expect(envelope.answers).toStrictEqual(answers);
    expect(envelope.parts).toStrictEqual([
      { partId: 'leftEnd', rawAnswer: answers.leftEnd },
      { partId: 'rightEnd', rawAnswer: answers.rightEnd },
    ]);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
    expectNoAuthority(envelope);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Your practice was saved.')).toBeTruthy();
    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(JSON.parse(String((evidenceCall[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(JSON.parse(String((evidenceCall[1] as RequestInit).body)));
  });

  it('shows the exact optional knowledge state when provided', () => {
    render(
      <PrecalculusTopic14PolynomialEndBehaviorPracticePilot knowledgeState={KNOWLEDGE_STATE} />,
    );

    expect(screen.getByText(KNOWLEDGE_STATE.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
  });

  it('omits the knowledge-state block when no state is provided', () => {
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);

    expect(screen.queryByText(KNOWLEDGE_STATE.title)).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('retries a failed create with the identical body and key', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: 'private detail' }, 500))
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
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
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('blocks duplicate clicks while create is in flight', async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveCreate(response(SERVER_RESULT));
    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows the awaiting-teacher message after a valid evidence response', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_AWAITING));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Complete this skill with your teacher before using Mastery Advantage.')).toBeTruthy());
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('accepts a valid replay evidence response', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_REPLAY));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
  });

  it('retries evidence only after delivery failure and keeps the opaque submission', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(alert.textContent).not.toContain('private evidence detail');
    const firstEvidenceBody = (fetchMock.mock.calls[1]?.[1] as RequestInit).body;
    const retry = screen.getByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(retry);

    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expect(JSON.parse(String(firstEvidenceBody))).toEqual({ submissionId: SERVER_RESULT.submissionId });
  });

  it.each([
    ['non-object', ['result']],
    ['invalid JSON', new Response('{', { status: 200 })],
    ['extra outer field', { ...EVIDENCE_MASTERED, hidden: true }],
    ['missing outer field', { ...EVIDENCE_MASTERED, persisted: undefined }],
    ['extra decision field', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, hidden: true } }],
    ['missing decision field', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, reason: undefined } }],
    ['wrong outer boolean type', { ...EVIDENCE_MASTERED, persisted: 'true' }],
    ['wrong decision boolean type', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, eligible: 'true' } }],
    ['unknown reason', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, reason: 'unknown' } }],
    ['unknown exposure', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, exposureState: 'unknown' } }],
    ['unknown idempotency', { ...EVIDENCE_MASTERED, decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'conflict' } }],
    ['unknown delivery', { ...EVIDENCE_MASTERED, delivery: 'later' }],
    ['invalid delivery value', { ...EVIDENCE_MASTERED, delivery: 'invalid' }],
    ['non-OK response', response({ error: 'private evidence detail' }, 500)],
  ] as const)('retains the opaque submission for malformed evidence: %s', async (_label, result) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(SERVER_RESULT))
      .mockResolvedValueOnce(result instanceof Response ? result : response(result))
      .mockResolvedValueOnce(response(EVIDENCE_MASTERED));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(screen.getByText('Server score: 2/2')).toBeTruthy();
    expect(screen.getByText(SERVER_RESULT.feedback)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry evidence delivery' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));

    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(fetchMock.mock.calls[2]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expect(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body))).toEqual({
      submissionId: SERVER_RESULT.submissionId,
    });
    expectNoAuthority(JSON.parse(String((fetchMock.mock.calls[1]?.[1] as RequestInit).body)));
    expectNoAuthority(JSON.parse(String((fetchMock.mock.calls[2]?.[1] as RequestInit).body)));
  });

  it.each([
    ['non-OK response', response({ error: 'private detail' }, 500)],
    ['invalid JSON response', new Response('{', { status: 200 })],
    ['non-object result', ['result']],
    ['extra result field', { ...SERVER_RESULT, hidden: true }],
    ['missing result field', { ...SERVER_RESULT, feedback: undefined }],
    ['blank submission ID', { ...SERVER_RESULT, submissionId: ' ' }],
    ['invalid score', { ...SERVER_RESULT, score: 3 }],
    ['fractional score', { ...SERVER_RESULT, score: 1.5 }],
    ['invalid maximum', { ...SERVER_RESULT, maxScore: 1 }],
    ['invalid ordinal', { ...SERVER_RESULT, attemptOrdinal: 0 }],
    ['blank feedback', { ...SERVER_RESULT, feedback: ' ' }],
  ] as const)('fails safely for %s without exposing private data', async (_label, result) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(result instanceof Response ? result : response(result));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private detail');
    expect(screen.queryByText(/Server score:/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('fails safely when create rejects', async () => {
    const fetchMock = vi.mocked(fetch).mockRejectedValueOnce(new Error('private fetch detail'));
    render(<PrecalculusTopic14PolynomialEndBehaviorPracticePilot />);
    chooseAnswers(expectedAnswers(guidedOutput));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private fetch detail');
    expect(screen.queryByText(/Server score:/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
