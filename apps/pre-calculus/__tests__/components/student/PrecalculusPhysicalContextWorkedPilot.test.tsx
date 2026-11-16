import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrecalculusPhysicalContextWorkedPilot } from '@/components/student/PrecalculusPhysicalContextWorkedPilot';
import {
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic11PhysicalContextGraphChoice } from '@math-platform/math-content/knowledge-space';

const sourceVariant = generateTopic11PhysicalContextGraphChoice(0);
const finalAnswer = 'Graph D is possible because the vase is narrow, then wide, then narrow, so the height changes steeply, gently, then steeply.';

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PrecalculusPhysicalContextWorkedPilot', () => {
  it('renders the source Worked example and records the exact review request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'submission-1',
      attemptOrdinal: 1,
      submittedAt: '2026-08-28T00:00:00.000Z',
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusPhysicalContextWorkedPilot />);

    expect(screen.getByRole('heading', { name: 'Worked Example: Select a Physical-Context Graph' })).toBeTruthy();
    expect(screen.getByText(sourceVariant.prompt)).toBeTruthy();
    expect(screen.getByText(sourceVariant.contextDescription)).toBeTruthy();
    expect(screen.getByText('Time (seconds) and Height (inches)')).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByRole('img', { name: sourceVariant.options[3]!.accessibleDescription })).toBeTruthy();

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0]?.name).toBe(`${PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID}-graph-choice`);
    expect(radios.find((radio) => radio.value === sourceVariant.correctOptionId)).toMatchObject({
      checked: true,
      disabled: true,
    });
    for (const step of sourceVariant.reasoning) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(finalAnswer)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull();

    const reviewButton = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(reviewButton);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/activities/precalculus-physical-context-worked/submissions');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ selectedOptionId: sourceVariant.correctOptionId }));
    expect(new Headers(init.headers).get('Idempotency-Key')).toEqual(expect.any(String));
    expect(new Headers(init.headers).get('Idempotency-Key')).not.toBe('');
  });

  it('disables duplicate clicks while saving and reuses the idempotency key on retry', async () => {
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
    render(<PrecalculusPhysicalContextWorkedPilot />);

    const reviewButton = screen.getByRole('button', { name: 'Mark worked example reviewed' });
    fireEvent.click(reviewButton);
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: 'Temporary failure.' }, 500));
    const retryButton = await screen.findByRole('button', { name: 'Retry worked example review' });
    expect(retryButton).toBeEnabled();
    const firstKey = new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    fireEvent.click(retryButton);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Worked example reviewed' })).toBeDisabled());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondKey = new Headers((fetchMock.mock.calls[1] as [string, RequestInit])[1].headers).get('Idempotency-Key');
    expect(secondKey).toBe(firstKey);
    expect(screen.getByRole('status')).toHaveTextContent('Worked example review saved.');
  });

  it('shows an error and retry action for an invalid server response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({}));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusPhysicalContextWorkedPilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to record the Worked example review.');
    expect(screen.getByRole('button', { name: 'Retry worked example review' })).toBeEnabled();
  });
});
