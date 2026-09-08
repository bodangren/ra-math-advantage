import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const text = readFileSync(resolve(app, 'curriculum/modules/module-8-lesson-6'), 'utf8');
const problem = (n: number) => text.split(`### Problem ${n}\n`)[1]?.split(/\n### Problem |\n## /)[0] ?? '';

describe('Lesson 8-6 source restoration', () => {
  it('restores all 42 numbered prompts', () => {
    expect([...text.matchAll(/^### Problem (\d+)$/gm)].map((match) => Number(match[1]))).toEqual(
      Array.from({ length: 42 }, (_, index) => index + 1),
    );
  });

  it('preserves the original formulas and fractions', () => {
    for (const value of ['a₁ = 1/2', 'aₙ = aₙ₋₁ + 3/2', 'a₁ = 38, aₙ = (1/2)aₙ₋₁', 'a₄ = 1104', 'aₙ = 4aₙ₋₁ + 16']) {
      expect(text).toContain(value);
    }
  });

  it('gives accessible unit-grid readings for all six graphs', () => {
    for (let n = 13; n <= 18; n += 1) {
      expect(problem(n)).toContain('unit-grid convention');
    }
    expect(problem(16)).toContain('(1, −5), (2, −3.5), (3, −2), (4, −0.5), (5, 1), (6, 2.5), (7, 4)');
    expect(problem(17)).toContain('(1, 2.5), (2, 1.5), (3, 0.5), (4, −0.5)');
    expect(problem(18)).toContain('(1, −3.25), (2, −2.5), (3, −1.75)');
    expect(problem(18)).toContain('(8, 2), (9, 2.75)');
  });

  it('preserves the context tables and full compound tasks', () => {
    for (const value of ['175 views', 'Number of folds', '4.374', 'County A', '1700 million widgets', '1.3 million people', '10 million widgets', '1.2% per year', '1200 widgets per person', 'B3 and C2', 'only one disk', 'larger disk']) {
      expect(text).toContain(value);
    }
    expect(problem(32)).toContain('(1700 + 10x)/(1.3(1.012)ˣ)');
    expect(problem(32)).toContain('horizontal axis');
    expect(problem(32)).toContain('vertical axis');
    expect(problem(32)).toContain('printed labels are 0, 2, 4, 6, and 8');
    expect(problem(32)).not.toContain('labels every 2 years');
    expect(problem(32)).toContain('constant rate of 1200 widgets per person');
    expect(problem(33)).toContain('tracing his family tree with his parents');
    expect(problem(33)).toContain('great-great-great-great-great-great-grandparents');
    expect(problem(37)).toContain('`2, −2, 2, −2, …`');
    expect(problem(37)).not.toContain('`2, −2, 2, −2, 2, …`');
    for (const value of ['1 | 1 |', '2 | 1 | 1', '3 | 2 | 2', '4 | 3 | 1.5', 'A (n) | B (aₙ) | C (aₙ/aₙ₋₁)', '10 | 55 | 1.617647', 'aₙ/aₙ₋₁']) expect(problem(35)).toContain(value);
  });

  it('uses all 11 original source assets', () => {
    for (let i = 1; i <= 11; i += 1) {
      expect(readFileSync(resolve(app, `public/curriculum/module-8-lesson-6/source-image-${i}.png`)).length).toBeGreaterThan(500);
    }
  });

  it('does not add checked answers to learner prompts', () => {
    for (const value of ['The answer is', 'Answer key', 'Review Notes']) expect(text).not.toContain(value);
  });
});
