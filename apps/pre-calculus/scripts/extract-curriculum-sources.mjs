import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curriculumRoot = path.join(appRoot, "curriculum");
const sourceRoot = path.join(curriculumRoot, "source");

const cedUrl =
  "https://apcentral.collegeboard.org/media/pdf/ap-precalculus-course-and-exam-description.pdf";
const clarificationUrl =
  "https://apcentral.collegeboard.org/media/pdf/ap-precalculus-ced-clarification-and-guidance.pdf";

const sources = {
  ced: path.join(sourceRoot, "originals/ap-precalculus-course-and-exam-description.pdf"),
  clarification: path.join(
    sourceRoot,
    "originals/ap-precalculus-ced-clarification-and-guidance.pdf",
  ),
};

const units = [
  {
    unit: 1,
    title: "Polynomial and Rational Functions",
    examStatus: "assessed-on-ap-exam",
    examWeighting: "30-40%",
    pacing: "6-8 weeks",
    topics: [
      ["1.1", "Change in Tandem"],
      ["1.2", "Rates of Change"],
      ["1.3", "Rates of Change in Linear and Quadratic Functions"],
      ["1.4", "Polynomial Functions and Rates of Change"],
      ["1.5", "Polynomial Functions and Complex Zeros"],
      ["1.6", "Polynomial Functions and End Behavior"],
      ["1.7", "Rational Functions and End Behavior"],
      ["1.8", "Rational Functions and Zeros"],
      ["1.9", "Rational Functions and Vertical Asymptotes"],
      ["1.10", "Rational Functions and Holes"],
      ["1.11", "Equivalent Representations of Polynomial and Rational Expressions"],
      ["1.12", "Transformations of Functions"],
      ["1.13", "Function Model Selection and Assumption Articulation"],
      ["1.14", "Function Model Construction and Application"],
    ],
  },
  {
    unit: 2,
    title: "Exponential and Logarithmic Functions",
    examStatus: "assessed-on-ap-exam",
    examWeighting: "27-40%",
    pacing: "6-9 weeks",
    topics: [
      ["2.1", "Change in Arithmetic and Geometric Sequences"],
      ["2.2", "Change in Linear and Exponential Functions"],
      ["2.3", "Exponential Functions"],
      ["2.4", "Exponential Function Manipulation"],
      ["2.5", "Exponential Function Context and Data Modeling"],
      ["2.6", "Competing Function Model Validation"],
      ["2.7", "Function Composition"],
      ["2.8", "Inverse Functions"],
      ["2.9", "Logarithmic Expressions"],
      ["2.10", "Inverses of Exponential Functions"],
      ["2.11", "Logarithmic Functions"],
      ["2.12", "Logarithmic Function Manipulation"],
      ["2.13", "Exponential and Logarithmic Equations and Inequalities"],
      ["2.14", "Logarithmic Function Context and Data Modeling"],
      ["2.15", "Semi-log Plots"],
    ],
  },
  {
    unit: 3,
    title: "Trigonometric and Polar Functions",
    examStatus: "assessed-on-ap-exam",
    examWeighting: "30-35%",
    pacing: "7-10 weeks",
    topics: [
      ["3.1", "Periodic Phenomena"],
      ["3.2", "Sine, Cosine, and Tangent"],
      ["3.3", "Sine and Cosine Function Values"],
      ["3.4", "Sine and Cosine Function Graphs"],
      ["3.5", "Sinusoidal Functions"],
      ["3.6", "Sinusoidal Function Transformations"],
      ["3.7", "Sinusoidal Function Context and Data Modeling"],
      ["3.8", "The Tangent Function"],
      ["3.9", "Inverse Trigonometric Functions"],
      ["3.10", "Trigonometric Equations and Inequalities"],
      ["3.11", "The Secant, Cosecant, and Cotangent Functions"],
      ["3.12", "Equivalent Representations of Trigonometric Functions"],
      ["3.13", "Trigonometry and Polar Coordinates"],
      ["3.14", "Polar Function Graphs"],
      ["3.15", "Rates of Change in Polar Functions"],
    ],
  },
  {
    unit: 4,
    title: "Functions Involving Parameters, Vectors, and Matrices",
    examStatus: "not-assessed-on-ap-exam",
    examWeighting: "0%",
    pacing: "7 weeks",
    topics: [
      ["4.1", "Parametric Functions"],
      ["4.2", "Parametric Functions Modeling Planar Motion"],
      ["4.3", "Parametric Functions and Rates of Change"],
      ["4.4", "Parametrically Defined Circles and Lines"],
      ["4.5", "Implicitly Defined Functions"],
      ["4.6", "Conic Sections"],
      ["4.7", "Parametrization of Implicitly Defined Functions"],
      ["4.8", "Vectors"],
      ["4.9", "Vector-Valued Functions"],
      ["4.10", "Matrices"],
      ["4.11", "The Inverse and Determinant of a Matrix"],
      ["4.12", "Linear Transformations and Matrices"],
      ["4.13", "Matrices as Functions"],
      ["4.14", "Matrices Modeling Contexts"],
    ],
  },
];

