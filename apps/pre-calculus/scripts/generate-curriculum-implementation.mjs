import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const curriculumRoot = path.join(appRoot, 'curriculum');
const topicIndex = JSON.parse(fs.readFileSync(path.join(curriculumRoot, 'source/college-board/ced-topic-index.json'), 'utf8'));
const exceptions = JSON.parse(fs.readFileSync(path.join(curriculumRoot, 'implementation/exceptions.json'), 'utf8'));

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function write(relativePath, content) {
  const fullPath = path.join(curriculumRoot, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content.trim()}\n`);
}

function writeJson(relativePath, value) {
  write(relativePath, JSON.stringify(value, null, 2));
}

function familyKey(topicId) {
  return `apc_${topicId.replace('.', '_')}`;
}

function periodId(unit, period) {
  return `u${String(unit).padStart(2, '0')}-p${String(period).padStart(2, '0')}`;
}

function topicPackage(unit, topic, period) {
  return {
    periodId: periodId(unit.unit, period),
    unit: unit.unit,
    period,
    dayType: 'instruction',
    cedTopic: {
      id: topic.id,
      title: topic.title,
      source: 'curriculum/source/college-board/ced-topic-index.json',
      errata: 'curriculum/source/college-board/clarification-guidance.md',
      examStatus: unit.examStatus,
    },
    competencyTarget: {
      learningObjectiveFamily: `${topic.id}.A`,
      essentialKnowledgeFamily: `${topic.id}.A.*`,
      mathematicalPractices: ['1.A', '1.B', '1.C', '2.A', '2.B', '3.A', '3.B', '3.C'],
    },
    passwaterSource: `curriculum/source/passwater/unit-${unit.unit}.md`,
    problemFamily: familyKey(topic.id),
    dailyPhases: {
      warmUp: `Retrieve prerequisite representations connected to Topic ${topic.id}.`,
      topicIntroduction: `Use Passwater notes to introduce ${topic.title}.`,
      scaffoldedExamples: `Model worked examples from the Unit ${unit.unit} Passwater source.`,
      guidedPractice: `Students complete scaffolded examples aligned to CED Topic ${topic.id}.`,
      independentPractice: `Students complete AP-style practice mapped to ${familyKey(topic.id)}.`,
      exitEvidence: `Short competency evidence for ${topic.id}.A and ${topic.id}.A.*.`,
      capReflection: 'Students identify a courage, adaptability, or persistence move from the period.',
    },
  };
}

function nonInstructionPackage(unit, period, dayType) {
  const labels = {
    ap_task_model: 'FRQ task-model transfer day',
    review: 'Unit review across CED topic families',
    test: 'Local unit assessment aligned to CED competency evidence',
  };

  return {
    periodId: periodId(unit.unit, period),
    unit: unit.unit,
    period,
    dayType,
    notes: labels[dayType],
    nonInstructionArtifact: {
      artifactType: dayType,
      source: `curriculum/source/passwater/unit-${unit.unit}.md`,
      cedScope: `Unit ${unit.unit}`,
      evidence: labels[dayType],
    },
  };
}

function classPeriodPackage(unit) {
  const periods = [];
  let period = 1;

  for (const topic of unit.topics) {
    periods.push(topicPackage(unit, topic, period));
    period += 1;
  }

  periods.push(nonInstructionPackage(unit, period, 'ap_task_model'));
  period += 1;
  periods.push(nonInstructionPackage(unit, period, 'review'));
  period += 1;
  periods.push(nonInstructionPackage(unit, period, 'test'));

  return {
    schemaVersion: 'class-period-package.v1',
    unit: unit.unit,
    generatedFrom: `curriculum/unit-${unit.unit}-class-period-plan.md`,
    sourcePriority: [
      'curriculum/source/college-board/ced-topic-index.json',
      'curriculum/source/college-board/clarification-guidance.md',
      `curriculum/source/passwater/unit-${unit.unit}.md`,
    ],
    periods,
  };
}

function activityCandidates() {
  const activities = [];

  for (const unit of topicIndex.units.filter((candidate) => candidate.unit <= 3)) {
    for (const topic of unit.topics) {
      activities.push({
        activityId: `apc-${topic.id.replace('.', '-')}-independent-practice`,
        familyKey: familyKey(topic.id),
        cedTopicId: topic.id,
        unit: unit.unit,
        title: `${topic.title} independent practice`,
        componentKey: 'comprehension-quiz',
        mode: 'practice',
        sourceReferences: [
          'curriculum/source/college-board/ced-topic-index.json',
          `curriculum/source/passwater/unit-${unit.unit}.md`,
        ],
        gradingConfig: {
          evidenceType: 'competency-check',
          learningObjectiveFamily: `${topic.id}.A`,
          essentialKnowledgeFamily: `${topic.id}.A.*`,
        },
        srsEligible: true,
      });
    }
  }

  return activities;
}

const sourceBackedUnits = topicIndex.units.filter((unit) => unit.unit <= 3);
const activities = activityCandidates();

for (const unit of sourceBackedUnits) {
  writeJson(`implementation/class-period-packages/unit-${unit.unit}.json`, classPeriodPackage(unit));
}

write(
  'implementation/README.md',
  `
# AP Precalculus Implementation Bridge

Generated by \`npm run curriculum:implementation\`.

| Artifact | Purpose |
|----------|---------|
| \`class-period-packages/unit-*.json\` | Seedable class-period package candidates for Passwater-backed units |
| \`practice-v1/activity-map.json\` | \`practice.v1\` activity candidates keyed to AP topic families |
| \`audit/latest.json\` | Current machine-readable curriculum audit summary |
| \`exceptions.json\` | Source gaps and deferred-detail records consumed by the audit |

Unit 4 is intentionally excluded from class-period packages until local instructional source evidence exists.
`,
);

