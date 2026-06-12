// Inventory assembler: converts parsed curriculum data into
// KnowledgeSpace nodes using math domain adapter ID constructors.

import {
  buildCourseId,
  buildModuleId,
  buildLessonId,
  buildWorkedExampleId,
  buildSkillId,
} from '../ids';
import type { MathCourse } from '../ids';
import type { KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import type {
  ModuleOverviewExtract,
  ClassPeriodPlanExtract,
  AleksRegistryExtract,
  ExtractedLesson,
  ExtractedObjective,
  ExtractedWorkedExample,
} from './parser';

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface InventoryAssemblerInput {
  course: MathCourse;
  moduleOverview: ModuleOverviewExtract;
  classPeriodPlan?: ClassPeriodPlanExtract;
  aleksRegistry?: AleksRegistryExtract;
  sourceFile: string;
}

// ---------------------------------------------------------------------------
// Slug derivation
// ---------------------------------------------------------------------------

/**
 * Convert text to a URL-friendly slug.
 * @param text - Input text to slugify
 * @returns Lowercase slug with hyphens
 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Sanitize a string for use as a knowledge-space ID segment.
 * @param s - Raw string to sanitize
 * @returns Lowercase alphanumeric-hyphen string, max 64 chars
 */
function sanitizeIdSegment(s: string): string {
  // Converts a string to a valid knowledge-space ID segment
  // Valid segment: starts with [a-z0-9], contains only [a-z0-9-]
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

/**
 * Derive a skill slug from an objective description.
 * @param objective - Objective text to convert
 * @returns Slug string, max 60 characters
 */
function deriveSkillSlug(objective: string): string {
  // "Graph quadratic functions" → "graph-quadratic-functions"
  return toSlug(objective).slice(0, 60);
}

/**
 * Pad a number to two digits with leading zeros.
 * @param n - Number to pad
 * @returns Zero-padded string
 */
function padNum(n: number): string {
  return String(n).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

/**
 * Assemble a draft inventory of knowledge-space nodes from parsed curriculum data.
 * @param input - Assembler input with course, module overview, and optional sources
 * @returns Array of knowledge-space nodes sorted by ID
 */
export function assembleDraftInventory(
  input: InventoryAssemblerInput,
): KnowledgeSpaceNode[] {
  const { course, moduleOverview, classPeriodPlan, aleksRegistry, sourceFile } = input;
  const { moduleNumber, title: overviewTitle, description: moduleDesc } = moduleOverview;
  const moduleTitle = overviewTitle || `Module ${moduleNumber}`;
  const domain = `math.${course}`;
  const moduleStr = String(moduleNumber);
  const sourceRef = `${sourceFile}`;

  const nodes: KnowledgeSpaceNode[] = [];

  // 1. Course node
  nodes.push({
    id: buildCourseId(course),
    kind: 'domain',
    title: courseName(course),
    domain,
    description: moduleDesc,
    sourceRefs: [sourceRef],
    reviewStatus: 'draft',
    metadata: { course },
  });

  // 2. Module node
  nodes.push({
    id: buildModuleId(course, moduleStr),
    kind: 'content_group',
    title: moduleTitle,
    domain,
    description: moduleDesc,
    sourceRefs: [sourceRef],
    reviewStatus: 'draft',
    metadata: { course, module: moduleStr },
  });

  // 3. Lesson nodes (from module overview)
  const lessonMap = new Map<string, { title: string; description: string }>();
  for (const lesson of moduleOverview.lessons) {
    lessonMap.set(
      `${lesson.number}-${lesson.lessonNumber}`,
      { title: lesson.title, description: lesson.description },
    );
  }

  // Also add lessons from class period plan
  if (classPeriodPlan) {
    for (const lesson of classPeriodPlan.lessons) {
      if (!lessonMap.has(lesson.lessonRef)) {
        lessonMap.set(lesson.lessonRef, {
          title: `Lesson ${lesson.lessonRef}`,
          description: '',
        });
      }
    }
  }

  for (const [lessonRef, info] of lessonMap) {
    const [modPart, lessonPart] = lessonRef.split('-').map(sanitizeIdSegment);
    nodes.push({
      id: buildLessonId(course, modPart, lessonPart),
      kind: 'instructional_unit',
      title: info.title,
      domain,
      description: info.description || undefined,
      sourceRefs: [sourceRef],
      reviewStatus: 'draft',
      metadata: { course, module: modPart, lesson: lessonPart },
    });
  }

  // 4. Worked example nodes + Skill nodes (from class period plan)
  const skillSlugSet = new Set<string>();
  if (classPeriodPlan) {
    let globalExampleIdx = 0;

    for (const lesson of classPeriodPlan.lessons) {
      const [mod, les] = lesson.lessonRef.split('-').map(sanitizeIdSegment);

      // Skill nodes from objectives
      for (const objective of lesson.objectives) {
        // Skip objectives without descriptions (embedded-only objectives)
        if (!objective.description) continue;
        const rawSlug = deriveSkillSlug(objective.description);
        const baseSlug = sanitizeIdSegment(rawSlug) || sanitizeIdSegment(objective.code);
        if (!baseSlug) continue;
        const slug = disambiguate(baseSlug, skillSlugSet);
        skillSlugSet.add(slug);

        nodes.push({
          id: buildSkillId(course, mod, les, slug),
          kind: 'skill',
          title: `${objective.code}: ${objective.description}`,
          domain,
          description: objective.description,
          sourceRefs: [sourceRef],
          reviewStatus: 'draft',
          metadata: { course, module: mod, lesson: les },
        });
      }

      // Worked example nodes
      for (const example of lesson.examples) {
        for (const num of example.exampleNumbers) {
          globalExampleIdx++;
          const idxStr = String(globalExampleIdx).padStart(3, '0');
          nodes.push({
            id: buildWorkedExampleId(course, mod, les, idxStr),
            kind: 'worked_example',
            title: example.title
              ? `Example ${num}: ${example.title}`
              : `Example ${num}`,
            domain,
            sourceRefs: [
              `${sourceFile} (${lesson.lessonRef}, Example ${num})`,
            ],
            reviewStatus: 'draft',
            metadata: {
              course,
              module: mod,
              lesson: les,
              exampleNumber: num,
              sourceLesson: lesson.lessonRef,
              rawText: example.rawText,
            },
          });
        }
      }
    }
  }

  // 5. Concept/problem-family nodes (from ALEKS registry)
  if (aleksRegistry) {
    for (const family of aleksRegistry.families) {
        nodes.push({
          id: buildSkillId(
            course,
            String(family.module),
            'aleks',
            sanitizeIdSegment(family.familyKey),
          ),
        kind: 'concept',
        title: family.familyKey,
        domain,
        description: family.notes || undefined,
        sourceRefs: [sourceRef],
        reviewStatus: 'draft',
        metadata: {
          course,
          module: String(family.module),
          source: 'aleks-registry',
          familyKey: family.familyKey,
          objectives: family.objectives,
          sourceExamples: family.sourceExamples,
          interactionShape: family.interactionShape,
          status: family.status,
        },
      });
    }
  }

  // Sort nodes deterministically by id
  nodes.sort((a, b) => a.id.localeCompare(b.id));

  return nodes;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the display name for a math course.
 * @param course - Math course identifier
 * @returns Human-readable course name
 */
function courseName(course: MathCourse): string {
  const names: Record<MathCourse, string> = {
    im1: 'Integrated Math 1',
    im2: 'Integrated Math 2',
    im3: 'Integrated Math 3',
    precalc: 'AP Precalculus',
  };
  return names[course] || course;
}

/**
 * Append a numeric suffix to a base string if it already exists in the used set.
 * @param base - The desired string
 * @param used - Set of already-used strings
 * @returns A unique string, possibly with a numeric suffix
 */
function disambiguate(base: string, used: Set<string>): string {
  if (!used.has(base)) return base;
  let counter = 2;
  let candidate = `${base}-${counter}`;
  while (used.has(candidate)) {
    counter++;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}
