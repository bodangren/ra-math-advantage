import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
const source = fs.readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../curriculum/modules/module-7-lesson-3',
  ),
  'utf8',
);
const pairs: Record<number, [string, string]> = {
  1:['-v + w = 7','v + w = 1'],2:['y + z = 4','y - z = 8'],3:['-4x + 5y = 17','4x + 6y = -6'],4:['5m - 2p = 24','3m + 2p = 24'],5:['a + 4b = -4','a + 10b = -16'],6:['6r - 6t = 6','3r - 6t = 15'],7:['6c - 9d = 111','5c - 9d = 103'],8:['11f + 14g = 13','11f + 10g = 25'],9:['9x + 6y = 78','3x - 6y = -30'],10:['3j + 4k = 23.5','8j - 4k = 4'],11:['-3x - 8y = -24','3x - 5y = 4.5'],12:['6x - 2y = 1','10x - 2y = 5'],13:['x - y = 1','x + y = 3'],14:['-x + y = 1','x + y = 11'],15:['x + 4y = 11','x - 6y = 11'],16:['-x + 3y = 6','x + 3y = 18'],17:['3x + 4y = 19','3x + 6y = 33'],18:['x + 4y = -8','x - 4y = -8'],19:['3x + 4y = 2','4x - 4y = 12'],20:['3x - y = -1','-3x - y = 5'],21:['2x - 3y = 9','-5x - 3y = 30'],22:['x - y = 4','2x + y = -4'],23:['3x - y = 26','-2x - y = -24'],24:['5x - y = -6','-x + y = 2'],25:['6x - 2y = 32','4x - 2y = 18'],26:['3x + 2y = -19','-3x - 5y = 25'],27:['7x + 4y = 2','7x + 2y = 8'],33:['4(x + 2y) = 8','4x + 4y = 12'],34:['3x - 5y = 11','5(x + y) = 5'],35:['4x + 3y = 6','3(x + y) = 7'],36:['0.3x - 2y = -28','0.8x + 2y = 28'],37:['(1/2)q - 4r = -2','(1/6)q - 4r = 10'],38:['0.5x + (1/3)y = -1','-0.5x + (2/3)y = 10'],
};
describe('IM1 Lesson 7-3 source', () => {
  it('has 49 unique readable problem sections and exact groups', () => {
    const headings = [...source.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]));
    expect(headings).toEqual(Array.from({ length: 49 }, (_, index) => index + 1));
    expect(new Set(headings).size).toBe(49);
    for (const group of ['## Examples 1 and 3','## Example 2','## Example 4','## Mixed Exercises']) expect(source).toContain(group);
  });
  it('stores both literal equations for every source system', () => {
    for (const [problem, equations] of Object.entries(pairs)) {
      const start = source.indexOf(`### Problem ${problem}\n`);
      const end = source.indexOf('\n### Problem ', start + 1);
      const section = source.slice(start, end < 0 ? undefined : end);
      for (const equation of equations) expect(section).toContain(`\`${equation}\``);
    }
  });
  it('restores the complete context tables and questions', () => {
    for (const text of ['| Spring Mix | 12 |','| Garden Delight | 16 |','| Jeremy | 4 | 2 | $18.50 |','| Kendrick | 7 | 2 | $26.75 |','| Saturday | 15 minutes | 30 minutes | 3.5 miles |','| Sunday | 1 hour | 30 minutes | 8 miles |','Show the work. Interpret the solution.','New York Yankees','St. Louis Cardinals','recent WNBA regular season','representatives `r` and senators `s`','State a general rule','Find a second equation','The number is 26.']) expect(source).toContain(text);
    expect(source).not.toMatch(/### Problem 48[\s\S]*?revers[\s\S]*?### Problem 49/i);
    for (const answer of ['4 Spring Mix and 3 Garden Delight','Popcorn costs $2.75','Erin jogs at 6 miles per hour','The solution is `(5, -2)`','The number is 26.']) {
      const prompt = source.slice(source.indexOf(`### Problem ${answer.includes('Spring') ? 40 : answer.includes('Popcorn') ? 41 : answer.includes('jogs') ? 42 : answer.includes('solution') ? 43 : 48}`), source.indexOf('\n### Problem ', source.indexOf(`### Problem ${answer.includes('Spring') ? 40 : answer.includes('Popcorn') ? 41 : answer.includes('jogs') ? 42 : answer.includes('solution') ? 43 : 48}`) + 1));
      expect(prompt).not.toContain(answer);
    }
  });
});
