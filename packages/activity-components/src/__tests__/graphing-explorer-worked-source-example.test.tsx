import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GraphingExplorer } from '../components/graphing/GraphingExplorer';
import { GraphingExplorerActivity } from '../components/graphing/GraphingExplorerActivity';

describe('GraphingExplorer worked quadratic example', () => {
  it('shows the 1-1-1 table method as a completed mathematical demonstration', () => {
    const { container } = render(
      <GraphingExplorer
        activityId="math.im3.skill.1.1.graph-quadratic-functions.worked_example"
        mode="teaching"
        equation="y = -x^2 - 1"
        variant="plot_from_equation"
      />,
    );

    expect(screen.getByText('Worked example')).toBeTruthy();
    expect(screen.getByText('Step 1: Analyze the function')).toBeTruthy();
    expect(screen.getByText('Step 2: Graph the function')).toBeTruthy();
    expect(screen.getByText('Step 3: Analyze the graph')).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-equation"] .katex')).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-axis"] .katex')).toBeTruthy();

    const tableValues = screen.getAllByRole('spinbutton');
    expect(tableValues.map((input) => (input as HTMLInputElement).value)).toEqual([
      '-5',
      '-2',
      '-1',
      '-2',
      '-5',
    ]);
    expect(tableValues.every((input) => (input as HTMLInputElement).disabled)).toBe(true);
    expect(container.querySelectorAll('.point-marker')).toHaveLength(5);
    const functionCurve = container.querySelector('.function-curve');
    expect(functionCurve).toBeTruthy();
    expect(functionCurve!.tagName).toBe('path');

    const curvePoints = functionCurve!
      .getAttribute('d')!
      .match(/[ML][^ML]+/g)!
      .map((command) => command.slice(1).trim().split(/[ ,]+/).map(Number) as [number, number]);
    const vertex = curvePoints.reduce((nearest, point) =>
      Math.abs(point[0] - 300) < Math.abs(nearest[0] - 300) ? point : nearest,
    );
    expect(vertex[0]).toBeCloseTo(300, 4);
    expect(vertex[1]).toBeCloseTo(330, 4);
    expect(screen.getByText('The domain is all real numbers.')).toBeTruthy();
    expect(container.querySelector('[data-testid="worked-range"] .katex')).toBeTruthy();
  });

  it('does not create a learner submission or completion acknowledgement in teaching mode', () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(
      <GraphingExplorerActivity
        activityId="math.im3.skill.1.1.graph-quadratic-functions.worked_example"
        mode="teaching"
        equation="y = -x^2 - 1"
        variant="plot_from_equation"
        onSubmit={onSubmit}
        onComplete={onComplete}
      />,
    );

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

});
