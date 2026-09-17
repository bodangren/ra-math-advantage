import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  PrecalculusTopic12PointwisePracticePilot,
  type PrecalculusTopic12PointwiseKnowledgeState,
  type PrecalculusTopic12PointwisePracticeMode,
} from '@/components/student/PrecalculusTopic12PointwisePracticePilot';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';

const guidedVariant = generateTopic12PointwiseLeastRateChoice(1);
const independentVariant = generateTopic12PointwiseLeastRateChoice(2);
const pointwiseKnowledgeState: PrecalculusTopic12PointwiseKnowledgeState = {
  nodeId: 'math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs',
  title: 'Identify the least pointwise rate of change from graphs',
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

function activityIdFor(mode: PrecalculusTopic12PointwisePracticeMode): string {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
}

describe('PrecalculusTopic12PointwisePracticePilot', () => {
  it.each([
    ['guided_practice', guidedVariant, 'Guided'],
    ['independent_practice', independentVariant, 'Independent'],
  ] as const)('renders the generated %s graph and sends only a raw selected option', async (
    mode,
    variant,
    label,
  ) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: `${mode}-submission`,
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 pointwise selections matched the server rubric.',
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
      <PrecalculusTopic12PointwisePracticePilot
        knowledgeState={pointwiseKnowledgeState}
        mode={mode}
      />,
    );

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    const graphDescription = variant.labeledPoints
      .map((point) => `${point.label}\\(${point.x}, ${point.y}\\)`)
      .join('.*');
    expect(screen.getByRole('img', { name: new RegExp(`${graphDescription}.*least instantaneous rate of change`, 'i') })).toBeTruthy();
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('y')).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const option of variant.options) {
      const point = variant.labeledPoints.find((candidate) => candidate.id === option.id)!;
      expect(screen.getByRole('radio', { name: new RegExp(`^${option.label}.*${point.x}`) })).toBeTruthy();
    }
    expect(screen.getByText(pointwiseKnowledgeState.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expect(container.textContent).not.toMatch(/correctOptionId|correctAnswer|answerKey|expectedAnswer|score|grading|solution|finalAnswer|slope|derivative/i);
    expect(container.textContent).not.toContain(variant.solutionSteps[0]!);

    if (mode === 'guided_practice') {
      expect(screen.getByText('Compare whether the graph is rising or falling at each labeled point.')).toBeTruthy();
      expect(screen.getByText('Among the falling points, compare steepness and select the most negative rate.')).toBeTruthy();
      expect(screen.getByText('A steeper downward graph has a smaller rate of change.')).toBeTruthy();
    } else {
      expect(screen.queryByText(/Compare whether the graph is rising/i)).toBeNull();
      expect(screen.queryByText(/steeper downward graph/i)).toBeNull();
    }

    chooseOption(variant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('1/1 pointwise selections matched the server rubric.');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe('/api/activities/precalculus-topic-1-2-pointwise/submissions');
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
      <PrecalculusTopic12PointwisePracticePilot
        knowledgeState={{ ...pointwiseKnowledgeState, status }}
      />,
    );

    expect(screen.getByText(pointwiseKnowledgeState.title)).toBeTruthy();
    expect(screen.getByText(`Mastery state: ${expectedStatus}`)).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(container.textContent).not.toMatch(/stability|difficulty|dueDate|probability|evidence|SRS/i);
  });

  it('does not render a knowledge-state block without the optional prop', () => {
    render(<PrecalculusTopic12PointwisePracticePilot mode="independent_practice" />);

    expect(screen.queryByText(/Mastery state:/)).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
    expect(screen.getByText(independentVariant.prompt)).toBeTruthy();
  });

  it('retries the same create envelope and key, then retries evidence only', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response({
        submissionId: 'pointwise-guided-submission',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 pointwise selections matched the server rubric.',
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
    render(<PrecalculusTopic12PointwisePracticePilot />);

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
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toEqual({ submissionId: 'pointwise-guided-submission' });
    expect(screen.getByRole('status')).toHaveTextContent(/mastery advantage updated your practice record/i);
  });

  it('shows the teacher-exposure message when evidence is awaiting exposure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'pointwise-independent-submission',
        score: 0,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '0/1 pointwise selections matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'awaiting_teacher_exposure', exposureState: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwisePracticePilot mode="independent_practice" />);
    chooseOption(independentVariant, 'A');
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent(/complete this skill with your teacher/i);
  });

  it('does not deliver evidence after a malformed create result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'pointwise-guided-submission',
      score: 2,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: 'invalid',
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwisePracticePilot />);
    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 pointwise practice.');
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
    render(<PrecalculusTopic12PointwisePracticePilot />);
    chooseOption(guidedVariant);

    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response({
      submissionId: 'pointwise-guided-submission',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 pointwise selections matched the server rubric.',
    }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('shows a safe retry for malformed JSON and HTTP errors', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{', { status: 500, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwisePracticePilot />);
    chooseOption(guidedVariant);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 pointwise practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
  });
});
