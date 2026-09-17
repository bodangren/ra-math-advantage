import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  PrecalculusTopic12PointwiseOrderingPracticePilot,
  type PrecalculusTopic12PointwiseOrderingKnowledgeState,
  type PrecalculusTopic12PointwiseOrderingPracticeMode,
} from '@/components/student/PrecalculusTopic12PointwiseOrderingPracticePilot';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';
import {
  generateTopic12PointwiseRateOrdering,
  generateTopic12PointwiseRateOrderingOutput,
} from '@math-platform/math-content/knowledge-space';

const guidedVariant = generateTopic12PointwiseRateOrdering(1);
const independentVariant = generateTopic12PointwiseRateOrdering(2);
const pointwiseKnowledgeState: PrecalculusTopic12PointwiseOrderingKnowledgeState = {
  nodeId: 'math.precalc.skill.1.2.compare-pointwise-rates-of-change-from-graphs',
  title: 'Compare pointwise rates of change from graphs',
  status: 'in_progress',
  readiness: 'ready',
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedOrder(seed: number): string[] {
  return [
    ...(generateTopic12PointwiseRateOrderingOutput(seed).expectedAnswer as { orderedPointIds: readonly string[] }).orderedPointIds,
  ];
}

function activityIdFor(mode: PrecalculusTopic12PointwiseOrderingPracticeMode): string {
  return mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID;
}

function requestBody(call: unknown[]): Record<string, unknown> {
  return JSON.parse(String((call[1] as RequestInit).body)) as Record<string, unknown>;
}

function chooseOrder(order: readonly string[]) {
  const selects = screen.getAllByRole('combobox');
  for (const [index, pointId] of order.entries()) {
    fireEvent.change(selects[index]!, { target: { value: pointId } });
  }
}

describe('PrecalculusTopic12PointwiseOrderingPracticePilot', () => {
  it.each([
    ['guided_practice', guidedVariant, 'Guided'],
    ['independent_practice', independentVariant, 'Independent'],
  ] as const)('renders the generated %s graph and sends a raw ordering', async (mode, variant, label) => {
    const order = expectedOrder(variant.seed);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: `${mode}-submission`,
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 pointwise ordering matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: true,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'eligible' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(
      <PrecalculusTopic12PointwiseOrderingPracticePilot
        mode={mode}
        knowledgeState={pointwiseKnowledgeState}
      />,
    );

    expect(screen.getByText(variant.prompt)).toBeTruthy();
    expect(screen.getByTestId('pointwise-ordering-axes')).toHaveAttribute('d', 'M42 80H346M194 146V14');
    expect(screen.getByText('x')).toBeTruthy();
    expect(screen.getByText('y')).toBeTruthy();
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    for (const point of variant.labeledPoints) {
      const labelNode = screen.getByTestId(`pointwise-ordering-label-${point.label}`);
      expect(labelNode).toHaveAttribute('data-point-x', String(point.x));
      expect(labelNode).toHaveAttribute('data-point-y', String(point.y));
    }
    const graphDescription = variant.labeledPoints
      .map((point) => `${point.label}\\(${point.x}, ${point.y}\\)`)
      .join('.*');
    expect(screen.getByRole('img', { name: new RegExp(graphDescription, 'i') })).toBeTruthy();
    expect(screen.getByText(pointwiseKnowledgeState.title)).toBeTruthy();
    expect(screen.getByText('Mastery state: in progress')).toBeTruthy();
    expect(screen.getByText('Readiness: Ready')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
    expect(container.textContent).not.toMatch(/orderedPointIds|expectedAnswer|correctAnswer|solutionSteps|gradingMetadata|slope|derivative/i);

    if (mode === 'guided_practice') {
      expect(screen.getByText('Compare local direction and steepness at each labeled point.')).toBeTruthy();
      expect(screen.getAllByText('Order the rates from least to greatest.')).toHaveLength(2);
      expect(screen.getByText('A steeper downward graph has a smaller rate of change.')).toBeTruthy();
    } else {
      expect(screen.queryByText(/Compare local direction/i)).toBeNull();
      expect(screen.queryByText(/steeper downward graph/i)).toBeNull();
    }

    chooseOrder(order);
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 1/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent(/mastery advantage updated your practice record/i);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const createCall = fetchMock.mock.calls[0] as unknown[];
    expect(createCall[0]).toBe('/api/activities/precalculus-topic-1-2-pointwise-ordering/submissions');
    const envelope = requestBody(createCall);
    expect(envelope).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: activityIdFor(mode),
      mode,
      status: 'submitted',
      answers: { orderedPointIds: order },
      parts: [{ partId: 'orderedPointIds', rawAnswer: order }],
    });
    expect(Object.keys((envelope.parts as Array<Record<string, unknown>>)[0]!)).toEqual(['partId', 'rawAnswer']);
    expect(envelope).not.toHaveProperty('correctOptionId');
    expect(envelope).not.toHaveProperty('correctAnswer');
    expect(envelope).not.toHaveProperty('expectedAnswer');
    expect(envelope).not.toHaveProperty('gradingMetadata');
    expect(envelope).not.toHaveProperty('solutionSteps');
    expect(JSON.stringify(envelope)).not.toMatch(/"(correctAnswer|expectedAnswer|gradingMetadata|solutionSteps|slope|derivative)"\s*:/);
    expect(new Headers((createCall[1] as RequestInit).headers).get('content-type')).toBe('application/json');
    expect(new Headers((createCall[1] as RequestInit).headers).get('Idempotency-Key')).toEqual(expect.any(String));
    expect(new Headers((createCall[1] as RequestInit).headers).get('Idempotency-Key')).not.toBe('');

    const evidenceCall = fetchMock.mock.calls[1] as unknown[];
    expect(evidenceCall[0]).toBe('/api/learning-evidence/precalculus-pilot');
    expect(requestBody(evidenceCall)).toEqual({ submissionId: `${mode}-submission` });
    expect(Object.keys(requestBody(evidenceCall))).toEqual(['submissionId']);
    expect(label).toBe(mode === 'guided_practice' ? 'Guided' : 'Independent');
  });

  it('keeps labels unique and blocks incomplete submission', () => {
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    const selects = screen.getAllByRole('combobox');

    fireEvent.change(selects[0]!, { target: { value: 'B' } });
    const duplicateOption = Array.from(selects[1]!.querySelectorAll('option')).find((option) => option.value === 'B');
    expect(duplicateOption).toBeDefined();
    expect(duplicateOption).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit answer' })).toBeDisabled();
  });

  it('does not render the bounded state block without knowledgeState', () => {
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot mode="independent_practice" />);

    expect(screen.queryByText(/Mastery state:/)).toBeNull();
    expect(screen.queryByText('Readiness: Ready')).toBeNull();
  });

  it('retries the same create envelope and key, then retries evidence only', async () => {
    const order = expectedOrder(1);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'create failed' }, 500))
      .mockResolvedValueOnce(response({
        submissionId: 'ordering-submission',
        score: 1,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '1/1 pointwise ordering matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({ error: 'evidence failed' }, 500))
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'replay',
        decision: { reason: 'saved' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    chooseOrder(order);
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    await screen.findByRole('alert');
    const firstCall = fetchMock.mock.calls[0] as unknown[];
    const firstKey = new Headers((firstCall[1] as RequestInit).headers).get('Idempotency-Key');

    fireEvent.click(screen.getByRole('button', { name: 'Retry submission' }));
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
    expect(requestBody(fetchMock.mock.calls[3] as unknown[])).toEqual({ submissionId: 'ordering-submission' });
    expect(screen.getByRole('status')).toHaveTextContent(/practice was saved/i);
  });

  it('shows the teacher-exposure message when evidence is awaiting exposure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        submissionId: 'ordering-submission',
        score: 0,
        maxScore: 1,
        attemptOrdinal: 1,
        feedback: '0/1 pointwise ordering matched the server rubric.',
      }))
      .mockResolvedValueOnce(response({
        persisted: false,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'awaiting_teacher_exposure', exposureState: 'awaiting_teacher_exposure' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    chooseOrder(expectedOrder(1));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    await waitFor(() => expect(screen.getByText('Server score: 0/1')).toBeTruthy());
    expect(screen.getByRole('status')).toHaveTextContent('Complete this skill with your teacher before using Mastery Advantage.');
  });

  it('blocks duplicate clicks while the create request is saving', async () => {
    const order = expectedOrder(1);
    let resolveCreate!: (value: Response) => void;
    const createResponse = new Promise<Response>((resolve) => { resolveCreate = resolve; });
    const fetchMock = vi.fn()
      .mockReturnValueOnce(createResponse)
      .mockResolvedValueOnce(response({
        persisted: true,
        masteryApplied: false,
        kstApplied: false,
        delivery: 'new',
        decision: { reason: 'saved' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    chooseOrder(order);
    const submit = screen.getByRole('button', { name: 'Submit answer' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveCreate(response({
      submissionId: 'ordering-submission',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 pointwise ordering matched the server rubric.',
    }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    ['invalid score', { score: 2 }],
    ['zero attempt ordinal', { attemptOrdinal: 0 }],
  ])('shows a safe retry and does not deliver evidence after a malformed create result (%s)', async (_caseName, invalidFields) => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      submissionId: 'ordering-submission',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: 'invalid',
      ...invalidFields,
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    chooseOrder(expectedOrder(1));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 pointwise ordering practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('shows a safe retry for malformed JSON and HTTP errors', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('{', {
      status: 500,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<PrecalculusTopic12PointwiseOrderingPracticePilot />);
    chooseOrder(expectedOrder(1));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save the Topic 1.2 pointwise ordering practice.');
    expect(screen.getByRole('button', { name: 'Retry submission' })).toBeEnabled();
  });
});
