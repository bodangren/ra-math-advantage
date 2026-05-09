// Standards alignment generator script
// Consumes draft skill inventories, seed standards, lesson-standards, and problem-family objectives
// to produce per-course standard-edges.json files.
//
// Usage:
//   npx tsx scripts/align-standards.ts --all
//   npx tsx scripts/align-standards.ts --course im3
//   npx tsx scripts/align-standards.ts --all --audit-only

import * as fs from 'fs';
import * as path from 'path';

import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import { validateKnowledgeSpace, knowledgeSpaceSchema } from '@math-platform/knowledge-space-core';
import { alignSkillsToStandards } from '@math-platform/math-content/knowledge-space';
import type { StandardDefinition, LessonStandardMapping, FamilyObjectiveMapping, CEDTopicMapping, AlignmentResult } from '@math-platform/math-content/knowledge-space';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..');

const COURSE_CONFIGS: Record<string, {
  draftNodesPath: string;
  outputPath: string;
  standardsPaths: string[];
  lessonStandardsDir: string;
  lessonStandardsGlob: string;
  problemFamiliesModule: string;
  cedTopicsPath?: string;
}> = {
  im1: {
    draftNodesPath: path.join(REPO_ROOT, 'apps/integrated-math-1/curriculum/skill-graph/draft-nodes.json'),
    outputPath: path.join(REPO_ROOT, 'apps/integrated-math-1/curriculum/skill-graph/standard-edges.json'),
    standardsPaths: [path.join(REPO_ROOT, 'apps/integrated-math-1/convex/seed/standards.ts')],
    lessonStandardsDir: path.join(REPO_ROOT, 'apps/integrated-math-1/convex/seed'),
    lessonStandardsGlob: 'seed_im1_module_*_standards.ts',
    problemFamiliesModule: '',
  },
  im2: {
    draftNodesPath: path.join(REPO_ROOT, 'apps/integrated-math-2/curriculum/skill-graph/draft-nodes.json'),
    outputPath: path.join(REPO_ROOT, 'apps/integrated-math-2/curriculum/skill-graph/standard-edges.json'),
    standardsPaths: [path.join(REPO_ROOT, 'apps/integrated-math-2/convex/seed/seed_standards.ts')],
    lessonStandardsDir: path.join(REPO_ROOT, 'apps/integrated-math-2/convex/seed'),
    lessonStandardsGlob: 'seed_im2_module_*_standards.ts',
    problemFamiliesModule: '@math-platform/math-content/problem-families/im2',
  },
  im3: {
    draftNodesPath: path.join(REPO_ROOT, 'apps/integrated-math-3/curriculum/skill-graph/draft-nodes.json'),
    outputPath: path.join(REPO_ROOT, 'apps/integrated-math-3/curriculum/skill-graph/standard-edges.json'),
    standardsPaths: [path.join(REPO_ROOT, 'apps/integrated-math-3/convex/seed/seed_standards.ts')],
    lessonStandardsDir: path.join(REPO_ROOT, 'apps/integrated-math-3/convex/seed'),
    lessonStandardsGlob: 'seed_lesson_standards.ts',
    problemFamiliesModule: '@math-platform/math-content/problem-families/im3',
  },
  precalc: {
    draftNodesPath: path.join(REPO_ROOT, 'apps/pre-calculus/curriculum/skill-graph/draft-nodes.json'),
    outputPath: path.join(REPO_ROOT, 'apps/pre-calculus/curriculum/skill-graph/standard-edges.json'),
    standardsPaths: [path.join(REPO_ROOT, 'apps/pre-calculus/convex/seed/seed_standards.ts')],
    lessonStandardsDir: path.join(REPO_ROOT, 'apps/pre-calculus/convex/seed'),
    lessonStandardsGlob: 'seed_lesson_standards.ts',
    problemFamiliesModule: '@math-platform/math-content/problem-families/precalc',
    cedTopicsPath: path.join(REPO_ROOT, 'apps/pre-calculus/curriculum/source/college-board/ced-topic-index.json'),
  },
};

