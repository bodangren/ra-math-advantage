import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  PrecalculusTopic12GraphPracticePilot,
  type PrecalculusTopic12GraphKnowledgeState,
  type PrecalculusTopic12GraphPracticeMode,
} from '@/components/student/PrecalculusTopic12GraphPracticePilot';
import {
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12GraphAverageRateChoice } from '@math-platform/math-content/knowledge-space';

const guidedVariant = generateTopic12GraphAverageRateChoice(1);
const independentVariant = generateTopic12GraphAverageRateChoice(2);
const graphKnowledgeState: PrecalculusTopic12GraphKnowledgeState = {
  nodeId: 'math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change',
  title: 'Compute and interpret the average rate of change',
  status: 'in_progress',
  readiness: 'ready',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function chooseOption(variant: typeof guidedVariant, optionId = variant.correctOptionId) {
  const radio = screen.getAllByRole('radio').find(
    (candidate) => (candidate as HTMLInputElement).value === optionId,
  );
  if (!radio) throw new Error(`Missing option ${optionId}`);
  fireEvent.click(radio);
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function activityIdFor(mode: PrecalculusTopic12GraphPracticeMode): string {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
}

describe('PrecalculusTopic12GraphPracticePilot', () => {
  it.each([
    ['guided_practice', guidedVariant, 1, 'Guided'],
    ['independent_practice', independentVariant, 0, 'Independent'],
  ] as const)('renders the generated %s graph and submits only a raw selected option', async (
    mode,
    variant,
    score,
    label,
  ) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: `${mode}-submission`,
        score,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: `${score}/1 graph selections matched the server rubric.`,
      }))
      .mockResolvedValueOnce(response({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(
      <PrecalculusTopic12GraphPracticePilot
        knowledgeState={graphKnowledgeState}
        mode={mode}
      />,
    );

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByRole('img', { name: /h\(1\)=.*h\(3\)=.*h\(5\)=.*h\(7\)=.*h\(9\)=/i })).toBeTruthy();
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('h(x)')).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const option of variant.options) {
      expect(screen.getByRole('radio', { name: new RegExp(`${option.label}.*${option.startInput} to ${option.endInput}`) })).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expect(container.textContent).not.toContain('correctOptionId');
    expect(container.textContent).not.toContain('finalAnswer');
    expect(container.textContent).not.toContain(variant.solutionSteps[0]!);

    if (mode === 'guided_practice') {
      expect(screen.getByText('Calculate (change in output)/(change in input) for each interval.')).toBeTruthy();
      expect(screen.getByText('Compare the four average rates and select the greatest.')).toBeTruthy();
      expect(screen.getByText('Use the endpoint values for each option.')).toBeTruthy();
    } else {
      expect(screen.queryByText('Calculate (change in output)/(change in input) for each interval.')).toBeNull();
      expect(screen.queryByText('Use the endpoint values for each option.')).toBeNull();
      expect(screen.queryByText(/The greatest average rate is/)).toBeNull();
    }

    chooseOption(variant);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText(`Server score: ${score}/1`)).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent(`${score}/1 graph selections matched the server rubric.`);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe('/api/activities/precalculus-topic-1-2-graph/submissions');
    const envelope = requestBody(createCall);
    expect(envelope).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: activityIdFor(mode),
      mode,
      status: 'submitted',
      answers: { selectedOptionId: variant.correctOptionId },
      parts: [{ partId: 'selectedOptionId', rawAnswer: variant.correctOptionId }],
    });
    expect(Object.keys((envelope.parts as Array<Record<string, unknown>>)[0]!)).toEqual(['partId', 'rawAnswer']);
    expect(envelope).not.toHaveProperty('correctOptionId');
    expect(envelope).not.toHaveProperty('correctAnswer');
    expect(envelope).not.toHaveProperty('expectedAnswer');
    expect(envelope).not.toHaveProperty('score');
    expect(envelope).not.toHaveProperty('gradingMetadata');
    expect(envelope).not.toHaveProperty('solutionSteps');
    expect(new Headers((createCall[1] as RequestInit).headers).get('content-type')).toBe('application/json');
    expect(new Headers((createCall[1] as RequestInit).headers).get('Idempotency-Key')).toEqual(expect.any(String));

    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(requestBody(evidenceCall)).toEqual({ submissionId: `${mode}-submission` });
    expect(Object.keys(requestBody(evidenceCall))).toEqual(['submissionId']);
    expect(label).toBe(mode === 'guided_practice' ? 'Guided' : 'Independent');
  });

  it.each([
    ['not_started', 'not started'],
    ['in_progress', 'in progress'],
    ['mastered', 'mastered'],
    ['decaying', 'decaying'],
  ] as const)('renders the bounded %s knowledge state', (status, expectedStatus) => {
    const { container } = render(
      <PrecalculusTopic12GraphPracticePilot
        knowledgeState={{ ...graphKnowledgeState, status }}
      />,
    );

    expect(screen.getByText(graphKnowledgeState.title)).toBeTruthy();
    expect(screen.getByText(`Mastery state: ${expectedStatus}`)).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(container.textContent).not.toContain('stability');
    expect(container.textContent).not.toContain('difficulty');
    expect(container.textContent).not.toContain('dueDate');
    expect(container.textContent).not.toContain('probability');
  });

  it('does not render a knowledge-state block without the optional prop', () => {
    render(<PrecalculusTopic12GraphPracticePilot mode="independent_practice" />);

    expect(screen.queryByText(/Mastery state:/)).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
  });

  it('retries the same create envelope and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response({
        submissionId: 'graph-guided-submission',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 graph selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({ error: 'evidence failed' }, 500))
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'eligible' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphPracticePilot />);

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
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toEqual({ submissionId: 'graph-guided-submission' });
    expect(screen.getByRole('status')).toHaveTextContent(/mastery advantage updated your practice record/i);
  });

  it('shows the teacher-exposure message when evidence is awaiting exposure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'graph-independent-submission',
        score: 0,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '0/1 graph selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'awaiting_teacher_exposure', exposureState: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphPracticePilot mode="independent_practice" />);
    chooseOption(independentVariant, 'A');
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent(/complete this skill with your teacher/i);
  });

  it('does not deliver evidence after a malformed create result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'graph-guided-submission',
      score: 2,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: 'invalid',
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphPracticePilot />);
    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 graph practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('disables duplicate clicks while the create request is saving', async () => {
    let resolveCreate!: (value: Response) => void;
    const createResponse = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValueOnce(response({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphPracticePilot />);
    chooseOption(guidedVariant);

    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response({
      submissionId: 'graph-guided-submission',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 graph selections matched the server rubric.',
    }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('shows a safe retry for malformed JSON and HTTP errors', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{', { status: 500, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12GraphPracticePilot />);
    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 graph practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
  });
});
