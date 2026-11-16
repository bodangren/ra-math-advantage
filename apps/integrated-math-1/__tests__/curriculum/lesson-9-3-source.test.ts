import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const app = resolve(import.meta.dirname, '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-9-lesson-3'), 'utf8');
const problem = (n: number) => text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';

describe('Lesson 9-3 source restoration', () => {
  it('restores all 22 prompts and four source headings', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((m) => Number(m[1]))).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    for (let i = 1; i <= 4; i += 1) expect(text).toContain(`## Example ${i}`);
  });

  it('preserves exact source contexts and subparts', () => {
    expect(problem(1)).toContain('everyone he sees leaving school after basketball practice');
    expect(problem(3)).toContain('Music education enriches student learning. Do you support music education in schools?');
    expect(problem(3)).toContain('b. Identify whose interests may be served by the question.');
    expect(problem(4)).toContain('same page as an opinion piece in support of one of the candidates');
    expect(problem(8)).toContain('If the same set of data is graphed with a scale of 0 to 10 on the y-axis and then with a scale of 0-100 on the y-axis, what effect does that have on the representation of the data?');
    expect(problem(9)).toContain('physics, biology, or chemistry');
    expect(problem(18)).toContain('two scenarios that have different examples of sample bias');
    expect(problem(19)).toContain('survey the teachers at your school');
  });

  it('preserves numerical data and transformation conditions', () => {
    expect(problem(5)).toContain('1, 8, 2, 2, 5, 6, and 4');
    expect(problem(11)).toContain('185, 222, 755, 801, 835, 990, and 1104');
    expect(problem(13)).toContain('11, 12, 10, 13, 10, and 10');
    expect(problem(14)).toContain('0.4 to 0.9 meters');
    expect(problem(16)).toContain('increased by a specific value, such as 10');
  });

  it('gives accessible source facts for both native graphs', () => {
    expect(problem(7)).toContain('Both vendors show 70 T-shirts in 2016 and 120 in 2017.');
    expect(problem(7)).toContain('Vendor 1 prints 60, 80, 100, 120, 140, and 160');
    expect(problem(7)).toContain('unlabeled bottom grid line corresponds to an inferred value of 40');
    expect(problem(7)).toContain('Vendor 2 prints 20, 40, 60, 80, 100, 120, and 140');
    expect(problem(12)).toContain('Canned Goods (1000 lbs)');
    expect(problem(12)).toContain('approximately 20 and 40 thousand pounds');
    expect(problem(12)).toContain('2017 can is both wider and taller');
  });

  it('preserves the false Problem 21 premise without adding an answer', () => {
    expect(problem(21)).toContain('If the mean, median and mode of a data set are equal, the data set is symmetric.');
    expect(problem(21)).toContain('mean that is less than its median');
    expect(text).not.toContain('The answer is');
    expect(text).not.toContain('third central moment');
  });

  it('uses both original source images', () => {
    for (let i = 1; i <= 2; i += 1) expect(readFileSync(resolve(app, `public/curriculum/module-9-lesson-3/source-image-${i}.png`)).length).toBeGreaterThan(500);
  });
});
