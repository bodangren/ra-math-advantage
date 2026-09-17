import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  generateTopic14PolynomialExtremaFromGraph,
  generateTopic14PolynomialExtremaFromGraphOutput,
} from '@math-platform/math-content/knowledge-space';

import { PrecalculusTopic14PolynomialExtremaWorkedPilot } from '@/components/student/PrecalculusTopic14PolynomialExtremaWorkedPilot';
import { PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';

const OUTPUT = generateTopic14PolynomialExtremaFromGraphOutput(0);
const ANSWERS = OUTPUT.expectedAnswer as {
  relative_minimum_x: number;
  relative_maximum_x: number;
  absolute_minimum_x: number;
};
const REVIEW_URL = '/api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions';
const CREATE_RESULT = {
  submissionId: 'activity_submissions:polynomial-extrema-worked-component',
  attemptOrdinal: 1,
  submittedAt: '2026-08-29T11:00:00.000Z',
};
const ANSWER_IDS = [
  'relative_minimum_x',
  'relative_maximum_x',
  'absolute_minimum_x',
] as const;

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

function expectedRequestBody(): Record<string, unknown> {
  const answers = {
    relative_minimum_x: String(ANSWERS.relative_minimum_x),
    relative_maximum_x: String(ANSWERS.relative_maximum_x),
    absolute_minimum_x: String(ANSWERS.absolute_minimum_x),
  };
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: expect.any(String),
    answers,
    parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
  };
}

function collectAttributeNames(): string[] {
  return [...document.querySelectorAll('*')].flatMap((element) => (
    [...element.attributes].map((attribute) => attribute.name)
  ));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PrecalculusTopic14PolynomialExtremaWorkedPilot', () => {
  it('renders the exact seed-0 graph, source answers, steps, and final explanation', () => {
    const { container } = render(<PrecalculusTopic14PolynomialExtremaWorkedPilot />);
    const variant = generateTopic14PolynomialExtremaFromGraph(0);

    expect(screen.getByRole('heading', { name: 'Worked Example: Identify Extrema from a Graph' })).toBeTruthy();
    expect(screen.getByText(variant.prompt)).toBeTruthy();
    const graph = screen.getByRole('img', { name: /Graph of polynomial g Graph of polynomial g on the domain/ });
    expect(graph.getAttribute('aria-labelledby')).toBeTruthy();
    expect(screen.getByText(`Graph of polynomial g on the domain ${variant.domain[0]} to ${variant.domain[1]}.`)).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Graph data for polynomial g' })).toBeTruthy();
    expect(screen.getAllByRole('row')).toHaveLength(variant.points.length + 1);
    for (const point of variant.points) {
      expect(screen.getByRole('row', { name: `${point.x} ${point.y}` })).toBeTruthy();
    }
    const polyline = screen.getByTestId('polynomial-extrema-curve');
    expect(polyline.getAttribute('points')?.trim().split(/\s+/)).toHaveLength(variant.points.length);
    expect(screen.getByText('Relative minimum x-value').parentElement?.textContent).toBe('Relative minimum x-value1');
    expect(screen.getByText('Relative maximum x-value').parentElement?.textContent).toBe('Relative maximum x-value4');
    expect(screen.getByText('Absolute minimum x-value').parentElement?.textContent).toBe('Absolute minimum x-value1');
    for (const step of OUTPUT.solutionSteps.map((item) => item.description)) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText(`x = ${ANSWERS.relative_minimum_x} is a relative minimum and the absolute minimum; x = ${ANSWERS.relative_maximum_x} is a relative maximum.`)).toBeTruthy();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(collectAttributeNames()).not.toEqual(expect.arrayContaining([
      'correctanswers', 'expectedanswer', 'authority', 'score', 'mastery',
    ]));
    expect(container.textContent).not.toContain('Server score');
  });

  it('sends the exact raw practice envelope and saves the review', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(CREATE_RESULT));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic14PolynomialExtremaWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Worked example review saved (attempt 1).'));
    const call = fetchMock.mock.calls[0] as unknown[];
    expect(call[0]).toBe(REVIEW_URL);
    const init = call[1] as RequestInit;
    expect(init.method).toBe('POST');
    const headers = new Headers(init.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toEqual(expect.any(String));
    expect(headers.get('Idempotency-Key')).not.toBe('');
    expect(requestBody(call)).toStrictEqual(expectedRequestBody());
    expect(Object.keys(requestBody(call) as Record<string, unknown>)).toEqual([
      'contractVersion', 'activityId', 'mode', 'status', 'attemptNumber',
      'submittedAt', 'answers', 'parts',
    ]);
    expect(JSON.stringify(call)).not.toContain('mastery');
    expect(JSON.stringify(call)).not.toContain('score');
    expect(JSON.stringify(call)).not.toContain('expectedAnswer');
    expect(screen.getByRole('button', { name: 'Worked review saved' })).toBeDisabled();
  });

  it('blocks duplicate clicks while saving', async () => {
    let resolveRequest!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveRequest = resolve; });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic14PolynomialExtremaWorkedPilot />);
    const button = screen.getByRole('button', { name: 'Save Worked review' });

    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveRequest(response(CREATE_RESULT));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
  });

  it.each([
    ['HTTP error', response({ error: 'private backend detail' }, 500)],
    ['malformed JSON', malformedJsonResponse()],
    ['non-object JSON', response(['submission-id'])],
    ['missing field', response({ submissionId: CREATE_RESULT.submissionId, attemptOrdinal: 1 })],
    ['extra field', response({ ...CREATE_RESULT, score: 1 })],
    ['blank submission ID', response({ ...CREATE_RESULT, submissionId: ' ' })],
    ['invalid ordinal', response({ ...CREATE_RESULT, attemptOrdinal: 0 })],
    ['fractional ordinal', response({ ...CREATE_RESULT, attemptOrdinal: 1.5 })],
    ['invalid timestamp', response({ ...CREATE_RESULT, submittedAt: 'not-a-date' })],
    ['noncanonical timestamp', response({ ...CREATE_RESULT, submittedAt: '2026-08-29' })],
  ])('shows one safe retry state for %s', async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic14PolynomialExtremaWorkedPilot />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save the Topic 1.4 polynomial extrema Worked review.'));
    expect(screen.getByRole('button', { name: 'Retry Worked review' })).toBeEnabled();
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('private backend detail');
  });

  it('reuses the same frozen envelope and key on retry', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'temporary failure' }, 500))
      .mockResolvedValueOnce(response(CREATE_RESULT));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic14PolynomialExtremaWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Worked review' }));
    await screen.findByRole('button', { name: 'Retry Worked review' });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstInit = firstCall[1] as RequestInit;
    const firstKey = new Headers(firstInit.headers).get('Idempotency-Key');
    const firstBody = firstInit.body;

    fireEvent.click(screen.getByRole('button', { name: 'Retry Worked review' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Worked example review saved (attempt 1).'));
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    const secondInit = secondCall[1] as RequestInit;
    expect(new Headers(secondInit.headers).get('Idempotency-Key')).toBe(firstKey);
    expect(secondInit.body).toBe(firstBody);
    expect(requestBody(secondCall)).toStrictEqual(expectedRequestBody());
  });
});
