import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  generateTopic12NegativeRateContextChoice,
  generateTopic12NegativeRateContextChoiceOutput,
} from '@math-platform/math-content/knowledge-space';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

import { PrecalculusTopic12NegativeRateContextPracticePilot } from '@/components/student/PrecalculusTopic12NegativeRateContextPracticePilot';
import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const variant = generateTopic12NegativeRateContextChoice(1);
const independentVariant = generateTopic12NegativeRateContextChoice(2);
const independentAnswer = (generateTopic12NegativeRateContextChoiceOutput(2).expectedAnswer as { selectedOptionId: string }).selectedOptionId;
const KNOWLEDGE_STATE = {
  nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  title: 'Model negative-rate contexts',
  status: 'in_progress' as const,
  readiness: 'ready' as const,
};
const workedOutput = generateTopic12NegativeRateContextChoiceOutput(0);
const GUIDED_STEPS = [
  'Determine how y changes as x increases in each option.',
  'Select the option in which y always decreases as x increases.',
];
const FIELD_HELP = 'A negative rate of change means y decreases as x increases.';
const CREATE_URL = '/api/activities/precalculus-topic-1-2-negative-rate-context/submissions';
const EVIDENCE_URL = '/api/learning-evidence/precalculus-pilot';
const EVIDENCE_ELIGIBLE = {
  persisted: true,
  masteryApplied: true,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: true,
    reason: 'eligible',
    masteryBearing: true,
  },
};
const EVIDENCE_AWAITING = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'awaiting_teacher_exposure',
    eligible: false,
    reason: 'awaiting_teacher_exposure',
    masteryBearing: true,
  },
};
const EVIDENCE_SAVED = {
  persisted: false,
  masteryApplied: false,
  kstApplied: false,
  delivery: 'new',
  decision: {
    idempotency: 'new',
    exposureState: 'introduced',
    eligible: false,
    reason: 'node_not_enabled',
    masteryBearing: false,
  },
};

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
    'correctOptionId',
    'correctAnswer',
    'expectedAnswer',
    'gradingMetadata',
    'solutionSteps',
    'finalAnswer',
    'relationship',
    'correctness',
    'score',
    'maxScore',
  ]) {
    expect(serialized).not.toContain(`"${key}"`);
  }
}

