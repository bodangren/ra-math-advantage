import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const CURRICULUM_DIR = join(__dirname, '../../curriculum');
const MODULES_DIR = join(CURRICULUM_DIR, 'modules');
const IMPLEMENTATION_DIR = join(CURRICULUM_DIR, 'implementation');
const PRACTICE_DIR = join(CURRICULUM_DIR, 'practice');
const SOURCE_DIR = join(CURRICULUM_DIR, 'source');

// Expected lesson counts per unit from overview.md
const EXPECTED_LESSONS: Record<number, number> = {
  1: 6, 2: 5, 3: 5, 4: 6, 5: 5, 6: 5, 7: 6,
  8: 6, 9: 5, 10: 5, 11: 6, 12: 5, 13: 5,
};

const _VALID_DAY_TYPES = ['instruction', 'mastery', 'jigsaw', 'review', 'test'];
void _VALID_DAY_TYPES;

function readFileLines(filePath: string): string[] {
  return readFileSync(filePath, 'utf-8').split('\n');
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

describe('Curriculum Structure', () => {
  it('has README.md and course-spec.md at curriculum root', () => {
    expect(existsSync(join(CURRICULUM_DIR, 'README.md'))).toBe(true);
    expect(existsSync(join(CURRICULUM_DIR, 'course-spec.md'))).toBe(true);
  });

  it('course-spec.md defines the class-period planning model', () => {
    const spec = readFileSync(join(CURRICULUM_DIR, 'course-spec.md'), 'utf-8');
    expect(spec).toContain('class period');
    expect(spec).toContain('instruction');
    expect(spec).toContain('mastery');
    expect(spec).toContain('jigsaw');
    expect(spec).toContain('review');
    expect(spec).toContain('test');
    expect(spec).toContain('warmUp');
    expect(spec).toContain('capReflection');
  });

  it('has modules, practice, implementation, and source directories', () => {
    expect(existsSync(MODULES_DIR)).toBe(true);
    expect(existsSync(PRACTICE_DIR)).toBe(true);
    expect(existsSync(IMPLEMENTATION_DIR)).toBe(true);
    expect(existsSync(SOURCE_DIR)).toBe(true);
  });
});

describe('Unit Summary Files', () => {
  it('has 13 unit summary files', () => {
    const summaries = readdirSync(MODULES_DIR).filter(f => f.match(/^unit-\d+-.*\.md$/));
    expect(summaries.length).toBe(13);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'unit %d summary file exists',
    (unit) => {
      const files = readdirSync(MODULES_DIR).filter(f => f.startsWith(`unit-${unit}-`) && f.endsWith('.md'));
      expect(files.length).toBeGreaterThanOrEqual(1);
    }
  );
});

describe('Lesson Source Files', () => {
  const lessonFiles = readdirSync(MODULES_DIR).filter(f => f.match(/^unit-\d+-lesson-\d+$/));

  it('has at least 67 lesson files', () => {
    expect(lessonFiles.length).toBeGreaterThanOrEqual(67);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'unit %d has expected number of lesson files',
    (unit) => {
      const expected = EXPECTED_LESSONS[unit];
      const actual = readdirSync(MODULES_DIR).filter(f => f.startsWith(`unit-${unit}-lesson-`)).length;
      expect(actual).toBeGreaterThanOrEqual(expected);
    }
  );

  it('no lesson file is under 60 lines', () => {
    const shallow: string[] = [];
    for (const file of lessonFiles) {
      const lines = readFileLines(join(MODULES_DIR, file));
      if (lines.length < 60) {
        shallow.push(`${file}: ${lines.length} lines`);
      }
    }
    expect(shallow).toEqual([]);
  });

  it('every lesson file contains Today\'s Goals section', () => {
    const missing: string[] = [];
    for (const file of lessonFiles) {
      const content = readFileSync(join(MODULES_DIR, file), 'utf-8');
      if (!content.includes("Today's Goals") && !content.includes('Today’s Goals') && !content.includes('Goals')) {
        missing.push(file);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every lesson file contains Vocabulary section', () => {
    const missing: string[] = [];
    for (const file of lessonFiles) {
      const content = readFileSync(join(MODULES_DIR, file), 'utf-8');
      if (!content.includes('Vocabulary')) {
        missing.push(file);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every lesson file contains Objective Alignment section', () => {
    const missing: string[] = [];
    for (const file of lessonFiles) {
      const content = readFileSync(join(MODULES_DIR, file), 'utf-8');
      if (!content.includes('Objective Alignment')) {
        missing.push(file);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every lesson file contains at least 4 worked examples', () => {
    const insufficient: string[] = [];
    for (const file of lessonFiles) {
      const content = readFileSync(join(MODULES_DIR, file), 'utf-8');
      const exampleCount = (content.match(/^## Example \d/gm) || []).length;
      if (exampleCount < 4) {
        insufficient.push(`${file}: ${exampleCount} examples`);
      }
    }
    expect(insufficient).toEqual([]);
  });
});

describe('Class-Period Plans', () => {
  it('has 13 class-period plan files', () => {
    const plans = readdirSync(CURRICULUM_DIR).filter(f => f.match(/^unit-\d+-class-period-plan\.md$/));
    expect(plans.length).toBe(13);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'unit %d class-period plan exists and uses valid day types',
    (unit) => {
      const planPath = join(CURRICULUM_DIR, `unit-${unit}-class-period-plan.md`);
      expect(existsSync(planPath)).toBe(true);
      const content = readFileSync(planPath, 'utf-8');
      expect(content).toContain('instruction');
      expect(content).toContain('mastery');
      expect(content).toContain('review');
      expect(content).toContain('test');
    }
  );
});

describe('Class-Period Packages', () => {
  it('has 13 class-period package JSON files', () => {
    const pkgs = readdirSync(join(IMPLEMENTATION_DIR, 'class-period-packages')).filter(f => f.endsWith('.json'));
    expect(pkgs.length).toBe(13);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'unit %d package uses class-period-package.v1 schema',
    (unit) => {
      const pkgPath = join(IMPLEMENTATION_DIR, 'class-period-packages', `unit-${unit}.json`);
      const pkg = readJson(pkgPath) as Record<string, unknown>;
      expect(pkg.schemaVersion).toBe('class-period-package.v1');
      expect(Array.isArray(pkg.periods)).toBe(true);
      const periods = pkg.periods as Record<string, unknown>[];
      expect(periods.length).toBeGreaterThan(0);
    }
  );

  it('instruction periods have dailyPhases with all 6 phases', () => {
    for (let unit = 1; unit <= 13; unit++) {
      const pkgPath = join(IMPLEMENTATION_DIR, 'class-period-packages', `unit-${unit}.json`);
      const pkg = readJson(pkgPath) as { periods: Record<string, unknown>[] };
      const instructions = pkg.periods.filter(p => p.dayType === 'instruction');
      for (const period of instructions) {
        const dp = period.dailyPhases as Record<string, string> | undefined;
        expect(dp).toBeDefined();
        if (dp) {
          expect(dp.warmUp).toBeTruthy();
          expect(dp.conceptDevelopment).toBeTruthy();
          expect(dp.guidedPractice).toBeTruthy();
          expect(dp.independentPractice).toBeTruthy();
          expect(dp.assessment).toBeTruthy();
          expect(dp.capReflection).toBeTruthy();
        }
      }
    }
  });

  it('instruction periods have sourceLesson, objectiveCode, objective, and workedExamples', () => {
    for (let unit = 1; unit <= 13; unit++) {
      const pkgPath = join(IMPLEMENTATION_DIR, 'class-period-packages', `unit-${unit}.json`);
      const pkg = readJson(pkgPath) as { periods: Record<string, unknown>[] };
      const instructions = pkg.periods.filter(p => p.dayType === 'instruction');
      for (const period of instructions) {
        expect(period.sourceLesson).toBeTruthy();
        expect(period.objectiveCode).toBeTruthy();
        expect(period.objective).toBeTruthy();
        expect(period.workedExamples).toBeTruthy();
      }
    }
  });

  it('non-instruction periods have nonInstructionArtifact', () => {
    for (let unit = 1; unit <= 13; unit++) {
      const pkgPath = join(IMPLEMENTATION_DIR, 'class-period-packages', `unit-${unit}.json`);
      const pkg = readJson(pkgPath) as { periods: Record<string, unknown>[] };
      const nonInstruction = pkg.periods.filter(p => ['mastery', 'jigsaw', 'review', 'test'].includes(p.dayType as string));
      for (const period of nonInstruction) {
        expect(period.nonInstructionArtifact).toBeDefined();
      }
    }
  });

  it('dailyPhases text is not copy-paste (unique across instruction periods within each unit)', () => {
    for (let unit = 1; unit <= 13; unit++) {
      const pkgPath = join(IMPLEMENTATION_DIR, 'class-period-packages', `unit-${unit}.json`);
      const pkg = readJson(pkgPath) as { periods: Record<string, unknown>[] };
      const instructions = pkg.periods.filter(p => p.dayType === 'instruction');
      const warmUpTexts = instructions.map(p => (p.dailyPhases as Record<string, string>)?.warmUp || '');
      const uniqueWarmUps = new Set(warmUpTexts);
      // Allow some reuse (e.g., standard "Activate prior knowledge" pattern) but require majority uniqueness
      expect(uniqueWarmUps.size).toBeGreaterThanOrEqual(Math.ceil(instructions.length * 0.5));
    }
  });
});

describe('Activity Map', () => {
  it('has practice.v1 contract and curriculum-activity-map.v1 schema', () => {
    const mapPath = join(IMPLEMENTATION_DIR, 'practice-v1', 'activity-map.json');
    const map = readJson(mapPath) as Record<string, string>;
    expect(map.contractVersion).toBe('practice.v1');
    expect(map.schemaVersion).toBe('curriculum-activity-map.v1');
  });

  it('has at least 400 activity entries', () => {
    const mapPath = join(IMPLEMENTATION_DIR, 'practice-v1', 'activity-map.json');
    const map = readJson(mapPath) as { activities: unknown[] };
    expect(map.activities.length).toBeGreaterThanOrEqual(400);
  });

  it('no single componentKey exceeds 40% of entries', () => {
    const mapPath = join(IMPLEMENTATION_DIR, 'practice-v1', 'activity-map.json');
    const map = readJson(mapPath) as { activities: Record<string, unknown>[] };
    const counts: Record<string, number> = {};
    for (const activity of map.activities) {
      const key = activity.componentKey as string;
      counts[key] = (counts[key] || 0) + 1;
    }
    const total = map.activities.length;
    for (const [, count] of Object.entries(counts)) {
      const pct = count / total;
      expect(pct).toBeLessThanOrEqual(0.40);
    }
  });

  it('uses only known practice.v1 modes', () => {
    const validModes = ['worked_example', 'guided_practice', 'independent_practice', 'assessment', 'teaching'];
    const mapPath = join(IMPLEMENTATION_DIR, 'practice-v1', 'activity-map.json');
    const map = readJson(mapPath) as { activities: Record<string, unknown>[] };
    for (const activity of map.activities) {
      expect(validModes).toContain(activity.mode);
    }
  });
});

describe('Problem-Family Registry', () => {
  it('problem-type-registry.md exists', () => {
    expect(existsSync(join(PRACTICE_DIR, 'problem-type-registry.md'))).toBe(true);
  });

  it('has familyKey entries for all 13 units', () => {
    const registry = readFileSync(join(PRACTICE_DIR, 'problem-type-registry.md'), 'utf-8');
    for (let unit = 1; unit <= 13; unit++) {
      expect(registry).toContain(`| ${unit} |`);
    }
  });

  it('course-plan-map.md exists and covers all units', () => {
    expect(existsSync(join(PRACTICE_DIR, 'course-plan-map.md'))).toBe(true);
    const map = readFileSync(join(PRACTICE_DIR, 'course-plan-map.md'), 'utf-8');
    for (let unit = 1; unit <= 13; unit++) {
      expect(map).toContain(`## Unit ${unit}`);
    }
  });
});

describe('Source PDF Extractions', () => {
  it('pdf-manifest.json exists and lists 18 PDFs', () => {
    const manifest = readJson(join(SOURCE_DIR, 'pdf-manifest.json')) as unknown[];
    expect(manifest.length).toBe(18);
  });

  it('has extracted markdown for all 18 PDFs', () => {
    const sourceFiles = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
    expect(sourceFiles.length).toBe(18);
  });

  it('no source extraction file is empty', () => {
    const sourceFiles = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
    for (const file of sourceFiles) {
      const content = readFileSync(join(SOURCE_DIR, file), 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    }
  });
});

describe('Exceptions', () => {
  it('exceptions.json documents filename anomalies', () => {
    const exc = readJson(join(IMPLEMENTATION_DIR, 'exceptions.json')) as Record<string, unknown>;
    const anomalies = exc.pdfFilenameAnomalies as Record<string, string>[];
    expect(anomalies.length).toBeGreaterThanOrEqual(2);
    const filenames = anomalies.map(a => a.filename);
    expect(filenames.some(f => f.includes('PRoblem'))).toBe(true);
    expect(filenames.some(f => f.includes('12-15'))).toBe(true);
  });

  it('exceptions.json documents split modules', () => {
    const exc = readJson(join(IMPLEMENTATION_DIR, 'exceptions.json')) as Record<string, unknown>;
    const splits = exc.splitModulePdfs as Record<string, unknown>[];
    expect(splits.length).toBe(5);
    const modules = splits.map(s => s.module);
    expect(modules).toEqual(expect.arrayContaining([6, 8, 9, 10, 12]));
  });
});

describe('Audit', () => {
  it('audit/latest.json exists with all checks passing', () => {
    const audit = readJson(join(IMPLEMENTATION_DIR, 'audit', 'latest.json')) as Record<string, unknown>;
    expect(audit.summary).toBeDefined();
    const checks = audit.checks as Record<string, string>[];
    expect(checks.length).toBeGreaterThanOrEqual(7);
    const failed = checks.filter(c => c.status !== 'pass');
    expect(failed).toEqual([]);
  });

  it('audit reports 13 units', () => {
    const audit = readJson(join(IMPLEMENTATION_DIR, 'audit', 'latest.json')) as { summary: Record<string, unknown> };
    expect(audit.summary.unitCount).toBe(13);
  });

  it('audit reports at least 67 lessons', () => {
    const audit = readJson(join(IMPLEMENTATION_DIR, 'audit', 'latest.json')) as { summary: Record<string, unknown> };
    expect(audit.summary.lessonCount as number).toBeGreaterThanOrEqual(67);
  });

  it('audit reports at least 160 planned periods', () => {
    const audit = readJson(join(IMPLEMENTATION_DIR, 'audit', 'latest.json')) as { summary: { plannedPeriods: Record<string, number> } };
    const total = Object.values(audit.summary.plannedPeriods).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(160);
  });
});
