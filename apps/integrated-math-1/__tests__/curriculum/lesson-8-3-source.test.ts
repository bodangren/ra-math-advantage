import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-8-lesson-3'), 'utf8');
const problem = (number: number) => text.split(`### Problem ${number}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';
const pairs = new Map<number, string[]>([
  [1, ['(2, 16)', '(3, 32)']], [2, ['(1, 1)', '(3, 0.25)']], [3, ['(2, 90)', '(4, 810)']],
  [4, ['(-2, 4)', '(1, 0.5)']], [5, ['(1, 12)', '(3, 192)']], [6, ['(1, 18)', '(3, 72)']],
  [22, ['(2, 1.4)', '(4, 5.6)']], [23, ['(1, 10.4)', '(4, 665.6)']], [24, ['(1, 42)', '(3, 2688)']],
]);

describe('Lesson 8-3 original source restoration', () => {
  it('restores all 35 problems and all source groups', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]))).toEqual(Array.from({ length: 35 }, (_, index) => index + 1));
    for (const heading of ['Example 1', 'Example 2', 'Example 3', 'Examples 4–6', 'Mixed Exercises']) expect(text).toContain(`## ${heading}`);
  });

  it('restores every two-point prompt and graph prompt', () => {
    for (const [number, values] of pairs) for (const value of values) expect(problem(number)).toContain(value);
    for (const number of [7, 8, 9, 10]) {
      expect(problem(number)).toContain(`source-image-${number - 6}.png`);
      expect(problem(number)).toContain('Write an exponential function for the graph.');
    }
  });

  it('restores exact context data, equations, units, and subparts', () => {
    const checks = new Map<number, string[]>([
      [11, ['50 cells', 'every 30 minutes']], [12, ['$32,500', '12%', '`x` years']], [13, ['23%', '2010 to 2016', '43 million']],
      [14, ['$1500', '4.85%', 'compounded quarterly']], [15, ['8,192,426', '8,550,405', '0.9%', 'a.', 'b.', '2025']],
      [16, ['$1000', '8%', 'compounded quarterly', '5 years', '35 years', 'a.', 'b.']], [17, ['$60,000', '10%', '6 years', 'a.', 'b.']],
      [18, ['$15,000', '4.5%', 'compounded monthly', '15 years', '$9,410', '$10,138', 'nearest month']],
      [19, ['7%', '$3000', '4 years', 'nearest hundred']], [20, ['$1200', '0.2%', 'compounded weekly', '10 years', 'exactly 52 weeks', 'nearest cent']],
      [21, ['2016', '322 million', '0.81%', '2030 census', 'nearest ten million']], [25, ['0.12%', '79,318', '2006', '2025']],
      [26, ['y = y_0(0.5)^(x/6)', '20 μg', '1 day', '12 days', 'less than 1 μg', 'a.', 'b.', 'c.']],
      [27, ['y = 2400(0.95)^x', 'originally invest', 'increasing or decreasing', 'half of its starting value']],
      [28, ['10%', '300 cubic centimeters', '11 hours', 'scatter plot', 'continuous curve', 'domain', 'a.', 'b.']],
      [29, ['Years of Study', '0 | 1 | 2 | 3', '128 | 160 | 200 | 250', 'average rate of change', 'exponential, not linear', 'a.', 'b.', 'c.', 'd.']],
      [31, ['$1200', '8%', 'compounded monthly', '$2500']], [32, ['doubles every minute', 'After 8 minutes', 'half-full']],
      [35, ['$25,000', '$5000', 'between 4% and 7%', 'from 8% to 10%', 'a.', 'b.', 'c.']],
    ]);
    for (const [number, values] of checks) for (const value of values) expect(problem(number)).toContain(value);
  });

  it('uses all six original source assets', () => {
    for (let index = 1; index <= 6; index += 1) expect(readFileSync(resolve(app, `public/curriculum/module-8-lesson-3/source-image-${index}.png`)).length).toBeGreaterThan(1000);
    expect(problem(18)).toContain('source-image-5.png');
    expect(problem(29)).toContain('source-image-6.png');
  });

  it('provides numeric accessible data without giving graph equations', () => {
    const data = new Map<number, string[]>([
      [7, ['one-unit grid intervals', 'horizontal asymptote `y = 0`', '`(0, 3)`', '`(-1, 1.5)`']],
      [8, ['one-unit grid intervals', 'horizontal asymptote `y = 0`', '`(0, -1)`', '`(1, -3)`']],
      [9, ['one-unit grid intervals', 'horizontal asymptote `y = 0`', '`(0, 1)`', '`(-1, 4)`']],
      [10, ['one-unit grid intervals', 'horizontal asymptote `y = 0`', '`(0, -1)`', '`(-1, -2)`']],
    ]);
    for (const [number, values] of data) for (const value of values) expect(problem(number)).toContain(value);
    for (const number of [7, 8, 9, 10]) expect(problem(number)).not.toContain('The equation is');
  });

  it('keeps open prompts and does not disclose verified answers', () => {
    expect(problem(30)).toContain('growth rate (as a percent)'); expect(problem(30)).toContain('Justify');
    expect(problem(33)).toContain('using exponential models to make decisions'); expect(problem(34)).toContain('Compare and contrast');
    for (const number of [27, 28, 29, 32, 35]) expect(problem(number).length).toBeGreaterThan(100);
    for (const value of ['Review Notes', 'Answer:', '9,370,872', '18.06 months', '13.51 years', '300%', 'half-full after 7 minutes']) expect(text).not.toContain(value);
  });
});