// ---------------------------------------------------------------------------
// Standard code parsing
// ---------------------------------------------------------------------------

type RawStandard = { code: string; description: string; category?: string; studentFriendlyDescription?: string; isActive?: boolean };

function extractStandardsFromTs(filePath: string): RawStandard[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const standards: RawStandard[] = [];

// Extract { code: "...", description: "...", ... } objects from TS files
  // Allow multi-line content between code and closing brace
  const objectPattern = /code:\s*"([^"]+)"[^]*?description:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  const seenCodes = new Set<string>();
  while ((match = objectPattern.exec(content)) !== null) {
    const code = match[1];
    const description = match[2];
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);
    // Extract category if present
    const catMatch = match[0].match(/category:\s*"([^"]+)"/);
    const category = catMatch ? catMatch[1] : undefined;
    // Extract studentFriendlyDescription if present
    const sfdMatch = match[0].match(/studentFriendlyDescription:\s*"([^"]+)"/);
    const studentFriendlyDescription = sfdMatch ? sfdMatch[1] : undefined;
    // Extract isActive if present
    const isActiveMatch = match[0].match(/isActive:\s*(true|false)/);
    const isActive = isActiveMatch ? isActiveMatch![1] === 'true' : undefined;

    standards.push({ code, description, category, studentFriendlyDescription, isActive });
  }

  return standards;
}

function extractLessonStandardsFromTs(filePath: string): Array<{ lessonSlug: string; standardCode: string; isPrimary: boolean }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links: Array<{ lessonSlug: string; standardCode: string; isPrimary: boolean }> = [];

  // Match patterns like { lessonSlug: "...", standardCode: "...", isPrimary: true/false }
  // Allow multi-line and various spacing
  const linkPattern = /lessonSlug:\s*"([^"]+)"[^}]*?standardCode:\s*"([^"]+)"[^}]*?isPrimary:\s*(true|false)/g;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(content)) !== null) {
    links.push({
      lessonSlug: match[1],
      standardCode: match[2],
      isPrimary: match[3] === 'true',
    });
  }

  return links;
}

function loadProblemFamilies(course: string): FamilyObjectiveMapping[] {
  // For IM2, IM3, and PreCalc, we can load from the package
  // For IM1, there are no problem families
  if (course === 'im1') return [];

  try {
    let families: Array<{ problemFamilyId: string; componentKey: string; displayName: string; description: string; objectiveIds: string[]; difficulty: string; metadata: Record<string, unknown> }>;
    switch (course) {
      case 'im2':
        // Dynamic import would be complex in a script; instead parse directly
        return loadProblemFamiliesFromFiles(course);
      case 'im3':
        return loadProblemFamiliesFromFiles(course);
      case 'precalc':
        return loadProblemFamiliesFromFiles(course);
      default:
        return [];
    }
  } catch {
    return [];
  }
}

function loadProblemFamiliesFromFiles(course: string): FamilyObjectiveMapping[] {
  const mappings: FamilyObjectiveMapping[] = [];
  const basePath = path.join(REPO_ROOT, `packages/math-content/src/problem-families/${course === 'precalc' ? 'precalc' : course}`);

  if (!fs.existsSync(basePath)) return [];

  const files = fs.readdirSync(basePath).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  for (const file of files) {
    const content = fs.readFileSync(path.join(basePath, file), 'utf-8');
    // Extract objectiveIds arrays from family objects
    // Problem family objects can be multi-line; extract each family's key fields
    const familyPattern = /problemFamilyId:\s*"([^"]+)"[^}]*?objectiveIds:\s*\[([^\]]*)\][^}]*?metadata:\s*\{[^}]*?module:\s*(\d+)[^}]*?\}/gs;
    let match: RegExpExecArray | null;
    while ((match = familyPattern.exec(content)) !== null) {
      const familyId = match[1];
      const objectiveIdsRaw = match[2];
      const module = match[3];
      // Parse objective IDs
      const objectiveIds = objectiveIdsRaw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) ?? [];
      // Extract lesson from metadata if available
      const lessonMatch = match[0].match(/lesson:\s*(\d+)/);
      const lesson = lessonMatch ? lessonMatch[1] : '1';

      mappings.push({
        familyId,
        module,
        lesson,
        objectiveIds,
      });
    }
  }

  return mappings;
}

