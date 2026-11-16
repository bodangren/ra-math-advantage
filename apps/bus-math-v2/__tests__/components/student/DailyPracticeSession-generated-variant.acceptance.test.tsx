import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { accountingEquationFamily } from '@/lib/practice/engine/families/accounting-equation';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  recordReview: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('convex/react', () => ({
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock('@/lib/convex/server', () => ({
  api: {
    srs: {
      getDueCards: 'api.srs.getDueCards',
      recordSrsReview: 'api.srs.recordSrsReview',
    },
  },
}));

vi.mock('@/lib/learning-evidence/bm2-pilot', async () => {
  const actual = await vi.importActual<typeof import('@/lib/learning-evidence/bm2-pilot')>(
    '@/lib/learning-evidence/bm2-pilot',
  );
  return { ...actual, isBm2PilotPublished: () => true };
});

vi.mock('@/lib/practice/engine/family-registry', async () => {
  const actual = await vi.importActual<typeof import('@/lib/practice/engine/families/accounting-equation')>(
    '@/lib/practice/engine/families/accounting-equation',
  );
  const practiceFamilyRegistry = {
    'accounting-equation': actual.accountingEquationFamily,
  };
  return {
    practiceFamilyRegistry,
    getPracticeFamily: (familyKey: string) => (
      practiceFamilyRegistry[familyKey as keyof typeof practiceFamilyRegistry] ?? null
    ),
  };
});

const { DailyPracticeSession } = await import('@/components/student/DailyPracticeSession');

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function continueToIndependentPractice() {
  expect(await screen.findByTestId('bm2-worked-example')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /continue to guided practice/i }));
  const guided = accountingEquationFamily.generate(8, { mode: 'guided_practice' });
  const guidedTerm = guided.equation.hiddenTermId;
  await userEvent.type(
    await screen.findByLabelText(new RegExp(`enter ${guided.terms[guidedTerm].label}`, 'i')),
    String(guided.equation[guidedTerm]),
  );
  await userEvent.click(screen.getByRole('button', { name: /submit answer/i }));
}

describe('BM2 generated accounting-equation pilot submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', (url: string, options?: RequestInit) => url === '/api/srs' ? Promise.resolve(jsonResponse(mocks.useQuery())) : mocks.fetch(url, options));
    mocks.useMutation.mockReturnValue(mocks.recordReview);
    mocks.useQuery.mockReturnValue([
      {
        _id: 'srs_cards:generated-accounting-equation',
        cardId: 'srs_cards:generated-accounting-equation',
        studentId: 'profiles:bm2-generated-variant-student',
        objectiveId: 'math.bm2.skill.1.1.apply-accounting-equation',
        problemFamilyId: 'accounting-equation',
        stability: 1,
        difficulty: 5,
        state: 'new',
        dueDate: '2026-08-19T00:00:00.000Z',
        elapsedDays: 0,
        scheduledDays: 0,
        // DailyPracticeSession generates with reps + 1, so this is seed 7.
        reps: 6,
        lapses: 0,
        lastReview: null,
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
      },
    ]);
    mocks.fetch
      .mockResolvedValueOnce(jsonResponse({
        submissionId: 'activity_submissions:bm2-generated-variant',
        score: 1,
        maxScore: 1,
        feedback: 'Correct equation balance.',
        attemptOrdinal: 3,
      }))
      .mockResolvedValueOnce(jsonResponse({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
      }));
  });

  it('submits the real generated activity ID and sends only its opaque ID to evidence', async () => {
    const expectedDefinition = accountingEquationFamily.generate(9, { mode: 'independent_practice' });
    expect(expectedDefinition.activityId).toMatch(/^accounting-equation-9-(assets|liabilities|equity)$/);
    expect(expectedDefinition.activityId).not.toBe('accounting-equation');
    expect(expectedDefinition.mode).toBe('independent_practice');

    render(<DailyPracticeSession studentId="profiles:bm2-generated-variant-student" />);
    await continueToIndependentPractice();

    const hiddenTermId = expectedDefinition.equation.hiddenTermId;
    const hiddenTermLabel = expectedDefinition.terms[hiddenTermId]?.label ?? hiddenTermId;
    await userEvent.type(
      await screen.findByLabelText(new RegExp(`enter ${hiddenTermLabel}`, 'i')),
      String(expectedDefinition.equation[hiddenTermId]),
    );
    await userEvent.click(screen.getByRole('button', { name: /submit answer/i }));

    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2));

    const producerCall = mocks.fetch.mock.calls[0] ?? [];
    expect(producerCall[0]).toBe('/api/progress/assessment');
    const producerOptions = producerCall[1] as RequestInit;
    const producerBody = JSON.parse(String(producerOptions.body));
    expect(producerBody).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: expectedDefinition.activityId,
      mode: 'independent_practice',
      status: 'submitted',
      answers: {
        [expectedDefinition.equation.hiddenTermId]: (
          expectedDefinition.equation[expectedDefinition.equation.hiddenTermId]
        ),
      },
    });
    expect(producerBody.activityId).not.toBe('accounting-equation');
    expect(producerBody.parts).toEqual([
      expect.objectContaining({
        partId: expectedDefinition.equation.hiddenTermId,
        rawAnswer: expectedDefinition.equation[expectedDefinition.equation.hiddenTermId],
      }),
    ]);
    const idempotencyKey = new Headers(producerOptions.headers).get('Idempotency-Key');
    expect(idempotencyKey).toEqual(expect.any(String));
    expect(idempotencyKey?.trim().length).toBeGreaterThan(0);

    const evidenceCall = mocks.fetch.mock.calls[1] ?? [];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/bm2-pilot');
    const evidenceBody = JSON.parse(String((evidenceCall[1] as RequestInit).body));
    expect(evidenceBody).toStrictEqual({
      submissionId: 'activity_submissions:bm2-generated-variant',
    });
    expect(JSON.stringify(evidenceBody)).not.toContain('accounting-equation-7-');
    expect(JSON.stringify(evidenceBody)).not.toContain('score');
    expect(JSON.stringify(evidenceBody)).not.toContain('maxScore');
    expect(mocks.recordReview).not.toHaveBeenCalled();
  });

  it('retries only opaque evidence delivery after the generated submission exists', async () => {
    mocks.fetch.mockReset();
    mocks.fetch
      .mockResolvedValueOnce(jsonResponse({
        submissionId: 'activity_submissions:bm2-generated-variant',
        score: 1,
        maxScore: 1,
        feedback: 'Correct equation balance.',
        attemptOrdinal: 3,
      }))
      .mockResolvedValueOnce(jsonResponse({ error: 'Evidence delivery failed' }, 500))
      .mockResolvedValueOnce(jsonResponse({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
      }));

    render(<DailyPracticeSession studentId="profiles:bm2-generated-variant-student" />);
    await continueToIndependentPractice();

    const expectedDefinition = accountingEquationFamily.generate(9, { mode: 'independent_practice' });
    const hiddenTermId = expectedDefinition.equation.hiddenTermId;
    const hiddenTermLabel = expectedDefinition.terms[hiddenTermId]?.label ?? hiddenTermId;
    await userEvent.type(
      await screen.findByLabelText(new RegExp(`enter ${hiddenTermLabel}`, 'i')),
      String(expectedDefinition.equation[hiddenTermId]),
    );
    await userEvent.click(screen.getByRole('button', { name: /submit answer/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/evidence delivery failed|retry/i);
    const retryButton = screen.getByRole('button', { name: /retry evidence delivery/i });
    expect(mocks.fetch).toHaveBeenCalledTimes(2);

    const initialEvidence = JSON.parse(String((mocks.fetch.mock.calls[1]?.[1] as RequestInit).body));
    expect(initialEvidence).toStrictEqual({
      submissionId: 'activity_submissions:bm2-generated-variant',
    });

    await userEvent.click(retryButton);

    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(3));
    expect(mocks.fetch.mock.calls[2]?.[0]).toBe('/api/learning-evidence/bm2-pilot');
    const retryEvidence = JSON.parse(String((mocks.fetch.mock.calls[2]?.[1] as RequestInit).body));
    expect(retryEvidence).toStrictEqual({
      submissionId: 'activity_submissions:bm2-generated-variant',
    });
    expect(JSON.stringify(retryEvidence)).not.toContain('accounting-equation-');
    expect(JSON.stringify(retryEvidence)).not.toContain('score');
    expect(JSON.stringify(retryEvidence)).not.toContain('maxScore');
    expect(mocks.fetch.mock.calls.filter(([url]) => url === '/api/progress/assessment')).toHaveLength(1);
  });

  it('retries a lost generated submission create with the identical envelope and Idempotency-Key', async () => {
    mocks.fetch.mockReset();
    mocks.fetch
      .mockResolvedValueOnce(jsonResponse({ error: 'Unable to create BM2 activity submission' }, 500))
      .mockResolvedValueOnce(jsonResponse({
        submissionId: 'activity_submissions:bm2-generated-variant',
        score: 1,
        maxScore: 1,
        feedback: 'Correct equation balance.',
        attemptOrdinal: 3,
      }))
      .mockResolvedValueOnce(jsonResponse({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
      }));

    render(<DailyPracticeSession studentId="profiles:bm2-generated-variant-student" />);
    await continueToIndependentPractice();

    const expectedDefinition = accountingEquationFamily.generate(9, { mode: 'independent_practice' });
    const hiddenTermId = expectedDefinition.equation.hiddenTermId;
    const hiddenTermLabel = expectedDefinition.terms[hiddenTermId]?.label ?? hiddenTermId;
    await userEvent.type(
      await screen.findByLabelText(new RegExp(`enter ${hiddenTermLabel}`, 'i')),
      String(expectedDefinition.equation[hiddenTermId]),
    );
    await userEvent.click(screen.getByRole('button', { name: /submit answer/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/unable to create|retry/i);
    const retryButton = screen.getByRole('button', { name: /retry submission/i });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);

    const initialCreate = mocks.fetch.mock.calls[0] ?? [];
    const initialEnvelope = JSON.parse(String((initialCreate[1] as RequestInit).body));
    const initialKey = new Headers((initialCreate[1] as RequestInit).headers).get('Idempotency-Key');
    expect(initialKey).toEqual(expect.any(String));
    expect(initialKey?.trim().length).toBeGreaterThan(0);

    await userEvent.click(retryButton);

    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(3));
    const retryCreate = mocks.fetch.mock.calls[1] ?? [];
    expect(retryCreate[0]).toBe('/api/progress/assessment');
    expect(JSON.parse(String((retryCreate[1] as RequestInit).body))).toStrictEqual(initialEnvelope);
    expect(new Headers((retryCreate[1] as RequestInit).headers).get('Idempotency-Key')).toBe(initialKey);

    const evidenceCall = mocks.fetch.mock.calls[2] ?? [];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/bm2-pilot');
    expect(JSON.parse(String((evidenceCall[1] as RequestInit).body))).toStrictEqual({
      submissionId: 'activity_submissions:bm2-generated-variant',
    });
  });
});
