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

describe('AP Precalculus implementation bridge artifacts', () => {
  it('generates class-period packages for source-backed units', async () => {
    const pkg = await import('../../package.json');
    expect(pkg.default.scripts['curriculum:implementation']).toBe('node scripts/generate-curriculum-implementation.mjs');

    for (const unit of [1, 2, 3]) {
      const packageJson = readJson<{
        schemaVersion: string;
        unit: number;
        generatedFrom: string;
        periods: Array<{
          periodId: string;
          dayType: string;
          cedTopic?: { id: string; title: string };
          competencyTarget?: { learningObjectiveFamily: string; essentialKnowledgeFamily: string };
          dailyPhases?: Record<string, string>;
          nonInstructionArtifact?: Record<string, string>;
        }>;
      }>(`implementation/class-period-packages/unit-${unit}.json`);

      expect(packageJson.schemaVersion).toBe('class-period-package.v1');
      expect(packageJson.unit).toBe(unit);
      expect(packageJson.generatedFrom).toBe(`curriculum/unit-${unit}-class-period-plan.md`);
      expect(packageJson.periods.length).toBeGreaterThan(15);
      expect(packageJson.periods[0].periodId).toBe(`u0${unit}-p01`);
      expect(packageJson.periods[0].dayType).toBe('instruction');
      expect(packageJson.periods[0].cedTopic?.id).toBe(`${unit}.1`);
      expect(packageJson.periods[0].competencyTarget?.learningObjectiveFamily).toBe(`${unit}.1.A`);
      expect(packageJson.periods[0].dailyPhases).toHaveProperty('warmUp');
      expect(packageJson.periods.some((period) => period.dayType === 'ap_task_model')).toBe(true);
      expect(packageJson.periods.some((period) => period.nonInstructionArtifact)).toBe(true);
    }

    expect(fs.existsSync(path.join(curriculumRoot, 'implementation/class-period-packages/unit-4.json'))).toBe(false);
  });

  it('generates practice.v1 activity candidates and AP Precalc problem families', () => {
    const activityMap = readJson<{
      schemaVersion: string;
      generatedFrom: string[];
      activities: Array<{
        activityId: string;
        familyKey: string;
        cedTopicId: string;
        componentKey: string;
        mode: string;
        srsEligible: boolean;
      }>;
    }>('implementation/practice-v1/activity-map.json');

    expect(activityMap.schemaVersion).toBe('curriculum-activity-map.v1');
    expect(activityMap.generatedFrom).toContain('curriculum/source/college-board/ced-topic-index.json');
    expect(activityMap.activities).toHaveLength(44);
    expect(activityMap.activities[0]).toMatchObject({
      activityId: 'apc-1-1-independent-practice',
      familyKey: 'apc_1_1',
      cedTopicId: '1.1',
      componentKey: 'comprehension-quiz',
      mode: 'practice',
      srsEligible: true,
    });

    const registry = read('practice/problem-family-registry.md');
    const courseMap = read('practice/course-plan-map.md');

    expect(registry).toContain('| `apc_1_1` | 1 | `1.1` | Change in Tandem |');
    expect(registry).toContain('| `apc_3_15` | 3 | `3.15` | Rates of Change in Polar Functions |');
    expect(courseMap).toContain('| `u01-p01` | `instruction` | `1.1` | `apc_1_1` |');
    expect(courseMap).toContain('| `u03-p15` | `instruction` | `3.15` | `apc_3_15` |');
  });

  it('generates an audit artifact that consumes exceptions and coverage counts', () => {
    const audit = readJson<{
      schemaVersion: string;
      sourceCoverage: Record<string, number>;
      packageCoverage: Record<string, number>;
      practiceCoverage: Record<string, number>;
      exceptionsConsumed: string[];
      checks: Array<{ id: string; status: string }>;
    }>('implementation/audit/latest.json');

    expect(audit.schemaVersion).toBe('precalculus-curriculum-audit.v1');
    expect(audit.sourceCoverage).toMatchObject({
      units: 4,
      topics: 58,
      passwaterBackedUnits: 3,
    });
    expect(audit.packageCoverage).toMatchObject({
      classPeriodPackageUnits: 3,
      unit4PackageDeferred: 1,
    });
    expect(audit.practiceCoverage).toMatchObject({
      activityCandidates: 44,
      problemFamilies: 44,
    });
    expect(audit.exceptionsConsumed).toContain('unit-4-passwater-source-missing');
    expect(audit.exceptionsConsumed).toContain('passwater-extraction-quality-limitations');
    expect(audit.checks.every((check) => check.status === 'pass')).toBe(true);
  });
});
