import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseAleksPracticeMap, parseClassPeriodPlan, runCurriculumAudit } from '@/lib/curriculum/audit';

describe('curriculum audit', () => {
  it('parses class-period plan rows', () => {
    const content = [
      '| Period | Day Type | Source Textbook Lesson | Primary Objective | Worked Examples | Embedded Objectives | Notes |',
      '|--------|----------|------------------------|-------------------|-----------------|---------------------|-------|',
      '| 1 | `instruction` | `1-1` | `1a. Graph quadratic functions.` | `1-1, Examples 1-3` | — | Graph features. |',
      '| 2 | `mastery` | — | — | — | — | Mastery cycle on `1a`. |',
    ].join('\n');

    expect(parseClassPeriodPlan(content, 1)).toEqual([
      {
        module: 1,
        period: 1,
        dayType: 'instruction',
        sourceLesson: '1-1',
        objective: '1a. Graph quadratic functions.',
        workedExamples: '1-1, Examples 1-3',
        embeddedObjectives: '',
        notes: 'Graph features.',
      },
      {
        module: 1,
        period: 2,
        dayType: 'mastery',
        sourceLesson: '',
        objective: '',
        workedExamples: '',
        embeddedObjectives: '',
        notes: 'Mastery cycle on `1a`.',
      },
    ]);
  });

  it('parses ALEKS practice-map rows after the ALEKS heading', () => {
    const content = [
      '# Module Plan',
      '## ALEKS SRS Practice Map',
      '| Period | ALEKS Practice Topics | Notes |',
      '|--------|-----------------------|-------|',
      '| 1 | `ALEKS M1-L1-1.01` through `ALEKS M1-L1-1.03` | Graphing practice. |',
    ].join('\n');

    expect(parseAleksPracticeMap(content, 1)).toEqual([
      {
        module: 1,
        period: 1,
        topics: '`ALEKS M1-L1-1.01` through `ALEKS M1-L1-1.03`',
        notes: 'Graphing practice.',
      },
    ]);
  });

  it('passes against the remediated curriculum artifacts', () => {
    const root = process.cwd();
    const report = runCurriculumAudit(root);
    const expectedFiles = [
      path.join(root, 'curriculum', 'implementation', 'class-period-packages', 'module-1.json'),
      path.join(root, 'curriculum', 'implementation', 'practice-v1', 'activity-map.json'),
    ];

    expect(report.summary.moduleCount).toBe(9);
    expect(report.summary.lessonCount).toBe(52);
    expect(report.summary.objectiveCount).toBe(105);
    expect(report.summary.plannedPeriods).toMatchObject({
      instruction: 108,
      mastery: 36,
      jigsaw: 18,
      review: 9,
      test: 9,
    });
    expect(report.summary.aleks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: 1, declaredTopics: 59, listedTopics: 59, documentedException: false }),
        expect.objectContaining({ module: 2, declaredTopics: 23, listedTopics: 13, documentedException: true }),
        expect.objectContaining({ module: 8, declaredTopics: 31, listedTopics: 31, documentedException: false }),
      ])
    );
    expectedFiles.forEach((file) => expect(fs.existsSync(file)).toBe(true));
    expect(report.pass).toBe(true);
  });
});