function loadCEDTopics(): CEDTopicMapping[] {
  const cedPath = COURSE_CONFIGS.precalc.cedTopicsPath;
  if (!cedPath || !fs.existsSync(cedPath)) return [];

  const cedData = JSON.parse(fs.readFileSync(cedPath, 'utf-8'));
  const mappings: CEDTopicMapping[] = [];

  // CED topic format: { units: [{ topics: [{ id: "1.1", title: "..." }] }] }
  // We need to map CED topics to lesson slugs and standard codes
  // This requires reading the PreCalc lesson-standards too
  const lessonStandards = loadLessonStandards('precalc');

  if (cedData.units) {
    for (const unit of cedData.units) {
      if (unit.topics) {
        for (const topic of unit.topics) {
          const unitNum = topic.id.split('.')[0];
          const lessonNum = topic.id.split('.')[1];
          const slug = `${unitNum}-${lessonNum}`;

          // Find matching lesson standards for this CED topic
          const matchingStandards = lessonStandards
            .filter(ls => ls.lessonSlug.startsWith(slug + '-'))
            .map(ls => ls.standardCode);

          // Deduplicate
          const uniqueStandards = [...new Set(matchingStandards)];

          if (uniqueStandards.length > 0) {
            mappings.push({
              lessonSlug: slug,
              cedTopic: topic.id,
              standardCodes: uniqueStandards,
            });
          }
        }
      }
    }
  }

  return mappings;
}

// ---------------------------------------------------------------------------
// Load helpers
// ---------------------------------------------------------------------------

function loadDraftNodes(course: string): KnowledgeSpaceNode[] {
  const config = COURSE_CONFIGS[course];
  if (!config) throw new Error(`Unknown course: ${course}`);

  const raw = fs.readFileSync(config.draftNodesPath, 'utf-8');
  const data = JSON.parse(raw);
  return data.nodes ?? [];
}

function loadStandardDefinitions(course: string): StandardDefinition[] {
  const config = COURSE_CONFIGS[course];
  if (!config) throw new Error(`Unknown course: ${course}`);

  const standards: StandardDefinition[] = [];

  for (const filePath of config.standardsPaths) {
    if (!fs.existsSync(filePath)) continue;
    const raw = extractStandardsFromTs(filePath);
    for (const s of raw) {
      standards.push({
        code: s.code,
        description: s.description,
        authority: 'ccss',
        category: s.category,
        studentFriendlyDescription: s.studentFriendlyDescription,
        isActive: s.isActive,
      });
    }
  }

  return standards;
}

function loadLessonStandards(course: string): LessonStandardMapping[] {
  const config = COURSE_CONFIGS[course];
  if (!config) throw new Error(`Unknown course: ${course}`);

  const allLinks: LessonStandardMapping[] = [];

  // For courses with per-module files, we need to glob
  const dir = config.lessonStandardsDir;
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => {
    if (course === 'im1' || course === 'im2') {
      return f.startsWith('seed_' + course + '_module_') && f.endsWith('_standards.ts');
    }
    return f === config.lessonStandardsGlob;
  });

  for (const file of files) {
    const filePath = path.join(dir, file);
    const links = extractLessonStandardsFromTs(filePath);
    allLinks.push(...links);
  }

  return allLinks;
}

// ---------------------------------------------------------------------------
// Main alignment generation
// ---------------------------------------------------------------------------

