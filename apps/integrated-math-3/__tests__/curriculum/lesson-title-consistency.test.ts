import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function normalizeTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim();
}

function canonicalLessonTitles() {
  const titles = new Map<string, string>();
  const modulesDir = join(repoRoot, 'curriculum/modules');

  for (const filename of readdirSync(modulesDir)) {
    const match = filename.match(/^module-(\d+)-lesson-(\d+)$/);
    if (!match) continue;

    const relativePath = `curriculum/modules/${filename}`;
    const firstLine = read(relativePath).split(/\r?\n/)[0];
    const heading = firstLine.match(/^# Lesson (\d+-\d+)\s+[\u2014-]\s+(.+)$/);

    expect(heading, `${relativePath} must start with a lesson heading`).not.toBeNull();
    if (!heading) continue;

    titles.set(heading[1], normalizeTitle(heading[2]));
  }

  return titles;
}

function expectCanonicalTitle(
  canonical: Map<string, string>,
  lessonId: string,
  title: string,
  source: string
) {
  const expected = canonical.get(lessonId);
  expect(expected, `${source} references unknown lesson ${lessonId}`).toBeDefined();
  expect(normalizeTitle(title), `${source} title for ${lessonId}`).toBe(expected);
}

function curriculumPhaseCounts(lessonId: string) {
  const [moduleNumber, lessonNumber] = lessonId.split('-');
  const source = read(`curriculum/modules/module-${moduleNumber}-lesson-${lessonNumber}`);

  return {
    learn: (source.match(/^## Learn:/gm) ?? []).length,
    worked_example: (source.match(/^## (?:Apply )?Example \d+/gm) ?? []).length,
    assessment: (source.match(/^## (?:Assessment|Quick Check)/gm) ?? []).length,
  };
}

function curriculumPhaseSequence(lessonId: string) {
  const [moduleNumber, lessonNumber] = lessonId.split('-');
  const source = read(`curriculum/modules/module-${moduleNumber}-lesson-${lessonNumber}`);
  const sequence: Array<'learn' | 'worked_example' | 'assessment'> = [];

  for (const line of source.split(/\r?\n/)) {
    if (/^## Learn:/.test(line)) {
      sequence.push('learn');
    } else if (/^## (?:Apply )?Example \d+/.test(line)) {
      sequence.push('worked_example');
    } else if (/^## (?:Assessment|Quick Check)/.test(line)) {
      sequence.push('assessment');
    }
  }

  return sequence;
}

function specPhaseCounts(sequence: string) {
  const counts = {
    learn: 0,
    worked_example: 0,
    assessment: 0,
  };

  for (const part of sequence.split(',').map((item) => item.trim())) {
    const match = part.match(/^(learn|worked_example|assessment)(?:\s*[x×]\s*(\d+))?$/);
    if (!match) continue;

    counts[match[1] as keyof typeof counts] += Number(match[2] ?? 1);
  }

  return counts;
}

function seedImplementationPhaseCounts(relativePath: string) {
  const source = read(relativePath);

  return {
    learn: (source.match(/phaseType: "learn"/g) ?? []).length,
    worked_example: (source.match(/phaseType: "worked_example"/g) ?? []).length,
    assessment: (source.match(/phaseType: "assessment"/g) ?? []).length,
  };
}

function seedImplementationPhaseSequence(relativePath: string) {
  return Array.from(
    read(relativePath).matchAll(/phaseType: "(learn|worked_example|assessment)"/g),
    (match) => match[1]
  );
}

describe('curriculum lesson title consistency', () => {
  const canonical = canonicalLessonTitles();

  it('has canonical headings for all 52 lesson source files', () => {
    expect(canonical.size).toBe(52);
  });

  it('keeps module overview titles aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(repoRoot, 'curriculum/modules'))) {
      if (!/^module-\d+-.*\.md$/.test(filename)) continue;

      const relativePath = `curriculum/modules/${filename}`;
      const lines = read(relativePath).split(/\r?\n/);

      lines.forEach((line, index) => {
        const overviewHeading = line.match(/^### (\d+-\d+)\s+(.+)$/);
        if (!overviewHeading) return;

        expectCanonicalTitle(
          canonical,
          overviewHeading[1],
          overviewHeading[2],
          `${relativePath}:${index + 1}`
        );
      });
    }
  });

  it('keeps curriculum-bearing Conductor track titles aligned to lesson source headings', () => {
    const conductorFiles = [
      'conductor/tracks.md',
      'conductor/tracks/module-1-seed_20260406/plan.md',
      'conductor/tracks/module-1-seed_20260406/spec.md',
      'conductor/tracks/module-2-seed_20260415/plan.md',
      'conductor/tracks/module-2-seed_20260415/spec.md',
    ];

    for (const relativePath of conductorFiles) {
      const lines = read(relativePath).split(/\r?\n/);

      lines.forEach((line, index) => {
        const source = `${relativePath}:${index + 1}`;
        const lessonColon = line.match(/Lesson (\d+-\d+):\s+([^(]+)/);
        const seedParen = line.match(/Seed Lesson (\d+-\d+) \(([^)]+)\)/);
        const seedDash = line.match(/Seed lesson (\d+-\d+) [\u2014-] ([^\[]+)/i);

        for (const match of [lessonColon, seedParen, seedDash]) {
          if (!match) continue;
          expectCanonicalTitle(canonical, match[1], match[2], source);
        }
      });
    }
  });

  it('keeps seed-track phase counts aligned to lesson source headings', () => {
    const seedSpecFiles = [
      'conductor/tracks/module-1-seed_20260406/spec.md',
      'conductor/tracks/module-2-seed_20260415/spec.md',
    ];

    for (const relativePath of seedSpecFiles) {
      const lines = read(relativePath).split(/\r?\n/);

      lines.forEach((line, index) => {
        const phaseRow = line.match(/^\|\s*(\d+-\d+)\s*\|\s*([^|]+)\|$/);
        if (!phaseRow) return;

        const lessonId = phaseRow[1];
        const source = `${relativePath}:${index + 1}`;

        expect(specPhaseCounts(phaseRow[2]), source).toEqual(curriculumPhaseCounts(lessonId));
      });
    }
  });

  it('keeps Convex seed lesson titles aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(repoRoot, 'convex/seed'))) {
      const seedFile = filename.match(/^seed-lesson-(\d+)-(\d+)\.ts$/);
      if (!seedFile) continue;

      const lessonId = `${seedFile[1]}-${seedFile[2]}`;
      const relativePath = `convex/seed/${filename}`;
      const title = read(relativePath).match(/title: "([^"]+)"/);

      expect(title, `${relativePath} must define a lesson title`).not.toBeNull();
      if (!title) continue;

      expectCanonicalTitle(canonical, lessonId, title[1], relativePath);
    }
  });

  it('keeps Convex seed implementation phase counts aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(repoRoot, 'convex/seed'))) {
      const seedFile = filename.match(/^seed-lesson-(\d+)-(\d+)\.ts$/);
      if (!seedFile) continue;

      const lessonId = `${seedFile[1]}-${seedFile[2]}`;
      const relativePath = `convex/seed/${filename}`;

      expect(seedImplementationPhaseCounts(relativePath), relativePath).toEqual(
        curriculumPhaseCounts(lessonId)
      );
    }
  });

  it('keeps Convex seed implementation phase order aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(repoRoot, 'convex/seed'))) {
      const seedFile = filename.match(/^seed-lesson-(\d+)-(\d+)\.ts$/);
      if (!seedFile) continue;

      const lessonId = `${seedFile[1]}-${seedFile[2]}`;
      const relativePath = `convex/seed/${filename}`;

      expect(seedImplementationPhaseSequence(relativePath), relativePath).toEqual(
        curriculumPhaseSequence(lessonId)
      );
    }
  });

  it('keeps seed test lesson titles aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(repoRoot, '__tests__/convex/seed'))) {
      const testFile = filename.match(/^seed-lesson-(\d+)-(\d+)\.test\.ts$/);
      if (!testFile) continue;

      const lessonId = `${testFile[1]}-${testFile[2]}`;
      const relativePath = `__tests__/convex/seed/${filename}`;
      const describeTitle = read(relativePath).match(/describe\('Lesson \d+-\d+: ([^']+)'/);

      expect(describeTitle, `${relativePath} must describe the canonical lesson title`).not.toBeNull();
      if (!describeTitle) continue;

      expectCanonicalTitle(canonical, lessonId, describeTitle[1], relativePath);
    }
  });
});
