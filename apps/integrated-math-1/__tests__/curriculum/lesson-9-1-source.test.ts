import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-9-lesson-1'), 'utf8');
const problem = (n: number) => text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';

describe('Lesson 9-1 source restoration', () => {
  it('restores all 39 numbered prompts', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map(match => Number(match[1])))
      .toEqual(Array.from({ length: 39 }, (_, index) => index + 1));
  });

  it('restores source data for Problems 1 through 12', () => {
    expect(problem(1)).toContain('17, 11, 8, 15, 28, 20, 10, 16');
    expect(problem(2)).toContain('2.5, 6.4, 7.0, 5.3, 1.1, 6.4, 3.5, 6.2, 3.9, 4.0');
    expect(problem(3)).toContain('| 1 | 2 | 1 | 1 | 5 | 7 |');
    expect(problem(3)).toContain('| 2 | 3 | 2 | 4 | 6 | 2 |');
    expect(problem(4)).toContain('| 1 | 50 | 30 | 40 | 10 |');
    expect(problem(4)).toContain('| 3 | 10 | 30 | 110 | 70 |');
    for (const value of ['Freeport | 78', 'Hamilton | 88', 'Monmouth | 67', 'Cave City | 90']) expect(text).toContain(value);
  });

  it('preserves full mixed-exercise tables and conditions', () => {
    for (const value of ['43 | 50 | 52 | 47 | 55 | 61 | 48 | 56', 'C | 350', 'F | 360', 'J | 379', 'Lord of the Flies | 59,900', 'The Color Purple | 66,556', '1 | 25 | 30 | 35 | 40 | 35', 'Adoptions | 7 | 19 | 26 | 20 | 23 | 21 | 24 | 20', '220', '255', '210']) expect(text).toContain(value);
    expect(problem(20)).toContain('19 competitors who received a lower score');
    expect(problem(20)).toContain('5 competitors who earned a higher score');
    expect(problem(25)).toContain('lower than the 50th percentile in length');
    expect(problem(25)).toContain('additional 10,020-word online reading assignment');
    expect(problem(27)).toContain('2016 Rio de Janeiro Olympics');
    expect(problem(27)).toContain('Research the total medal counts');
    expect(problem(28)).toContain('| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |');
    expect(problem(28)).toContain('| Adoptions | 7 | 19 | 26 | 20 | 23 | 21 | 24 | 20 |');
    expect(problem(36)).toContain('luxury-priced paintings');
    expect(problem(36)).toContain('James volunteered 8 hours per week');
    expect(problem(36)).toContain('number of attendees tripled');
  });

  it('preserves percentile prompts without inventing a convention', () => {
    expect(problem(34)).toContain('divide the selected value by the total of all the values');
    expect(text).not.toContain('Percentile Rank =');
    expect(text).not.toContain('strictly below');
    expect(text).not.toContain('less than or equal to a given value');
  });

  it('uses all ten original assets and adds no answer key', () => {
    for (let i = 1; i <= 10; i += 1) {
      expect(readFileSync(resolve(app, `public/curriculum/module-9-lesson-1/source-image-${i}.png`)).length).toBeGreaterThan(500);
    }
    for (const value of ['Review Notes', 'The answer is', 'Answer key', '15.625', '75%']) expect(text).not.toContain(value);
  });
});
