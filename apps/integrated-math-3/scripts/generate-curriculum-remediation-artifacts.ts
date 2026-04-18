import fs from 'node:fs';
import path from 'node:path';
import { parseAleksPracticeMap, parseClassPeriodPlan } from '../lib/curriculum/audit';

type PracticeMode = 'worked_example' | 'guided_practice' | 'independent_practice' | 'assessment' | 'teaching';

interface PeriodPackage {
  periodId: string;
  module: number;
  period: number;
  dayType: string;
  sourceLesson?: string;
  objectiveCode?: string;
  objective?: string;
  workedExamples?: string;
  embeddedObjectives?: string[];
  aleksSrsPractice?: string[];
  srsSubstitute?: string;
  notes: string;
  dailyPhases?: {
    warmUp: string;
    conceptDevelopment: string;
    guidedPractice: string;
    independentPractice: string;
    assessment: string;
    capReflection: string;
  };
  nonInstructionArtifact?: Record<string, unknown>;
}

interface ActivityMapping {
  stableActivityId: string;
  periodId: string;
  sourceReference: string;
  componentKey: string;
  mode: PracticeMode;
  objectiveCodes: string[];
  props: Record<string, unknown>;
  gradingConfig: {
    autoGrade: boolean;
    partialCredit: boolean;
    passingScore?: number;
    rubric?: Array<{ criteria: string; points: number }>;
  };
  srsEligible: boolean;
}