const mathematicalPractices = [
  {
    id: "practice-1",
    name: "Procedural and Symbolic Fluency",
    skills: ["1.A", "1.B", "1.C"],
  },
  {
    id: "practice-2",
    name: "Multiple Representations",
    skills: ["2.A", "2.B"],
  },
  {
    id: "practice-3",
    name: "Communication and Reasoning",
    skills: ["3.A", "3.B", "3.C"],
  },
];

const freeResponseModels = [
  {
    id: "frq-1",
    taskModel: "Function Concepts",
    calculator: "graphing-calculator-required",
    unitFocus: "Units 1-2",
  },
  {
    id: "frq-2",
    taskModel: "Modeling a Non-Periodic Context",
    calculator: "graphing-calculator-required",
    unitFocus: "Units 1-2",
  },
  {
    id: "frq-3",
    taskModel: "Modeling a Periodic Context",
    calculator: "graphing-calculator-not-allowed",
    unitFocus: "Unit 3",
  },
  {
    id: "frq-4",
    taskModel: "Symbolic Manipulations",
    calculator: "graphing-calculator-not-allowed",
    unitFocus: "Units 2-3",
  },
];

const passwaterUnits = [
  {
    unit: 1,
    fileName: "APPC  Unit 1 Passwater.pdf",
    title: "Polynomial and Rational Functions",
    topics: units[0].topics,
    evidence: [
      "Unit guide table lists notes, worksheet blanks/keys, review blocks, quizzes/tests, and Unit 1 test.",
      "Pacing guide reports Unit 1 as 24-34 recommended days and 34 days used in the 2024-2025 reference.",
      "Local evidence includes explicit review/test breaks at 1.1-1.3, 1.1-1.6, 1.7-1.11, and final Unit 1 test.",
    ],
  },
  {
    unit: 2,
    fileName: "APPC  Unit 2 Passwater.pdf",
    title: "Exponential and Logarithmic Functions",
    topics: units[1].topics,
    evidence: [
      "Extracted text starts with Topic 2.1 notes on arithmetic and geometric sequences.",
      "Notes pages include vocabulary blanks, worked examples, and guided examples that scaffold from sequence definitions into linear/exponential comparison.",
      "Local extraction does not expose a complete first-page unit guide table, so later planning should use topic notes and CED topic sequence together.",
    ],
  },
  {
    unit: 3,
    fileName: "APPC  Unit 3 Passwater.pdf",
    title: "Trigonometric and Polar Functions",
    topics: units[2].topics,
    evidence: [
      "Unit guide table lists notes, worksheet blanks/keys, topic quizzes, reviews, and Unit 3 assessment flow.",
      "The source combines Topics 3.4-3.5 for graphing and sinusoidal functions, matching a multi-topic instructional block.",
      "Polar topics 3.13-3.15 appear as the final local sequence before implementation planning.",
    ],
  },
];

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function writeFile(relativePath, content) {
  const fullPath = path.join(curriculumRoot, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content.trim()}\n`);
}

function pdfInfo(pdfPath) {
  const output = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  const pages = Number(output.match(/^Pages:\s+(\d+)/m)?.[1]);
  const title = output.match(/^Title:\s+(.+)$/m)?.[1]?.trim() ?? path.basename(pdfPath);
  return { pages, title };
}

function pdfText(pdfPath, pages = ["-f", "1", "-l", "3"]) {
  return execFileSync("pdftotext", ["-layout", ...pages, pdfPath, "-"], { encoding: "utf8" });
}

function assertContains(text, pattern, label) {
  if (!text.includes(pattern)) {
    throw new Error(`${label} missing expected text: ${pattern}`);
  }
}

function tableOfTopics(unit) {
  return unit.topics.map(([id, title]) => `| ${id} | ${title} |`).join("\n");
}

function generateCedMarkdown(cedInfo) {
  return `
# College Board AP Precalculus CED Source Artifact

Source PDF: \`source/originals/ap-precalculus-course-and-exam-description.pdf\`
Source URL: ${cedUrl}
Title: ${cedInfo.title}
Pages: ${cedInfo.pages}
Normalized by: \`scripts/extract-curriculum-sources.mjs\`

## Role

This artifact is the official curriculum backbone for AP Precalculus competencies, AP topics, mathematical practices, calculator expectations, exam weighting, and FRQ models.

Units 1, 2, and 3 topics are included on the AP Exam. Unit 4 topics are at the discretion of the school and teacher, based on state and local requirements.

## Exam Weighting

| Unit | Title | AP Exam status | Multiple-choice weighting |
|------|-------|----------------|---------------------------|
${units.map((unit) => `| ${unit.unit} | ${unit.title} | ${unit.examStatus} | ${unit.examWeighting} |`).join("\n")}

## Mathematical Practices

| Practice | Name | Skills |
|----------|------|--------|
${mathematicalPractices.map((practice) => `| ${practice.id} | ${practice.name} | ${practice.skills.join(", ")} |`).join("\n")}

## FRQ Models

| FRQ | Task model | Calculator | Unit focus |
|-----|------------|------------|------------|
${freeResponseModels.map((model) => `| ${model.id} | Question ${model.id.slice(-1)}: ${model.taskModel} | ${model.calculator} | ${model.unitFocus} |`).join("\n")}

## Topic Index

${units.map((unit) => `### Unit ${unit.unit}: ${unit.title}\n\n| Topic | Title |\n|-------|-------|\n${tableOfTopics(unit)}`).join("\n\n")}
`;
}

function generateCedTopicIndex(cedInfo) {
  return {
    schemaVersion: "ap-precalculus-ced-topic-index.v1",
    generatedBy: "scripts/extract-curriculum-sources.mjs",
    source: {
      title: cedInfo.title,
      url: cedUrl,
      localPdf: "source/originals/ap-precalculus-course-and-exam-description.pdf",
      pages: cedInfo.pages,
    },
    units: units.map((unit) => ({
      unit: unit.unit,
      title: unit.title,
      examStatus: unit.examStatus,
      examWeighting: unit.examWeighting,
      pacing: unit.pacing,
      topics: unit.topics.map(([id, title]) => ({ id, title })),
    })),
    mathematicalPractices,
    freeResponseModels,
  };
}

function generateClarificationMarkdown(info) {
  return `
# College Board AP Precalculus CED Clarification and Guidance

Source PDF: \`source/originals/ap-precalculus-ced-clarification-and-guidance.pdf\`
Source URL: ${clarificationUrl}
Title: ${info.title}
Pages: ${info.pages}
Normalized by: \`scripts/extract-curriculum-sources.mjs\`

## Role

Errata role: overrides or narrows the base CED where applicable.

## High-Impact Curriculum Notes

- EKs 1.1.A.3 and 1.1.A.4: increasing and decreasing should be treated as strictly increasing/decreasing; open-vs-closed interval discrimination for this topic is not assessed on the AP Precalculus Exam.
- EK 1.3.A.3: average rate of change language refers to a function \`f\`.
- EK 1.4.A.1: coefficient indexing correction.
- EKs 2.1.B.3: applies only to positive-valued geometric sequences.
- EKs 2.2.A.3, 2.2.A.4, and 2.2.B.1: exponential ratios must not equal 1 or 0 when distinguishing exponential from linear.
- EKs 2.5.B.3, 2.14.A.6, and 3.7.A.5: models can be used to predict values of the independent variable as well as dependent variables.
- EKs 2.6.B.1 and 2.6.B.2: residual sign is valid content; error sign is not assessed.
- EK 3.6.A.1: precision requires \`b != 0\`.
- EKs 3.13.A.1, 3.14.A.1, 3.14.A.3, and 3.15.A.4: polar radius values should be treated as signed radius values where applicable.
- Question 3(C)(ii): FRQ language should ask about concavity and whether rate of change is increasing or decreasing.

## Planning Rule

When a topic source file or class-period package references a corrected EK or FRQ model, it should point to this errata artifact in addition to the base CED.
`;
}

