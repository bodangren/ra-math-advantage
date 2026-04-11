import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const curriculumRoot = path.join(repoRoot, 'curriculum');
const modulesRoot = path.join(curriculumRoot, 'modules');

const dayTypes = new Set(['instruction', 'mastery', 'jigsaw', 'review', 'test']);
const aleksStatuses = new Set(['planned', 'component-planned', 'composite']);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function listFiles(directory: string): string[] {
  return fs.readdirSync(directory).sort();
}

function stripCodeTicks(value: string): string {
  return value.replace(/^`|`$/g, '').replace(/^\*\*|\*\*$/g, '');
}

function parseMarkdownTableRows(content: string, header: string): string[][] {
  const lines = content.split('\n');
  const headerIndex = lines.findIndex((line) => line.trim() === header);

  expect(headerIndex, `Missing table header: ${header}`).toBeGreaterThanOrEqual(0);

  const rows: string[][] = [];
  for (const line of lines.slice(headerIndex + 2)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) break;
    rows.push(trimmed.split('|').slice(1, -1).map((cell) => cell.trim()));
  }

  return rows;
}

function parseBudget(content: string): Record<string, number> {
  const rows = parseMarkdownTableRows(content, '| Day Type | Count |');
  return Object.fromEntries(rows.map(([label, count]) => [stripCodeTicks(label), Number(count.replace(/\D/g, ''))]));
}

function parsePeriodRows(content: string): Array<{
  period: number;
  dayType: string;
  source: string;
  primaryObjective: string;
  workedExamples: string;
}> {
  return parseMarkdownTableRows(
    content,
    '| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |',
  ).map(([period, dayType, source, primaryObjective, workedExamples]) => ({
    period: Number(period),
    dayType: stripCodeTicks(dayType),
    source: stripCodeTicks(source),
    primaryObjective,
    workedExamples,
  }));
}

function parseAleksMapRows(content: string): Array<{
  period: number;
  dayType: string;
  source: string;
  familyKeys: string;
}> {
  return parseMarkdownTableRows(content, '| Period | Day Type | Source | Primary familyKeys | Notes |')
    .map(([period, dayType, source, familyKeys]) => ({
      period: Number(period),
      dayType: stripCodeTicks(dayType),
      source: stripCodeTicks(source),
      familyKeys,
    }));
}

function parseRegistryRows(content: string): Array<{
  familyKey: string;
  moduleNumber: number;
  objectives: string;
  sourceExamples: string;
  interactionShape: string;
  status: string;
}> {
  return parseMarkdownTableRows(
    content,
    '| familyKey | Module | Objectives | Source examples | Interaction shape | Status | Notes |',
  ).map(([familyKey, moduleNumber, objectives, sourceExamples, interactionShape, status]) => ({
    familyKey: stripCodeTicks(familyKey),
    moduleNumber: Number(moduleNumber),
    objectives,
    sourceExamples,
    interactionShape,
    status,
  }));
}

function extractModuleSection(content: string, moduleNumber: number): string {
  const startMarker = `## Module ${moduleNumber}`;
  const start = content.indexOf(startMarker);
  expect(start, `Missing ${startMarker}`).toBeGreaterThanOrEqual(0);

  const next = content.indexOf('\n## Module ', start + startMarker.length);
  return next === -1 ? content.slice(start) : content.slice(start, next);
}

