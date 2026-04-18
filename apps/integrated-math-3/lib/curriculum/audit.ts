import fs from 'node:fs';
import path from 'node:path';

export type AuditStatus = 'pass' | 'fail' | 'warn';

export interface AuditCheck {
  id: string;
  status: AuditStatus;
  message: string;
  details?: unknown;
}

export interface AuditSummary {
  moduleCount: number;
  lessonCount: number;
  objectiveCount: number;
  plannedPeriods: Record<string, number>;
  aleks: Array<{
    module: number;
    declaredTopics: number;
    listedTopics: number;
    documentedException: boolean;
  }>;
  phasePackageCount: number;
  activityMappingCount: number;
}

export interface CurriculumAuditReport {
  generatedAt: string;
  rootDir: string;
  summary: AuditSummary;
  checks: AuditCheck[];
  pass: boolean;
}

interface PlannedPeriod {
  module: number;
  period: number;
  dayType: string;
  sourceLesson: string;
  objective: string;
  workedExamples: string;
  embeddedObjectives: string;
  notes: string;
}

interface AleksMapRow {
  module: number;
  period: number;
  topics: string;
  notes: string;
}

const EXPECTED_DAY_COUNTS: Record<string, number> = {
  instruction: 108,
  mastery: 36,
  jigsaw: 18,
  review: 9,
  test: 9,
};

const PLACEHOLDER_PATTERNS = [
  /Online Extra Example/i,
  /online-only/i,
  /placeholder preserves/i,
];

const TRUNCATION_PATTERNS = [
  /algebra ca\s*$/i,
  /\bUse\s*$/i,
  /\bwith\s*$/i,
];

const ALLOWED_COMPONENT_KEYS = new Set([
  'comprehension-quiz',
  'fill-in-the-blank',
  'tiered-assessment',
  'graphing-explorer',
  'step-by-step-solver',
  'equation-solver',
  'function-analyzer',
  'drag-drop-categorization',
  'statistical-explorer',
  'unit-circle-trainer',
  'rate-of-change-calculator',
  'discriminant-analyzer',
]);

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function stripTicks(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '—') return '';
  return trimmed.replace(/^`|`$/g, '');
}

