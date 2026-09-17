import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getGenerator } from '@math-platform/math-content/knowledge-space';
import { GraphingExplorerActivity } from '@/components/activities/graphing/GraphingExplorerActivity';
import {
  IM3_MASTERY_ADVANTAGE_ACTIVITY_ID,
  IM3_PILOT_NODE,
} from '@/lib/practice/learning-evidence-pilot';

const pilotOutput = getGenerator('quadratic-graph-analysis').generate({
  nodeId: IM3_PILOT_NODE,
  seed: 0,
  difficulty: 0.5,
});

const pilotRendererProps = pilotOutput.data.rendererProps as {
  equation: string;
  variant: 'plot_from_equation';
  responseVariant: 'table_graph';
  domain: [number, number];
  range: [number, number];
};

// Seed 0 gives y = -x^2 - 1. These values are solved independently.
const expectedTableValues = [
  { x: -2, y: -5 }, { x: -1, y: -2 }, { x: 0, y: -1 },
  { x: 1, y: -2 }, { x: 2, y: -5 },
];

function renderPilot(
  onSubmit: (payload: unknown) => void | Promise<void> = vi.fn<(payload: unknown) => void | Promise<void>>(),
  onComplete: () => void = vi.fn(),
) {
  return render(
    <GraphingExplorerActivity
      activityId="activities:im3-pilot"
      stableActivityId={IM3_MASTERY_ADVANTAGE_ACTIVITY_ID}
      mode="practice"
      {...pilotRendererProps}
      onSubmit={onSubmit}
      onComplete={onComplete}
    />,
  );
}

function fillPilotTable() {
  const inputs = screen.getAllByRole('spinbutton');
  expect(inputs).toHaveLength(5);

  inputs.forEach((input, index) => {
    const point = expectedTableValues[index];
    fireEvent.change(input, { target: { value: String(point?.y) } });
  });
}

