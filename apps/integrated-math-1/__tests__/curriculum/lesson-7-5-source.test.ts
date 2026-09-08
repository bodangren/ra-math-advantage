import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-7-lesson-5'), 'utf8');
const problem = (n: number) => text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';
const systems = [
  ['y < 6', 'y > x + 3'], ['y >= 0', 'y <= x - 5'], ['y <= x + 10', 'y > 6x + 2'],
  ['y >= x + 10', 'y <= x - 3'], ['y < 5x - 5', 'y > 5x + 9'], ['y >= 3x - 5', '3x - y > -4'],
  ['x > -1', 'y <= -3'], ['y > 2', 'x < -2'], ['y > x + 3', 'y <= -1'],
  ['x < 2', 'y - x <= 2'], ['x + y <= -1', 'x + y >= 3'], ['y - x > 4', 'x + y > 2'],
];
describe('Lesson 7-5 original source restoration', () => {
  it('preserves all 28 questions and actual source groups', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map(match => Number(match[1]))).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(text).toContain('## Examples 1 and 2');
    expect(text.indexOf('## Example 3')).toBeGreaterThan(text.indexOf('### Problem 12'));
    expect(text.indexOf('## Mixed Exercises')).toBeGreaterThan(text.indexOf('### Problem 14'));
    systems.forEach((pair, i) => pair.forEach(inequality => expect(problem(i + 1)).toContain(inequality)));
  });
  it('restores the four original graph assets without disclosing answer systems', () => {
    for (const n of [15, 16, 17, 18]) {
      const path = `/curriculum/module-7-lesson-5/problem-${n}.png`;
      expect(problem(n)).toContain(path);
      const bytes = readFileSync(resolve(app, `public${path}`));
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.length).toBeGreaterThan(1000);
      expect(problem(n)).toContain('Graph description:');
      expect(problem(n)).not.toMatch(/y\s*(?:<=|>=|<|>)/);
    }
    expect(problem(15)).toContain('(0, 2)');
    expect(problem(16)).toContain('dashed');
    expect(problem(17)).toContain('horizontal');
    expect(problem(18)).toContain('(4, 1)');
  });
  it('retains the context constraints and requested operations', () => {
    for (const phrase of ['9 to 12 miles', '4.5 to 6 hours', 'Define your variables', 'three viable solutions']) expect(problem(13)).toContain(phrase);
    for (const phrase of ['$4 or $6', '$30', 'at least 4', 'three viable solutions']) expect(problem(14)).toContain(phrase);
    for (const n of [13, 14, 22]) for (const part of ['a.', 'b.', 'c.']) expect(problem(n)).toContain(part);
    for (const phrase of ['cats', 'dogs', 'x + y <= 20', 'x <= 8']) expect(problem(20)).toContain(phrase);
    for (const phrase of ['$900', '200 tins', 'at least as many', '$3', '$4', 'constraints']) expect(problem(21)).toContain(phrase);
    for (const phrase of ['100 workers', '200 workers', '30 units per worker']) expect(problem(22)).toContain(phrase);
    for (const phrase of ['$25', '$15', '$100', '6 hours', 'ordered pair']) expect(problem(23)).toContain(phrase);
  });
  it('preserves reasoning prompts without an authored answer key', () => {
    for (const phrase of ['(2.5, 1)', '2x + 3y > 8', '4x - 5y >= 2', 'without graphing']) expect(problem(19)).toContain(phrase);
    expect(problem(24)).toContain('|x| <= 4');
    expect(problem(25)).toContain('sometimes, always, or never');
    expect(problem(26)).toContain('3x - y > 4');
    for (const phrase of ['y >= 1', 'y <= x + 4', 'y <= -x + 4', 'Estimate the area']) expect(problem(27)).toContain(phrase);
    for (const phrase of ['6x - 3y <= -5', '6x - 3y >= -5', 'without graphing']) expect(problem(28)).toContain(phrase);
    expect(problem(19)).not.toContain('not a solution');
    expect(problem(27)).not.toContain('9 square units');
    expect(problem(28)).not.toContain('2x + 5/3');
    expect(problem(23)).not.toContain('(4, 0)');
  });
});
