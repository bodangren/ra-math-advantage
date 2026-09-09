import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServerOwnedActivitySubmission, getQuadraticFormulaAttempt, startQuadraticFormulaAttempt, submitActivity } from '@/lib/activities/submission';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

global.fetch = vi.fn() as unknown as typeof fetch;

describe('submitActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds valid envelope and validates against practice.v1 schema', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub123' }),
    } as Response);

    const result = await submitActivity({
      activityId: 'act123',
      mode: 'independent_practice',
      answers: { part1: 42, part2: 'test' },
      attemptNumber: 1,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.submissionId).toBe('sub123');
    }

    const callArgs = mockFetch.mock.calls[0];
    const [url, options] = callArgs;
    expect(url).toBe('/api/activities/submit');
    expect(options?.method).toBe('POST');
    expect(options?.headers).toMatchObject({
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(options?.body as string);
    const parsed = practiceSubmissionEnvelopeSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'act123',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      answers: { part1: 42, part2: 'test' },
    });
  });

  it('posts to API endpoint and handles success response with score', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub456', score: 85, maxScore: 100 }),
    } as Response);

    const result = await submitActivity({
      activityId: 'act456',
      mode: 'assessment',
      answers: { q1: 'A', q2: 'B' },
      attemptNumber: 2,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.submissionId).toBe('sub456');
      expect(result.score).toBe(85);
      expect(result.maxScore).toBe(100);
    }
  });

  it('posts to API endpoint and handles error response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid submission envelope' }),
    } as Response);

    const result = await submitActivity({
      activityId: 'act789',
      mode: 'guided_practice',
      answers: { step1: 'wrong' },
      attemptNumber: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid submission envelope');
    }
  });

  it('includes artifact when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub789' }),
    } as Response);

    await submitActivity({
      activityId: 'act789',
      mode: 'assessment',
      answers: { graph: 'data' },
      attemptNumber: 1,
      artifact: { type: 'graph', data: [1, 2, 3] },
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.artifact).toEqual({ type: 'graph', data: [1, 2, 3] });
  });

  it('includes interactionHistory when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub790' }),
    } as Response);

    const history = [{ type: 'hint', timestamp: '2024-01-01T00:00:00Z' }];
    await submitActivity({
      activityId: 'act790',
      mode: 'guided_practice',
      answers: { step1: 'correct' },
      attemptNumber: 1,
      interactionHistory: history,
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.interactionHistory).toEqual(history);
  });

  it('includes studentFeedback when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub791' }),
    } as Response);

    await submitActivity({
      activityId: 'act791',
      mode: 'assessment',
      answers: { q1: 'A' },
      attemptNumber: 1,
      studentFeedback: 'This was challenging',
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.studentFeedback).toBe('This was challenging');
  });

  it('handles network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await submitActivity({
      activityId: 'act999',
      mode: 'assessment',
      answers: { q1: 'A' },
      attemptNumber: 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Network error');
    }
  });

  it('uses default status "submitted" when not provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub800' }),
    } as Response);

    await submitActivity({
      activityId: 'act800',
      mode: 'assessment',
      answers: { q1: 'A' },
      attemptNumber: 1,
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.status).toBe('submitted');
  });

  it('allows overriding status to "draft"', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub801' }),
    } as Response);

    await submitActivity({
      activityId: 'act801',
      mode: 'assessment',
      answers: { q1: 'A' },
      attemptNumber: 1,
      status: 'draft',
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.status).toBe('draft');
  });

  it('generates parts array from answers if not provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, submissionId: 'sub802' }),
    } as Response);

    await submitActivity({
      activityId: 'act802',
      mode: 'assessment',
      answers: { q1: 'A', q2: 42, q3: true },
      attemptNumber: 1,
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.parts).toHaveLength(3);
    expect(body.parts[0]).toMatchObject({
      partId: 'q1',
      rawAnswer: 'A',
      normalizedAnswer: 'a',
    });
    expect(body.parts[1]).toMatchObject({
      partId: 'q2',
      rawAnswer: 42,
      normalizedAnswer: '42',
    });
  });
});

describe('quadratic-formula attempt helpers', () => {
  beforeEach(() => vi.clearAllMocks());
  it('uses GET for read and POST for explicit Start', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ state: 'no_attempt' }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ state: 'exhausted' }) } as Response);
    await expect(getQuadraticFormulaAttempt('activity:1', 'guided_practice')).resolves.toEqual({ state: 'no_attempt' });
    await expect(startQuadraticFormulaAttempt('activity:1', 'guided_practice')).resolves.toEqual({ state: 'exhausted' });
    expect(fetch).toHaveBeenNthCalledWith(1, '/api/activities/quadratic-formula/attempt?activityId=activity%3A1&mode=guided_practice', { method: 'GET' });
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/activities/quadratic-formula/attempt?activityId=activity%3A1&mode=guided_practice', { method: 'POST' });
  });
  it('fails closed for private response fields and identity mismatch', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ state: 'pending', pendingSubmissionId: 'sub:1', activityId: 'wrong', mode: 'guided_practice', attemptOrdinal: 1, idempotencyKey: 'qf:sub:1', props: { presentationMode: 'guided', prompt: 'Solve.', equation: 'x=0', fieldHelp: { discriminant: 'd', x1: 'a', x2: 'b' } }, privateSeed: 7 }) } as Response);
    await expect(getQuadraticFormulaAttempt('activity:1', 'guided_practice')).resolves.toEqual({ state: 'unavailable' });
  });
  it('accepts a repeated-root final with a zero-weight x2 part', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ state: 'final', activityId: 'activity:1', mode: 'independent_practice', attemptOrdinal: 3, props: { presentationMode: 'independent', prompt: 'Solve.', equation: 'x^2=0' }, submissionId: 'sub:3', score: 2, maxScore: 2, answers: { discriminant: 0, x1: 0, x2: '' }, parts: [{ partId: 'discriminant', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x1', rawAnswer: 0, isCorrect: true, score: 1, maxScore: 1 }, { partId: 'x2', rawAnswer: '', isCorrect: true, score: 0, maxScore: 0 }] }) } as Response);
    await expect(getQuadraticFormulaAttempt('activity:1', 'independent_practice')).resolves.toMatchObject({ state: 'final', submissionId: 'sub:3', maxScore: 2 });
  });
  it('sends the pending ID only as a header and requires its exact receipt', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ submissionId: 'pending:1', score: 3, maxScore: 3 }) } as Response);
    const input = { activityId: 'activity:1', mode: 'independent_practice' as const, answers: { x: 1 }, attemptNumber: 2, idempotencyKey: 'qf:pending:1', pendingSubmissionId: 'pending:1' };
    await expect(createServerOwnedActivitySubmission(input)).resolves.toMatchObject({ success: true, submissionId: 'pending:1' });
    const options = vi.mocked(fetch).mock.calls[0][1]!;
    expect(options.headers).toEqual({ 'Content-Type': 'application/json', 'Idempotency-Key': 'qf:pending:1', 'X-Pending-Submission-Id': 'pending:1' });
    expect(JSON.parse(String(options.body))).not.toHaveProperty('pendingSubmissionId');
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ submissionId: 'other' }) } as Response);
    await expect(createServerOwnedActivitySubmission(input)).resolves.toMatchObject({ success: false, error: expect.stringMatching(/does not match/) });
  });
});
