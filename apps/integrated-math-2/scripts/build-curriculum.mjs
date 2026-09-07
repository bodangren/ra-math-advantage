import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const app = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(app, "curriculum/modules");
const files = (await readdir(directory)).filter((name) =>
  /^module-\d+-lesson-\d+$/.test(name),
);
const lessons = [];
for (const slug of files) {
  const [, moduleNumber, lessonNumber] = slug.match(
    /^module-(\d+)-lesson-(\d+)$/,
  );
  let source = path.join(directory, slug);
  if ((await stat(source)).isDirectory())
    source = path.join(source, "index.md");
  const markdown = await readFile(source, "utf8");
  const title = markdown
    .split("\n")[0]
    .replace(/^#\s*(?:Lesson\s+\d+-\d+\s*[—–:-]\s*)?/, "")
    .trim();
  const sections = markdown.split(/^## /m).slice(1);
  const phases = sections.map((section, i) => {
    const title = section.split("\n")[0].trim();
    const phaseType = /^Explore/i.test(title)
      ? "explore"
      : /^Vocabulary/i.test(title)
        ? "vocabulary"
        : /^Example/i.test(title)
          ? "worked_example"
          : /^Mixed|^Practice/i.test(title)
            ? "independent_practice"
            : /^Review Notes/i.test(title)
              ? "reflection"
              : "learn";
    return {
      phaseNumber: i + 1,
      title,
      phaseType,
      markdown: section.slice(section.indexOf("\n") + 1).trim(),
    };
  });
  if (!title || phases.length === 0)
    throw Error(`Lesson is incomplete: ${slug}`);
  lessons.push({
    slug,
    unitNumber: Number(moduleNumber),
    orderIndex: Number(lessonNumber),
    title,
    phases,
  });
}
lessons.sort(
  (a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex,
);
if (lessons.length !== 96)
  throw Error(`Expected 96 lessons, found ${lessons.length}`);
const output = JSON.stringify(lessons, null, 2) + "\n";
const target = path.join(app, "curriculum/lessons.json");
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8").catch(() => null)) !== output)
    throw Error(
      "Curriculum bundle is stale. Run node scripts/build-curriculum.mjs.",
    );
} else await writeFile(target, output);
console.log(`Checked ${lessons.length} source lessons.`);
