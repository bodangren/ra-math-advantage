import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
} from '@math-platform/math-content/knowledge-space';

import { PrecalculusTopic13ConcavityWorkedPilot } from '@/components/student/PrecalculusTopic13ConcavityWorkedPilot';

const SOURCE_PROMPT = 'Determine concavity.';
const SOURCE_X_VALUES = [1, 1.1, 1.2, 1.3] as const;
const SOURCE_Y_VALUES = [4, 1, -1, -2] as const;
const SOURCE_STEPS = [
  'The first differences are -3, -2, and -1.',
  'The first differences increase from -3 to -2 to -1.',
  'Therefore, k is concave up.',
] as const;
const SOURCE_FINAL_ANSWER = 'concave up.';
const CREATE_URL = '/api/activities/precalculus-topic-1-3-concavity-worked/submissions';
const CREATE_RESULT = {
  submissionId: 'activity_submissions:concavity-worked-component',
  attemptOrdinal: 1,
  submittedAt: '2026-08-29T11:00:00.000Z',
};
const AUTHORITY_KEYS = [
  'activityId',
  'learnerId',
  'mode',
  'correctness',
  'score',
  'expectedAnswer',
  'correctClassification',
  'steps',
  'solutionSteps',
  'solution',
  'finalAnswer',
  'attemptNumber',
  'attemptOrdinal',
  'submittedAt',
  'contractVersion',
  'status',
  'parts',
];

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function malformedJsonResponse(): Response {
  return new Response('{', { status: 200, headers: { 'content-type': 'application/json' } });
}

function requestBody(call: unknown[]): unknown {
  return JSON.parse(String((call[1] as RequestInit).body)) as unknown;
}

function assertNoAuthority(value: unknown): void {
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
  for (const key of AUTHORITY_KEYS) expect(keys).not.toContain(key);
}

describe('PrecalculusTopic13ConcavityWorkedPilot', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the exact seed-0 source Worked example', () => {
    const variant = generateTopic13ConcavityFromRateChange(0);
    const output = generateTopic13ConcavityFromRateChangeOutput(0);
    render(<PrecalculusTopic13ConcavityWorkedPilot />);

    expect(variant.prompt).toBe(SOURCE_PROMPT);
    expect(variant.functionName).toBe('k');
    expect(variant.xValues).toEqual(SOURCE_X_VALUES);
    expect(variant.yValues).toEqual(SOURCE_Y_VALUES);
    expect(output.expectedAnswer).toEqual({ classification: 'concave_up' });
    expect(output.solutionSteps.map((step) => step.description)).toEqual(SOURCE_STEPS);
    expect(screen.getByRole('heading', { name: 'Worked Example: Determine Concavity' })).toBeTruthy();
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();

    const table = screen.getByRole('table', { name: 'k(x) values' });
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(within(table).getAllByRole('row')[0]?.textContent).toBe('x11.11.21.3');
    expect(within(table).getAllByRole('row')[1]?.textContent).toBe('k(x)41-1-2');

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Concave up' })).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Concave down' })).toHaveProperty('checked', false);
    expect(screen.getByRole('radio', { name: 'Neither' })).toHaveProperty('checked', false);
    for (const radio of radios) expect(radio).toHaveProperty('disabled', true);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
  });

  it('sends only the raw source classification and saves the review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityWorkedPilot />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Concavity Worked example review saved (attempt 1).'));
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(CREATE_URL);
    const init = call[1] as RequestInit;
    expect(init.method).toBe('POST');
    const headers = new Headers(init.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toEqual(expect.any(String));
    expect(headers.get('Idempotency-Key')).not.toBe('');
    expect(requestBody(call)).toStrictEqual({ classification: 'concave_up' });
    expect(Object.keys(requestBody(call) as Record<string, unknown>)).toEqual(['classification']);
    assertNoAuthority(requestBody(call));
    expect(screen.getByRole('button', { name: 'Concavity Worked example reviewed' })).toBeDisabled();
  });

  it('blocks fast duplicate review clicks while saving', async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityWorkedPilot />);
    const review = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(review);
    fireEvent.click(review);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest(response(CREATE_RESULT));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
  });

  it.each([
    ['HTTP error', response({ error: 'private backend detail' }, 500)],
    ['malformed JSON', malformedJsonResponse()],
    ['non-object JSON', response(['submission-id'])],
    ['missing response field', response({ submissionId: CREATE_RESULT.submissionId, attemptOrdinal: 1 })],
    ['extra response field', response({ ...CREATE_RESULT, score: 1 })],
    ['blank submission ID', response({ ...CREATE_RESULT, submissionId: ' ' })],
    ['invalid ordinal', response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ['non-integer ordinal', response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ['invalid time', response({ ...CREATE_RESULT, submittedAt: 'not-a-date' })],
  ])('shows a safe retry state for %s', async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityWorkedPilot />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save the Topic 1.3 concavity Worked example review.'));
    expect(screen.getByRole('button', { name: 'Retry Topic 1.3 concavity Worked example review' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('private backend detail');
  });

  it('reuses the same key and body on retry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'temporary failure' }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic13ConcavityWorkedPilot />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));
    await screen.findByRole('button', { name: 'Retry Topic 1.3 concavity Worked example review' });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get('Idempotency-Key');
    const firstBody = firstInit.body;

    fireEvent.click(screen.getByRole('button', { name: 'Retry Topic 1.3 concavity Worked example review' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Concavity Worked example review saved (attempt 1).'));
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(secondCall[0]).toBe(CREATE_URL);
    expect(new Headers(secondInit.headers).get('Idempotency-Key')).toBe(firstKey);
    expect(secondInit.body).toBe(firstBody);
    expect(requestBody(secondCall)).toStrictEqual({ classification: 'concave_up' });
  });
});