function generatePasswaterMarkdown(unit, info) {
  return `
# Passwater Unit ${unit.unit}: ${unit.title}

Source PDF: \`${unit.fileName}\`
Pages: ${info.pages}
Instructional role: topic introduction, scaffolding, guided practice, independent practice, pacing, and local assessment evidence.
Normalized by: \`scripts/extract-curriculum-sources.mjs\`

## Topic Sequence

| Topic | Title |
|-------|-------|
${unit.topics.map(([id, title]) => `| ${id} | ${title} |`).join("\n")}

## Extracted Instructional Evidence

${unit.evidence.map((line) => `- ${line}`).join("\n")}

## Planning Use

- Use Passwater notes to decide how each topic is introduced.
- Use worked examples and worksheet progressions to scaffold guided practice.
- Use worksheets, quizzes, reviews, and tests as the local source for independent AP-style practice shape.
- Tag every package back to the CED topic and competency references before seeding.

## Extraction limitations

- Diagrams, graphs, handwritten or embedded mathematical layouts, and some formulas may require manual review against the PDF.
- This artifact intentionally preserves source structure and planning cues; it is not a full lesson authoring output.
`;
}

for (const sourcePath of Object.values(sources)) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source PDF: ${sourcePath}`);
  }
}

const cedInfo = pdfInfo(sources.ced);
const clarificationInfo = pdfInfo(sources.clarification);
const cedSample = pdfText(sources.ced, ["-f", "1", "-l", "25"]);
const clarificationSample = pdfText(sources.clarification, ["-f", "1", "-l", "5"]);

assertContains(cedSample, "Unit 4 topics are additional and excluded", "CED sample");
assertContains(cedSample, "Exam Weighting for the Multiple-Choice Section", "CED sample");
assertContains(clarificationSample, "EKs 1.1.A.3 and 1.1.A.4", "clarification sample");

writeFile("source/college-board/ced.md", generateCedMarkdown(cedInfo));
writeFile(
  "source/college-board/ced-topic-index.json",
  JSON.stringify(generateCedTopicIndex(cedInfo), null, 2),
);
writeFile(
  "source/college-board/clarification-guidance.md",
  generateClarificationMarkdown(clarificationInfo),
);

for (const unit of passwaterUnits) {
  const pdfPath = path.join(curriculumRoot, unit.fileName);
  const info = pdfInfo(pdfPath);
  const sample = pdfText(pdfPath, ["-f", "1", "-l", "2"]);
  assertContains(
    sample,
    unit.unit === 2 ? "Topic 2.1" : `Unit ${unit.unit}`,
    `Passwater Unit ${unit.unit}`,
  );
  writeFile(`source/passwater/unit-${unit.unit}.md`, generatePasswaterMarkdown(unit, info));
}

writeFile(
  "source/README.md",
  `
# AP Precalculus Normalized Sources

Generated by \`npm run curriculum:extract\`.

| Artifact | Purpose |
|----------|---------|
| \`college-board/ced.md\` | Human-readable CED topic, exam, practice, and FRQ summary |
| \`college-board/ced-topic-index.json\` | Machine-readable AP topic index and exam metadata |
| \`college-board/clarification-guidance.md\` | CED errata and clarification notes |
| \`passwater/unit-*.md\` | Local instructional evidence summaries for Units 1-3 |
| \`originals/*.pdf\` | Downloaded official PDFs used for extraction plus local Passwater PDFs referenced from curriculum root |
`,
);
