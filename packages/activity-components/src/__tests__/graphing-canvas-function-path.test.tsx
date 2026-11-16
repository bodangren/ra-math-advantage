import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphingCanvas } from '../components/graphing/GraphingCanvas';

describe('GraphingCanvas function path', () => {
  it('places the literal quadratic curve vertex at the plotted vertex pixel', () => {
    const { container } = render(
      <GraphingCanvas
        domain={[-10, 10]}
        range={[-10, 10]}
        width={600}
        height={600}
        functions={[{ expression: 'x^2 + 2x - 3', color: '#3b82f6' }]}
        points={[{ x: -1, y: -4, label: 'vertex' }]}
        readonly
      />,
    );

    const path = container.querySelector('.function-curve');
    const vertex = container.querySelector('.point-marker');
    expect(path?.getAttribute('d')).toMatch(/(?:^| )L 270,420(?: |$)/);
    expect(vertex?.getAttribute('cx')).toBe('270');
    expect(vertex?.getAttribute('cy')).toBe('420');
    expect(path?.hasAttribute('transform')).toBe(false);
  });
});
