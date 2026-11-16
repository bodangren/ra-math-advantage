import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrecalculusTopic12WorkedPilot } from '@/components/student/PrecalculusTopic12WorkedPilot';
import { PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID } from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12TableAverageRateChoice } from '@math-platform/math-content/knowledge-space';

const sourceVariant = generateTopic12TableAverageRateChoice(0);
const finalAnswer = 'The average rate of change is greatest over 1900-1950 (option C).';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PrecalculusTopic12WorkedPilot', () => {
  it('renders the source Worked table, rates, answer, and raw review request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'submission-1',
      attemptOrdinal: 1,
      submittedAt: '2026-08-28T00:00:00.000Z',
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12WorkedPilot />);

    expect(screen.getByText(sourceVariant.prompt)).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Life expectancy table' })).toBeTruthy();
    for (const row of sourceVariant.rows) {
      expect(screen.getByText(String(row.input))).toBeTruthy();
      expect(screen.getByText(String(row.output))).toBeTruthy();
    }
    for (const step of sourceVariant.solutionSteps) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByRole('radio', { name: /C.*1900 to 1950/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /C.*1900 to 1950/ })).toBeDisabled();
    expect(screen.getByText(finalAnswer)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/activities/precalculus-topic-1-2-worked/submissions');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ selectedOptionId: sourceVariant.correctOptionId }));
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    expect(new Headers(init.headers).get('Idempotency-Key')).toEqual(expect.any(String));
    expect(new Headers(init.headers).get('Idempotency-Key')).not.toBe('');
    expect(JSON.stringify(init.body)).not.toMatch(/score|maxScore|isCorrect|correctAnswer/);
    expect(PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID).toContain('.worked_example');
  });

  it('disables duplicate clicks and reuses the idempotency key on retry', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({
        submissionId: 'submission-2',
        attemptOrdinal: 1,
        submittedAt: '2026-08-28T00:00:00.000Z',
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12WorkedPilot />);

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
  });

  it('shows a safe error and retry action for an invalid server response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({})));
    render(<PrecalculusTopic12WorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to record the Worked example review.');
    expect(screen.getByRole('button', { name: 'Retry worked example review' })).toBeEnabled();
  });
});