const rootDir = process.cwd();
const implementationDir = path.join(rootDir, 'curriculum', 'implementation');
const packageDir = path.join(implementationDir, 'class-period-packages');
const practiceDir = path.join(implementationDir, 'practice-v1');

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function writeText(filePath: string, value: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function planPath(module: number): string {
  return path.join(rootDir, 'curriculum', `module-${module}-class-period-plan.md`);
}

function periodId(module: number, period: number): string {
  return `m${String(module).padStart(2, '0')}-p${String(period).padStart(2, '0')}`;
}

function objectiveCode(objective: string): string | undefined {
  return objective.match(/^(\d+[a-z])\./)?.[1];
}

function objectiveText(objective: string): string {
  return objective.replace(/^\d+[a-z]\.\s*/, '').trim();
}

function embeddedObjectives(value: string): string[] {
  if (!value || value === '—') return [];
  return [...value.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function expandAleksReferences(value: string): string[] {
  if (/No direct ALEKS|No additional direct ALEKS/i.test(value)) return [];
  const refs: string[] = [];
  const rangePattern = /ALEKS (M\d+-L\d+-\d+)\.(\d{2})`?\s+through\s+`?ALEKS \1\.(\d{2})/g;
  let cleaned = value;

  for (const match of value.matchAll(rangePattern)) {
    const prefix = match[1];
    const start = Number(match[2]);
    const end = Number(match[3]);
    for (let index = start; index <= end; index += 1) {
      refs.push(`ALEKS ${prefix}.${String(index).padStart(2, '0')}`);
    }
    cleaned = cleaned.replace(match[0], '');
  }

  for (const match of cleaned.matchAll(/ALEKS M\d+-L\d+-\d+\.\d{2}/g)) {
    refs.push(match[0]);
  }

  return [...new Set(refs)];
}

function componentKeyForObjective(objective: string, module: number): string {
  const lower = objective.toLowerCase();
  if (module === 8 || /distribution|sample|probability|z-values|confidence/.test(lower)) return 'statistical-explorer';
  if (module === 9 && /trigonometric|unit circle|sine|cosine|tangent|angle/.test(lower)) return 'unit-circle-trainer';
  if (/graph|analyze|model|transform|asymptote|periodic/.test(lower)) return 'graphing-explorer';
  if (/solve|equation|inequal|factor|simplify|divide|multiply|radical|logarithm|exponential/.test(lower)) {
    return 'step-by-step-solver';
  }
  if (/classify|distinguish|recognize|choose/.test(lower)) return 'drag-drop-categorization';
  return 'comprehension-quiz';
}

function packageForInstruction(period: ReturnType<typeof parseClassPeriodPlan>[number], aleks: string[]): PeriodPackage {
  const code = objectiveCode(period.objective) ?? `m${period.module}p${period.period}`;
  const objective = objectiveText(period.objective);
  const refs = expandAleksReferences(aleks[0] ?? '');
  const hasDirectAleks = refs.length > 0;

  return {
    periodId: periodId(period.module, period.period),
    module: period.module,
    period: period.period,
    dayType: 'instruction',
    sourceLesson: period.sourceLesson,
    objectiveCode: code,
    objective,
    workedExamples: period.workedExamples,
    embeddedObjectives: embeddedObjectives(period.embeddedObjectives),
    aleksSrsPractice: refs,
    srsSubstitute: hasDirectAleks
      ? undefined
      : `Generate worked-example-derived SRS items from ${period.workedExamples}.`,
    notes: period.notes,
    dailyPhases: {
      warmUp: `Activate prior knowledge for ${code} with one retrieval prompt tied to ${period.sourceLesson}.`,
      conceptDevelopment: `Use ${period.workedExamples} to develop: ${objective}.`,
      guidedPractice: `Students complete a scaffolded problem modeled on ${period.workedExamples}; teacher checks notation and reasoning.`,
      independentPractice: hasDirectAleks
        ? `Students complete aligned ALEKS/SRS practice: ${refs.join(', ')}.`
        : `Students complete worked-example-derived SRS practice because no direct ALEKS export is available.`,
      assessment: `Exit ticket: one fresh problem assessing ${code} and one short explanation prompt.`,
      capReflection: `CAP reflection: Name the strategy that helped you persist with ${objective.toLowerCase()}.`,
    },
  };
}

function packageForNonInstruction(period: ReturnType<typeof parseClassPeriodPlan>[number]): PeriodPackage {
  const id = periodId(period.module, period.period);
  const base = {
    periodId: id,
    module: period.module,
    period: period.period,
    dayType: period.dayType,
    notes: period.notes,
  };

  if (period.dayType === 'mastery') {
    return {
      ...base,
      nonInstructionArtifact: {
        artifactType: 'mastery',
        objectiveScope: period.notes,
        srsSources: ['worked-example-derived practice', 'ALEKS topic practice where available', 'prior-unit spiral review'],
        remediationGrouping: 'Group students by recent objective evidence and misconception patterns.',
        extensionOptions: 'Offer synthesis problems that combine current objectives with prior modules.',
        evidence: 'Student completes due SRS items and submits one corrected-error reflection.',
      },
    };
  }

  if (period.dayType === 'jigsaw') {
    return {
      ...base,
      nonInstructionArtifact: {
        artifactType: 'jigsaw',
        groupTask: period.notes,
        sourceWorkedExamples: 'Use the prior instruction periods named in the notes as the problem bank.',
        deliverable: 'Group solution poster or shared explanation with one strategy comparison.',
        facilitationNotes: 'Assign roles for graphing, algebra, checking, and explanation.',
        completionCriteria: 'Correct method, accurate result, clear justification, and response to peer question.',
      },
    };
  }

  if (period.dayType === 'review') {
    return {
      ...base,
      nonInstructionArtifact: {
        artifactType: 'review',
        objectiveCoverage: period.notes,
        reviewActivities: ['mixed retrieval set', 'misconception sort', 'student-selected retry set'],
        misconceptionTargets: 'Use recent mastery and SRS evidence to select the highest-frequency errors.',
        readinessCheck: 'Short diagnostic covering representative module objectives.',
      },
    };
  }

  return {
    ...base,
    nonInstructionArtifact: {
      artifactType: 'test',
      objectiveCoverage: period.notes,
      assessmentStructure: ['fluency section', 'conceptual reasoning section', 'modeling/application section'],
      gradingExpectations: 'Grade against module objectives and record evidence for mastery updates.',
      retakeRelationship: 'Retake eligibility follows the course mastery policy after targeted remediation.',
    },
  };
}

function activityForPackage(pkg: PeriodPackage, suffix: string, mode: PracticeMode, componentKey: string): ActivityMapping {
  const objectiveCodes = pkg.objectiveCode ? [pkg.objectiveCode, ...(pkg.embeddedObjectives ?? [])] : [];
  return {
    stableActivityId: `${pkg.periodId}-${suffix}`,
    periodId: pkg.periodId,
    sourceReference: pkg.sourceLesson
      ? `${pkg.sourceLesson}: ${pkg.workedExamples ?? pkg.objective ?? pkg.notes}`
      : `${pkg.dayType}: ${pkg.notes}`,
    componentKey,
    mode,
    objectiveCodes,
    props: {
      title: `${pkg.periodId} ${suffix.replace(/-/g, ' ')}`,
      prompt: pkg.objective ?? pkg.notes,
      sourceLesson: pkg.sourceLesson ?? null,
      workedExamples: pkg.workedExamples ?? null,
    },
    gradingConfig: {
      autoGrade: componentKey !== 'tiered-assessment',
      partialCredit: true,
      passingScore: mode === 'assessment' ? 80 : undefined,
    },
    srsEligible: mode !== 'worked_example' && pkg.dayType !== 'test',
  };
}

function activitiesForPackage(pkg: PeriodPackage): ActivityMapping[] {
  if (pkg.dayType !== 'instruction') {
    const key = pkg.dayType === 'test' ? 'tiered-assessment' : 'comprehension-quiz';
    const mode: PracticeMode = pkg.dayType === 'test' ? 'assessment' : 'independent_practice';
    return [activityForPackage(pkg, pkg.dayType, mode, key)];
  }

  const primaryComponent = componentKeyForObjective(pkg.objective ?? '', pkg.module);
  const activities: ActivityMapping[] = [
    activityForPackage(pkg, 'worked-example-set', 'worked_example', primaryComponent),
    activityForPackage(pkg, 'guided-practice', 'guided_practice', primaryComponent),
    activityForPackage(pkg, 'independent-practice', 'independent_practice', primaryComponent),
    activityForPackage(pkg, 'exit-ticket', 'assessment', 'comprehension-quiz'),
  ];

  if ((pkg.aleksSrsPractice ?? []).length > 0) {
    for (const ref of pkg.aleksSrsPractice ?? []) {
      activities.push({
        ...activityForPackage(pkg, `srs-${slugify(ref)}`, 'independent_practice', 'comprehension-quiz'),
        sourceReference: ref,
        props: {
          title: ref,
          prompt: `Complete ALEKS-aligned SRS practice for ${pkg.objectiveCode}.`,
          aleksTopicId: ref,
        },
        srsEligible: true,
      });
    }
  } else {
    activities.push({
      ...activityForPackage(pkg, 'worked-example-derived-srs', 'independent_practice', primaryComponent),
      sourceReference: pkg.srsSubstitute ?? pkg.workedExamples ?? pkg.periodId,
      srsEligible: true,
    });
  }

  return activities;
}

function generatePackages() {
  const allPackages: PeriodPackage[] = [];

  for (let moduleNumber = 1; moduleNumber <= 9; moduleNumber += 1) {
    const plan = readText(planPath(moduleNumber));
    const periods = parseClassPeriodPlan(plan, moduleNumber);
    const aleksRows = new Map(parseAleksPracticeMap(plan, moduleNumber).map((row) => [row.period, row]));
    const packages = periods.map((period) => {
      const row = aleksRows.get(period.period);
      if (period.dayType === 'instruction') {
        return packageForInstruction(period, row ? [row.topics] : []);
      }
      return packageForNonInstruction(period);
    });

    allPackages.push(...packages);
    writeJson(path.join(packageDir, `module-${moduleNumber}.json`), {
      schemaVersion: 'class-period-package.v1',
      module: moduleNumber,
      generatedFrom: `curriculum/module-${moduleNumber}-class-period-plan.md`,
      periods: packages,
    });
  }

  return allPackages;
}

function generateExceptions() {
  writeJson(path.join(implementationDir, 'exceptions.json'), {
    schemaVersion: 'curriculum-exceptions.v1',
    aleksTopicGaps: [
      { module: 2, declaredTopics: 23, listedTopics: 13, reason: 'Source HTML exposes only 13 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS for uncovered periods.' },
      { module: 3, declaredTopics: 30, listedTopics: 4, reason: 'Source HTML exposes only 4 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS for uncovered polynomial-equation objectives.' },
      { module: 4, declaredTopics: 92, listedTopics: 88, reason: 'Source HTML exposes 88 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS only where no direct topic aligns.' },
      { module: 5, declaredTopics: 59, listedTopics: 43, reason: 'Source HTML exposes 43 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS for exponential inequalities and series gaps.' },
      { module: 6, declaredTopics: 29, listedTopics: 21, reason: 'Source HTML exposes 21 rendered topic rows and includes Module 5 carryover groups.', replacementPlan: 'Use worked-example-derived SRS for natural-log notation and decay contexts.' },
      { module: 7, declaredTopics: 86, listedTopics: 82, reason: 'Source HTML exposes 82 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS for reciprocal graphing gaps.' },
      { module: 9, declaredTopics: 45, listedTopics: 31, reason: 'Source HTML exposes 31 rendered topic rows for this module export.', replacementPlan: 'Use worked-example-derived SRS for translation and inverse-trig gaps.' },
    ],
    lessonSourceExceptions: [],
  });
}

function generateReadme() {
  writeText(
    path.join(implementationDir, 'README.md'),
    [
      '# Curriculum Implementation Artifacts',
      '',
      'This directory contains generated planning artifacts that bridge the source curriculum to app implementation.',
      '',
      '## Files',
      '',
      '- `class-period-packages/module-*.json`: one package for each planned class period.',
      '- `practice-v1/activity-map.json`: activity candidates mapped to the `practice.v1` contract.',
      '- `exceptions.json`: explicit source limitations and replacement plans.',
      '- `audit/latest.json`: latest machine-readable curriculum audit report.',
      '',
      '## Class-Period Package Schema',
      '',
      'Instruction packages include `periodId`, `module`, `period`, `dayType`, `sourceLesson`, `objectiveCode`, `objective`, `workedExamples`, `aleksSrsPractice` or `srsSubstitute`, and six daily phases: `warmUp`, `conceptDevelopment`, `guidedPractice`, `independentPractice`, `assessment`, and `capReflection`.',
      '',
      'Non-instruction packages include a `nonInstructionArtifact` object for `mastery`, `jigsaw`, `review`, or `test` day work.',
      '',
      '## Validation',
      '',
      'Run:',
      '',
      '```bash',
      'npm run curriculum:audit',
      '```',
      '',
      'The audit verifies curriculum counts, lesson source quality, ALEKS coverage documentation, package coverage, and `practice.v1` mapping coverage.',
      '',
    ].join('\n'),
  );
}

const packages = generatePackages();
const activities = packages.flatMap(activitiesForPackage);

writeJson(path.join(practiceDir, 'activity-map.json'), {
  contractVersion: 'practice.v1',
  schemaVersion: 'curriculum-activity-map.v1',
  generatedFrom: [
    'curriculum/module-*-class-period-plan.md',
    'curriculum/aleks/module-*.md',
    'conductor/practice-component-contract.md',
  ],
  activities,
  proposedComponentKeyGaps: [
    {
      componentKey: 'statistical-explorer',
      reason: 'Needed for Module 8 distribution, z-score, simulation, and confidence interval practice.',
    },
    {
      componentKey: 'unit-circle-trainer',
      reason: 'Needed for Module 9 unit-circle, exact-value, and trigonometric graph practice.',
    },
    {
      componentKey: 'function-analyzer',
      reason: 'Needed for cross-module graph-feature analysis beyond coordinate plotting.',
    },
  ],
});

generateExceptions();
generateReadme();

console.log(`Generated ${packages.length} class-period packages.`);
console.log(`Generated ${activities.length} practice.v1 activity mappings.`);