describe('GraphingExplorerActivity IM3 pilot table-and-graph input', () => {
  it('forwards the exact symmetry graph props to the shared activity', () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:im3-symmetry-worked"
        mode="teaching"
        responseVariant="symmetry_graph"
        equation="g(x) = -3x^2 + 6x - 1"
        vertex={[1, 2]}
        yIntercept={[0, -1]}
        domain={[-3, 5]}
        range={[-10, 5]}
      />,
    );

    expect(screen.getByText('Graph by Using Symmetry')).toBeInTheDocument();
    expect(screen.getByText('Vertex: (1, 2)')).toBeInTheDocument();
    expect(screen.getByText('Y-intercept: (0, -1)')).toBeInTheDocument();
    expect(screen.getByText('Reflect (0, -1) across x = 1 to get (2, -1).')).toBeInTheDocument();
    expect(screen.queryByText('Symmetry graph activity is unavailable until vertex and y-intercept are provided.'))
      .not.toBeInTheDocument();
  });

  it.each([
    ['guided', 'guided_practice', true],
    ['practice', 'independent_practice', false],
  ] as const)('accepts the deferred one-real-solution %s input contract', async (mode, envelopeMode, showsHint) => {
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>().mockResolvedValue(undefined);
    const onComplete = vi.fn();
    const { container } = render(
      <GraphingExplorerActivity
        activityId="activities:one-real-solution-practice"
        mode={mode}
        equation="f(x) = x^2 + 6x + 9"
        responseVariant="one_real_solution"
        originalEquation="8 - x^2 = 6x + 17"
        domain={[-6, 0]}
        range={[-1, 10]}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText('Solve a Quadratic Equation by Graphing')).toBeInTheDocument();
    expect(screen.getByText('Original equation: 8 - x^2 = 6x + 17')).toBeInTheDocument();
    expect(screen.getByText('Related function: f(x) = x^2 + 6x + 9')).toBeInTheDocument();
    if (showsHint) {
      expect(screen.getByText(
        'Use the table to plot the parabola. The single x-intercept is the solution.',
      )).toBeInTheDocument();
    } else {
      expect(screen.queryByText(
        'Use the table to plot the parabola. The single x-intercept is the solution.',
      )).not.toBeInTheDocument();
    }

    const tableValues = [
      ['f(-5)', '4'],
      ['f(-4)', '1'],
      ['f(-3)', '0'],
      ['f(-2)', '1'],
      ['f(-1)', '4'],
    ] as const;
    tableValues.forEach(([label]) => {
      expect(screen.getByLabelText(label)).toHaveValue(null);
    });

    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    expect(container.querySelectorAll('.point-label')).toHaveLength(0);

    tableValues.forEach(([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });

    const submitButton = screen.getByRole('button', { name: 'Submit graph and solution' });
    expect(submitButton).toBeDisabled();

    for (let index = 0; index < 5; index += 1) {
      fireEvent.keyDown(canvas, { key: 'Enter' });
    }
    expect(container.querySelectorAll('.point-label')).toHaveLength(5);

    fireEvent.change(screen.getByLabelText('Solution x'), { target: { value: '-3' } });
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const submission = onSubmit.mock.calls[0]?.[0] as {
      contractVersion: string;
      activityId: string;
      mode: string;
      status: string;
      attemptNumber: number;
      submittedAt: string;
      answers: unknown;
      parts: unknown;
      artifact: unknown;
    };
    const expectedTableValues = [
      { x: -5, y: 4 },
      { x: -4, y: 1 },
      { x: -3, y: 0 },
      { x: -2, y: 1 },
      { x: -1, y: 4 },
    ];
    const expectedPlacedPoints = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    expect(Object.keys(submission).sort()).toEqual([
      'activityId',
      'answers',
      'artifact',
      'attemptNumber',
      'contractVersion',
      'mode',
      'parts',
      'status',
      'submittedAt',
    ]);
    expect(submission).toEqual({
      contractVersion: 'practice.v1',
      activityId: 'activities:one-real-solution-practice',
      mode: envelopeMode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/),
      answers: {
        table_values: expectedTableValues,
        placed_points: expectedPlacedPoints,
        solution: -3,
      },
      parts: [
        { partId: 'table_values', rawAnswer: expectedTableValues },
        { partId: 'placed_points', rawAnswer: expectedPlacedPoints },
        { partId: 'solution', rawAnswer: -3 },
      ],
      artifact: {
        graphState: {
          originalEquation: '8 - x^2 = 6x + 17',
          equation: 'f(x) = x^2 + 6x + 9',
          tableValues: expectedTableValues,
          placedPoints: expectedPlacedPoints,
          domain: [-6, 0],
          range: [-1, 10],
        },
      },
    });
    expect(JSON.stringify(submission)).not.toMatch(/"isCorrect"|"score"|"maxScore"/);

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    expect(screen.queryByText(/correct|incorrect|solution reveal/i)).not.toBeInTheDocument();
  });

  it('renders the exact atomic one-real-solution Worked example', () => {
    const { container } = render(
      <GraphingExplorerActivity
        activityId="activities:one-real-solution-worked"
        mode="teaching"
        equation="f(x) = x^2 + 4x + 4"
        responseVariant="one_real_solution"
        originalEquation="10 - x^2 = 4x + 14"
        domain={[-5, 1]}
        range={[-1, 10]}
      />,
    );

    expect(screen.getByText('Solve a Quadratic Equation by Graphing')).toBeInTheDocument();
    expect(screen.getByText('Original equation: 10 - x^2 = 4x + 14')).toBeInTheDocument();
    expect(screen.getByText('Rewrite the equation as 0 = x^2 + 4x + 4.')).toBeInTheDocument();
    expect(screen.getByTestId('one-real-solution-axis')).toHaveTextContent('x = -2');
    expect(screen.getAllByRole('spinbutton').map((input) => (input as HTMLInputElement).value))
      .toEqual(['4', '1', '0', '1', '4']);
    expect(screen.getByRole('img', { name: /coordinate plane/i })).toBeInTheDocument();
    expect(container.querySelectorAll('.point-label')).toHaveLength(5);
    expect(screen.getByText('The graph touches the x-axis once, so the solution is x = -2.'))
      .toBeInTheDocument();
    expect(screen.queryByText(/unavailable/i)).not.toBeInTheDocument();
  });

  it('records the exact deferred table-and-graph envelope after real student input', async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();
    const { container } = renderPilot(onSubmit, onComplete);

    expect(screen.getAllByRole('spinbutton')).toHaveLength(5);
    expect(screen.queryByTestId('im3-pilot-vertex-x')).not.toBeInTheDocument();
    expect(screen.queryByTestId('im3-pilot-vertex-y')).not.toBeInTheDocument();
    expect(screen.queryByTestId('im3-pilot-direction')).not.toBeInTheDocument();
    expect(screen.queryByTestId('im3-pilot-y-intercept')).not.toBeInTheDocument();
    expect(screen.queryByText(/enter the vertex, opening direction, and y-intercept/i))
      .not.toBeInTheDocument();

    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    expect(container.querySelectorAll('.point-label')).toHaveLength(0);

    fillPilotTable();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    });

    container.querySelectorAll('tr').forEach((row) => {
      expect(row).not.toHaveClass('bg-red-100');
      expect(row).not.toHaveClass('bg-green-100');
    });
    expect(screen.queryByText(/hints/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/correct solution/i)).not.toBeInTheDocument();

    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    await waitFor(() => {
      expect(container.querySelectorAll('.point-label')).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onComplete).not.toHaveBeenCalled();

    const submission = onSubmit.mock.calls[0]?.[0] as {
      contractVersion: string;
      activityId: string;
      mode: string;
      status: string;
      attemptNumber: number;
      submittedAt: string;
      answers: {
        tableValues: Array<{ x: number; y: number }>;
        placedPoints: Array<{ x: number; y: number }>;
      };
      parts: Array<{ partId: string; rawAnswer: unknown }>;
      artifact: { graphState: Record<string, unknown> };
    };
    const placedPoints = [{ x: 0, y: 0 }];

    expect(submission.contractVersion).toBe('practice.v1');
    expect(submission.activityId).toBe('activities:im3-pilot');
    expect(submission.mode).toBe('independent_practice');
    expect(submission.status).toBe('submitted');
    expect(submission.attemptNumber).toBe(1);
    expect(submission.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/);
    expect(Number.isNaN(Date.parse(submission.submittedAt))).toBe(false);

    expect(submission.answers).toEqual({
      table_values: expectedTableValues,
      placed_points: placedPoints,
    });
    expect(submission.parts).toEqual([
      { partId: 'table_values', rawAnswer: expectedTableValues },
      { partId: 'placed_points', rawAnswer: placedPoints },
    ]);
    expect(submission.artifact.graphState).toEqual({
      equation: pilotRendererProps.equation,
      tableValues: expectedTableValues,
      placedPoints,
    });
    expect(JSON.stringify(submission)).not.toMatch(/"isCorrect"|"score"|"maxScore"/);
    expect(screen.queryByTestId('deferred-submission-recorded')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.queryByText(/correct solution/i)).not.toBeInTheDocument();

    resolveSubmission?.();

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
    expect(screen.getByTestId('deferred-submission-recorded'))
      .toHaveTextContent('Submission recorded for grading.');
  });

  it('invalidates a table after a student clears a value', async () => {
    const onSubmit = vi.fn();
    const { container } = renderPilot(onSubmit);
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]');
    expect(inputs).toHaveLength(5);
    inputs.forEach((input, index) => fireEvent.change(input, { target: { value: String(expectedTableValues[index].y) } }));
    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeNull());
    fireEvent.change(inputs[0], { target: { value: '' } });
    await waitFor(() => expect(container.querySelector('button[type="submit"]')).toBeNull());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not complete when deferred submission storage fails', async () => {
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>().mockRejectedValue(new Error('Storage failed'));
    const onComplete = vi.fn();

    renderPilot(onSubmit, onComplete);
    fillPilotTable();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onComplete).not.toHaveBeenCalled();
  });
});
