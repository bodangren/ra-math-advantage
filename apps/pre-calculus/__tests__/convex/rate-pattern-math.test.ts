import { expect, it } from 'vitest';
import { generateTopic13RatePatternClassificationOutput } from '../../../../packages/math-content/src/knowledge-space/generators/topic13-rate-pattern-classification';

it('recognizes the source linear table with unequal input widths', () => {
  const output = generateTopic13RatePatternClassificationOutput(0);
  expect(output.expectedAnswer).toEqual({ a: 'quadratic', b: 'linear', c: 'quadratic' });
});

it('agrees with an independent polynomial interpolation check for 200 seeds', () => {
  for (let seed = 0; seed < 200; seed++) {
    const output = generateTopic13RatePatternClassificationOutput(seed);
    const cases = (output.data as any).rendererProps.cases;
    for (const row of cases) {
      const [x0, x1, x2, x3] = row.xValues, [y0, y1, y2, y3] = row.yValues;
      const line = (x: number) => y0 + (x - x0) * (y1 - y0) / (x1 - x0);
      const quad = y0 * (x3-x1)*(x3-x2)/((x0-x1)*(x0-x2)) + y1*(x3-x0)*(x3-x2)/((x1-x0)*(x1-x2)) + y2*(x3-x0)*(x3-x1)/((x2-x0)*(x2-x1));
      const expected = Math.abs(line(x2)-y2)<1e-8 && Math.abs(line(x3)-y3)<1e-8 ? 'linear' : Math.abs(quad-y3)<1e-8 ? 'quadratic' : 'neither';
      expect(output.expectedAnswer[row.id], `seed ${seed}, ${row.id}`).toBe(expected);
    }
  }
});
