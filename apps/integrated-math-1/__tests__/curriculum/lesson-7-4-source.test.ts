import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../curriculum/modules/module-7-lesson-4',
  ),
  'utf8',
);

const systems: Record<number, [string, string]> = {
  1: ['x + y = 2', '-3x + 4y = 15'],
  2: ['x - y = -8', '7x + 5y = 16'],
  3: ['x + 5y = 17', '-4x + 3y = 24'],
  4: ['6x + y = -39', '3x + 2y = -15'],
  5: ['2x + 5y = 11', '4x + 3y = 1'],
  6: ['3x - 3y = -6', '-5x + 6y = 12'],
  7: ['3x + 4y = 29', '6x + 5y = 43'],
  8: ['8x + 3y = 4', '-7x + 5y = -34'],
  9: ['8x + 3y = -7', '7x + 2y = -3'],
  10: ['4x + 7y = -80', '3x + 5y = -58'],
  11: ['12x - 3y = -3', '6x + y = 1'],
  12: ['-4x + 2y = 0', '10x + 3y = 8'],
};

function problem(problemNumber: number): string {
  const start = source.indexOf(`### Problem ${problemNumber}\n`);
  const end = source.indexOf('\n### Problem ', start + 1);
  return source.slice(start, end < 0 ? undefined : end);
}

describe('IM1 Lesson 7-4 source', () => {
  it('has 25 exact problem sections in the three source groups', () => {
    const headings = [...source.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]));
    expect(headings).toEqual(Array.from({ length: 25 }, (_, index) => index + 1));
    expect(new Set(headings).size).toBe(25);
    for (const heading of ['## Examples 1 and 2', '## Example 3', '## Mixed Exercises']) {
      expect(source).toContain(heading);
    }
  });

  it('stores both literal equations for Problems 1 through 12', () => {
    for (const [problemNumber, equations] of Object.entries(systems)) {
      const section = problem(Number(problemNumber));
      for (const equation of equations) expect(section).toContain(`\`${equation}\``);
    }
  });

  it('restores every context, table, and source subpart', () => {
    for (const text of [
      'Fan Cost Index (FCI)',
      'tickets, drinks, food, parking, programs, and souvenirs',
      'a family of four',
      '| Firing Clay (kg) | Polymer Clay (kg) | Total Cost |',
      '| 5 | 24 | $64.05 |',
      '| 25 | 8 | $51.45 |',
      'washing 5 cars and vacuuming 4 cars',
      'washing 4 cars and vacuuming 2 cars',
      '| Tropical Breeze | 20% pineapple juice |',
      '| Kona Cooler | 50% pineapple juice |',
      '125 five-dollar bills and ten-dollar bills',
      'The total value of these bills is $990.',
      'Is either of them correct? Explain your reasoning.',
      'Justify your argument.',
      'multiplying one equation by `-3` and then adding the two equations together',
      'The solution of the system `4x + 5y = 2` and `6x - 2y = b` is `(3, a)`.',
      'Why is substitution sometimes more helpful than elimination, and vice versa?',
    ]) expect(source).toContain(text);

    for (const subpart of [
      'a. Write a system of equations',
      'b. Solve the system',
      'a. Describe two different ways',
      'b. Explain why multiplying the first equation by `6` and the second equation by `5`',
      'c. Solve the system by elimination.',
      'a. Make a table',
      'b. Solve the system and explain what your solution represents.',
      'c. Explain how you know your answer is correct.',
    ]) expect(source).toContain(subpart);
  });

  it('preserves all displayed Jason and Daniela work as source givens', () => {
    const section = problem(21);
    for (const line of [
      '#### Jason\n',
      '`2r + 7t = 11`',
      '`r - 9t = -7`',
      '`(-) 2r - 18t = -14`',
      '`25t = 25`',
      '`t = 1`',
      '`2r + 7(1) = 11`',
      '`2r = 4`',
      '`r = 2`',
      'The solution is `(2, 1)`.',
      '#### Daniela\n',
      '`(-) r - 9t = -7`',
      '`r = 18`',
      '`2(18) + 7t = 11`',
      '`36 + 7t = 11`',
      '`7t = -25`',
      '`7t / 7 = 25 / 7`',
      '`t = -3.6`',
      'The solution is `(18, -3.6)`.',
    ]) expect(section).toContain(line);
  });

  it('does not insert verification answers into learner questions', () => {
    for (const answer of [
      '(-1, 3)', '$164.43', '$263.44', '$1.29', '$2.40',
      '10/3 quarts', '52 five-dollar bills', 'a = -2', 'b = 22',
    ]) expect(source).not.toContain(answer);
  });
});
