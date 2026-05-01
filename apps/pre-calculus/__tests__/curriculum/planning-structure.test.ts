import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const curriculumRoot = path.join(appRoot, 'curriculum');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(curriculumRoot, relativePath), 'utf8');
}

function files(directory: string): string[] {
  return fs.readdirSync(path.join(curriculumRoot, directory)).sort();
}

function tableRows(content: string, header: string): string[][] {
  const lines = content.split('\n');
  const headerIndex = lines.findIndex((line) => line.trim() === header);
  expect(headerIndex, `Missing table header ${header}`).toBeGreaterThanOrEqual(0);

  const rows: string[][] = [];
  for (const line of lines.slice(headerIndex + 2)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) break;
    rows.push(trimmed.split('|').slice(1, -1).map((cell) => cell.trim()));
  }
  return rows;
}

describe('AP Precalculus planning structure artifacts', () => {
  it('creates unit summaries and topic source files from the CED topic index', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.default.scripts['curriculum:plan']).toBe('node scripts/generate-curriculum-planning.mjs');

    const unitFiles = files('units').filter((file) => /^unit-\d+\.md$/.test(file));
    const topicFiles = files('topics').filter((file) => /^unit-\d+-topic-\d+\.\d+\.md$/.test(file));

    expect(unitFiles).toEqual(['unit-1.md', 'unit-2.md', 'unit-3.md', 'unit-4.md']);
    expect(topicFiles).toHaveLength(58);
    expect(read('units/unit-1.md')).toContain('## CED Competency Role');
    expect(read('units/unit-1.md')).toContain('Passwater source: `source/passwater/unit-1.md`');
    expect(read('units/unit-4.md')).toContain('Local Passwater source: not available');
    expect(read('topics/unit-1-topic-1.1.md')).toContain('# Topic 1.1: Change in Tandem');
    expect(read('topics/unit-1-topic-1.1.md')).toContain('Learning-objective family: `1.1.A`');
    expect(read('topics/unit-1-topic-1.1.md')).toContain('Passwater instructional source: `source/passwater/unit-1.md`');
    expect(read('topics/unit-4-topic-4.14.md')).toContain('AP Exam status: `not-assessed-on-ap-exam`');
  });

  it('creates class-period plans for Passwater source-backed units only', () => {
    for (const unit of [1, 2, 3]) {
      const content = read(`unit-${unit}-class-period-plan.md`);
      const rows = tableRows(
        content,
        '| Period | Day Type | CED Topic | Passwater Source | Competency Target | Instructional Evidence | Independent Practice Shape | Notes |',
      );

      expect(content).toContain(`# Unit ${unit} Class-Period Plan`);
      expect(content).toContain('## Planning Source Hierarchy');
      expect(content).toContain('## Period-by-Period Plan');
      expect(rows.length).toBeGreaterThan(15);
      expect(rows[0][1]).toBe('`instruction`');
      expect(rows[0][2]).toMatch(new RegExp(`^\\\`${unit}\\.1\\\``));
      expect(rows.some((row) => row[1] === '`ap_task_model`')).toBe(true);
      expect(rows.some((row) => row[1] === '`review`')).toBe(true);
      expect(rows.some((row) => row[1] === '`test`')).toBe(true);
    }

    expect(fs.existsSync(path.join(curriculumRoot, 'unit-4-class-period-plan.md'))).toBe(false);
  });
});