function parseMarkdownTableLine(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  if (/^\|[-:|\s]+\|$/.test(trimmed)) return null;
  return trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

export function parseClassPeriodPlan(content: string, module: number): PlannedPeriod[] {
  return content
    .split(/\r?\n/)
    .map(parseMarkdownTableLine)
    .filter((row): row is string[] => Boolean(row))
    .filter((row) => /^\d+$/.test(row[0]) && row.length >= 7)
    .map((row) => ({
      module,
      period: Number(row[0]),
      dayType: stripTicks(row[1]),
      sourceLesson: stripTicks(row[2]),
      objective: stripTicks(row[3]),
      workedExamples: stripTicks(row[4]),
      embeddedObjectives: stripTicks(row[5]),
      notes: row[6],
    }));
}

export function parseAleksPracticeMap(content: string, module: number): AleksMapRow[] {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => /^## ALEKS SRS Practice Map/.test(line));
  if (start < 0) return [];

  return lines
    .slice(start)
    .map(parseMarkdownTableLine)
    .filter((row): row is string[] => Boolean(row))
    .filter((row) => /^\d+$/.test(row[0]) && row.length >= 3)
    .map((row) => ({
      module,
      period: Number(row[0]),
      topics: row[1].trim(),
      notes: row[2].trim(),
    }));
}

function lessonFiles(rootDir: string): string[] {
  const modulesDir = path.join(rootDir, 'curriculum', 'modules');
  return fs
    .readdirSync(modulesDir)
    .filter((name) => /^module-\d+-lesson-\d+$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(modulesDir, name));
}

function moduleOverviewFiles(rootDir: string): string[] {
  const modulesDir = path.join(rootDir, 'curriculum', 'modules');
  return fs
    .readdirSync(modulesDir)
    .filter((name) => /^module-\d+-.+\.md$/.test(name))
    .map((name) => path.join(modulesDir, name));
}

function planFiles(rootDir: string): string[] {
  return fs
    .readdirSync(path.join(rootDir, 'curriculum'))
    .filter((name) => /^module-\d+-class-period-plan\.md$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => path.join(rootDir, 'curriculum', name));
}

function moduleNumberFromPath(filePath: string): number {
  const match = filePath.match(/module-(\d+)/);
  return match ? Number(match[1]) : 0;
}

function parseObjectives(rootDir: string): number {
  const filePath = path.join(rootDir, 'conductor', 'course-objectives.md');
  return (readText(filePath).match(/^\*\*\d+[a-z]\./gm) ?? []).length;
}

function parseAleksSummaries(rootDir: string) {
  const readmePath = path.join(rootDir, 'curriculum', 'aleks', 'README.md');
  const readme = exists(readmePath) ? readText(readmePath) : '';
  const documented = new Set<number>();
  const exceptionModules = new Set((loadExceptions(rootDir).aleksTopicGaps ?? []).map((item) => item.module));

  for (const line of readme.split(/\r?\n/)) {
    const match = line.match(/^\| Module (\d+) \|/);
    if (!match) continue;
    if (/Documented|Exception|source limitation|Extraction gap/i.test(line)) {
      documented.add(Number(match[1]));
    }
  }

  return fs
    .readdirSync(path.join(rootDir, 'curriculum', 'aleks'))
    .filter((name) => /^module-\d+-.+\.md$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => {
      const moduleNumber = Number(name.match(/^module-(\d+)/)?.[1] ?? 0);
      const content = readText(path.join(rootDir, 'curriculum', 'aleks', name));
      const taggedTopicCount = (content.match(/^- \[ALEKS /gm) ?? []).length;
      const lessonSection = content.split(/^## Lessons\s*$/m)[1] ?? '';
      const visibleTopicCount = (lessonSection.match(/^- .+/gm) ?? []).length;
      const declaredTopics = Number(content.match(/^- Total topics: (\d+)/m)?.[1] ?? 0);
      const listedTopics = taggedTopicCount || visibleTopicCount;
      return {
        module: moduleNumber,
        declaredTopics,
        listedTopics,
        documentedException: documented.has(moduleNumber) || exceptionModules.has(moduleNumber),
      };
    });
}

function loadExceptions(rootDir: string) {
  const filePath = path.join(rootDir, 'curriculum', 'implementation', 'exceptions.json');
  if (!exists(filePath)) return { aleksTopicGaps: [], lessonSourceExceptions: [] };
  return JSON.parse(readText(filePath)) as {
    aleksTopicGaps?: Array<{ module: number }>;
    lessonSourceExceptions?: Array<{ file: string; reason: string }>;
  };
}

function checkLessonSources(rootDir: string, checks: AuditCheck[]) {
  const files = lessonFiles(rootDir);
  const exceptions = loadExceptions(rootDir).lessonSourceExceptions ?? [];
  const exceptionFiles = new Set(exceptions.map((item) => item.file));

  const missingGoals: string[] = [];
  const missingAlignment: string[] = [];
  const badHeadings: Array<{ file: string; line: number; heading: string }> = [];
  const placeholders: Array<{ file: string; line: number; text: string }> = [];
  const truncations: Array<{ file: string; line: number; text: string }> = [];

  for (const file of files) {
    const relative = path.relative(rootDir, file);
    const content = readText(file);
    const lines = content.split(/\r?\n/);
    if (!/^## Today.s Goals?/m.test(content)) missingGoals.push(relative);
    if (!/^## Objective Alignment/m.test(content)) missingAlignment.push(relative);

    lines.forEach((line, index) => {
      if (line.startsWith('# ') && index !== 0) {
        badHeadings.push({ file: relative, line: index + 1, heading: line });
      }
      if (/^## (Step |Steps |Part [A-Z]:|[a-z]\. |Key Concept|Study Tip|Watch Out|Check$)/.test(line)) {
        badHeadings.push({ file: relative, line: index + 1, heading: line });
      }
      if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(line)) && !exceptionFiles.has(relative)) {
        placeholders.push({ file: relative, line: index + 1, text: line.trim() });
      }
      if (TRUNCATION_PATTERNS.some((pattern) => pattern.test(line)) && !exceptionFiles.has(relative)) {
        truncations.push({ file: relative, line: index + 1, text: line.trim() });
      }
    });
  }

  checks.push({
    id: 'lesson-goals',
    status: missingGoals.length === 0 ? 'pass' : 'fail',
    message: missingGoals.length === 0 ? 'All lesson sources include Today’s Goal(s).' : 'Some lesson sources are missing Today’s Goal(s).',
    details: missingGoals,
  });
  checks.push({
    id: 'lesson-objective-alignment',
    status: missingAlignment.length === 0 ? 'pass' : 'fail',
    message: missingAlignment.length === 0 ? 'All lesson sources include Objective Alignment.' : 'Some lesson sources are missing Objective Alignment.',
    details: missingAlignment,
  });
  checks.push({
    id: 'lesson-heading-hierarchy',
    status: badHeadings.length === 0 ? 'pass' : 'fail',
    message: badHeadings.length === 0 ? 'Lesson heading hierarchy is normalized.' : 'Lesson heading hierarchy violations were found.',
    details: badHeadings,
  });
  checks.push({
    id: 'lesson-placeholders',
    status: placeholders.length === 0 ? 'pass' : 'fail',
    message: placeholders.length === 0 ? 'No unresolved online-only placeholders remain.' : 'Unresolved online-only placeholders remain.',
    details: placeholders,
  });
  checks.push({
    id: 'lesson-truncations',
    status: truncations.length === 0 ? 'pass' : 'fail',
    message: truncations.length === 0 ? 'No known truncation patterns remain.' : 'Known truncation patterns remain.',
    details: truncations,
  });
}

function checkImplementationArtifacts(rootDir: string, plannedPeriods: PlannedPeriod[], checks: AuditCheck[]) {
  const implementationDir = path.join(rootDir, 'curriculum', 'implementation');
  const packageDir = path.join(implementationDir, 'class-period-packages');
  const activityMapPath = path.join(implementationDir, 'practice-v1', 'activity-map.json');

  const packages: Array<Record<string, unknown>> = [];
  const packageErrors: string[] = [];

  for (let moduleNumber = 1; moduleNumber <= 9; moduleNumber += 1) {
    const filePath = path.join(packageDir, `module-${moduleNumber}.json`);
    if (!exists(filePath)) {
      packageErrors.push(`Missing ${path.relative(rootDir, filePath)}`);
      continue;
    }

    try {
      const parsed = JSON.parse(readText(filePath)) as { periods?: Array<Record<string, unknown>> };
      if (!Array.isArray(parsed.periods)) {
        packageErrors.push(`${path.relative(rootDir, filePath)} does not contain a periods array`);
        continue;
      }
      packages.push(...parsed.periods);
    } catch (error) {
      packageErrors.push(`${path.relative(rootDir, filePath)} could not be parsed: ${String(error)}`);
    }
  }

  const packageIds = new Set(packages.map((item) => item.periodId));
  const missingPackages = plannedPeriods
    .map((period) => `m${String(period.module).padStart(2, '0')}-p${String(period.period).padStart(2, '0')}`)
    .filter((id) => !packageIds.has(id));
  const invalidInstructionPackages = packages.filter((item) => {
    if (item.dayType !== 'instruction') return false;
    const phases = item.dailyPhases as Record<string, unknown> | undefined;
    return !(
      item.sourceLesson &&
      item.objectiveCode &&
      item.objective &&
      item.workedExamples &&
      phases?.warmUp &&
      phases?.conceptDevelopment &&
      phases?.guidedPractice &&
      phases?.independentPractice &&
      phases?.assessment &&
      phases?.capReflection
    );
  });

  checks.push({
    id: 'class-period-packages',
    status: packageErrors.length === 0 && missingPackages.length === 0 && invalidInstructionPackages.length === 0 ? 'pass' : 'fail',
    message:
      packageErrors.length === 0 && missingPackages.length === 0 && invalidInstructionPackages.length === 0
        ? 'All planned periods have valid class-period package artifacts.'
        : 'Some class-period package artifacts are missing or invalid.',
    details: { packageErrors, missingPackages, invalidInstructionPackages },
  });

  if (!exists(activityMapPath)) {
    checks.push({
      id: 'practice-v1-activity-map',
      status: 'fail',
      message: 'Missing practice.v1 activity map.',
      details: path.relative(rootDir, activityMapPath),
    });
    return { phasePackageCount: packages.length, activityMappingCount: 0 };
  }

  const mapping = JSON.parse(readText(activityMapPath)) as {
    contractVersion?: string;
    activities?: Array<Record<string, unknown>>;
  };
  const activities = Array.isArray(mapping.activities) ? mapping.activities : [];
  const activityPeriodIds = new Set(activities.map((activity) => activity.periodId));
  const missingActivityPeriods = [...packageIds].filter((id) => !activityPeriodIds.has(id));
  const invalidActivities = activities.filter((activity) => {
    return !(
      activity.stableActivityId &&
      activity.sourceReference &&
      typeof activity.componentKey === 'string' &&
      ALLOWED_COMPONENT_KEYS.has(activity.componentKey) &&
      activity.mode &&
      activity.gradingConfig &&
      typeof activity.srsEligible === 'boolean'
    );
  });

  checks.push({
    id: 'practice-v1-activity-map',
    status:
      mapping.contractVersion === 'practice.v1' && missingActivityPeriods.length === 0 && invalidActivities.length === 0
        ? 'pass'
        : 'fail',
    message:
      mapping.contractVersion === 'practice.v1' && missingActivityPeriods.length === 0 && invalidActivities.length === 0
        ? 'All class-period packages have practice.v1 activity mappings.'
        : 'Some practice.v1 mappings are missing or invalid.',
    details: { missingActivityPeriods, invalidActivities },
  });

  return { phasePackageCount: packages.length, activityMappingCount: activities.length };
}

export function runCurriculumAudit(rootDir = process.cwd()): CurriculumAuditReport {
  const checks: AuditCheck[] = [];
  const lessons = lessonFiles(rootDir);
  const moduleOverviews = moduleOverviewFiles(rootDir);
  const objectives = parseObjectives(rootDir);
  const plans = planFiles(rootDir);
  const plannedPeriods = plans.flatMap((file) => parseClassPeriodPlan(readText(file), moduleNumberFromPath(file)));
  const dayCounts = plannedPeriods.reduce<Record<string, number>>((acc, period) => {
    acc[period.dayType] = (acc[period.dayType] ?? 0) + 1;
    return acc;
  }, {});

  checks.push({
    id: 'module-count',
    status: moduleOverviews.length === 9 ? 'pass' : 'fail',
    message: moduleOverviews.length === 9 ? 'Nine module overview files are present.' : 'Module overview file count is incorrect.',
    details: { expected: 9, actual: moduleOverviews.length },
  });
  checks.push({
    id: 'lesson-count',
    status: lessons.length === 52 ? 'pass' : 'fail',
    message: lessons.length === 52 ? 'Fifty-two lesson source files are present.' : 'Lesson source file count is incorrect.',
    details: { expected: 52, actual: lessons.length },
  });
  checks.push({
    id: 'objective-count',
    status: objectives === 105 ? 'pass' : 'fail',
    message: objectives === 105 ? 'One hundred five course objectives are present.' : 'Course objective count is incorrect.',
    details: { expected: 105, actual: objectives },
  });

  const dayCountFailures = Object.entries(EXPECTED_DAY_COUNTS).filter(([dayType, expected]) => dayCounts[dayType] !== expected);
  checks.push({
    id: 'class-period-budget',
    status: dayCountFailures.length === 0 ? 'pass' : 'fail',
    message: dayCountFailures.length === 0 ? 'Class-period budget matches the 180-day planning target.' : 'Class-period budget does not match target.',
    details: { expected: EXPECTED_DAY_COUNTS, actual: dayCounts },
  });

  checkLessonSources(rootDir, checks);

  const aleks = parseAleksSummaries(rootDir);
  const aleksFailures = aleks.filter((item) => item.declaredTopics !== item.listedTopics && !item.documentedException);
  checks.push({
    id: 'aleks-coverage',
    status: aleksFailures.length === 0 ? 'pass' : 'fail',
    message:
      aleksFailures.length === 0
        ? 'ALEKS declared/listed topic mismatches are resolved or explicitly documented.'
        : 'Undocumented ALEKS declared/listed topic mismatches remain.',
    details: aleks,
  });

  const implementationCounts = checkImplementationArtifacts(rootDir, plannedPeriods, checks);

  const report: CurriculumAuditReport = {
    generatedAt: new Date().toISOString(),
    rootDir,
    summary: {
      moduleCount: moduleOverviews.length,
      lessonCount: lessons.length,
      objectiveCount: objectives,
      plannedPeriods: dayCounts,
      aleks,
      phasePackageCount: implementationCounts.phasePackageCount,
      activityMappingCount: implementationCounts.activityMappingCount,
    },
    checks,
    pass: checks.every((check) => check.status !== 'fail'),
  };

  return report;
}
