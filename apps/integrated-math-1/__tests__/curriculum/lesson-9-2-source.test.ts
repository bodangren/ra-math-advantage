import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-9-lesson-2'), 'utf8');
const problem = (n: number) => text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';

describe('Lesson 9-2 source restoration', () => {
  it('restores all 17 prompts and source headings', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((m) => Number(m[1]))).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    );
    expect(text).toContain('## Examples 1 and 2');
    expect(text).toContain('## Examples 3 and 4');
    expect(text).not.toContain('## Example 5');
  });

  it('preserves exact ambiguous and compound prompts', () => {
    expect(problem(1)).toContain('students in a summer reading program');
    expect(problem(3)).toContain('students in Mr. Dalton’s science class');
    expect(problem(5)).toContain('Determine whether the data should be shown in a bar graph or histogram. Then make an appropriate graph for the data.');
    expect(problem(5)).not.toContain('Explain.');
    expect(problem(6)).toContain('customers at a carnival game each of the past several days');
    expect(problem(7)).toContain('How many days did Lisa jog 4 miles at least 4 miles?');
    expect(problem(7)).toContain('What was the greatest number of miles');
    expect(problem(8)).toContain('Select an appropriate display for the data. Explain your reasoning.');
    expect(problem(9)).toContain('participants in a 10K race at Masonville');
    expect(problem(9)).toContain('In what interval is the most frequent age?');
    expect(problem(11)).toContain('A scientific research study tracks the growth of an insect in millimeters.');
    expect(problem(11)).toContain('during week 1');
    expect(problem(11)).toContain('distribution of growth across the population');
    expect(problem(12)).toContain('The pets owned by Liza’s classmates');
    expect(problem(12)).toContain('Make a dot plot of the data.');
    expect(problem(16)).toContain('what are two conclusions the grocery store could infer?');
  });

  it('preserves exact tables and data lists', () => {
    for (const value of ['Number of Books Read', 'Destination | Number of Votes', 'Prizes Won', '3 | 8 | 5 | 6 | 5', '0–10 | 400', '60–70 | 240', '2010 | 563', '2016 | 718', '1.1, 1.25, 1.3, 1.67', 'rabbit: 2, dog: 6, cat: 3', 'fish: 3, and other: 1']) {
      expect(text).toContain(value);
    }
    expect(problem(9)).toContain('65, 47, 23, 70, 41, 55');
    expect(problem(10)).toContain('39, 43, 31, 53, 41, 25, 35, 46, 27, 34, 37, 26, 51, 29, 36, 40, 33, 28, 48, 26, 42, and 38 years');
    expect(problem(1)).toContain('| Number of Books Read | Number of Books Read | Number of Books Read | Number of Books Read | Number of Books Read |');
    expect(problem(6)).toContain('| Prizes Won | Prizes Won | Prizes Won | Prizes Won | Prizes Won |');
    expect(problem(1)).not.toMatch(/\|[ \t]*\|/);
    expect(problem(6)).not.toMatch(/\|[ \t]*\|/);
  });

  it('gives accessible data for both supplied graphs', () => {
    expect(problem(13)).toContain('1 | 1');
    expect(problem(13)).toContain('10 | 4');
    expect(problem(16)).toContain('thousands of dollars');
    expect(problem(16)).toContain('Crunchy | 300 | 400');
    expect(problem(16)).toContain('With Jelly | 50 | 35');
  });

  it('uses all seven original source assets', () => {
    for (let i = 1; i <= 7; i += 1) {
      expect(readFileSync(resolve(app, `public/curriculum/module-9-lesson-2/source-image-${i}.png`)).length).toBeGreaterThan(500);
    }
  });

  it('does not add answers or a universal display rule', () => {
    for (const value of ['The answer is', 'Answer key', 'Review Notes', 'discrete → bar graph', 'continuous → histogram']) {
      expect(text).not.toContain(value);
    }
  });
});
