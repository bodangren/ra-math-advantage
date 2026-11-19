import { readFile, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../curriculum/", import.meta.url));
const lessons = JSON.parse(await readFile(path.join(root, "lessons.json"), "utf8"));
const questions = JSON.parse(await readFile(path.join(root, "questions.json"), "utf8"));
const units = JSON.parse(await readFile(path.join(root, "units.json"), "utf8"));
const assessmentBlocks = [[1], [2], [3, 4], [5, 6], [7], [8, 9], [10], [11, 12], [13]];
const extendedGroupModules = [1, 4, 6, 9, 12];
const periods = [];
const check = process.argv.includes("--check");
async function emit(target, content) {
  if (check) {
    if ((await readFile(target, "utf8").catch(() => null)) !== content)
      throw Error(`Calendar output is stale: ${path.relative(root, target)}`);
  } else await writeFile(target, content);
}
function add(unit, dayType, data) {
  const index = periods.filter((period) => period.unitNumber === unit).length + 1;
  periods.push({
    periodId: `m${unit}-p${String(index).padStart(2, "0")}`,
    number: periods.length + 1,
    unitNumber: unit,
    dayType,
    ...data,
  });
}
function goals(lesson) {
  return (
    lesson.phases
      .find((phase) => /Goals/.test(phase.title))
      ?.markdown.split("\n")
      .filter((line) => /^\s*[-*] /.test(line))
      .map((line) => line.replace(/^\s*[-*] /, "")) ?? []
  );
}
function examples(lesson) {
  return lesson.phases
    .filter((phase) => phase.phaseType === "worked_example")
    .map((phase) => phase.title);
}
for (const unit of units) {
  const sourceLessons = lessons.filter((lesson) => lesson.unitNumber === unit.number);
  const expanded =
    unit.number === 13
      ? null
      : [...sourceLessons].sort((a, b) => examples(b).length - examples(a).length)[0];
  let masteryCount = 0;
  const masteryTarget = unit.number <= 10 ? 3 : 2;
  for (const [index, lesson] of sourceLessons.entries()) {
    const objectiveList = goals(lesson);
    const selected = examples(lesson).slice(0, 2);
    const previous = lessons[lessons.indexOf(lesson) - 1];
    add(unit.number, "instruction", {
      sourceLesson: lesson.slug,
      objective: objectiveList[0],
      embeddedObjectives: objectiveList.slice(1),
      workedExamples: selected,
      dailyPhases: {
        warmUp: previous ? questions[previous.slug].prompt : questions[lesson.slug].prompt,
        conceptDevelopment: {
          sourceLesson: lesson.slug,
          workedExamples: selected.slice(0, 1),
        },
        guidedPractice: {
          sourceLesson: lesson.slug,
          workedExamples: selected.slice(1).length ? selected.slice(1) : selected,
        },
        independentPractice: {
          questionId: lesson.slug,
          prompt: questions[lesson.slug].prompt,
        },
        assessment: { questionId: lesson.slug, requireExplanation: true },
        capReflection: `Which step in ${lesson.title.toLowerCase()} required a change in your method? Explain the change.`,
      },
    });
    if (lesson === expanded) {
      const extension = examples(lesson).slice(2, 5);
      if (!extension.length) throw Error(`Missing extension examples for ${lesson.slug}`);
      add(unit.number, "instruction", {
        sourceLesson: lesson.slug,
        objective: objectiveList[1] ?? objectiveList[0],
        embeddedObjectives: objectiveList.slice(2),
        workedExamples: extension,
        dailyPhases: {
          warmUp: questions[lesson.slug].prompt,
          conceptDevelopment: {
            sourceLesson: lesson.slug,
            workedExamples: extension.slice(0, 1),
          },
          guidedPractice: {
            sourceLesson: lesson.slug,
            workedExamples: extension.slice(1).length ? extension.slice(1) : extension,
          },
          independentPractice: {
            sourceLesson: lesson.slug,
            workedExamples: extension,
          },
          assessment: { questionId: lesson.slug, requireExplanation: true },
          capReflection: `Explain how the additional examples change your understanding of ${lesson.title.toLowerCase()}.`,
        },
      });
    }
    const target = Math.floor(((index + 1) * masteryTarget) / sourceLessons.length);
    if (target > masteryCount) {
      const covered = sourceLessons.slice(0, index + 1).map((lesson) => lesson.slug);
      add(unit.number, "mastery", {
        sourceLessons: covered,
        questionIds: covered,
        task: "Solve the listed checkpoint questions. Explain each method. Use the source worked examples to correct an error. Recheck the corrected answer.",
      });
      masteryCount++;
    }
  }
  const groupCount = extendedGroupModules.includes(unit.number) ? 2 : 1;
  for (let group = 0; group < groupCount; group++) {
    const assigned = sourceLessons
      .filter((_, index) => index % groupCount === group)
      .map((lesson) => lesson.slug);
    add(unit.number, "jigsaw", {
      sourceLessons: assigned,
      questionIds: assigned,
      task: "Assign one listed lesson to each group. Prepare a solution and explain each step. Exchange solutions with another group. Check the method and identify any restriction.",
    });
  }
  const block = assessmentBlocks.find((block) => block.at(-1) === unit.number);
  if (block) {
    const assessed = lessons
      .filter((lesson) => block.includes(lesson.unitNumber))
      .map((lesson) => lesson.slug);
    add(unit.number, "review", {
      assessmentModules: block,
      sourceLessons: assessed,
      questionIds: assessed,
      task: "Review the listed lessons. Solve their checkpoint questions and explain the method. Review the source examples for each error.",
    });
    add(unit.number, "test", {
      assessmentModules: block,
      sourceLessons: assessed,
      task: "Use a teacher-authored assessment for the listed modules. Include reasoning, application, and restrictions. The public checkpoint bank is review material and is not a secure test form.",
    });
  }
}
if (periods.length !== 180) throw Error(`Expected 180 periods, found ${periods.length}`);
const calendar = {
  schemaVersion: "im2-calendar.v1",
  assessmentBlocks,
  periods,
};
await emit(path.join(root, "calendar.json"), JSON.stringify(calendar, null, 2) + "\n");
const packageDir = path.join(root, "implementation/class-period-packages");
for (const filename of await readdir(packageDir))
  if (/^module-\d+-p\d+\.json$/.test(filename)) {
    if (check) throw Error(`Legacy period package remains: ${filename}`);
    await unlink(path.join(packageDir, filename));
  }
for (const unit of units) {
  const unitPeriods = periods.filter((period) => period.unitNumber === unit.number);
  await emit(
    path.join(packageDir, `unit-${unit.number}.json`),
    JSON.stringify(
      {
        schemaVersion: "class-period-package.v1",
        unit: unit.number,
        periods: unitPeriods,
      },
      null,
      2,
    ) + "\n",
  );
  const counts = Object.fromEntries(
    ["instruction", "mastery", "jigsaw", "review", "test"].map((type) => [
      type,
      unitPeriods.filter((period) => period.dayType === type).length,
    ]),
  );
  const lines = [
    `# Module ${unit.number}: ${unit.title}`,
    "",
    "This plan is generated from `calendar.json`. Source lesson files define the content.",
    "",
    `Periods in this module: ${unitPeriods.length}.`,
    "",
    "| Day type | Periods |",
    "|---|---:|",
    ...Object.entries(counts).map(([type, count]) => `| ${type} | ${count} |`),
    "",
    "| Course period | Type | Lesson or assessment modules | Objective or task | Worked examples |",
    "|---:|---|---|---|---|",
  ];
  for (const p of unitPeriods)
    lines.push(
      `| ${p.number} | ${p.dayType} | ${p.sourceLesson ?? p.assessmentModules?.join(", ") ?? p.sourceLessons.join(", ")} | ${(p.objective ?? p.task).replaceAll("|", "/")} | ${p.workedExamples?.join("; ") ?? "See the listed sources."} |`,
    );
  lines.push(
    "",
    "Review and test periods belong to nine assessment blocks. A block can cover more than one module. The 180-period course budget includes all blocks.",
    "",
  );
  await emit(path.join(root, `module-${unit.number}-class-period-plan.md`), lines.join("\n"));
}
console.log(`Built ${periods.length} class periods across ${units.length} modules.`);
