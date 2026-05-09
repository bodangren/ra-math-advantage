#!/usr/bin/env npx tsx
/**
 * Skill Inventory Extraction CLI
 *
 * Reads curriculum source files and produces draft node inventories for
 * IM1, IM2, IM3, and AP Precalculus.
 *
 * Usage:
 *   npx tsx scripts/extract-skill-inventory.ts im3
 *   npx tsx scripts/extract-skill-inventory.ts --all
 *   npx tsx scripts/extract-skill-inventory.ts --audit-only
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parseClassPeriodPlan,
  parseModuleOverview,
  parseAleksRegistry,
  parsePrecalcLesson,
  assembleDraftInventory,
} from '../packages/math-content/src/knowledge-space/extraction/index';
import type {
  ModuleOverviewExtract,
  ClassPeriodPlanExtract,
  AleksRegistryExtract,
  PrecalcLessonExtract,
} from '../packages/math-content/src/knowledge-space/extraction/index';
import type { MathCourse } from '../packages/math-content/src/knowledge-space/ids';
import type { KnowledgeSpaceNode } from '../packages/knowledge-space-core/src/types';

const REPO_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Course configuration
// ---------------------------------------------------------------------------

interface CourseConfig {
  course: MathCourse;
  appDir: string;
  classPeriodPlanPattern: string; // relative to appDir/curriculum/
  moduleOverviewPattern?: string; // relative to appDir/curriculum/
  aleksRegistryFile?: string; // relative to appDir/curriculum/
  precalcLessonPattern?: string; // for PreCalc only
  precalcTopicsDir?: string;
}

const COURSE_CONFIGS: Record<MathCourse, CourseConfig> = {
  im1: {
    course: 'im1',
    appDir: path.join(REPO_ROOT, 'apps', 'integrated-math-1'),
    classPeriodPlanPattern: 'module-*-class-period-plan.md',
  },
  im2: {
    course: 'im2',
    appDir: path.join(REPO_ROOT, 'apps', 'integrated-math-2'),
    classPeriodPlanPattern: 'module-*-class-period-plan.md',
    moduleOverviewPattern: 'modules/module-*-*.md',
  },
  im3: {
    course: 'im3',
    appDir: path.join(REPO_ROOT, 'apps', 'integrated-math-3'),
    classPeriodPlanPattern: 'module-*-class-period-plan.md',
    moduleOverviewPattern: 'modules/module-*-*.md',
    aleksRegistryFile: 'aleks/problem-type-registry.md',
  },
  precalc: {
    course: 'precalc',
    appDir: path.join(REPO_ROOT, 'apps', 'pre-calculus'),
    classPeriodPlanPattern: 'unit-*-class-period-plan.md',
    precalcLessonPattern: 'modules/unit-*/lesson-*-*/lesson.md',
    precalcTopicsDir: 'topics',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function globFiles(dir: string, pattern: string): string[] {
  // Simple glob: supports * wildcard in filename or one path segment
  const results: string[] = [];
  const parts = pattern.split('/');
  const filePattern = parts[parts.length - 1];
  const baseDir = path.join(dir, ...parts.slice(0, -1));

  if (!fs.existsSync(baseDir)) return results;

  const regex = new RegExp(
    '^' + filePattern.replace(/\*/g, '.*') + '$',
  );

  try {
    const entries = fs.readdirSync(baseDir);
    for (const entry of entries) {
      if (regex.test(entry)) {
        results.push(path.join(baseDir, entry));
      }
    }
  } catch {
    // Directory doesn't exist
  }

  // Sort for deterministic order
  results.sort();
  return results;
}

