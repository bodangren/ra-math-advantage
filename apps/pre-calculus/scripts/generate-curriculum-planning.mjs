import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const curriculumRoot = path.join(appRoot, 'curriculum');
const topicIndexPath = path.join(curriculumRoot, 'source/college-board/ced-topic-index.json');
const topicIndex = JSON.parse(fs.readFileSync(topicIndexPath, 'utf8'));

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function write(relativePath, content) {
  const fullPath = path.join(curriculumRoot, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content.trim()}\n`);
}

function slugTopic(topicId) {
  return topicId;
}

function topicFileName(unitNumber, topicId) {
  return `topics/unit-${unitNumber}-topic-${slugTopic(topicId)}.md`;
}

function passwaterSource(unit) {
  return unit.unit <= 3 ? `source/passwater/unit-${unit.unit}.md` : null;
}

function learningObjectiveFamily(topicId) {
  return `${topicId}.A`;
}

function essentialKnowledgeFamily(topicId) {
  return `${topicId}.A.*`;
}

function unitSummary(unit) {
  const localSource = passwaterSource(unit);
  return `
# Unit ${unit.unit}: ${unit.title}

## CED Competency Role

- AP Exam status: \`${unit.examStatus}\`
- Multiple-choice weighting: \`${unit.examWeighting}\`
- Suggested pacing: \`${unit.pacing}\`
- Topic count: ${unit.topics.length}
- CED topic source: \`source/college-board/ced-topic-index.json\`
- CED errata source: \`source/college-board/clarification-guidance.md\`
- ${localSource ? `Passwater source: \`${localSource}\`` : 'Local Passwater source: not available'}

## Planning Role

The CED topic identity is the canonical competency key. The Passwater source, when available, supplies the instructional path: topic introduction, scaffolding, guided practice, independent practice shape, pacing cues, and local quiz/test evidence.

## Topics

| Topic | Title | Topic source |
|-------|-------|--------------|
${unit.topics.map((topic) => `| ${topic.id} | ${topic.title} | \`${topicFileName(unit.unit, topic.id)}\` |`).join('\n')}

## Source Notes

${localSource
  ? '- This unit has local Passwater evidence and can receive source-backed class-period planning.'
  : '- This unit is CED-defined, locally unsourced, and not AP-exam-assessed. Do not create Passwater-derived class-period packages until a local source exists.'}
`;
}

function topicSource(unit, topic) {
  const localSource = passwaterSource(unit);
  return `
# Topic ${topic.id}: ${topic.title}

## CED Identity

- Unit: ${unit.unit}
- Unit title: ${unit.title}
- AP Exam status: \`${unit.examStatus}\`
- CED topic ID: \`${topic.id}\`
- Learning-objective family: \`${learningObjectiveFamily(topic.id)}\`
- Essential-knowledge family: \`${essentialKnowledgeFamily(topic.id)}\`
- Mathematical practices: \`1.A\`, \`1.B\`, \`1.C\`, \`2.A\`, \`2.B\`, \`3.A\`, \`3.B\`, \`3.C\`

## Source References

- CED topic index: \`source/college-board/ced-topic-index.json\`
- CED errata: \`source/college-board/clarification-guidance.md\`
- ${localSource ? `Passwater instructional source: \`${localSource}\`` : 'Passwater instructional source: not available'}

## Instructional Planning Notes

${localSource
  ? 'Use the Passwater source for topic introduction, scaffolding, guided practice, independent AP-style practice, and local assessment shape. Tag all evidence back to this CED topic ID.'
  : 'Unit 4 topic. Preserve CED identity and competency metadata, but mark instructional implementation as locally unsourced until a Unit 4 local source is provided.'}

## Detail Status

Full CED learning-objective and essential-knowledge text is deferred to the next normalization pass. This file preserves the stable objective/EK family keys so standards seeding and class-period planning can reference the topic without inventing alternate identifiers.
`;
}

function instructionRow(period, topic, unit) {
  const localSource = passwaterSource(unit);
  return [
    period,
    '`instruction`',
    `\`${topic.id}\` ${topic.title}`,
    localSource ? `\`${localSource}\`` : '-',
    `\`${learningObjectiveFamily(topic.id)}\` / \`${essentialKnowledgeFamily(topic.id)}\``,
    'Passwater notes and scaffolded examples',
    'Passwater worksheet or AP-style independent practice aligned to CED topic',
    'Source-backed topic instruction',
  ];
}

function nonInstructionRow(period, dayType, unit, note) {
  return [
    period,
    `\`${dayType}\``,
    '-',
    `\`source/passwater/unit-${unit.unit}.md\``,
    `Unit ${unit.unit} competency evidence`,
    note,
    'Mixed AP topic practice and written reasoning',
    `${dayType} day generated from source-backed unit planning`,
  ];
}

function row(cells) {
  return `| ${cells.join(' | ')} |`;
}

function classPeriodPlan(unit) {
  const rows = [];
  let period = 1;

  for (const topic of unit.topics) {
    rows.push(instructionRow(period, topic, unit));
    period += 1;
  }

  rows.push(nonInstructionRow(period, 'ap_task_model', unit, 'FRQ model transfer day using CED task models and Passwater independent-practice shapes.'));
  period += 1;
  rows.push(nonInstructionRow(period, 'review', unit, 'Unit review across CED topics and Passwater review materials.'));
  period += 1;
  rows.push(nonInstructionRow(period, 'test', unit, 'Local unit assessment aligned to CED competencies and Passwater test/review evidence.'));

  return `
# Unit ${unit.unit} Class-Period Plan

This is the conservative source-backed class-period plan for AP Precalculus Unit ${unit.unit}.

## Planning Source Hierarchy

1. CED topic and competency identity from \`source/college-board/ced-topic-index.json\`.
2. CED clarification/guidance errata from \`source/college-board/clarification-guidance.md\`.
3. Passwater local instructional evidence from \`source/passwater/unit-${unit.unit}.md\`.

## Budget

| Day Type | Count |
|----------|------:|
| \`instruction\` | ${unit.topics.length} |
| \`ap_task_model\` | 1 |
| \`review\` | 1 |
| \`test\` | 1 |
| **Total** | **${rows.length}** |

## Period-by-Period Plan

| Period | Day Type | CED Topic | Passwater Source | Competency Target | Instructional Evidence | Independent Practice Shape | Notes |
|--------|----------|-----------|------------------|-------------------|------------------------|----------------------------|-------|
${rows.map(row).join('\n')}
`;
}

for (const unit of topicIndex.units) {
  write(`units/unit-${unit.unit}.md`, unitSummary(unit));

  for (const topic of unit.topics) {
    write(topicFileName(unit.unit, topic.id), topicSource(unit, topic));
  }

  if (unit.unit <= 3) {
    write(`unit-${unit.unit}-class-period-plan.md`, classPeriodPlan(unit));
  }
}