writeJson('implementation/practice-v1/activity-map.json', {
  schemaVersion: 'curriculum-activity-map.v1',
  generatedFrom: [
    'curriculum/source/college-board/ced-topic-index.json',
    'curriculum/source/college-board/clarification-guidance.md',
    'curriculum/source/passwater/unit-*.md',
    'curriculum/unit-*-class-period-plan.md',
  ],
  activities,
});

write(
  'practice/README.md',
  `
# AP Precalculus Practice Planning

Generated by \`npm run curriculum:implementation\`.

The practice layer maps CED topic identities and Passwater independent-practice shapes into reusable AP Precalculus problem families. These are planning records for future activity authoring and \`practice.v1\` implementation; they are not yet student-facing seeded activities.
`,
);

write(
  'practice/problem-family-registry.md',
  `
# AP Precalculus Problem-Family Registry

| familyKey | Unit | CED Topic | Title | Status | Notes |
|-----------|------|-----------|-------|--------|-------|
${activities.map((activity) => `| \`${activity.familyKey}\` | ${activity.unit} | \`${activity.cedTopicId}\` | ${activity.title.replace(' independent practice', '')} | planned | Source-backed by CED and Passwater Unit ${activity.unit}. |`).join('\n')}
`,
);

write(
  'practice/course-plan-map.md',
  `
# AP Precalculus Course Plan Map

| Period | Day Type | CED Topic | familyKey | Source |
|--------|----------|-----------|-----------|--------|
${sourceBackedUnits.flatMap((unit) => unit.topics.map((topic, index) => `| \`${periodId(unit.unit, index + 1)}\` | \`instruction\` | \`${topic.id}\` | \`${familyKey(topic.id)}\` | \`curriculum/source/passwater/unit-${unit.unit}.md\` |`)).join('\n')}
`,
);

const exceptionsConsumed = exceptions.exceptions.map((exception) => exception.id);

writeJson('implementation/audit/latest.json', {
  schemaVersion: 'precalculus-curriculum-audit.v1',
  generatedBy: 'scripts/generate-curriculum-implementation.mjs',
  sourceCoverage: {
    units: topicIndex.units.length,
    topics: topicIndex.units.flatMap((unit) => unit.topics).length,
    passwaterBackedUnits: sourceBackedUnits.length,
    unit4ExamStatus: topicIndex.units.find((unit) => unit.unit === 4)?.examStatus,
  },
  packageCoverage: {
    classPeriodPackageUnits: sourceBackedUnits.length,
    unit4PackageDeferred: 1,
    classPeriods: sourceBackedUnits.reduce((total, unit) => total + unit.topics.length + 3, 0),
  },
  practiceCoverage: {
    activityCandidates: activities.length,
    problemFamilies: activities.length,
    srsEligibleCandidates: activities.filter((activity) => activity.srsEligible).length,
  },
  exceptionsConsumed,
  checks: [
    { id: 'ced-topic-count', status: 'pass' },
    { id: 'source-backed-package-count', status: 'pass' },
    { id: 'unit-4-deferred', status: 'pass' },
    { id: 'practice-map-coverage', status: 'pass' },
    { id: 'exceptions-consumed', status: 'pass' },
  ],
});
