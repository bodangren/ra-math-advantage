import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const appRoot = process.cwd();
function readApp(relativePath: string) {
  return readFileSync(join(appRoot, relativePath), 'utf8');
}

function normalizeTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim();
}

function canonicalLessonTitles() {
  const titles = new Map<string, string>();
  const modulesDir = join(appRoot, 'curriculum/modules');

  for (const filename of readdirSync(modulesDir)) {
    const match = filename.match(/^module-(\d+)-lesson-(\d+)$/);
    if (!match) continue;

    const relativePath = `curriculum/modules/${filename}`;
    const firstLine = readApp(relativePath).split(/\r?\n/)[0];
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

describe('curriculum lesson title consistency', () => {
  const canonical = canonicalLessonTitles();

  it('has canonical headings for all 52 lesson source files', () => {
    expect(canonical.size).toBe(52);
  });

  it('keeps module overview titles aligned to lesson source headings', () => {
    for (const filename of readdirSync(join(appRoot, 'curriculum/modules'))) {
      if (!/^module-\d+-.*\.md$/.test(filename)) continue;

      const relativePath = `curriculum/modules/${filename}`;
      const lines = readApp(relativePath).split(/\r?\n/);

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

});
