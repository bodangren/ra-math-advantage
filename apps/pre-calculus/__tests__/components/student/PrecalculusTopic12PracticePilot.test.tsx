import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrecalculusTopic12PracticePilot } from '@/components/student/PrecalculusTopic12PracticePilot';
import {
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12TableAverageRateChoice } from '@math-platform/math-content/knowledge-space';

const guidedVariant = generateTopic12TableAverageRateChoice(1);
const independentVariant = generateTopic12TableAverageRateChoice(2);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function chooseOption(variant: typeof guidedVariant) {
  const radio = screen.getAllByRole('radio').find(
    (candidate) => (candidate as HTMLInputElement).value === variant.correctOptionId,
  );
  if (!radio) throw new Error(`Missing option ${variant.correctOptionId}`);
  fireEvent.click(radio);
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

describe('PrecalculusTopic12PracticePilot', () => {
  it('shows the bounded Topic 1.2 knowledge state when provided', () => {
    render(
      <PrecalculusTopic12PracticePilot
        knowledgeState={{
          nodeId: 'math.precalc.skill.1.2.compare-rates-of-change-across-intervals',
          title: 'Compare average rates of change across intervals',
          status: 'mastered',
          readiness: 'ready',
        }}
      />,
    );

    expect(screen.getByText('Compare average rates of change across intervals')).toBeTruthy();
    expect(screen.getByText('Mastery state: mastered')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
  });

  it.each([
    ['guided_practice', guidedVariant, PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID],
    ['independent_practice', independentVariant, PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID],
  ] as const)('renders the generated %s table without answer leakage', (mode, variant, activityId) => {
    const { container } = render(<PrecalculusTopic12PracticePilot mode={mode} />);

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByRole('table', { name: 'Life expectancy table' })).toBeTruthy();
    for (const row of variant.rows) {
      expect(screen.getByText(String(row.input))).toBeTruthy();
      expect(screen.getByText(String(row.output))).toBeTruthy();
    }
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('name', `${activityId}-interval-choice`);
    expect(container.textContent).not.toContain('finalAnswer');
    expect(container.textContent).not.toContain('solutionSteps');
    expect(container.textContent).not.toContain('gradingMetadata');
    expect(container.textContent).not.toContain('correctOptionId');

    if (mode === 'guided_practice') {
      expect(screen.getByText('For each interval, calculate change in output divided by change in input.')).toBeTruthy();
      expect(screen.getByText('Calculate change in output divided by change in input for each option.')).toBeTruthy();
    } else {
      expect(screen.queryByText('For each interval, calculate change in output divided by change in input.')).toBeNull();
      expect(screen.queryByText('Calculate change in output divided by change in input for each option.')).toBeNull();
    }
  });

  it.each([
    ['guided_practice', guidedVariant, PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID],
    ['independent_practice', independentVariant, PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID],
  ] as const)('submits the grade-free %s envelope, then opaque evidence', async (mode, variant, activityId) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: `${mode}-submission`,
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 table interval selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: true,
        kstApplied: true,
        delivery: 'new',
        decision: { reason: 'eligible' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PracticePilot mode={mode} />);

    chooseOption(variant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 table interval selections matched the server rubric.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe('/api/activities/precalculus-topic-1-2/submissions');
    const envelope = requestBody(createCall);
    expect(envelope).toMatchObject({
      contractVersion: 'practice.v1',
      activityId,
      mode,
      status: 'submitted',
      answers: { selectedOptionId: variant.correctOptionId },
      parts: [{ partId: 'selectedOptionId', rawAnswer: variant.correctOptionId }],
    });
    expect(Object.keys((envelope.parts as Array<Record<string, unknown>>)[0]!)).toEqual(['partId', 'rawAnswer']);
    expect(envelope).not.toHaveProperty('score');
    expect(envelope).not.toHaveProperty('maxScore');
    expect(envelope).not.toHaveProperty('isCorrect');
    expect(envelope).not.toHaveProperty('correctAnswer');

    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(requestBody(evidenceCall)).toEqual({ submissionId: `${mode}-submission` });
  });

  it('retries the same create envelope and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response({
        submissionId: 'topic-12-guided-submission',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 table interval selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({ error: 'evidence failed' }, 500))
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'replay',
        decision: { reason: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PracticePilot />);

    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    const retryCreate = screen.getByRole('button', { name: 'Retry submission' });
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(retryCreate);
    await screen.findByRole('alert');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const secondCall = fetchMock.mock.calls[1] as unknown[];
    expect(requestBody(secondCall)).toEqual(requestBody(firstCall));
    expect(new Headers((secondCall[1] as RequestInit).headers).get('Idempotency-Key')).toBe(firstKey);
    expect(screen.getByRole('button', { name: 'Retry evidence delivery' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Retry evidence delivery' }));
    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toEqual({
      submissionId: 'topic-12-guided-submission',
    });
    expect(screen.getByRole('status')).toHaveTextContent(/complete this skill with your teacher/i);
  });

  it('does not deliver evidence after a malformed create result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'topic-12-guided-submission',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 0,
      feedback: '1/1 table interval selections matched the server rubric.',
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PracticePilot />);

    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 table practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
