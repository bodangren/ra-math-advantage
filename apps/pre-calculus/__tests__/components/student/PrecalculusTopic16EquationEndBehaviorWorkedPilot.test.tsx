import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateTopic16EquationEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';
import {
  polynomialEquationEndBehaviorSchema,
  type PolynomialEquationEndBehaviorProps,
} from '@math-platform/math-content/schemas';

import { PrecalculusTopic16EquationEndBehaviorWorkedPilot } from '@/components/student/PrecalculusTopic16EquationEndBehaviorWorkedPilot';
import {
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const OUTPUT = generateTopic16EquationEndBehaviorOutput(0);
const ROUTE_URL = '/api/activities/precalculus-topic-1-6-equation-end-behavior-worked/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const IDEMPOTENCY_KEY = 'topic16-equation-end-behavior-worked-test-key';
const SAFE_ERROR = 'Unable to save the Topic 1.6 polynomial end-behavior Worked review.';
const FINAL_ANSWER = 'The six polynomial end behaviors are shown above.';
const SOURCE_ITEMS = [
  { id: 'a', functionName: 'f', expression: '4x^5' },
  { id: 'b', functionName: 'g', expression: '(1/2)x^4' },
  { id: 'c', functionName: 'y', expression: '-2(x + 3)^6' },
  { id: 'd', functionName: 'h', expression: '3 - x^5' },
  { id: 'e', functionName: 'k', expression: '8x^2 + 4 - x^5' },
  { id: 'f', functionName: 'm', expression: '2x(x - 1)(6 - x)' },
] as const;
const SOURCE_ANSWERS = {
  a_leftEnd: 'down',
  a_rightEnd: 'up',
  b_leftEnd: 'up',
  b_rightEnd: 'up',
  c_leftEnd: 'down',
  c_rightEnd: 'down',
  d_leftEnd: 'up',
  d_rightEnd: 'down',
  e_leftEnd: 'up',
  e_rightEnd: 'down',
  f_leftEnd: 'up',
  f_rightEnd: 'down',
} as const;
const SOURCE_STEPS = [
  'a) The leading term is 4x^5. The degree is odd and the leading coefficient is positive, so the left end is down and the right end is up.',
  'b) The leading term is (1/2)x^4. The degree is even and the leading coefficient is positive, so both ends are up.',
  'c) The leading term is -2x^6. The degree is even and the leading coefficient is negative, so both ends are down.',
  'd) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
  'e) The leading term is -x^5. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
  'f) The leading term is -2x^3. The degree is odd and the leading coefficient is negative, so the left end is up and the right end is down.',
] as const;
const WORKED_PROPS = polynomialEquationEndBehaviorSchema.parse({
  ...(OUTPUT.data.rendererProps as Record<string, unknown>),
  presentationMode: 'worked_example',
  correctAnswers: OUTPUT.expectedAnswer,
  steps: OUTPUT.solutionSteps.map((step) => step.description),
  finalAnswer: FINAL_ANSWER,
}) as Extract<PolynomialEquationEndBehaviorProps, { presentationMode: 'worked_example' }>;
const SERVER_RESULT = {
  submissionId: 'activity_submissions:topic16-equation-end-behavior-worked-component',
  attemptOrdinal: 1,
  submittedAt: '2026-08-30T12:00:00.000Z',
} as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function expectExactEnvelope(call: unknown[]): string {
  const init = call[1] as RequestInit;
  const headers = new Headers(init.headers);
  const body = requestBody(call);
  expect(call[0]).toBe(ROUTE_URL);
  expect(init.method).toBe('POST');
  expect(headers.get('content-type')).toBe('application/json');
  const idempotencyKey = headers.get('Idempotency-Key');
  expect(idempotencyKey).toMatch(/\S/);
  expect(idempotencyKey).toBe(idempotencyKey?.trim());
  expect(idempotencyKey).toBe(IDEMPOTENCY_KEY);
  expect(Object.keys(body).sort()).toStrictEqual([
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
    activityId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers: SOURCE_ANSWERS,
    parts: Object.entries(SOURCE_ANSWERS).map(([partId, rawAnswer]) => ({ partId, rawAnswer })),
  });
  expect(body.submittedAt).toBe(new Date(String(body.submittedAt)).toISOString());
  return String(init.body);
}

function expectNoAuthorityAttributes(): void {
  const names = Array.from(document.querySelectorAll('*')).flatMap((element) => (
    Array.from(element.attributes, (attribute) => attribute.name.toLowerCase())
  ));
  for (const name of [
    'correctanswers',
    'expectedanswer',
    'answerkey',
    'grading',
    'gradingmetadata',
    'evidence',
    'nodeid',
    'submissionid',
  ]) {
    expect(names).not.toContain(name);
  }
}

describe('PrecalculusTopic16EquationEndBehaviorWorkedPilot', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(IDEMPOTENCY_KEY);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the exact seed-0 Worked source with no editable controls', () => {
    render(<PrecalculusTopic16EquationEndBehaviorWorkedPilot />);

    expect(screen.getByRole('heading', { name: 'Worked Example: Polynomial Equation End Behavior' })).toBeTruthy();
    expect(screen.getByText('Determine the end behavior for the following polynomials. Limit notation is not necessary.')).toBeTruthy();
    expect(WORKED_PROPS.items).toStrictEqual(SOURCE_ITEMS);
    expect(WORKED_PROPS.correctAnswers).toStrictEqual(SOURCE_ANSWERS);
    expect(WORKED_PROPS.steps).toStrictEqual(SOURCE_STEPS);
    for (const item of SOURCE_ITEMS) expect(screen.getByText(item.expression, { exact: true })).toBeTruthy();
    for (const [partId, answer] of Object.entries(SOURCE_ANSWERS)) {
      const [itemId, side] = partId.split('_');
      expect(screen.getByText(`${itemId} ${side === 'leftEnd' ? 'Left' : 'Right'} end: ${answer === 'up' ? 'Up' : 'Down'}`)).toBeTruthy();
    }
    for (const step of SOURCE_STEPS) expect(screen.getByText(step, { exact: true })).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER, { exact: true })).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Save Worked review' })).toBeEnabled();
    expectNoAuthorityAttributes();
  });

  it('posts only the exact source envelope to the Worked route and hides the opaque ID', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(response(SERVER_RESULT));
    render(<PrecalculusTopic16EquationEndBehaviorWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Worked example review saved (attempt 1).'));

    expect(fetchMock).toHaveBeenCalledOnce();
    expectExactEnvelope(fetchMock.mock.calls[0] as unknown[]);
    expect(document.body.textContent).not.toContain(SERVER_RESULT.submissionId);
    expect(fetchMock.mock.calls.some((call) => call[0] === EVIDENCE_URL)).toBe(false);
    expect(screen.getByRole('button', { name: 'Worked review saved' })).toBeDisabled();
  });

  it('blocks duplicate clicks while saving and after success', async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.mocked(fetch).mockReturnValueOnce(pending);
    render(<PrecalculusTopic16EquationEndBehaviorWorkedPilot />);

    const save = screen.getByRole('button', { name: 'Save Worked review' });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    resolveRequest(response(SERVER_RESULT));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked review saved' })).toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Worked review saved' }));
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ['HTTP error', () => response({ error: 'private backend detail' }, 500)],
    ['invalid JSON', () => new Response('{', { status: 200 })],
    ['non-object result', () => response(null)],
    ['extra result field', () => response({ ...SERVER_RESULT, hidden: true })],
    ['missing result field', () => response(Object.fromEntries(Object.entries(SERVER_RESULT).filter(([key]) => key !== 'submittedAt')))],
    ['blank submission ID', () => response({ ...SERVER_RESULT, submissionId: ' ' })],
    ['wrong submission ID type', () => response({ ...SERVER_RESULT, submissionId: 1 })],
    ['zero ordinal', () => response({ ...SERVER_RESULT, attemptOrdinal: 0 })],
    ['fractional ordinal', () => response({ ...SERVER_RESULT, attemptOrdinal: 1.5 })],
    ['unsafe ordinal', () => response({ ...SERVER_RESULT, attemptOrdinal: Number.MAX_SAFE_INTEGER + 1 })],
    ['wrong ordinal type', () => response({ ...SERVER_RESULT, attemptOrdinal: '1' })],
    ['invalid time', () => response({ ...SERVER_RESULT, submittedAt: 'not-a-date' })],
    ['noncanonical time', () => response({ ...SERVER_RESULT, submittedAt: '2026-08-30T12:00:00Z' })],
    ['wrong time type', () => response({ ...SERVER_RESULT, submittedAt: 1 })],
  ] as const)('shows one safe error and no evidence request for %s', async (_label, makeResponse) => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(makeResponse());
    render(<PrecalculusTopic16EquationEndBehaviorWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(SAFE_ERROR);
    expect(alert.textContent).not.toContain('private backend detail');
    expect(screen.getByRole('button', { name: 'Retry Worked review' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls.some((call) => call[0] === EVIDENCE_URL)).toBe(false);
    expectNoAuthorityAttributes();
  });

  it('retries with the same serialized body and idempotency key', async () => {
    const fetchMock = vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('private transport detail'))
      .mockResolvedValueOnce(response(SERVER_RESULT));
    render(<PrecalculusTopic16EquationEndBehaviorWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(SAFE_ERROR);
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstBody = expectExactEnvelope(firstCall);
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry Worked review' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked review saved' })).toBeDisabled());
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect((secondCall[1] as RequestInit).body).toBe(firstBody);
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => call[0])).toStrictEqual([ROUTE_URL, ROUTE_URL]);
    expect(document.body.textContent).not.toContain(SERVER_RESULT.submissionId);
  });
});
