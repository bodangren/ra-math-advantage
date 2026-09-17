import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';

const { graphingExplorerSpy } = vi.hoisted(() => ({ graphingExplorerSpy: vi.fn() }));

vi.mock('../components/graphing/GraphingExplorer', () => ({
  GraphingExplorer: (props: Record<string, unknown>) => {
    graphingExplorerSpy(props);
    return <div data-testid="shared-graphing-explorer" />;
  },
}));

import { GraphingExplorerActivity } from '../components/graphing/GraphingExplorerActivity';

describe('GraphingExplorerActivity response variants', () => {
  it('renders the quadratic-feature response form only when requested', () => {
    const { container, rerender } = render(
      <GraphingExplorerActivity
        activityId="graphing:standard"
        mode="practice"
        equation="y = x^2"
      />,
    );

    expect(screen.getByTestId('shared-graphing-explorer')).toBeTruthy();
    expect(screen.queryByTestId('im3-pilot-answer-form')).toBeNull();

    rerender(
      <GraphingExplorerActivity
        activityId="graphing:quadratic-features"
        mode="practice"
        equation="y = x^2 - 4"
        responseVariant="quadratic_features"
      />,
    );

    expect(screen.getByTestId('im3-pilot-answer-form')).toBeTruthy();
    expect(screen.queryByTestId('shared-graphing-explorer')).toBeNull();
    expect(container.querySelector('[data-testid="quadratic-feature-equation"] .katex')).toBeTruthy();
  });

  it('passes all graph schema props to GraphingExplorer', () => {
    const graphProps = {
      activityId: 'graphing:schema',
      mode: 'guided' as const,
      equation: 'y = x^2 + 2x - 3',
      variant: 'graph_system' as const,
      domain: [-5, 5] as [number, number],
      range: [-10, 10] as [number, number],
      points: [[-1, -4], [0, -3]] as [number, number][],
      comparisonEquation: 'y = x + 1',
      comparisonQuestion: 'Which function opens upward?',
      comparisonAnswer: 'first' as const,
      linearEquation: 'y = 2x + 1',
    };

    render(<GraphingExplorerActivity {...graphProps} />);

    expect(graphingExplorerSpy).toHaveBeenLastCalledWith(expect.objectContaining(graphProps));
  });

  it('passes the table-graph response variant to GraphingExplorer', () => {
    render(
      <GraphingExplorerActivity
        activityId="graphing:table-graph"
        mode="practice"
        equation="y = x^2 - 4"
        variant="plot_from_equation"
        responseVariant="table_graph"
      />,
    );

    expect(graphingExplorerSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      responseVariant: 'table_graph',
      variant: 'plot_from_equation',
    }));
  });

  it('reuses the read-only GraphingExplorer for teaching domain and range review', () => {
    render(
      <div className="text-white">
        <GraphingExplorerActivity
          activityId="graphing:domain-range-worked"
          mode="teaching"
          equation="f(x) = x^2 - 4"
          domain={[-5, 5]}
          range={[-10, 10]}
          responseVariant="domain_range"
        />
      </div>,
    );

    expect(screen.getByTestId('shared-graphing-explorer')).toBeTruthy();
    expect(graphingExplorerSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      activityId: 'graphing:domain-range-worked',
      mode: 'teaching',
      equation: 'f(x) = x^2 - 4',
    }));
    expect(graphingExplorerSpy.mock.calls.at(-1)?.[0].responseVariant).toBeUndefined();
  });

  it('delegates maximum-value teaching to the read-only GraphingExplorer', () => {
    graphingExplorerSpy.mockClear();

    render(
      <GraphingExplorerActivity
        activityId="graphing:maximum-worked"
        mode="teaching"
        equation="y = -x^2 + 2"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="maximum_value"
      />,
    );

    expect(screen.getByTestId('shared-graphing-explorer')).toBeTruthy();
    expect(screen.queryByLabelText('Maximum value')).toBeNull();
    expect(graphingExplorerSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      activityId: 'graphing:maximum-worked',
      mode: 'teaching',
      equation: 'y = -x^2 + 2',
    }));
    expect(graphingExplorerSpy.mock.calls.at(-1)?.[0].responseVariant).toBeUndefined();
  });

  it('shows a read-only maximum graph and Guided hint without equation text', () => {
    const { rerender } = render(
      <GraphingExplorerActivity
        activityId="graphing:maximum-guided"
        mode="guided"
        equation="y = -x^2 + 2"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="maximum_value"
      />,
    );

    expect(screen.getByRole('img', { name: 'Completed coordinate plane graph' })).toBeTruthy();
    expect(screen.getByText('Find the highest point on the graph. Use its y-coordinate.')).toBeTruthy();
    expect(screen.getByLabelText('Maximum value')).toBeTruthy();
    expect(screen.queryByText('y = -x^2 + 2')).toBeNull();

    rerender(
      <GraphingExplorerActivity
        activityId="graphing:maximum-independent"
        mode="practice"
        equation="y = -x^2 + 2"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="maximum_value"
      />,
    );

    expect(screen.getByRole('img', { name: 'Completed coordinate plane graph' })).toBeTruthy();
    expect(screen.queryByText('Find the highest point on the graph. Use its y-coordinate.')).toBeNull();
    expect(screen.queryByText('y = -x^2 + 2')).toBeNull();
  });

  it('emits the exact Guided maximum-value envelope and completes after storage', async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        activityId="graphing:maximum-guided-envelope"
        mode="guided"
        equation="y = -x^2 + 2"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="maximum_value"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    const maximumInput = screen.getByLabelText('Maximum value') as HTMLInputElement;
    expect(submitButton.disabled).toBe(true);
    expect(maximumInput.id).toContain('graphing-maximum-value-');

    fireEvent.change(maximumInput, { target: { value: 'Infinity' } });
    expect(submitButton.disabled).toBe(true);
    fireEvent.change(maximumInput, { target: { value: '2' } });
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0][0];
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toEqual({
      contractVersion: 'practice.v1',
      activityId: 'graphing:maximum-guided-envelope',
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: { maximum_value: 2 },
      parts: [{ partId: 'maximum_value', rawAnswer: 2 }],
      artifact: {
        graphState: {
          equation: 'y = -x^2 + 2',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
    });
    expect(payload).not.toHaveProperty('score');
    expect(payload).not.toHaveProperty('correctness');
    expect((payload as { parts: Array<Record<string, unknown>> }).parts[0]).not.toHaveProperty('isCorrect');
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('emits the exact Independent maximum-value envelope', () => {
    const onSubmit = vi.fn<(payload: unknown) => void>();

    render(
      <GraphingExplorerActivity
        activityId="graphing:maximum-independent-envelope"
        mode="practice"
        equation="y = -x^2 + 2"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="maximum_value"
        onSubmit={onSubmit}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    fireEvent.change(screen.getByLabelText('Maximum value'), { target: { value: '2' } });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      contractVersion: 'practice.v1',
      activityId: 'graphing:maximum-independent-envelope',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: { maximum_value: 2 },
      parts: [{ partId: 'maximum_value', rawAnswer: 2 }],
      artifact: {
        graphState: {
          equation: 'y = -x^2 + 2',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
    });
  });

  it('uses unique associated control IDs for duplicate domain and range instances', () => {
    render(
      <>
        <GraphingExplorerActivity
          activityId="graphing:domain-range-duplicate"
          mode="practice"
          equation="f(x) = x^2 - 4"
          domain={[-5, 5]}
          range={[-10, 10]}
          responseVariant="domain_range"
        />
        <GraphingExplorerActivity
          activityId="graphing:domain-range-duplicate"
          mode="practice"
          equation="f(x) = x^2 - 4"
          domain={[-5, 5]}
          range={[-10, 10]}
          responseVariant="domain_range"
        />
      </>,
    );

    for (const labelText of ['Domain', 'Range relation', 'Range boundary']) {
      const controls = screen.getAllByLabelText(labelText) as Array<HTMLInputElement | HTMLSelectElement>;
      expect(controls).toHaveLength(2);
      expect(new Set(controls.map((control) => control.id)).size).toBe(2);
      for (const control of controls) {
        expect(control.labels?.[0]?.htmlFor).toBe(control.id);
      }
    }
  });

  it('emits the exact Guided domain and range envelope and completes after storage', async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();

    render(
      <div className="text-white">
        <GraphingExplorerActivity
          activityId="graphing:domain-range-guided"
          mode="guided"
          equation="f(x) = x^2 - 4"
          domain={[-5, 5]}
          range={[-10, 10]}
          responseVariant="domain_range"
          onSubmit={onSubmit}
          onComplete={onComplete}
        />
      </div>,
    );

    expect(screen.getByText('A quadratic has an all-real domain. Its vertex supplies the lower or upper range bound.')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('Domain'), { target: { value: 'all_real_numbers' } });
    fireEvent.change(screen.getByLabelText('Range relation'), { target: { value: 'gte' } });
    fireEvent.change(screen.getByLabelText('Range boundary'), { target: { value: '-4' } });

    const submitButton = screen.getByRole('button', { name: 'Submit answer' });
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0][0];
    expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
    expect(payload).toEqual({
      contractVersion: 'practice.v1',
      activityId: 'graphing:domain-range-guided',
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -4 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers' },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: -4 } },
      ],
      artifact: {
        graphState: {
          equation: 'f(x) = x^2 - 4',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
    });
    expect(new Date((payload as { submittedAt: string }).submittedAt).toISOString()).toBe((payload as { submittedAt: string }).submittedAt);
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('emits the Independent domain and range envelope without Guided scaffolding', () => {
    const onSubmit = vi.fn<(payload: unknown) => void>();

    render(
      <GraphingExplorerActivity
        activityId="graphing:domain-range-practice"
        mode="practice"
        equation="f(x) = x^2 - 4"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="domain_range"
        onSubmit={onSubmit}
      />,
    );

    expect(screen.queryByText('A quadratic has an all-real domain. Its vertex supplies the lower or upper range bound.')).toBeNull();
    fireEvent.change(screen.getByLabelText('Domain'), { target: { value: 'all_real_numbers' } });
    fireEvent.change(screen.getByLabelText('Range relation'), { target: { value: 'lte' } });
    fireEvent.change(screen.getByLabelText('Range boundary'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledWith({
      contractVersion: 'practice.v1',
      activityId: 'graphing:domain-range-practice',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'lte', boundary: 3 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers' },
        { partId: 'range', rawAnswer: { relation: 'lte', boundary: 3 } },
      ],
      artifact: {
        graphState: {
          equation: 'f(x) = x^2 - 4',
          domain: [-5, 5],
          range: [-10, 10],
        },
      },
    });
  });

  it('accepts a fractional range boundary in the raw practice envelope', () => {
    const onSubmit = vi.fn<(payload: unknown) => void>();

    render(
      <GraphingExplorerActivity
        activityId="graphing:domain-range-fractional"
        mode="practice"
        equation="f(x) = x^2 - 4"
        domain={[-5, 5]}
        range={[-10, 10]}
        responseVariant="domain_range"
        onSubmit={onSubmit}
      />,
    );

    const boundary = screen.getByLabelText('Range boundary') as HTMLInputElement;
    expect(boundary.getAttribute('step')).toBe('any');
    fireEvent.change(screen.getByLabelText('Domain'), { target: { value: 'all_real_numbers' } });
    fireEvent.change(screen.getByLabelText('Range relation'), { target: { value: 'gte' } });
    fireEvent.change(boundary, { target: { value: '-3.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'independent_practice',
      answers: {
        domain: 'all_real_numbers',
        range: { relation: 'gte', boundary: -3.5 },
      },
      parts: [
        { partId: 'domain', rawAnswer: 'all_real_numbers' },
        { partId: 'range', rawAnswer: { relation: 'gte', boundary: -3.5 } },
      ],
    }));
  });

  it('emits four raw answers and completes only after submission succeeds', async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        activityId="graphing:quadratic-features"
        mode="practice"
        equation="y = x^2 - 4"
        responseVariant="quadratic_features"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText('Vertex x'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Vertex y'), { target: { value: '-4' } });
    fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'upward' } });
    fireEvent.change(screen.getByLabelText('Y-intercept'), { target: { value: '-4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(onSubmit).toHaveBeenCalledWith({
      vertex_x: 0,
      vertex_y: -4,
      direction: 'upward',
      y_intercept: -4,
    });
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('renders the exact two-real-solutions Worked source', () => {
    const { container } = render(
      <GraphingExplorerActivity
        activityId="graphing:two-real-solutions-worked"
        mode="teaching"
        equation="f(x) = x^2 - 24x + 143"
        originalEquation="x(24 - x) = 143"
        variant="plot_from_equation"
        responseVariant="two_real_solutions"
        points={[[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]]}
        domain={[8, 16]}
        range={[-2, 8]}
        sum={24}
        product={143}
      />,
    );

    expect(screen.getByRole('heading', {
      name: 'Find Two Numbers by Graphing a Quadratic Equation',
    })).toBeTruthy();
    expect(screen.getByText('Find two real numbers with a sum of 24 and a product of 143.')).toBeTruthy();
    expect(screen.getByText('Model: x(24 - x) = 143')).toBeTruthy();
    expect(screen.getByText('Standard form: 0 = x^2 - 24x + 143')).toBeTruthy();
    expect(screen.getByText('Axis of symmetry: x = 12')).toBeTruthy();
    expect(screen.getByText('The zeros are 11 and 13.')).toBeTruthy();
    expect(screen.getByText('Thus, the two numbers are 11 and 13.')).toBeTruthy();

    const table = screen.getByRole('table');
    const tableInputs = Array.from(table.querySelectorAll('input')) as HTMLInputElement[];
    expect(tableInputs).toHaveLength(5);
    expect(tableInputs.map(input => input.value)).toEqual(['3', '0', '-1', '0', '3']);
    expect(tableInputs.every(input => input.disabled)).toBe(true);
    expect(screen.getByRole('img', { name: 'Completed coordinate plane graph' })).toBeTruthy();
    expect(container.querySelectorAll('.point-marker')).toHaveLength(5);
    expect(screen.queryByText('Two-real-solutions activity is unavailable until valid source data is provided.')).toBeNull();
    expect(screen.queryByText('Two-real-solutions student practice is unavailable until its response path is provided.')).toBeNull();
  });

  it.each([
    ['guided', 'guided_practice', true],
    ['practice', 'independent_practice', false],
  ] as const)('collects the two-real-solutions %s response', async (mode, envelopeMode, showsHint) => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();
    const { container } = render(
      <GraphingExplorerActivity
        activityId={`graphing:two-real-solutions-${mode}`}
        mode={mode}
        equation="f(x) = x^2 - 24x + 143"
        originalEquation="x(24 - x) = 143"
        variant="plot_from_equation"
        responseVariant="two_real_solutions"
        points={[[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]]}
        domain={[8, 16]}
        range={[-2, 8]}
        sum={24}
        product={143}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByRole('heading', {
      name: 'Find Two Numbers by Graphing a Quadratic Equation',
    })).toBeTruthy();
    expect(screen.queryByText(
      'Two-real-solutions student practice is unavailable until its response path is provided.',
    )).toBeNull();
    const hint = 'Complete the table, plot five points, and use the two x-intercepts as the two numbers.';
    if (showsHint) {
      expect(screen.getByText(hint)).toBeTruthy();
    } else {
      expect(screen.queryByText(hint)).toBeNull();
    }

    const tableValues = [
      ['f(10)', '3'],
      ['f(11)', '0'],
      ['f(12)', '-1'],
      ['f(13)', '0'],
      ['f(14)', '3'],
    ] as const;
    tableValues.forEach(([label]) => {
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe('');
    });

    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    expect(container.querySelectorAll('.point-label')).toHaveLength(0);

    tableValues.forEach(([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });

    const submitButton = screen.getByRole('button', { name: 'Submit graph and solutions' });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);

    for (let index = 0; index < 5; index += 1) {
      fireEvent.keyDown(canvas, { key: 'Enter' });
    }
    expect(container.querySelectorAll('.point-label')).toHaveLength(5);

    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '11' } });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '13' } });
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
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
      { x: 10, y: 3 },
      { x: 11, y: 0 },
      { x: 12, y: -1 },
      { x: 13, y: 0 },
      { x: 14, y: 3 },
    ];
    const expectedPlacedPoints = [
      { x: 8, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 0 },
    ];

    expect(practiceSubmissionEnvelopeSchema.safeParse(submission).success).toBe(true);
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
      activityId: `graphing:two-real-solutions-${mode}`,
      mode: envelopeMode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/),
      answers: {
        table_values: expectedTableValues,
        placed_points: expectedPlacedPoints,
        solutions: [11, 13],
      },
      parts: [
        { partId: 'table_values', rawAnswer: expectedTableValues },
        { partId: 'placed_points', rawAnswer: expectedPlacedPoints },
        { partId: 'solutions', rawAnswer: [11, 13] },
      ],
      artifact: {
        graphState: {
          originalEquation: 'x(24 - x) = 143',
          equation: 'f(x) = x^2 - 24x + 143',
          tableValues: expectedTableValues,
          placedPoints: expectedPlacedPoints,
          domain: [8, 16],
          range: [-2, 8],
        },
      },
    });
    expect(JSON.stringify(submission)).not.toMatch(/"isCorrect"|"score"|"maxScore"/);
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('keeps two-real-solutions practice incomplete when submission rejects', async () => {
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => Promise.reject(new Error('storage failed')));
    const onComplete = vi.fn();
    const { container } = render(
      <GraphingExplorerActivity
        activityId="graphing:two-real-solutions-rejected"
        mode="practice"
        equation="f(x) = x^2 - 24x + 143"
        originalEquation="x(24 - x) = 143"
        variant="plot_from_equation"
        responseVariant="two_real_solutions"
        points={[[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]]}
        domain={[8, 16]}
        range={[-2, 8]}
        sum={24}
        product={143}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    const tableValues = [
      ['f(10)', '3'],
      ['f(11)', '0'],
      ['f(12)', '-1'],
      ['f(13)', '0'],
      ['f(14)', '3'],
    ] as const;
    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    tableValues.forEach(([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });
    for (let index = 0; index < 5; index += 1) {
      fireEvent.keyDown(canvas, { key: 'Enter' });
    }
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '11' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '13' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit graph and solutions' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(container.querySelectorAll('.point-label')).toHaveLength(5);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('shows two-real-solutions invalid-source unavailability', () => {
    render(
      <GraphingExplorerActivity
        activityId="graphing:two-real-solutions-invalid"
        mode="teaching"
        equation="f(x) = x^2 - 24x + 143"
        originalEquation="x(24 - x) = 143"
        variant="plot_from_equation"
        responseVariant="two_real_solutions"
        points={[[10, 3], [11, 0], [12, -1], [13, 0], [14, 3]]}
        domain={[8, 16]}
        range={[-2, 8]}
        sum={24}
        product={144}
      />,
    );

    expect(screen.getByRole('status').textContent).toBe(
      'Two-real-solutions activity is unavailable until valid source data is provided.',
    );
    expect(screen.queryByRole('heading', {
      name: 'Find Two Numbers by Graphing a Quadratic Equation',
    })).toBeNull();
  });

  it('renders the exact Example 3 Worked root-interval source', () => {
    const { container } = render(
      <GraphingExplorerActivity
        activityId="activities:estimate-roots-worked"
        mode="teaching"
        equation="f(x) = -x^2 + 3x + 7"
        originalEquation="-x^2 + 3x + 7 = 0"
        variant="plot_from_equation"
        responseVariant={'estimated_root_intervals' as never}
        points={[[-2, -3], [-1, 3], [0, 7], [1, 9], [2, 9], [3, 7], [4, 3], [5, -3]]}
      />,
    );

    expect(screen.getByText(
      'Solve -x^2 + 3x + 7 = 0 by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.',
    )).toBeTruthy();
    expect(screen.getByText('Related function: f(x) = -x^2 + 3x + 7')).toBeTruthy();
    expect(screen.getByText('Axis of symmetry: x = 1.5')).toBeTruthy();

    const table = screen.getByRole('table');
    const tableInputs = Array.from(table.querySelectorAll('input')) as HTMLInputElement[];
    expect(tableInputs).toHaveLength(8);
    expect(tableInputs.map(input => input.getAttribute('aria-label'))).toEqual([
      'f(-2)',
      'f(-1)',
      'f(0)',
      'f(1)',
      'f(2)',
      'f(3)',
      'f(4)',
      'f(5)',
    ]);
    expect(tableInputs.map(input => input.value)).toEqual(['-3', '3', '7', '9', '9', '7', '3', '-3']);
    expect(tableInputs.every(input => input.disabled)).toBe(true);
    expect(screen.getByRole('img', { name: 'Completed coordinate plane graph' })).toBeTruthy();
    expect(container.querySelectorAll('.function-curve')).toHaveLength(1);
    expect(screen.getByLabelText('Point at -2.0, -3.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at -1.0, 3.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 0.0, 7.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 1.0, 9.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 2.0, 9.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 3.0, 7.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 4.0, 3.0. Press Delete to remove.')).toBeTruthy();
    expect(screen.getByLabelText('Point at 5.0, -3.0. Press Delete to remove.')).toBeTruthy();
    expect(container.querySelectorAll('.point-marker')).toHaveLength(8);
    expect(screen.getByText(/between -2 and -1/)).toBeTruthy();
    expect(screen.getByText(/between 4 and 5/)).toBeTruthy();
    expect(screen.queryByTestId('shared-graphing-explorer')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it.each([
    ['guided', 'guided_practice', true],
    ['practice', 'independent_practice', false],
  ] as const)('collects the exact Example 3 %s root-interval response', async (mode, envelopeMode, showsHint) => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    }));
    const onComplete = vi.fn();
    const expectedTableValues = [
      { x: -2, y: -3 },
      { x: -1, y: 3 },
      { x: 0, y: 7 },
      { x: 1, y: 9 },
      { x: 2, y: 9 },
      { x: 3, y: 7 },
      { x: 4, y: 3 },
      { x: 5, y: -3 },
    ];
    const expectedPlacedPoints = expectedTableValues;
    const expectedRootIntervals = [[-2, -1], [4, 5]];
    const { container } = render(
      <GraphingExplorerActivity
        activityId="activities:estimate-roots-student"
        mode={mode}
        equation="f(x) = -x^2 + 3x + 7"
        originalEquation="-x^2 + 3x + 7 = 0"
        variant="plot_from_equation"
        responseVariant="estimated_root_intervals"
        points={[[-2, -3], [-1, 3], [0, 7], [1, 9], [2, 9], [3, 7], [4, 3], [5, -3]]}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(screen.queryByText(/Estimated-root-interval activity is unavailable/)).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Estimate Roots by Graphing' })).toBeTruthy();
    const hint = 'Use the table and graph to locate each root between consecutive integers.';
    if (showsHint) {
      expect(screen.getByText(hint)).toBeTruthy();
    } else {
      expect(screen.queryByText(hint)).toBeNull();
    }

    const tableValues = [
      ['f(-2)', '-3'],
      ['f(-1)', '3'],
      ['f(0)', '7'],
      ['f(1)', '9'],
      ['f(2)', '9'],
      ['f(3)', '7'],
      ['f(4)', '3'],
      ['f(5)', '-3'],
    ] as const;
    tableValues.forEach(([label]) => {
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe('');
    });

    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'Enter' });
    expect(container.querySelectorAll('.point-label')).toHaveLength(0);

    tableValues.forEach(([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });
    const submitButton = screen.getByRole('button', { name: 'Submit graph and root intervals' }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    const intervalInputs = {
      firstLower: screen.getByLabelText('First interval lower bound'),
      firstUpper: screen.getByLabelText('First interval upper bound'),
      secondLower: screen.getByLabelText('Second interval lower bound'),
      secondUpper: screen.getByLabelText('Second interval upper bound'),
    } as const;
    fireEvent.change(intervalInputs.firstLower, { target: { value: '-2' } });
    fireEvent.change(intervalInputs.firstUpper, { target: { value: '0' } });
    fireEvent.change(intervalInputs.secondLower, { target: { value: '4' } });
    fireEvent.change(intervalInputs.secondUpper, { target: { value: '5' } });
    expect(submitButton.disabled).toBe(true);

    let cursorX = 0;
    let cursorY = 0;
    expectedPlacedPoints.forEach(({ x, y }) => {
      while (cursorX < x) {
        fireEvent.keyDown(canvas, { key: 'ArrowRight' });
        cursorX += 1;
      }
      while (cursorX > x) {
        fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
        cursorX -= 1;
      }
      while (cursorY < y) {
        fireEvent.keyDown(canvas, { key: 'ArrowUp' });
        cursorY += 1;
      }
      while (cursorY > y) {
        fireEvent.keyDown(canvas, { key: 'ArrowDown' });
        cursorY -= 1;
      }
      fireEvent.keyDown(canvas, { key: 'Enter' });
    });

    expect(container.querySelectorAll('.point-label')).toHaveLength(8);
    expectedPlacedPoints.forEach(({ x, y }) => {
      expect(screen.getByLabelText(`Point at ${x.toFixed(1)}, ${y.toFixed(1)}. Press Delete to remove.`)).toBeTruthy();
    });
    expect(submitButton.disabled).toBe(true);

    fireEvent.change(intervalInputs.firstUpper, { target: { value: '-1' } });
    expect(submitButton.disabled).toBe(false);
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
    expect(practiceSubmissionEnvelopeSchema.safeParse(submission).success).toBe(true);
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
      activityId: 'activities:estimate-roots-student',
      mode: envelopeMode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/),
      answers: {
        table_values: expectedTableValues,
        placed_points: expectedPlacedPoints,
        root_intervals: expectedRootIntervals,
      },
      parts: [
        { partId: 'table_values', rawAnswer: expectedTableValues },
        { partId: 'placed_points', rawAnswer: expectedPlacedPoints },
        { partId: 'root_intervals', rawAnswer: expectedRootIntervals },
      ],
      artifact: {
        graphState: {
          originalEquation: '-x^2 + 3x + 7 = 0',
          equation: 'f(x) = -x^2 + 3x + 7',
          tableValues: expectedTableValues,
          placedPoints: expectedPlacedPoints,
          domain: [-10, 10],
          range: [-10, 10],
        },
      },
    });
    expect(JSON.stringify(submission)).not.toMatch(/"isCorrect"|"score"|"maxScore"/);
    expect(onComplete).not.toHaveBeenCalled();

    resolveSubmission?.();
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
  });

  it('rejects malformed Example 3 source without rendering an activity surface', () => {
    render(
      <GraphingExplorerActivity
        activityId="activities:estimate-roots-invalid"
        mode="guided"
        equation="f(x) = -x^2 + 3x + 7"
        originalEquation="-x^2 + 3x + 7 = 0"
        variant="plot_from_equation"
        responseVariant="estimated_root_intervals"
        points={[[-2, -2], [-1, 3], [0, 7], [1, 9], [2, 9], [3, 7], [4, 3], [5, -3]]}
      />,
    );

    expect(screen.getByRole('status').textContent).toBe(
      'Estimated-root-interval activity is unavailable until valid source data is provided.',
    );
    expect(screen.queryByRole('heading', { name: 'Estimate Roots by Graphing' })).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('img', { name: /coordinate plane/i })).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByTestId('shared-graphing-explorer')).toBeNull();
  });

  it('keeps the Example 3 Independent response intact when submission rejects', async () => {
    const onSubmit = vi.fn<(payload: unknown) => Promise<void>>(() => Promise.reject(new Error('storage failed')));
    const onComplete = vi.fn();
    const { container } = render(
      <GraphingExplorerActivity
        activityId="activities:estimate-roots-rejected"
        mode="practice"
        equation="f(x) = -x^2 + 3x + 7"
        originalEquation="-x^2 + 3x + 7 = 0"
        variant="plot_from_equation"
        responseVariant="estimated_root_intervals"
        points={[[-2, -3], [-1, 3], [0, 7], [1, 9], [2, 9], [3, 7], [4, 3], [5, -3]]}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    const tableValues = [
      ['f(-2)', '-3'],
      ['f(-1)', '3'],
      ['f(0)', '7'],
      ['f(1)', '9'],
      ['f(2)', '9'],
      ['f(3)', '7'],
      ['f(4)', '3'],
      ['f(5)', '-3'],
    ] as const;
    tableValues.forEach(([label, value]) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    });

    const canvas = screen.getByRole('img', { name: /coordinate plane/i });
    let cursorX = 0;
    let cursorY = 0;
    const expectedPoints = [
      [-2, -3],
      [-1, 3],
      [0, 7],
      [1, 9],
      [2, 9],
      [3, 7],
      [4, 3],
      [5, -3],
    ] as const;
    expectedPoints.forEach(([x, y]) => {
      while (cursorX < x) {
        fireEvent.keyDown(canvas, { key: 'ArrowRight' });
        cursorX += 1;
      }
      while (cursorX > x) {
        fireEvent.keyDown(canvas, { key: 'ArrowLeft' });
        cursorX -= 1;
      }
      while (cursorY < y) {
        fireEvent.keyDown(canvas, { key: 'ArrowUp' });
        cursorY += 1;
      }
      while (cursorY > y) {
        fireEvent.keyDown(canvas, { key: 'ArrowDown' });
        cursorY -= 1;
      }
      fireEvent.keyDown(canvas, { key: 'Enter' });
    });

    const intervalInputs = {
      firstLower: screen.getByLabelText('First interval lower bound'),
      firstUpper: screen.getByLabelText('First interval upper bound'),
      secondLower: screen.getByLabelText('Second interval lower bound'),
      secondUpper: screen.getByLabelText('Second interval upper bound'),
    } as const;
    fireEvent.change(intervalInputs.firstLower, { target: { value: '-2' } });
    fireEvent.change(intervalInputs.firstUpper, { target: { value: '-1' } });
    fireEvent.change(intervalInputs.secondLower, { target: { value: '4' } });
    fireEvent.change(intervalInputs.secondUpper, { target: { value: '5' } });
    const submitButton = screen.getByRole('button', { name: 'Submit graph and root intervals' }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onComplete).not.toHaveBeenCalled();
    tableValues.forEach(([label, value]) => {
      expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe(value);
    });
    expect(container.querySelectorAll('.point-label')).toHaveLength(8);
    expectedPoints.forEach(([x, y]) => {
      expect(screen.getByLabelText(`Point at ${x.toFixed(1)}, ${y.toFixed(1)}. Press Delete to remove.`)).toBeTruthy();
    });
    expect((intervalInputs.firstLower as HTMLInputElement).value).toBe('-2');
    expect((intervalInputs.firstUpper as HTMLInputElement).value).toBe('-1');
    expect((intervalInputs.secondLower as HTMLInputElement).value).toBe('4');
    expect((intervalInputs.secondUpper as HTMLInputElement).value).toBe('5');
  });
});
