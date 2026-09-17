import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  generateTopic12QuadraticNegativeRateIntervalChoice,
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
} from '@math-platform/math-content/knowledge-space';

import { PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot } from '@/components/student/PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot';
import { PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';

const sourceVariant = generateTopic12QuadraticNegativeRateIntervalChoice(0);
const sourceOutput = generateTopic12QuadraticNegativeRateIntervalChoiceOutput(0);
const sourceAnswer = (sourceOutput.expectedAnswer as { selectedOptionId: string }).selectedOptionId;
const SOURCE_PROMPT = 'The function k is defined by k(x) = 3.16 + 4.2x - 0.85x^2 for -10 <= x <= 10. Which statement about k is correct?';
const SOURCE_OPTIONS = [
  { id: 'A', label: 'A', rateSign: 'positive', startInput: -10, endInput: 8.348 },
  { id: 'B', label: 'B', rateSign: 'positive', startInput: -0.663, endInput: 5.605 },
  { id: 'C', label: 'C', rateSign: 'negative', startInput: -10, endInput: 2.470 },
  { id: 'D', label: 'D', rateSign: 'negative', startInput: 2.470, endInput: 10 },
] as const;
const SOURCE_STEPS = [
  'The quadratic opens downward.',
  'The vertex is at x = 2.470.',
  'The rate is negative to the right of the vertex, so option D is correct.',
] as const;
const FINAL_ANSWER = 'Option D is correct because the rate is negative to the right of the vertex.';
const WORKED_ACTIVITY_ID = 'math.precalc.skill.1.2.determine-negative-rate-intervals-for-quadratics.worked_example';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function malformedJsonResponse() {
  return new Response('{', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function expectNoAuthorityKeys(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const key of [
    'activityId',
    'learnerId',
    'mode',
    'correctOptionId',
    'correctAnswer',
    'expectedAnswer',
    'gradingMetadata',
    'score',
    'correctness',
    'steps',
    'solutionSteps',
    'vertexX',
    'rateSign',
  ]) {
    expect(serialized).not.toContain(`"${key}"`);
  }
}

describe('PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot', () => {
  it('renders the exact source Worked activity and sends only raw D', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ submissionId: 'activity_submissions:quadratic-negative-rate-worked-component' }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot />);

    expect(sourceAnswer).toBe('D');
    expect(sourceVariant.prompt).toBe(SOURCE_PROMPT);
    expect(sourceVariant.options).toStrictEqual(SOURCE_OPTIONS);
    expect(sourceOutput.solutionSteps.map((step) => step.description)).toStrictEqual(SOURCE_STEPS);
    expect(screen.getByText(SOURCE_PROMPT)).toBeTruthy();
    for (const option of SOURCE_OPTIONS) {
      expect(screen.getByText(
        `k has a ${option.rateSign} rate of change on ${Number.isInteger(option.startInput) ? option.startInput : option.startInput.toFixed(3)} ≤ x ≤ ${Number.isInteger(option.endInput) ? option.endInput : option.endInput.toFixed(3)}.`,
      )).toBeTruthy();
    }
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios.filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
    expect(radios.find((radio) => (radio as HTMLInputElement).value === 'D')).toBeChecked();
    expect(radios.every((radio) => (radio as HTMLInputElement).disabled)).toBe(true);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FINAL_ANSWER)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Quadratic negative-rate interval Worked example review saved.'));
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/activities/precalculus-topic-1-2-quadratic-negative-rate-interval-worked/submissions');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    const key = new Headers(init.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
    expect(JSON.parse(String(init.body))).toStrictEqual({ selectedOptionId: 'D' });
    expectNoAuthorityKeys(JSON.parse(String(init.body)));
    expect(PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID).toBe(WORKED_ACTIVITY_ID);
    expect(screen.getByRole('button', { name: 'Quadratic negative-rate interval Worked example reviewed' })).toBeDisabled();
  });

  it('prevents duplicate clicks and reuses the same key after a failed request', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({ submissionId: 'activity_submissions:quadratic-negative-rate-worked-retry' }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot />);
    const reviewButton = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(reviewButton);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: 'Temporary failure.' }, 500));
    const retryButton = await screen.findByRole('button', { name: 'Retry quadratic negative-rate interval Worked example review' });
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    fireEvent.click(retryButton);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Quadratic negative-rate interval Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondKey = new Headers((fetchMock.mock.calls[1] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    expect(secondKey).toBe(firstKey);
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].body).toBe(JSON.stringify({ selectedOptionId: 'D' }));
  });

  it.each([
    ['an HTTP error', response({ error: 'private server detail' }, 500)],
    ['a non-object JSON response', response(['submission-id'])],
    ['a blank submission ID', response({ submissionId: ' ' })],
    ['malformed JSON', malformedJsonResponse()],
  ])('shows a safe retry state for %s', async (_label, serverResponse) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(serverResponse));
    render(<PrecalculusTopic12QuadraticNegativeRateIntervalWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to record the quadratic negative-rate interval Worked example review.');
    expect(screen.getByRole('button', { name: 'Retry quadratic negative-rate interval Worked example review' })).toBeEnabled();
    expect(screen.getByRole('alert')).not.toHaveTextContent('private server detail');
  });
});
