import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic15PolynomialInequalityOutput } from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import {
  PrecalculusTopic15PolynomialInequalityPracticePilot,
  type PrecalculusTopic15PolynomialInequalityKnowledgeState,
} from '@/components/student/PrecalculusTopic15PolynomialInequalityPracticePilot';
import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const GUIDED_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID;
const KNOWLEDGE_STATE: PrecalculusTopic15PolynomialInequalityKnowledgeState = {
  nodeId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_NODE_ID,
  title: 'Solve polynomial inequalities using sign charts',
  status: 'in_progress',
  readiness: 'ready',
};
const CREATE_URL = '/api/activities/precalculus-topic-1-5-polynomial-inequality/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const PRACTICE_ERROR = 'Unable to save the Topic 1.5 polynomial inequality practice.';
const IDEMPOTENCY_KEY = 'c15a-test-idempotency-key';
const GUIDED_STEPS = [
  'Find and sort the distinct real roots.',
  'Test one value in each interval and record the sign.',
  'Use the inequality operator to write the interval union.',
];
const GUIDED_HELP = {
  roots: 'Enter the sorted distinct real roots.',
  intervalSigns: 'Enter one sign for each interval from left to right.',
  solution: 'Write the solution as an interval union.',
};
type Mode = 'guided_practice' | 'independent_practice';
type Sign = '+' | '-';
type Answers = { roots: number[]; intervalSigns: Sign[]; solution: string };

const GUIDED_ANSWERS: Answers = {
  roots: [5, -2.5],
  intervalSigns: ['-', '-', '+'],
  solution: '  (-∞, 5]  ',
};
const INDEPENDENT_ANSWERS: Answers = {
  roots: [2, 1, -3],
  intervalSigns: ['-', '-', '-', '+'],
  solution: ' (1.0, 2) U (-infinity, -3) ',
};
const PARTIAL_RESULT = {
  submissionId: 'activity_submissions:topic-1-5-polynomial-inequality',
  score: 2,
  maxScore: 3,
  attemptOrdinal: 1,
  feedback: '2/3 polynomial-inequality-sign-chart response matched the server rubric.',
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
    reason: 'node_not_enabled',
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
const EVIDENCE_AWAITING_BY_REASON = {
  ...EVIDENCE_SAVED,
  decision: { ...EVIDENCE_SAVED.decision, reason: 'awaiting_teacher_exposure' },
} as const;
const EVIDENCE_AWAITING_BY_EXPOSURE = {
  ...EVIDENCE_SAVED,
  decision: { ...EVIDENCE_SAVED.decision, exposureState: 'awaiting_teacher_exposure' },
} as const;
const EVIDENCE_REPLAY_WITH_NEW_IDEMPOTENCY = {
  ...EVIDENCE_MASTERED,
  delivery: 'replay',
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'new' },
} as const;
const EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY = {
  ...EVIDENCE_MASTERED,
  decision: { ...EVIDENCE_MASTERED.decision, idempotency: 'replay' },
} as const;
const AUTHORITY_KEYS = new Set([
  'answer',
  'answerkey',
  'correctanswer',
  'correctanswers',
  'expectedanswer',
  'grading',
  'gradingmetadata',
  'normalizedanswer',
  'solutionsteps',
  'steps',
  'finalanswer',
  'authority',
  'iscorrect',
  'correctness',
  'score',
  'maxscore',
]);

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectNoAuthority(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(expectNoAuthority);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    expect(AUTHORITY_KEYS).not.toContain(key.toLowerCase());
    expectNoAuthority(child);
  }
}

function expectNoAuthorityAttributes(): void {
  const attributes = Array.from(document.body.querySelectorAll('*'))
    .flatMap((element) => element.getAttributeNames().map((name) => name.toLowerCase()));
  for (const attribute of attributes) expect(AUTHORITY_KEYS).not.toContain(attribute);
}

function renderPractice(mode: Mode) {
  return mode === 'guided_practice'
    ? render(<PrecalculusTopic15PolynomialInequalityPracticePilot />)
    : render(<PrecalculusTopic15PolynomialInequalityPracticePilot mode={mode} />);
}