describe('curriculum markdown formatting', () => {
  it('keeps module class-period plans structurally consistent', () => {
    for (let moduleNumber = 1; moduleNumber <= 9; moduleNumber += 1) {
      const relativePath = `curriculum/module-${moduleNumber}-class-period-plan.md`;
      const content = read(relativePath);
      const budget = parseBudget(content);
      const rows = parsePeriodRows(content);

      expect(content).toContain(`# Module ${moduleNumber} Class-Period Plan`);
      expect(content).toContain('## Module');
      expect(content).toContain('## Notes');
      expect(content).toContain('## Period-by-Period Plan');
      expect(content).toContain('## Objective Coverage Check');
      expect(content).toContain('## Why This Split Works');
      expect(rows).toHaveLength(budget.Total);
      expect(rows.map((row) => row.period)).toEqual(Array.from({ length: rows.length }, (_, index) => index + 1));

      const actualCounts = rows.reduce<Record<string, number>>((counts, row) => {
        counts[row.dayType] = (counts[row.dayType] ?? 0) + 1;
        return counts;
      }, {});

      for (const type of dayTypes) {
        expect(actualCounts[type] ?? 0, `${relativePath} ${type} count`).toBe(budget[type]);
      }

      for (const row of rows) {
        expect(dayTypes.has(row.dayType), `${relativePath} period ${row.period} day type`).toBe(true);

        if (row.dayType === 'instruction') {
          expect(row.source, `${relativePath} period ${row.period} source`).toMatch(new RegExp(`^${moduleNumber}-\\d+$`));
          expect(row.primaryObjective, `${relativePath} period ${row.period} objective`).toMatch(new RegExp(`^\`${moduleNumber}[a-z]\\.`));
          expect(row.workedExamples, `${relativePath} period ${row.period} examples`).toMatch(new RegExp(`^\`${moduleNumber}-\\d, `));
        } else {
          expect(row.source, `${relativePath} period ${row.period} non-instruction source`).toBe('—');
          expect(row.primaryObjective, `${relativePath} period ${row.period} non-instruction objective`).toBe('—');
          expect(row.workedExamples, `${relativePath} period ${row.period} non-instruction examples`).toBe('—');
        }
      }
    }
  });

  it('keeps lesson source files on the agreed heading outline', () => {
    const lessonFiles = listFiles(modulesRoot).filter((name) => /^module-\d+-lesson-\d+$/.test(name));

    expect(lessonFiles).toHaveLength(52);

    for (const fileName of lessonFiles) {
      const relativePath = `curriculum/modules/${fileName}`;
      const content = read(relativePath);
      const [, moduleNumber, lessonNumber] = fileName.match(/^module-(\d+)-lesson-(\d+)$/) ?? [];
      const h1s = content.split('\n').filter((line) => line.startsWith('# '));
      const invalidSubstructureHeadings = content
        .split('\n')
        .filter((line) => /^## (Key Concept:|Study Tip|Watch Out|Step \d+|[a-z]\.\s|Part [A-Z]:)/.test(line));

      expect(h1s, `${relativePath} should have exactly one H1`).toHaveLength(1);
      expect(h1s[0], `${relativePath} H1`).toMatch(new RegExp(`^# Lesson ${moduleNumber}-${lessonNumber} [—-] `));
      expect(content, `${relativePath} goals section`).toMatch(/^## Today['’]s Goals?$/m);
      expect(content, `${relativePath} vocabulary section`).toMatch(/^## Vocabulary$/m);
      expect(content, `${relativePath} objective alignment section`).toMatch(/^## Objective Alignment$/m);
      expect(content, `${relativePath} example headings`).toMatch(/^## (Apply )?Example \d+/m);
      expect(invalidSubstructureHeadings, `${relativePath} substructure should use ### headings`).toEqual([]);
    }
  });

  it('keeps module overview files formatted as module summaries', () => {
    const overviewFiles = listFiles(modulesRoot).filter((name) => /^module-\d+-.+\.md$/.test(name));

    expect(overviewFiles).toHaveLength(9);

    for (const fileName of overviewFiles) {
      const relativePath = `curriculum/modules/${fileName}`;
      const content = read(relativePath);
      const moduleNumber = Number(fileName.match(/^module-(\d+)-/)?.[1]);
      const h1s = content.split('\n').filter((line) => line.startsWith('# '));
      const lessonHeadings = content.match(new RegExp(`^### ${moduleNumber}-\\d+ `, 'gm')) ?? [];

      expect(h1s, `${relativePath} should have exactly one H1`).toHaveLength(1);
      expect(h1s[0], `${relativePath} H1`).toMatch(new RegExp(`^# Module ${moduleNumber}: `));
      expect(content).toContain('## Overview');
      expect(content).toContain('## Lessons');
      expect(content).toContain('## Skills Developed');
      expect(lessonHeadings.length, `${relativePath} lesson headings`).toBeGreaterThan(0);
    }
  });

  it('keeps ALEKS registry and course map aligned', () => {
    const registryContent = read('curriculum/aleks/problem-type-registry.md');
    const mapContent = read('curriculum/aleks/course-plan-map.md');
    const registryRows = parseRegistryRows(registryContent);
    const registryKeys = new Set(registryRows.map((row) => row.familyKey));
    const referencedKeys = new Set<string>();

    expect(registryRows.length).toBeGreaterThan(100);
    expect(registryKeys.size).toBe(registryRows.length);

    for (const row of registryRows) {
      expect(row.familyKey).toMatch(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);
      expect(row.moduleNumber).toBeGreaterThanOrEqual(1);
      expect(row.moduleNumber).toBeLessThanOrEqual(9);
      expect(row.objectives).toMatch(new RegExp(`\`${row.moduleNumber}[a-z]`));
      expect(row.sourceExamples).toMatch(new RegExp(`\`${row.moduleNumber}-\\d`));
      expect(row.interactionShape.length).toBeGreaterThan(0);
      expect(aleksStatuses.has(row.status), `${row.familyKey} status`).toBe(true);
    }

    for (let moduleNumber = 1; moduleNumber <= 9; moduleNumber += 1) {
      const planContent = read(`curriculum/module-${moduleNumber}-class-period-plan.md`);
      const planRows = parsePeriodRows(planContent);
      const mapRows = parseAleksMapRows(extractModuleSection(mapContent, moduleNumber));

      expect(mapRows).toHaveLength(planRows.length);
      expect(mapRows.map((row) => row.period)).toEqual(planRows.map((row) => row.period));
      expect(mapRows.map((row) => row.dayType)).toEqual(planRows.map((row) => row.dayType));

      for (const [index, mapRow] of mapRows.entries()) {
        const planRow = planRows[index];
        expect(mapRow.source, `Module ${moduleNumber} period ${mapRow.period} source`).toBe(planRow.source === '—' ? '-' : planRow.source);

        if (mapRow.familyKeys.includes('family pool')) continue;

        const keys = mapRow.familyKeys.split(';').map((key) => stripCodeTicks(key.trim()));
        expect(keys.length, `Module ${moduleNumber} period ${mapRow.period} keys`).toBeGreaterThan(0);

        for (const key of keys) {
          referencedKeys.add(key);
          expect(registryKeys.has(key), `Missing registry key for ${key}`).toBe(true);
        }
      }
    }

    for (const key of registryKeys) {
      expect(referencedKeys.has(key), `Registry key ${key} should appear in course-plan-map.md`).toBe(true);
    }
  });
});
