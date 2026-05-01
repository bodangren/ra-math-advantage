import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const curriculumRoot = path.join(appRoot, 'curriculum');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(curriculumRoot, relativePath), 'utf8');
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

describe('AP Precalculus curriculum source inventory', () => {
  it('keeps the official and local source hierarchy documented', () => {
    const courseSpec = read('course-spec.md');

    expect(courseSpec).toContain('College Board AP Precalculus Course and Exam Description');
    expect(courseSpec).toContain('https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf');
    expect(courseSpec).toContain('https://apcentral.collegeboard.org/media/pdf/ap-precalculus-ced-clarification-and-guidance.pdf');
    expect(courseSpec).toContain('CED defines competency evidence');
    expect(courseSpec).toContain('Passwater defines instruction');
    expect(courseSpec).toContain('FRQ 1: Function Concepts');
    expect(courseSpec).toContain('FRQ 2: Modeling a Non-Periodic Context');
    expect(courseSpec).toContain('FRQ 3: Modeling a Periodic Context');
    expect(courseSpec).toContain('FRQ 4: Symbolic Manipulations');
  });

  it('tracks all local source PDFs and the intentional Unit 4 Passwater gap', () => {
    for (const unit of [1, 2, 3]) {
      const pdfPath = path.join(curriculumRoot, `APPC  Unit ${unit} Passwater.pdf`);
      expect(fs.existsSync(pdfPath), `Unit ${unit} Passwater PDF should exist`).toBe(true);
      expect(fs.statSync(pdfPath).size, `Unit ${unit} PDF should be non-empty`).toBeGreaterThan(1_000_000);
    }

    expect(fs.existsSync(path.join(curriculumRoot, 'APPC  Unit 4 Passwater.pdf'))).toBe(false);
  });

  it('documents source exceptions that future generators must consume', () => {
    const exceptions = readJson<{
      schemaVersion: string;
      exceptions: Array<{
        id: string;
        status: string;
        unit?: number;
        sourceStatus?: string;
        examStatus?: string;
        values?: Record<string, number | string>;
      }>;
    }>('implementation/exceptions.json');

    expect(exceptions.schemaVersion).toBe('precalculus-curriculum-exceptions.v1');

    const unit4 = exceptions.exceptions.find((entry) => entry.id === 'unit-4-passwater-source-missing');
    expect(unit4).toMatchObject({
      status: 'open',
      unit: 4,
      sourceStatus: 'ced-defined-local-passwater-missing',
      examStatus: 'not-assessed-on-ap-exam',
    });

    const countMismatch = exceptions.exceptions.find((entry) => entry.id === 'topic-count-language-mismatch');
    expect(countMismatch?.values).toMatchObject({
      productApproxLessons: '~54',
      overviewApproxLessons: '~54',
      listedTopics: 58,
      cedTopics: 58,
    });
  });

  it('makes the curriculum README the entry point for future authoring and seeding', () => {
    const readme = read('README.md');

    expect(readme).toContain('course-spec.md');
    expect(readme).toContain('implementation/exceptions.json');
    expect(readme).toContain('CED for competencies');
    expect(readme).toContain('Passwater PDFs for scaffolding');
    expect(readme).toContain('curriculum-authoring-precalc_20260425');
  });
});
