import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrecalculusTopic12PointwiseWorkedPilot } from '@/components/student/PrecalculusTopic12PointwiseWorkedPilot';
import { PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';

const sourceVariant = generateTopic12PointwiseLeastRateChoice(0);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PrecalculusTopic12PointwiseWorkedPilot', () => {
  it('renders the source Worked graph and sends only the raw source selection', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ submissionId: 'submission-1' }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12PointwiseWorkedPilot />);

    expect(sourceVariant.correctOptionId).toBe('D');
    expect(screen.getByText(sourceVariant.prompt)).toBeTruthy();
    expect(screen.getByRole('img', { name: /A\(-3\.5, -1\.2\).*B\(-1, 1\).*C\(2\.3, 2\.3\).*D\(4, -1\).*least instantaneous rate of change/i })).toBeTruthy();
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('y')).toBeTruthy();
    for (const point of sourceVariant.labeledPoints) {
      expect(screen.getByTestId(`point-label-${point.label}`)).toHaveAttribute('data-point-x', String(point.x));
      expect(screen.getByTestId(`point-label-${point.label}`)).toHaveAttribute('data-point-y', String(point.y));
    }
    for (const option of sourceVariant.options) {
      const point = sourceVariant.labeledPoints.find((candidate) => candidate.id === option.id)!;
      expect(screen.getByRole('radio', { name: new RegExp(`^${option.label}.*${point.x}`) })).toBeTruthy();
    }
    const correct = screen.getByRole('radio', { name: /^D/ }) as HTMLInputElement;
    expect(correct).toBeChecked();
    expect(correct).toBeDisabled();
    for (const step of sourceVariant.solutionSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText('Point D has the least rate of change (option D).')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Pointwise Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/activities/precalculus-topic-1-2-pointwise-worked/submissions');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    const key = new Headers(init.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
    expect(init.body).toBe(JSON.stringify({ selectedOptionId: 'D' }));
    expect(JSON.stringify(init.body)).not.toMatch(/activityId|learnerId|mode|score|maxScore|correct|answerKey|steps|graphPoints|slope|derivative/);
    expect(PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID).toContain('.worked_example');
  });

  it('disables duplicate clicks and reuses the same idempotency key on retry', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({ submissionId: 'submission-2' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseWorkedPilot />);

    const reviewButton = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(reviewButton);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: 'Temporary failure.' }, 500));
    const retryButton = await screen.findByRole('button', { name: 'Retry pointwise Worked example review' });
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    fireEvent.click(retryButton);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pointwise Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondKey = new Headers((fetchMock.mock.calls[1] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    expect(secondKey).toBe(firstKey);
    expect((fetchMock.mock.calls[1] as [string, RequestInit])[1].body).toBe(
      JSON.stringify({ selectedOptionId: sourceVariant.correctOptionId }),
    );
  });

  it.each([
    ['an HTTP error', response({ error: 'Internal detail.' }, 500)],
    ['a non-object JSON response', response(['submission-3'])],
    ['a blank submission ID', response({ submissionId: ' ' })],
    ['a malformed response', new Response('{', { status: 200, headers: { 'content-type': 'application/json' } })],
  ])('shows a safe retry state for %s', async (_label, serverResponse) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(serverResponse));
    render(<PrecalculusTopic12PointwiseWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to record the pointwise Worked example review.');
    expect(screen.getByRole('button', { name: 'Retry pointwise Worked example review' })).toBeEnabled();
  });
});