function generateAlignment(course: string): AlignmentResult & { standardNodes: KnowledgeSpaceNode[] } {
  const nodes = loadDraftNodes(course);
  const standardDefinitions = loadStandardDefinitions(course);
  const lessonStandards = loadLessonStandards(course);
  const familyObjectives = loadProblemFamilies(course);
  const cedTopics = course === 'precalc' ? loadCEDTopics() : [];

  const skillNodes = nodes.filter(n => n.kind === 'skill');
  const exampleNodes = nodes.filter(n => n.kind === 'worked_example');
  const conceptNodes = nodes.filter(n => n.kind === 'concept');

  // Only align skills, worked_examples, and task_blueprints (concepts optional)
  const alignableNodes = nodes.filter(n =>
    n.kind === 'skill' || n.kind === 'worked_example' || n.kind === 'task_blueprint'
  );

  if (alignableNodes.length === 0) {
    console.log(`  ⚠ No alignable nodes found for ${course}. Skipping.`);
    return {
      edges: [],
      standardNodes: [],
      exceptions: [{ skillId: `${course}-none`, reason: 'No skill or worked_example nodes found in draft inventory' }],
      missingStandards: [],
      reviewQueue: [],
    };
  }

  console.log(`  Aligning ${alignableNodes.length} nodes (${skillNodes.length} skills, ${exampleNodes.length} examples) for ${course}...`);

  const result = alignSkillsToStandards({
    nodes: alignableNodes,
    lessonStandards,
    standardDefinitions,
    familyObjectives,
    course,
    cedTopics,
  });

  const highCount = result.edges.filter(e => e.confidence === 'high').length;
  const medCount = result.edges.filter(e => e.confidence === 'medium').length;
  const lowCount = result.edges.filter(e => e.confidence === 'low').length;

  console.log(`  Generated ${result.edges.length} edges (high: ${highCount}, medium: ${medCount}, low: ${lowCount})`);
  console.log(`  ${result.exceptions.length} exceptions (no alignment found)`);
  console.log(`  ${result.missingStandards.length} missing standard definitions`);
  console.log(`  ${result.reviewQueue.length} items in review queue`);

  return result;
}