function fillPractice(answers: Answers): void {
  const roots = screen.getAllByRole('spinbutton') as HTMLInputElement[];
  const signs = screen.getAllByRole('combobox') as HTMLSelectElement[];
  expect(roots).toHaveLength(answers.roots.length);
  expect(signs).toHaveLength(answers.intervalSigns.length);
  for (const [index, value] of answers.roots.entries()) {
    fireEvent.change(roots[index]!, { target: { value: String(value) } });
  }
  for (const [index, value] of answers.intervalSigns.entries()) {
    fireEvent.change(signs[index]!, { target: { value } });
  }
  fireEvent.change(screen.getByRole('textbox', { name: 'Solution interval union' }), {
    target: { value: answers.solution },
  });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function expectEvidenceCall(call: unknown[], submissionId: string): void {
  expect(call[0]).toBe(EVIDENCE_URL);
  const init = call[1] as RequestInit;
  expect(init.method).toBe('POST');
  expect(new Headers(init.headers).get('content-type')).toBe('application/json');
  const body = requestBody(call);
  expect(body).toStrictEqual({ submissionId });
  expect(body).not.toHaveProperty('activityId');
  expect(body).not.toHaveProperty('nodeId');
  expect(body).not.toHaveProperty('mode');
  expect(body).not.toHaveProperty('answers');
  expect(body).not.toHaveProperty('rawAnswer');
  expect(body).not.toHaveProperty('score');
  expect(body).not.toHaveProperty('idempotencyKey');
  expectNoAuthority(body);
}

function expectEnvelope(call: unknown[], activityId: string, mode: Mode, answers: Answers): void {
  const body = requestBody(call);
  expect(Object.keys(body).sort()).toEqual([
    'activityId',
    'answers',
    'attemptNumber',
    'contractVersion',
    'mode',
    'parts',
    'status',
    'submittedAt',
  ]);
  expect(body).toStrictEqual({
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers,
    parts: [
      { partId: 'roots', rawAnswer: answers.roots },
      { partId: 'intervalSigns', rawAnswer: answers.intervalSigns },
      { partId: 'solution', rawAnswer: answers.solution },
    ],
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(body).success).toBe(true);
  expect(Number.isFinite(Date.parse(String(body.submittedAt)))).toBe(true);
  expectNoAuthority(body);
}

describe('PrecalculusTopic15PolynomialInequalityPracticePilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(IDEMPOTENCY_KEY);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the exact optional knowledge state block', () => {
    render(
      <PrecalculusTopic15PolynomialInequalityPracticePilot knowledgeState={KNOWLEDGE_STATE} />,
    );

    expect(screen.getByText('Solve polynomial inequalities using sign charts')).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Guided Practice: Polynomial Inequality Sign Chart' })).toBeTruthy();
  });

  it('omits the knowledge state block when the prop is absent', () => {
    render(<PrecalculusTopic15PolynomialInequalityPracticePilot />);

    expect(screen.queryByText('Solve polynomial inequalities using sign charts')).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Guided Practice: Polynomial Inequality Sign Chart' })).toBeTruthy();
  });

  it('renders Guided seed 1 with exact source props and help', () => {
    const output = generateTopic15PolynomialInequalityOutput(1);
    const rendererProps = output.data.rendererProps as { expression: string; operator: string };
    renderPractice('guided_practice');

    expect(screen.getByRole('heading', { name: 'Guided Practice: Polynomial Inequality Sign Chart' })).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.getByText(`${rendererProps.expression} ${rendererProps.operator} 0`, { exact: true })).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    for (const help of Object.values(GUIDED_HELP)) expect(screen.getByText(help)).toBeTruthy();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expectNoAuthorityAttributes();
    expect(document.body.textContent ?? '').not.toContain('correctAnswer');
    expect(document.body.textContent ?? '').not.toContain('expectedAnswer');
    expect(document.body.textContent ?? '').not.toContain(output.expectedAnswer.solution);
  });

  it('renders Independent seed 2 without Guided help or answer authority', () => {
    const output = generateTopic15PolynomialInequalityOutput(2);
    const rendererProps = output.data.rendererProps as { expression: string; operator: string };
    renderPractice('independent_practice');

    expect(screen.getByRole('heading', { name: 'Independent Practice: Polynomial Inequality Sign Chart' })).toBeTruthy();
    expect(screen.getByText(output.prompt)).toBeTruthy();
    expect(screen.getByText(`${rendererProps.expression} ${rendererProps.operator} 0`, { exact: true })).toBeTruthy();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    for (const help of Object.values(GUIDED_HELP)) expect(screen.queryByText(help)).toBeNull();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
    expect(screen.getAllByRole('combobox')).toHaveLength(4);
    expectNoAuthorityAttributes();
    expect(document.body.textContent ?? '').not.toContain('correctAnswer');
    expect(document.body.textContent ?? '').not.toContain('expectedAnswer');
    expect(document.body.textContent ?? '').not.toContain(output.expectedAnswer.solution);
  });

  it.each([
    ['Guided fractional raw answer', 'guided_practice', GUIDED_ID, GUIDED_ANSWERS],
    ['Independent raw answer', 'independent_practice', INDEPENDENT_ID, INDEPENDENT_ANSWERS],
  ] as const)('submits the exact %s envelope and preserves raw values', async (_label, mode, activityId, answers) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice(mode);
    fillPractice(answers);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    expect(document.body.textContent ?? '').not.toContain(PARTIAL_RESULT.submissionId);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    expect((call[1] as RequestInit).method).toBe('POST');
    const headers = new Headers((call[1] as RequestInit).headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toBe(IDEMPOTENCY_KEY);
    expectEnvelope(call, activityId, mode, answers);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], PARTIAL_RESULT.submissionId);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL]);
  });

  it('retries a failed create with the identical body and idempotency key', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response({ error: 'private create detail' }, 500))
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private create detail');
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = (firstCall[1] as RequestInit).body;
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(document.body.textContent ?? '').not.toContain(PARTIAL_RESULT.submissionId);
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], PARTIAL_RESULT.submissionId);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, CREATE_URL, EVIDENCE_URL]);
  });

  it.each([
    ['non-object result', () => response([])],
    ['invalid JSON', () => new Response('{', { status: 200 })],
    ['extra result field', () => response({ ...PARTIAL_RESULT, hidden: true })],
    ['missing result field', () => response(Object.fromEntries(Object.entries(PARTIAL_RESULT).filter(([key]) => key !== 'feedback')))],
    ['blank submission ID', () => response({ ...PARTIAL_RESULT, submissionId: ' ' })],
    ['non-string submission ID', () => response({ ...PARTIAL_RESULT, submissionId: 1 })],
    ['negative score', () => response({ ...PARTIAL_RESULT, score: -1 })],
    ['fractional score', () => response({ ...PARTIAL_RESULT, score: 1.5 })],
    ['unsafe score', () => response({ ...PARTIAL_RESULT, score: Number.MAX_SAFE_INTEGER + 1 })],
    ['score above maximum', () => response({ ...PARTIAL_RESULT, score: 4 })],
    ['invalid max score', () => response({ ...PARTIAL_RESULT, maxScore: 2 })],
    ['zero ordinal', () => response({ ...PARTIAL_RESULT, attemptOrdinal: 0 })],
    ['fractional ordinal', () => response({ ...PARTIAL_RESULT, attemptOrdinal: 1.5 })],
    ['unsafe ordinal', () => response({ ...PARTIAL_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 })],
    ['non-string ordinal', () => response({ ...PARTIAL_RESULT, attemptOrdinal: '1' })],
    ['blank feedback', () => response({ ...PARTIAL_RESULT, feedback: ' ' })],
    ['non-string feedback', () => response({ ...PARTIAL_RESULT, feedback: 1 })],
  ] as const)('shows one safe error for malformed result: %s', async (_label, makeResponse) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse());
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private');
    expect(screen.queryByText(/Server score:/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls.some((entry) => entry[0] === EVIDENCE_URL)).toBe(false);
  });

  it('blocks duplicate create calls while pending and after save', async () => {
    let resolveCreate!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response(PARTIAL_RESULT));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('blocks duplicate evidence calls while evidence is pending and after save', async () => {
    let resolveEvidence!: (value: Response) => void;
    const pendingEvidence = new Promise<Response>((resolve) => { resolveEvidence = resolve; });
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockReturnValueOnce(pendingEvidence);
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    resolveEvidence(response(EVIDENCE_SAVED));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it('shows the awaiting-teacher message for a valid evidence response', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response(EVIDENCE_AWAITING));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Complete this skill with your teacher before using Mastery Advantage.')).toBeTruthy());
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it.each([
    ['awaiting reason', EVIDENCE_AWAITING_BY_REASON],
    ['awaiting exposure state', EVIDENCE_AWAITING_BY_EXPOSURE],
  ] as const)('shows the awaiting-teacher message for %s', async (_label, evidenceResult) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response(evidenceResult));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Complete this skill with your teacher before using Mastery Advantage.')).toBeTruthy());
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it.each([
    ['replay delivery with new decision idempotency', EVIDENCE_REPLAY_WITH_NEW_IDEMPOTENCY, INDEPENDENT_ANSWERS],
    ['new delivery with replay decision idempotency', EVIDENCE_NEW_WITH_REPLAY_IDEMPOTENCY, INDEPENDENT_ANSWERS],
  ] as const)('accepts %s as a valid evidence response', async (_label, evidenceResult, answers) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response(evidenceResult));
    renderPractice('independent_practice');
    fillPractice(answers);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Mastery Advantage updated your practice record.')).toBeTruthy());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expectEvidenceCall(fetchMock.mock.calls[1] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it('retries evidence only after delivery failure and preserves the create result', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(response({ error: 'private evidence detail' }, 500))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private evidence detail');
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    expect(document.body.textContent ?? '').not.toContain(PARTIAL_RESULT.submissionId);
    const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
    const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
    expectEvidenceCall(firstEvidenceCall, PARTIAL_RESULT.submissionId);

    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL, EVIDENCE_URL]);
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it('retries evidence after a transport rejection without repeating create', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockRejectedValueOnce(new Error('private transport detail'))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private transport detail');
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    expect(document.body.textContent ?? '').not.toContain(PARTIAL_RESULT.submissionId);
    const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
    const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
    expectEvidenceCall(firstEvidenceCall, PARTIAL_RESULT.submissionId);

    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL, EVIDENCE_URL]);
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], PARTIAL_RESULT.submissionId);
  });

  it.each([
    ['non-object evidence', () => response([])],
    ['invalid evidence JSON', () => new Response('{', { status: 200 })],
    ['extra outer evidence field', () => response({ ...EVIDENCE_SAVED, hidden: true })],
    ['missing outer evidence field', () => response(Object.fromEntries(Object.entries(EVIDENCE_SAVED).filter(([key]) => key !== 'persisted')))],
    ['wrong persisted boolean type', () => response({ ...EVIDENCE_SAVED, persisted: 'true' })],
    ['wrong mastery boolean type', () => response({ ...EVIDENCE_SAVED, masteryApplied: 1 })],
    ['wrong KST boolean type', () => response({ ...EVIDENCE_SAVED, kstApplied: null })],
    ['extra decision field', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, hidden: true } })],
    ['non-record decision', () => response({ ...EVIDENCE_SAVED, decision: null })],
    ['missing decision field', () => response({ ...EVIDENCE_SAVED, decision: Object.fromEntries(Object.entries(EVIDENCE_SAVED.decision).filter(([key]) => key !== 'reason')) })],
    ['wrong eligible boolean type', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, eligible: 'false' } })],
    ['wrong mastery-bearing boolean type', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, masteryBearing: 1 } })],
    ['unknown delivery', () => response({ ...EVIDENCE_SAVED, delivery: 'unknown' })],
    ['unknown decision idempotency', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, idempotency: 'unknown' } })],
    ['unknown reason', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, reason: 'private' } })],
    ['unknown exposure state', () => response({ ...EVIDENCE_SAVED, decision: { ...EVIDENCE_SAVED.decision, exposureState: 'unknown' } })],
  ] as const)('keeps the opaque ID and retries evidence for %s', async (_label, makeEvidenceResponse) => {
    const fetchMock = vi.mocked(fetch)
      .mockResolvedValueOnce(response(PARTIAL_RESULT))
      .mockResolvedValueOnce(makeEvidenceResponse())
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    renderPractice('guided_practice');
    fillPractice(GUIDED_ANSWERS);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(PRACTICE_ERROR);
    expect(alert.textContent).not.toContain('private');
    expect(screen.getByText('Server score: 2/3')).toBeTruthy();
    expect(screen.getByText(PARTIAL_RESULT.feedback)).toBeTruthy();
    const firstEvidenceCall = fetchMock.mock.calls[1] as unknown[];
    const firstEvidenceBody = (firstEvidenceCall[1] as RequestInit).body;
    expectEvidenceCall(firstEvidenceCall, PARTIAL_RESULT.submissionId);
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByText('Your practice was saved.')).toBeTruthy());

    expect(fetchMock.mock.calls.map((entry) => entry[0])).toEqual([CREATE_URL, EVIDENCE_URL, EVIDENCE_URL]);
    expect((fetchMock.mock.calls[2]?.[1] as RequestInit).body).toBe(firstEvidenceBody);
    expectEvidenceCall(fetchMock.mock.calls[2] as unknown[], PARTIAL_RESULT.submissionId);
  });
});