function selectFirstOption() {
  fireEvent.click(screen.getByRole('radio', { name: /^A/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
}

describe('PrecalculusTopic12NegativeRateContextPracticePilot', () => {
  it('renders the bounded knowledge state when provided', () => {
    render(<PrecalculusTopic12NegativeRateContextPracticePilot knowledgeState={KNOWLEDGE_STATE} />);

    expect(screen.getByText('Model negative-rate contexts')).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
  });

  it('does not render a knowledge state when it is absent', () => {
    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);

    expect(screen.queryByText('Model negative-rate contexts')).toBeNull();
    expect(screen.queryByText('Mastery state: in progress')).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('renders seed-1 Guided practice and sends the exact raw envelope before evidence delivery', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-practice-1',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response(EVIDENCE_ELIGIBLE));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);

    expect(screen.getByRole('heading', { name: 'Guided Practice: Model a Negative Rate Context' })).toBeTruthy();
    expect(screen.getByText(variant.prompt)).toBeTruthy();
    for (const option of variant.options) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeTruthy();
    expect(screen.getByText(FIELD_HELP)).toBeTruthy();
    expect(screen.queryByText(/correctOptionId|expectedAnswer|solutionSteps|finalAnswer|gradingMetadata/i)).toBeNull();
    expect(screen.queryByText(/Option [A-D] is correct/i)).toBeNull();
    for (const step of workedOutput.solutionSteps as Array<{ description: string }>) {
      expect(screen.queryByText(step.description)).toBeNull();
    }
    expect(screen.queryByText('Option B is correct because x increases while y decreases.')).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();

    selectFirstOption();
    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 context selections matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [createUrl, createInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toBe(CREATE_URL);
    expect(createInit.method).toBe('POST');
    expect(new Headers(createInit.headers).get('content-type')).toBe('application/json');
    const key = new Headers(createInit.headers).get('Idempotency-Key');
    expect(key).toEqual(expect.any(String));
    expect(key).not.toBe('');
    const createBody = JSON.parse(String(createInit.body)) as Record<string, unknown>;
    expect(createBody.activityId).toBe(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID);
    expect(createBody.mode).toBe('guided_practice');
    expect(createBody.answers).toEqual({ selectedOptionId: 'A' });
    expect(createBody.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'A' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(createBody)).not.toThrow();
    expectNoAuthorityKeys(createBody);
    expect(Object.keys(createBody)).toEqual([
      'contractVersion',
      'activityId',
      'mode',
      'status',
      'attemptNumber',
      'submittedAt',
      'answers',
      'parts',
    ]);

    const [evidenceUrl, evidenceInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(evidenceUrl).toBe(EVIDENCE_URL);
    expect(JSON.parse(String(evidenceInit.body))).toStrictEqual({
      submissionId: 'activity_submissions:negative-rate-practice-1',
    });
  });

  it('shows a server zero score and awaiting-teacher message', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-practice-0',
        score: 0,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '0/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response(EVIDENCE_AWAITING));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);
    selectFirstOption();

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('0/1 context selections matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');
  });

  it('renders seed-2 Independent practice without Guided or Worked leakage', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-independent-practice',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response(EVIDENCE_ELIGIBLE));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot mode="independent_practice" />);

    expect(screen.getByRole('heading', { name: 'Independent Practice: Model a Negative Rate Context' })).toBeTruthy();
    expect(independentAnswer).toBe('B');
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
    for (const option of independentVariant.options) {
      expect(screen.getByText(`x = ${option.xDefinition}`)).toBeTruthy();
      expect(screen.getByText(`y = ${option.yDefinition}`)).toBeTruthy();
    }
    expect(screen.queryByText(GUIDED_STEPS[0])).toBeNull();
    expect(screen.queryByText(GUIDED_STEPS[1])).toBeNull();
    expect(screen.queryByText(FIELD_HELP)).toBeNull();
    expect(screen.queryByText(/Option B is correct/i)).toBeNull();
    expect(screen.queryByText(/For an always-negative rate/i)).toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /^B/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 context selections matched the server rubric.');
    expect(screen.getByRole('status')).toHaveTextContent('Mastery Advantage updated your practice record.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [createUrl, createInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toBe(CREATE_URL);
    const createBody = JSON.parse(String(createInit.body)) as Record<string, unknown>;
    expect(createBody.activityId).toBe(PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID);
    expect(createBody.mode).toBe('independent_practice');
    expect(createBody.answers).toEqual({ selectedOptionId: 'B' });
    expect(createBody.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'B' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(createBody)).not.toThrow();
    expectNoAuthorityKeys(createBody);
    expect(JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body))).toStrictEqual({
      submissionId: 'activity_submissions:negative-rate-independent-practice',
    });
  });

  it('locks duplicate clicks and reuses the same envelope and key after create failure', async () => {
    let resolveFirst!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-practice-retry',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 2,
        feedback: '1/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);
    selectFirstOption();
    expect(fetchMock).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveFirst(response({ error: 'Temporary failure.' }, 500));
    const retryButton = await screen.findByRole('button', { name: 'Retry submission' });
    const firstCall = fetchMock.mock.calls[0] as [string, RequestInit];
    const firstKey = new Headers(firstCall[1].headers).get('Idempotency-Key');
    const firstBody = firstCall[1].body;
    fireEvent.click(retryButton);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const secondCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(new Headers(secondCall[1].headers).get('Idempotency-Key')).toBe(firstKey);
    expect(secondCall[1].body).toBe(firstBody);
  });

  it('retries only evidence after create succeeds and evidence fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-practice-evidence-retry',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({ error: 'Evidence unavailable.' }, 500))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);
    selectFirstOption();
    const retryButton = await screen.findByRole('button', { name: 'Retry evidence delivery' });
    fireEvent.click(retryButton);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(JSON.parse(String((fetchMock.mock.calls[2] as [string, RequestInit])[1].body))).toStrictEqual({
      submissionId: 'activity_submissions:negative-rate-practice-evidence-retry',
    });
  });

  it.each([
    ['missing outer fields', {}],
    ['an extra outer field', { ...EVIDENCE_ELIGIBLE, extra: true }],
    ['a wrong boolean type', { ...EVIDENCE_ELIGIBLE, masteryApplied: 'yes' }],
    ['a missing decision field', {
      ...EVIDENCE_ELIGIBLE,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        masteryBearing: true,
      },
    }],
    ['an extra decision field', {
      ...EVIDENCE_ELIGIBLE,
      decision: { ...EVIDENCE_ELIGIBLE.decision, extra: true },
    }],
    ['an unknown reason', {
      ...EVIDENCE_ELIGIBLE,
      decision: { ...EVIDENCE_ELIGIBLE.decision, reason: 'unknown' },
    }],
    ['an unknown exposure state', {
      ...EVIDENCE_ELIGIBLE,
      decision: { ...EVIDENCE_ELIGIBLE.decision, exposureState: 'pending' },
    }],
    ['invalid delivery value', {
      ...EVIDENCE_ELIGIBLE,
      delivery: 'invalid',
    }],
    ['a non-OK response', response({ error: 'private evidence detail' }, 500)],
  ])('keeps the opaque submission and retries only evidence for %s', async (_label, malformedEvidence) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'activity_submissions:negative-rate-malformed-evidence',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 context selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(malformedEvidence instanceof Response ? malformedEvidence : response(malformedEvidence))
      .mockResolvedValueOnce(response(EVIDENCE_SAVED));
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);
    selectFirstOption();
    await screen.findByRole('button', { name: 'Retry evidence delivery' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Your practice was saved.'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(CREATE_URL);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(EVIDENCE_URL);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(EVIDENCE_URL);
    expect(JSON.parse(String((fetchMock.mock.calls[2] as [string, RequestInit])[1].body))).toStrictEqual({
      submissionId: 'activity_submissions:negative-rate-malformed-evidence',
    });
  });

  it.each([
    ['an HTTP error', response({ error: 'private detail' }, 500)],
    ['a non-object response', response(['submission-id'])],
    ['malformed JSON', malformedJsonResponse()],
    ['a blank submission ID', response({ submissionId: ' ', score: 1, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback' })],
    ['an invalid score', response({ submissionId: 'submission', score: 2, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback' })],
    ['an invalid maximum score', response({ submissionId: 'submission', score: 1, maxScore: 2, attemptOrdinal: 1, feedback: 'feedback' })],
    ['an invalid attempt ordinal', response({ submissionId: 'submission', score: 1, maxScore: 1, attemptOrdinal: 0, feedback: 'feedback' })],
    ['blank feedback', response({ submissionId: 'submission', score: 1, maxScore: 1, attemptOrdinal: 1, feedback: ' ' })],
    ['an extra result field', response({ submissionId: 'submission', score: 1, maxScore: 1, attemptOrdinal: 1, feedback: 'feedback', answer: 'B' })],
  ])('blocks evidence and shows a safe retry state for %s', async (_label, serverResponse) => {
    const fetchMock = vi.fn().mockResolvedValue(serverResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<PrecalculusTopic12NegativeRateContextPracticePilot />);
    selectFirstOption();

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 negative-rate context practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('private detail');
  });
});
