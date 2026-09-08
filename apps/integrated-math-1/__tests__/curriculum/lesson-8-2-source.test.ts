import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-8-lesson-2'), 'utf8');
const problem = (number: number) =>
  text.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';

const equations = new Map<number, string[]>([
  [1, ['f(x) = 6^x', 'g(x) = 6^x + 8']],
  [2, ['f(x) = 5^x', 'g(x) = -(5^x)']],
  [3, ['f(x) = 3^x + 1', 'g(x) = 3^(2x) + 1']],
  [4, ['f(x) = 4^x - 3', 'g(x) = 4^(0.5x) - 3']],
  [5, ['f(x) = 2.3^x', 'g(x) = -(2.3^(x - 1))']],
  [6, ['f(x) = 2^x', 'g(x) = 2^(-x) + 1']],
  [7, ['f(x) = 5^x + 2', 'g(x) = 5^(-x) + 6']],
  [8, ['f(x) = 1.4^x - 1', 'g(x) = -(1.4^x) + 6']],
  [9, ['f(x) = 3^x + 1', 'g(x) = 2(3^x + 1)']],
  [10, ['f(x) = -(4^x)', 'g(x) = (1/3)(-(4^x))']],
  [11, ['f(x) = 4^x', 'g(x) = 4^(x - 3)']],
  [12, ['f(x) = (1/2)^x + 5', 'g(x) = (1/2)^x']],
  [21, ['g(x) = 2^x + 6']], [22, ['g(x) = 3(2^x)']],
  [23, ['g(x) = -(1/4)(2^x)']], [24, ['g(x) = -3 + 2^x']],
  [25, ['g(x) = 2^(-x)']], [26, ['g(x) = -5(2^x)']],
]);

describe('Lesson 8-2 original source restoration', () => {
  it('restores all 50 numbered problems and four source groups', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]))).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
    for (const heading of ['Examples 1–3, 6–7, and 10–12', 'Examples 4–5 and 9', 'Example 8', 'Mixed Exercises']) {
      expect(text).toContain(`## ${heading}`);
    }
  });

  it('restores the exact equation-comparison and mixed-description prompts', () => {
    for (const [number, values] of equations) {
      for (const value of values) expect(problem(number)).toContain(value);
    }
    expect(text).toContain('Describe the transformation of g(x) as it relates to the parent function f(x).');
  });

  it('restores all context data, units, and subparts', () => {
    for (const value of ['$2000', '1.25%', '1.0125^x']) expect(problem(17)).toContain(value);
    for (const value of ['8-ounce', '100 milligrams', '11% per hour', '100(0.89)^x', '25(0.89)^x']) expect(problem(18)).toContain(value);
    for (const value of ['20(2^x)', 'number of months', 'first month']) expect(problem(19)).toContain(value);
    for (const value of ['$12,000', '15%', '12000(0.85)^x', '$20,000', 'after 5 years', 'a.', 'b.', 'c.']) expect(problem(20)).toContain(value);
    for (const value of ['$1000', '1.5%', 'antique toy automobile', 'a.', 'b.']) expect(problem(41)).toContain(value);
  });

  it('restores equation-writing, graphing, reasoning, and creation tasks', () => {
    for (let number = 27; number <= 32; number += 1) expect(problem(number)).toContain('translated');
    for (let number = 33; number <= 36; number += 1) expect(problem(number)).toContain('factor');
    for (const value of ['g(x) = 5 * 3^(x + 2) - 4', 'g(x) = -3 * 2^(-x) + 1']) expect(text).toContain(value);
    for (const number of [44, 45, 46, 47, 48, 49, 50]) expect(problem(number).length).toBeGreaterThan(100);
    expect(problem(50)).toContain('a.'); expect(problem(50)).toContain('b.'); expect(problem(50)).toContain('c.'); expect(problem(50)).toContain('d.');
  });

  it('links all 12 original source assets to the correct problems', () => {
    const names = Array.from({ length: 12 }, (_, index) => `source-image-${index + 1}${index === 7 ? '.JPG' : '.png'}`);
    for (const name of names) {
      const bytes = readFileSync(resolve(app, 'public/curriculum/module-8-lesson-2', name));
      expect(bytes.length).toBeGreaterThan(1000);
    }
    for (const [number, image] of [[13, 1], [14, 2], [15, 3], [16, 4], [20, 5], [37, 6], [38, 7], [41, 8], [39, 9], [40, 10], [49, 11], [50, 12]]) {
      expect(problem(number)).toContain(`source-image-${image}${image === 8 ? '.JPG' : '.png'}`);
    }
  });

  it('gives numeric source data for every required figure description', () => {
    const required = new Map<number, string[]>([
      [13, ['Both axes use 1-unit grid intervals', 'x-axis is the horizontal asymptote', '`(0, -1)`', '`(1, -2)`', '`(2, -4)`']],
      [14, ['x-axis is the horizontal asymptote', '`(3, 1)`', '`(4, 2)`', '`(5, 4)`']],
      [15, ['`y = 5`', '`(0, 6)`', '`(-1, 7)`']],
      [16, ['`y = 4`', '`(-3, 5)`', '`(-2, 6)`', '`(-1, 8)`', '`(0, 12)`']],
      [37, ['`y = -2`', '`(0, -1)`', '`(1, 3)`']],
      [38, ['`y = 3`', '`(0, 2)`', '`(1, -2)`']],
      [39, ['x-axis is the horizontal asymptote', '`(4, 1)`', '`(5, 5)`']],
      [40, ['x-axis is the horizontal asymptote', '`(2, 1)`', '`(1, 5)`']],
      [41, ['Thomas starts at `$1500`', 'Rebecca starts at `$1000`', '`$100` intervals', '`5`-year intervals']],
      [50, ['x-axis is the horizontal asymptote', '`(-2, 4)`', '`(-1, 2)`', '`(0, 1)`']],
    ]);
    for (const [number, values] of required) {
      for (const value of values) expect(problem(number)).toContain(value);
    }
    for (const value of ['f(x) = 3^(x + 2)', 'g(x) = 3^(x - 1) + 2', 'f(x) = 2^x', 'g(x) = 2^(x + 3) + 2', 'f(x) = 4^(x + 1)', 'g(x) = 4^(x + 4) + 2']) {
      expect(problem(49)).toContain(value);
    }
  });

  it('does not disclose verified answers or internal source notes', () => {
    for (const value of ['Review Notes', 'Source Notes', 'Answer:', 'approximately $3,549.64', 'Neither Jennifer nor James', 'The antique value is $500']) {
      expect(text).not.toContain(value);
    }
  });
});
