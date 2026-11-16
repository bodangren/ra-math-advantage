import { describe, expect, it } from 'vitest';
import { generateFunctionPath } from '../canvas-utils';

describe('generateFunctionPath SVG coordinates', () => {
  it('emits valid move and line commands through the literal quadratic vertex', () => {
    const path = generateFunctionPath('x^2 + 2x - 3', [-10, 10], [-10, 10], 600, 600);

    expect(path).toMatch(/^M \d+(?:\.\d+)?,\d+(?:\.\d+)?(?: L \d+(?:\.\d+)?,\d+(?:\.\d+)?)+$/);
    expect(path.split(' ')).toContain('270,420');
  });
});