function writeOutput(course: string, result: AlignmentResult & { standardNodes: KnowledgeSpaceNode[] }): void {
  const config = COURSE_CONFIGS[course];
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Combine draft nodes (from T3) with new standard nodes and edges
  const draftNodes = loadDraftNodes(course);
  const allNodes = [...draftNodes, ...result.standardNodes];

  // Validate
  const graph = { nodes: allNodes, edges: result.edges };
  const validation = validateKnowledgeSpace(graph);
  if (!validation.valid) {
    console.error(`  ❌ Validation errors for ${course}:`);
    for (const error of validation.errors.slice(0, 10)) {
      console.error(`    ${error.code}: ${error.message}`);
    }
    if (validation.errors.length > 10) {
      console.error(`    ... and ${validation.errors.length - 10} more`);
    }
  } else {
    console.log(`  ✓ Validation passed`);
  }

  // Write standard-edges.json
  const output = {
    nodes: allNodes,
    edges: result.edges,
    metadata: {
      course,
      generatedAt: new Date().toISOString(),
      alignmentStats: {
        totalEdges: result.edges.length,
        highConfidence: result.edges.filter(e => e.confidence === 'high').length,
        mediumConfidence: result.edges.filter(e => e.confidence === 'medium').length,
        lowConfidence: result.edges.filter(e => e.confidence === 'low').length,
        exceptions: result.exceptions.length,
        missingStandards: result.missingStandards.length,
        reviewQueue: result.reviewQueue.length,
      },
    },
  };

  fs.writeFileSync(config.outputPath, JSON.stringify(output, null, 2));

  // Write review queue
  const reviewQueuePath = path.join(outputDir, 'standards-review-queue.json');
  fs.writeFileSync(reviewQueuePath, JSON.stringify(result.reviewQueue, null, 2));

  console.log(`  Written: ${config.outputPath}`);
  console.log(`  Written: ${reviewQueuePath}`);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isAll = args.includes('--all');
const isAuditOnly = args.includes('--audit-only');
const courseArg = args.find(a => a.startsWith('--course='))?.split('=')[1];

let courses: string[];
if (isAll) {
  courses = ['im1', 'im2', 'im3', 'precalc'];
} else if (courseArg) {
  courses = [courseArg];
} else {
  console.error('Usage: npx tsx scripts/align-standards.ts --all | --course=<im1|im2|im3|precalc> [--audit-only]');
  process.exit(1);
}

console.log('=== Standards Alignment Generator ===\n');

const auditResults: Array<{
  course: string;
  totalSkills: number;
  totalExamples: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  exceptions: number;
  missingStandards: number;
  reviewQueue: number;
}> = [];

for (const course of courses) {
  console.log(`\n--- Processing ${course} ---`);

  if (!fs.existsSync(COURSE_CONFIGS[course].draftNodesPath)) {
    console.log(`  ⚠ No draft-nodes.json found for ${course}. Skipping.`);
    auditResults.push({
      course,
      totalSkills: 0,
      totalExamples: 0,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      exceptions: 0,
      missingStandards: 0,
      reviewQueue: 0,
    });
    continue;
  }

  const result = generateAlignment(course);

  if (!isAuditOnly) {
    writeOutput(course, result);
  }

  const nodes = loadDraftNodes(course);
  auditResults.push({
    course,
    totalSkills: nodes.filter(n => n.kind === 'skill').length,
    totalExamples: nodes.filter(n => n.kind === 'worked_example').length,
    highConfidence: result.edges.filter(e => e.confidence === 'high').length,
    mediumConfidence: result.edges.filter(e => e.confidence === 'medium').length,
    lowConfidence: result.edges.filter(e => e.confidence === 'low').length,
    exceptions: result.exceptions.length,
    missingStandards: result.missingStandards.length,
    reviewQueue: result.reviewQueue.length,
  });

  // Print exceptions
  if (result.exceptions.length > 0 && result.exceptions.length <= 20) {
    console.log(`\n  Exceptions:`);
    for (const ex of result.exceptions) {
      console.log(`    - ${ex.skillId}: ${ex.reason}`);
    }
  } else if (result.exceptions.length > 20) {
    console.log(`\n  Exceptions (showing first 10 of ${result.exceptions.length}):`);
    for (const ex of result.exceptions.slice(0, 10)) {
      console.log(`    - ${ex.skillId}: ${ex.reason}`);
    }
  }

  // Print missing standards
  if (result.missingStandards.length > 0) {
    console.log(`\n  Missing standards:`);
    for (const ms of result.missingStandards) {
      console.log(`    - ${ms.code}: referenced in ${ms.referencedInLessonStandards.length} lesson(s), ${ms.referencedInFamilyObjectives.length} family/families`);
    }
  }
}

// ---------------------------------------------------------------------------
// Audit report
// ---------------------------------------------------------------------------

const auditPath = path.join(REPO_ROOT, 'measure/skill-graph-standards-audit.md');
let auditContent = `# Skill Graph Standards Alignment Audit\n\n`;
auditContent += `Generated: ${new Date().toISOString()}\n\n`;
auditContent += `| Course | Skills | Worked Examples | High Conf | Medium Conf | Low Conf | Exceptions | Missing Stds | Review Queue |\n`;
auditContent += `|--------|--------|-----------------|-----------|-------------|----------|------------|--------------|---------------|\n`;

for (const r of auditResults) {
  auditContent += `| ${r.course} | ${r.totalSkills} | ${r.totalExamples} | ${r.highConfidence} | ${r.mediumConfidence} | ${r.lowConfidence} | ${r.exceptions} | ${r.missingStandards} | ${r.reviewQueue} |\n`;
}

auditContent += `\n## Acceptance Criteria Status\n\n`;
auditContent += `- [ ] Standard node inventories exist or are referenced for each course\n`;
auditContent += `- [ ] Every skill has at least one standard edge or exception\n`;
auditContent += `- [ ] Low-confidence mappings are listed in a review queue\n`;
auditContent += `- [ ] Missing standards are listed in an audit report\n`;
auditContent += `- [ ] Existing lesson-level mappings remain intact\n`;
auditContent += `- [ ] Validation catches dangling standard IDs and missing skill IDs\n`;

if (!fs.existsSync(path.dirname(auditPath))) {
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
}
fs.writeFileSync(auditPath, auditContent);
console.log(`\nWritten audit report: ${auditPath}`);

console.log('\n=== Done ===');