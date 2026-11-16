import { describe, expect, it } from 'vitest';

import { parseMathSegments } from '../lib/parse-math-segments';

describe('parseMathSegments', () => {
  it('preserves markdown while separating inline and block mathematics', () => {
    expect(parseMathSegments('Rate $r=2$ then $$d=rt$$ done.')).toEqual([
      { type: 'markdown', content: 'Rate ' },
      { type: 'inline-math', content: 'r=2' },
      { type: 'markdown', content: ' then ' },
      { type: 'block-math', content: 'd=rt' },
      { type: 'markdown', content: ' done.' },
    ]);
  });

  it('supports bracket-delimited display mathematics', () => {
    expect(parseMathSegments('Before \\[x^2\\] after')).toEqual([
      { type: 'markdown', content: 'Before ' },
      { type: 'block-math', content: 'x^2' },
      { type: 'markdown', content: ' after' },
    ]);
  });
});
