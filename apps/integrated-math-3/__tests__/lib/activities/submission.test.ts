import { beforeEach, describe, expect, it, vi } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { submitActivity } from '@/lib/activities/submission';

global.fetch = vi.fn() as unknown as typeof fetch;

function makeResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

const GENERIC_ENVELOPE = practiceSubmissionEnvelopeSchema.parse({
  contractVersion: 'practice.v1',
  activityId: 'generic-im3-activity',
  mode: 'assessment',
  status: 'submitted',
  attemptNumber: 7,
  submittedAt: '2026-08-20T10:00:00.000Z',
  answers: { q1: 'A', q2: 'B' },
  parts: [
    { partId: 'q1', rawAnswer: 'A' },
    { partId: 'q2', rawAnswer: 'B' },
  ],
  artifact: { clientGraph: 'raw visual state' },
  interactionHistory: [{ type: 'hint', at: '2026-08-20T09:59:00.000Z' }],
  analytics: { timeSpent: 120 },
  studentFeedback: 'I am ready to submit.',
  timing: {
    startedAt: '2026-08-20T09:58:00.000Z',
    submittedAt: '2026-08-20T10:00:00.000Z',
    wallClockMs: 120000,
    activeMs: 110000,
    idleMs: 10000,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence: 'high',
  },
});

const GENERIC_KEY = 'im3-generic-submit-key';
const IDEMPOTENT_GENERIC_ENVELOPE = {
  ...GENERIC_ENVELOPE,
  idempotencyKey: GENERIC_KEY,
};

describe('submitActivity generic practice path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts one complete practice.v1 envelope to the generic route', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse({
      success: true,
      submissionId: 'generic-im3-submission',
      score: 6,
      maxScore: 8,
    }));

    const result = await submitActivity(IDEMPOTENT_GENERIC_ENVELOPE);

    expect(result).toEqual({
      success: true,
      submissionId: 'generic-im3-submission',
      score: 6,
      maxScore: 8,
      idempotencyKey: GENERIC_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] ?? [];
    expect(url).toBe('/api/activities/submit');
    expect(options).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': GENERIC_KEY,
      },
    });
    expect(JSON.parse(String(options?.body))).toEqual(GENERIC_ENVELOPE);
    expect(mockFetch.mock.calls.map(([requestUrl]) => requestUrl)).not.toContain(
      '/api/activities/submissions',
    );
    expect(mockFetch.mock.calls.map(([requestUrl]) => requestUrl)).not.toContain(
      '/api/learning-evidence/im3-pilot',
    );
  });

  it('returns a generic route failure without a create or opaque delivery request', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse({ error: 'Invalid submission' }, false));

    const result = await submitActivity(IDEMPOTENT_GENERIC_ENVELOPE);

    expect(result).toEqual({
      success: false,
      error: 'Invalid submission',
      idempotencyKey: GENERIC_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe('/api/activities/submit');
  });

  it('returns a generic network error after one request', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await submitActivity(IDEMPOTENT_GENERIC_ENVELOPE);

    expect(result).toEqual({
      success: false,
      error: 'Network error',
      idempotencyKey: GENERIC_KEY,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe('/api/activities/submit');
  });
});
