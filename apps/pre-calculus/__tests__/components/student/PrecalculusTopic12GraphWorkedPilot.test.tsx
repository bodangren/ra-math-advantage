import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrecalculusTopic12GraphWorkedPilot } from '@/components/student/PrecalculusTopic12GraphWorkedPilot';
import { PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12GraphAverageRateChoice } from '@math-platform/math-content/knowledge-space';

const sourceVariant = generateTopic12GraphAverageRateChoice(0);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PrecalculusTopic12GraphWorkedPilot', () => {
  it('renders the source Worked graph and sends only the raw source selection', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ submissionId: 'submission-1' }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12GraphWorkedPilot />);

    expect(sourceVariant.correctOptionId).toBe('C');
    expect(screen.getByText(sourceVariant.prompt)).toBeTruthy();
    expect(screen.getByRole('img', { name: /h\(2\)=6.*h\(3\)=6.*h\(5\)=4.*h\(7\)=6.*h\(8\)=3/i })).toBeTruthy();
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('h(x)')).toBeTruthy();
    for (const option of sourceVariant.options) {
      expect(screen.getByRole('radio', { name: new RegExp(`${option.label}.*${option.startInput} to ${option.endInput}`) })).toBeTruthy();
    }
    const correct = screen.getByRole('radio', { name: /C.*5 to 7/ }) as HTMLInputElement;
    expect(correct).toBeChecked();
    expect(correct).toBeDisabled();
    for (const step of sourceVariant.solutionSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText('The greatest average rate is on 5 to 7 (option C).')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/activities/precalculus-topic-1-2-graph-worked/submissions');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    const key = new Headers(init.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
    expect(init.body).toBe(JSON.stringify({ selectedOptionId: 'C' }));
    expect(JSON.stringify(init.body)).not.toMatch(/activityId|learnerId|mode|score|maxScore|correct|answerKey|steps|graphPoints/);
    expect(PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID).toContain('.worked_example');
  });

  it('disables duplicate clicks and reuses the same idempotency key on retry', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({ submissionId: 'submission-2' }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphWorkedPilot />);

    const reviewButton = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(reviewButton);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: 'Temporary failure.' }, 500));
    const retryButton = await screen.findByRole('button', { name: 'Retry worked example review' });
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    fireEvent.click(retryButton);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked example reviewed' })).toBeDisabled());
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
    render(<PrecalculusTopic12GraphWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to record the graph Worked example review.');
    expect(screen.getByRole('button', { name: 'Retry worked example review' })).toBeEnabled();
  });
});