function globRecursive(dir: string, pattern: string): string[] {
  // Supports ** wildcard for recursive search
  const results: string[] = [];

  function walk(currentDir: string, remainingParts: string[]) {
    if (remainingParts.length === 0) {
      if (fs.existsSync(currentDir) && fs.statSync(currentDir).isFile()) {
        results.push(currentDir);
      }
      return;
    }

    const part = remainingParts[0];
    const rest = remainingParts.slice(1);

    if (part === '**') {
      // Recursive descent
      if (rest.length === 0) return;
      if (!fs.existsSync(currentDir)) return;
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const full = path.join(currentDir, entry);
        if (fs.statSync(full).isDirectory()) {
          walk(full, rest);
          walk(full, remainingParts); // also try matching at this level
        }
      }
    } else if (part.includes('*')) {
      // Wildcard in this segment
      if (!fs.existsSync(currentDir)) return;
      const regex = new RegExp('^' + part.replace(/\*/g, '.*') + '$');
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        if (regex.test(entry)) {
          const full = path.join(currentDir, entry);
          walk(full, rest);
        }
      }
    } else {
      walk(path.join(currentDir, part), rest);
    }
  }

  walk(dir, pattern.split('/'));
  results.sort();
  return results;
}

function extractModuleNumber(filename: string): number {
  const match = filename.match(/module-(\d+)/i) || filename.match(/unit-(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
}

// ---------------------------------------------------------------------------
// Course-specific extractors
// ---------------------------------------------------------------------------

function extractImCourse(config: CourseConfig): KnowledgeSpaceNode[] {
  const { course, appDir } = config;
  const curriculumDir = path.join(appDir, 'curriculum');
  const allNodes: KnowledgeSpaceNode[] = [];

  // Read class period plans
  const planFiles = globFiles(curriculumDir, config.classPeriodPlanPattern);
  if (planFiles.length === 0) {
    console.warn(`  Warning: No class period plans found for ${course}`);
    return [];
  }

  // Read ALEKS registry if available
  let aleksRegistry: AleksRegistryExtract | undefined;
  if (config.aleksRegistryFile) {
    const aleksPath = path.join(curriculumDir, config.aleksRegistryFile);
    const content = readFile(aleksPath);
    if (content) {
      aleksRegistry = parseAleksRegistry(content);
    }
  }

  for (const planFile of planFiles) {
    const content = readFile(planFile);
    if (!content) continue;

    const moduleNumber = extractModuleNumber(path.basename(planFile));
    const classPeriodPlan = parseClassPeriodPlan(content);
    const relativePath = path.relative(REPO_ROOT, planFile);

    // Try to find a module overview
    let moduleOverview: ModuleOverviewExtract | undefined;
    if (config.moduleOverviewPattern) {
      const overviewFiles = globFiles(curriculumDir, config.moduleOverviewPattern);
      const matchingOverview = overviewFiles.find((f) => {
        const n = extractModuleNumber(path.basename(f));
        return n === moduleNumber;
      });
      if (matchingOverview) {
        const overviewContent = readFile(matchingOverview);
        if (overviewContent) {
          moduleOverview = parseModuleOverview(overviewContent);
        }
      }
    }

    // Fallback: create minimal module overview from plan
    if (!moduleOverview) {
      moduleOverview = {
        moduleNumber,
        title: `Module ${moduleNumber}`,
        description: '',
        lessons: classPeriodPlan.lessons.map((l) => ({
          number: l.moduleNumber,
          lessonNumber: l.lessonNumber,
          title: `Lesson ${l.lessonRef}`,
          description: l.objectives.map((o) => o.description).join('; '),
        })),
        skills: [],
      };
    }

    // Filter ALEKS families to just this module
    const moduleAleksRegistry: AleksRegistryExtract | undefined = aleksRegistry
      ? {
          families: aleksRegistry.families.filter(
            (f) => f.module === moduleNumber,
          ),
        }
      : undefined;

    const nodes = assembleDraftInventory({
      course,
      moduleOverview,
      classPeriodPlan,
      aleksRegistry: moduleAleksRegistry,
      sourceFile: relativePath,
    });

    allNodes.push(...nodes);
  }

  return allNodes;
}

function extractPrecalc(config: CourseConfig): KnowledgeSpaceNode[] {
  const { course, appDir } = config;
  const curriculumDir = path.join(appDir, 'curriculum');
  const allNodes: KnowledgeSpaceNode[] = [];

  // Read class period plans
  const planFiles = globFiles(curriculumDir, config.classPeriodPlanPattern);
  if (planFiles.length === 0) {
    // Fall back to curriculum/topics if no plans exist
    console.warn('  Warning: No class period plans found for precalc, using topics');
  }

  // Read precalc lesson files
  let lessonFiles: string[] = [];
  if (config.precalcLessonPattern) {
    lessonFiles = globRecursive(curriculumDir, config.precalcLessonPattern);
  }

  // If no lesson files, try topics
  if (lessonFiles.length === 0 && config.precalcTopicsDir) {
    const topicsDir = path.join(curriculumDir, config.precalcTopicsDir);
    lessonFiles = globFiles(topicsDir, '*.md');
  }

  if (lessonFiles.length === 0) {
    console.warn('  Warning: No lesson files found for precalc');
    return [];
  }

  // Process class period plans if available
  for (const planFile of planFiles) {
    const content = readFile(planFile);
    if (!content) continue;

    const unitNumber = extractModuleNumber(path.basename(planFile));
    const classPeriodPlan = parseClassPeriodPlan(content);
    const relativePath = path.relative(REPO_ROOT, planFile);

    const moduleOverview: ModuleOverviewExtract = {
      moduleNumber: unitNumber,
      title: `Unit ${unitNumber}`,
      description: '',
      lessons: classPeriodPlan.lessons.map((l) => ({
        number: l.moduleNumber,
        lessonNumber: l.lessonNumber,
        title: `Lesson ${l.lessonRef}`,
        description: l.objectives.map((o) => o.description).join('; '),
      })),
      skills: [],
    };

    const nodes = assembleDraftInventory({
      course,
      moduleOverview,
      classPeriodPlan,
      sourceFile: relativePath,
    });

    allNodes.push(...nodes);
  }

  // Process individual lesson files
  for (const lessonFile of lessonFiles) {
    const content = readFile(lessonFile);
    if (!content) continue;

    const relativePath = path.relative(REPO_ROOT, lessonFile);
    const parsed = parsePrecalcLesson(content);

    if (parsed.examples.length === 0) continue;

    const unitNumber = extractModuleNumber(path.basename(lessonFile));
    const [unitPart, lessonPart] = parsed.lessonRef
      ? parsed.lessonRef.split('-')
      : [String(unitNumber), '1'];

    const moduleOverview: ModuleOverviewExtract = {
      moduleNumber: unitNumber,
      title: `Unit ${unitNumber}: ${parsed.title}`,
      description: '',
      lessons: [
        {
          number: unitNumber,
          lessonNumber: parseInt(lessonPart, 10) || 1,
          title: parsed.title,
          description: `Topic ${parsed.topic}`,
        },
      ],
      skills: [],
    };

    const classPeriodPlan: ClassPeriodPlanExtract = {
      moduleNumber: unitNumber,
      lessons: [
        {
          lessonRef: parsed.lessonRef || `${unitPart}-${lessonPart}`,
          moduleNumber: unitNumber,
          lessonNumber: parseInt(lessonPart, 10) || 1,
          objectives: [],
          examples: parsed.examples.map((ex) => ({
            lessonRef: parsed.lessonRef || `${unitPart}-${lessonPart}`,
            exampleNumbers: [ex.index],
            title: ex.content.split('\n')[0]?.slice(0, 80),
            rawText: ex.content,
            lineNumber: ex.lineNumber,
            bodyExcerpt: ex.content,
          })),
        },
      ],
      examples: parsed.examples.map((ex) => ({
        lessonRef: parsed.lessonRef || `${unitPart}-${lessonPart}`,
        exampleNumbers: [ex.index],
        title: ex.content.split('\n')[0]?.slice(0, 80),
        rawText: ex.content,
        lineNumber: ex.lineNumber,
        bodyExcerpt: ex.content,
      })),
    };

    const nodes = assembleDraftInventory({
      course,
      moduleOverview,
      classPeriodPlan,
      sourceFile: relativePath,
    });

    allNodes.push(...nodes);
  }

  return allNodes;
}

// ---------------------------------------------------------------------------
// Inventory deduplication
// ---------------------------------------------------------------------------

function deduplicateNodes(nodes: KnowledgeSpaceNode[]): KnowledgeSpaceNode[] {
  const seen = new Map<string, KnowledgeSpaceNode>();
  for (const node of nodes) {
    const existing = seen.get(node.id);
    if (!existing) {
      seen.set(node.id, node);
    } else {
      // Use non-empty title/description when available
      if (!existing.title && node.title) {
        existing.title = node.title;
      }
      if (!existing.description && node.description) {
        existing.description = node.description;
      }
      // Merge sourceRefs
      const existingRefs = new Set(
        (existing.sourceRefs ?? []).map((r) =>
          typeof r === 'string' ? r : JSON.stringify(r),
        ),
      );
      for (const ref of node.sourceRefs ?? []) {
        const refStr = typeof ref === 'string' ? ref : JSON.stringify(ref);
        if (!existingRefs.has(refStr)) {
          existing.sourceRefs = [...(existing.sourceRefs ?? []), ref];
        }
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.id.localeCompare(b.id));
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

interface AuditStats {
  course: string;
  totalNodes: number;
  byKind: Record<string, number>;
  lessonsWithoutExamples: string[];
  duplicateIds: string[];
  missingSourceRefs: string[];
}

function auditInventory(
  course: MathCourse,
  nodes: KnowledgeSpaceNode[],
): AuditStats {
  const byKind: Record<string, number> = {};
  const lessonIds = new Set<string>();
  const lessonsWithExamples = new Set<string>();
  const idCounts = new Map<string, number>();
  const missingSourceRefs: string[] = [];

  for (const node of nodes) {
    byKind[node.kind] = (byKind[node.kind] || 0) + 1;

    // Track IDs
    idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);

    // Track lessons vs examples
    if (node.kind === 'instructional_unit') {
      lessonIds.add(node.id);
    }
    if (node.kind === 'worked_example') {
      // Extract lesson from ID: math.im3.example.1.2.001 → math.im3.lesson.1.2
      const lessonId = node.id
        .replace('.example.', '.lesson.')
        .replace(/\.[^.]+$/, '');
      lessonsWithExamples.add(lessonId);
    }

    // Check source refs
    if (
      !node.sourceRefs ||
      node.sourceRefs.length === 0
    ) {
      missingSourceRefs.push(node.id);
    }
  }

  // Find duplicate IDs
  const duplicateIds: string[] = [];
  for (const [id, count] of idCounts) {
    if (count > 1) duplicateIds.push(id);
  }

  // Find lessons without examples
  const lessonsWithoutExamples: string[] = [];
  for (const lessonId of lessonIds) {
    if (!lessonsWithExamples.has(lessonId)) {
      lessonsWithoutExamples.push(lessonId);
    }
  }

  return {
    course: COURSE_CONFIGS[course].course,
    totalNodes: nodes.length,
    byKind,
    lessonsWithoutExamples,
    duplicateIds,
    missingSourceRefs,
  };
}

function writeAuditReport(
  allStats: AuditStats[],
  outputPath: string,
) {
  const lines: string[] = [
    '# Skill Graph Inventory Audit',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    '## Summary by Course',
    '',
    '| Course | Total Nodes | Skills | Worked Examples | Lessons | Concepts |',
    '|--------|-------------|--------|-----------------|---------|----------|',
  ];

  for (const stats of allStats) {
    lines.push(
      `| ${stats.course} | ${stats.totalNodes} | ${stats.byKind['skill'] || 0} | ${stats.byKind['worked_example'] || 0} | ${stats.byKind['instructional_unit'] || 0} | ${stats.byKind['concept'] || 0} |`,
    );
  }

  lines.push(
    '',
    `**Total across all courses:** ${allStats.reduce((s, x) => s + x.totalNodes, 0)} nodes`,
  );

  // Detailed breakdown per course
  for (const stats of allStats) {
    lines.push(
      '',
      `## ${stats.course}`,
      '',
      `**Total nodes:** ${stats.totalNodes}`,
      '',
      '### By Kind',
    );
    for (const [kind, count] of Object.entries(stats.byKind).sort()) {
      lines.push(`- ${kind}: ${count}`);
    }

    if (stats.lessonsWithoutExamples.length > 0) {
      lines.push(
        '',
        `### Lessons Without Examples (${stats.lessonsWithoutExamples.length})`,
        '',
      );
      for (const id of stats.lessonsWithoutExamples.slice(0, 20)) {
        lines.push(`- \`${id}\``);
      }
      if (stats.lessonsWithoutExamples.length > 20) {
        lines.push(
          `- ... and ${stats.lessonsWithoutExamples.length - 20} more`,
        );
      }
    }

    if (stats.duplicateIds.length > 0) {
      lines.push(
        '',
        `### Duplicate IDs (${stats.duplicateIds.length})`,
        '',
      );
      for (const id of stats.duplicateIds) {
        lines.push(`- \`${id}\``);
      }
    }

    if (stats.missingSourceRefs.length > 0) {
      lines.push(
        '',
        `### Missing Source References (${stats.missingSourceRefs.length})`,
        '',
      );
      for (const id of stats.missingSourceRefs) {
        lines.push(`- \`${id}\``);
      }
    }
  }

  lines.push('');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`Audit report written to ${path.relative(REPO_ROOT, outputPath)}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function extractCourse(
  course: MathCourse,
): KnowledgeSpaceNode[] {
  const config = COURSE_CONFIGS[course];

  let nodes: KnowledgeSpaceNode[];
  if (course === 'precalc') {
    nodes = extractPrecalc(config);
  } else {
    nodes = extractImCourse(config);
  }

  return deduplicateNodes(nodes);
}

function writeInventory(
  course: MathCourse,
  nodes: KnowledgeSpaceNode[],
) {
  const config = COURSE_CONFIGS[course];
  const outputDir = path.join(config.appDir, 'curriculum', 'skill-graph');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'draft-nodes.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ nodes }, null, 2),
    'utf-8',
  );
  console.log(
    `  ${nodes.length} nodes → ${path.relative(REPO_ROOT, outputPath)}`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  const courseArg = args[0];
  const auditOnly = args.includes('--audit-only');
  const allFlag = args.includes('--all');

  if (!courseArg && !allFlag && !auditOnly) {
    console.log('Usage: npx tsx scripts/extract-skill-inventory.ts <course|--all> [--audit-only]');
    console.log('  course: im1, im2, im3, precalc');
    console.log('  --all:  process all courses');
    console.log('  --audit-only:  only generate audit report');
    process.exit(1);
  }

  const courses: MathCourse[] = allFlag
    ? Object.keys(COURSE_CONFIGS) as MathCourse[]
    : [courseArg as MathCourse];

  if (!allFlag && !COURSE_CONFIGS[courseArg as MathCourse]) {
    console.error(`Unknown course: ${courseArg}. Use im1, im2, im3, or precalc.`);
    process.exit(1);
  }

  const allStats: AuditStats[] = [];

  for (const course of courses) {
    console.log(`\nExtracting ${course}...`);
    const nodes = extractCourse(course);
    console.log(`  Parsed ${nodes.length} nodes`);

    if (!auditOnly) {
      writeInventory(course, nodes);
    }

    const stats = auditInventory(course, nodes);
    allStats.push(stats);

    console.log(
      `  Skills: ${stats.byKind['skill'] || 0}, ` +
      `Examples: ${stats.byKind['worked_example'] || 0}, ` +
      `Lessons: ${stats.byKind['instructional_unit'] || 0}, ` +
      `Concepts: ${stats.byKind['concept'] || 0}`,
    );

    if (stats.duplicateIds.length > 0) {
      console.warn(`  Warning: ${stats.duplicateIds.length} duplicate IDs`);
    }
    if (stats.lessonsWithoutExamples.length > 0) {
      console.warn(
        `  Warning: ${stats.lessonsWithoutExamples.length} lessons without examples`,
      );
    }
  }

  // Write audit report
  const auditPath = path.join(REPO_ROOT, 'measure', 'skill-graph-inventory-audit.md');
  writeAuditReport(allStats, auditPath);

  // Count total
  const total = allStats.reduce((s, x) => s + x.totalNodes, 0);
  console.log(`\nDone. ${total} total nodes across ${allStats.length} courses.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
