import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = path.join(appRoot, 'curriculum/modules');
const index = JSON.parse(fs.readFileSync(path.join(appRoot, 'curriculum/source/college-board/ced-topic-index.json'), 'utf8'));
for (const unit of index.units) {
  for (const topic of unit.topics) {
    const [u, t] = topic.id.split('.');
    const unitDirectory = fs.readdirSync(modules).find(name => name.startsWith(`unit-${u.padStart(2, '0')}-`));
    const markdown = fs.readFileSync(path.join(modules, unitDirectory, `lesson-${u}-${t}`, 'lesson.md'), 'utf8');
    const sections = [...markdown.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
    if (!sections.length) throw new Error(`No phases in ${topic.id}`);
    const phases = sections.map((match, i) => ({
      phaseNumber: i + 1, title: match[1], phaseType: match[1].toLowerCase().replaceAll(' ', '_'), estimatedMinutes: 10,
      sections: [{ sequenceOrder: 1, sectionType: 'text', content: { markdown: match[2].replace(/^### Section: text\s*/gm, '').trim() } }],
    }));
    const file = path.join(appRoot, `convex/seed/seed_lesson_${u}_${t}.ts`);
    let source = fs.readFileSync(file, 'utf8');
    const start = source.indexOf('    const phaseData = [');
    const tail = source.slice(start);
    const boundary = /\n    (?:let|const) (?:activitiesCreated|phasesCreated)/.exec(tail);
    const end = boundary ? start + boundary.index : -1;
    if (start < 0 || end < 0) throw new Error(`No phase data boundary in ${file}`);
    source = source.slice(0, start) + `    const phaseData = ${JSON.stringify(phases, null, 2)} as const;\n` + source.slice(end);
    // Only update metadata before phase content. Preserve stable slugs and authored pilot registration.
    const prefixEnd = source.indexOf('    const phaseData');
    let prefix = source.slice(0, prefixEnd).replace(/title: "[^"\n]*"/g, `title: ${JSON.stringify(topic.title)}`);
    prefix = prefix.replace(/description: "[^"\n]*"/g, `description: ${JSON.stringify(`AP Precalculus Topic ${topic.id}: ${topic.title}`)}`);
    source = prefix + source.slice(prefixEnd);
    // Text phases no longer include the old generic activity branches. Authored pilot seeds below remain intact.
    const branch = source.indexOf('        if (section.sectionType === "activity")');
    if (branch >= 0) {
      const endBranch = source.indexOf('\n      }\n    }', branch);
      source = source.slice(0, branch) + `        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId, sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType, content: section.content, createdAt: now,
        });` + source.slice(endBranch);
    }
    fs.writeFileSync(file, source);
  }
}
console.log('Synchronized 58 lesson seed definitions from corrected lesson sources.');
