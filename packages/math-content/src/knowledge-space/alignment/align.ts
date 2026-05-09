// Standards alignment: generate aligned_to_standard edges from
// lesson-standard mappings, problem-family objectives, and CED topics.
//
// Confidence rules:
//   high   — exact lesson-standard mapping directly supports the skill
//   medium — family/objective or CED topic mapping, but skill is narrower than lesson scope
//   low    — heuristic or title-derived mapping requiring human review

import type {
  KnowledgeSpaceNode,
  KnowledgeSpaceEdge,
  ConfidenceLevel,
  ReviewStatus,
  SourceRef,
} from '@math-platform/knowledge-space-core';
import { buildStandardId } from '../ids';
import type {
  StandardDefinition,
  LessonStandardMapping,
  FamilyObjectiveMapping,
  CEDTopicMapping,
} from './load-standards';
import { buildLessonSlug } from './load-standards';

export interface AlignmentInput {
  nodes: KnowledgeSpaceNode[];
  lessonStandards: LessonStandardMapping[];
  standardDefinitions: StandardDefinition[];
  familyObjectives: FamilyObjectiveMapping[];
  course: string;
  cedTopics?: CEDTopicMapping[];
}

export interface AlignmentException {
  skillId: string;
  reason: string;
}

export interface MissingStandard {
  code: string;
  authority: string;
  referencedInLessonStandards: string[];
  referencedInFamilyObjectives: string[];
}

export interface ReviewQueueItem {
  skillId: string;
  standardId: string;
  standardCode: string;
  confidence: ConfidenceLevel;
  rationale: string;
  sources: string[];
}

export interface AlignmentResult {
  edges: KnowledgeSpaceEdge[];
  standardNodes: KnowledgeSpaceNode[];
  exceptions: AlignmentException[];
  missingStandards: MissingStandard[];
  reviewQueue: ReviewQueueItem[];
}

interface AlignmentCandidate {
  sourceId: string;
  targetId: string;
  confidence: ConfidenceLevel;
  weight: number;
  sourceRefs: Array<SourceRef | string>;
  rationale: string;
  isPrimary: boolean;
}

const ALIGNABLE_KINDS = new Set(['skill', 'worked_example', 'task_blueprint']);

const CONFIDENCE_PRIORITY: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function standardCodeToNodeId(code: string, authority: string = 'ccss'): string {
  return buildStandardId(authority, code.toLowerCase().replace(/\./g, '-'));
}

function standardCodeFromNodeId(nodeId: string): string {
  // math.standard.ccs.hsa-sse-b-3 → HSA-SSE.B.3 (reconstructed)
  const parts = nodeId.replace(/^math\.standard\./, '');
  return parts || nodeId;
}

function buildAlignmentEdgeId(sourceId: string, targetId: string): string {
  const sourceKey = sourceId.replace(/^math\./, '').replace(/\./g, '-');
  const targetKey = targetId.replace(/^math\.standard\./, '').replace(/\./g, '-');
  return `math.alignment.${sourceKey}-to-${targetKey}`;
}

function buildStandardNode(def: StandardDefinition): KnowledgeSpaceNode {
  const id = standardCodeToNodeId(def.code, def.authority);
  return {
    id,
    kind: 'standard',
    title: `${def.code}: ${def.description}`,
    domain: 'math',
    description: def.description,
    sourceRefs: [{ source: `seed-standards:${def.authority}`, note: def.code }],
    reviewStatus: 'reviewed' as ReviewStatus,
    metadata: {
      framework: def.authority,
      code: def.code,
      ...(def.category ? { category: def.category } : {}),
      ...(def.studentFriendlyDescription ? { studentFriendlyDescription: def.studentFriendlyDescription } : {}),
    },
  };
}

function buildPlaceholderStandardNode(code: string, authority: string = 'ccss'): KnowledgeSpaceNode {
  const id = standardCodeToNodeId(code, authority);
  return {
    id,
    kind: 'standard',
    title: `${code} (placeholder)`,
    domain: 'math',
    description: `Standard ${code} — definition not yet available in seed data`,
    sourceRefs: [{ source: 'lesson-standards-inference', note: `Inferred from lesson-standard references; no definition in seed_standards.ts` }],
    derived: true,
    derivationMethod: 'standards-alignment-inference',
    reviewStatus: 'draft' as ReviewStatus,
    metadata: {
      framework: authority,
      code,
      isPlaceholder: true,
    },
  };
}

function getLessonSlugsForNode(node: KnowledgeSpaceNode, course: string): string[] {
  const module = String(node.metadata.module ?? '');
  const lesson = String(node.metadata.lesson ?? '');
  if (!module || !lesson) return [];

  const slugs: string[] = [];
  // IM1/IM2/IM3 format: module-X-lesson-Y
  slugs.push(`module-${module}-lesson-${lesson}`);
  // PreCalc format: X-Y
  if (course === 'precalc') {
    slugs.push(`${module}-${lesson}`);
  }
  // Also try just the bare lesson number format
  slugs.push(`${module}-${lesson}`);
  return slugs;
}

function skillKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'can', 'using', 'from', 'with', 'that', 'this',
  'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'will',
  'would', 'could', 'should', 'into', 'over', 'also', 'about', 'their',
  'through', 'which', 'what', 'when', 'where', 'how', 'each', 'more',
]);

export function alignSkillsToStandards(input: AlignmentInput): AlignmentResult {
  const {
    nodes,
    lessonStandards,
    standardDefinitions,
    familyObjectives,
    course,
    cedTopics = [],
  } = input;

  const alignableNodes = nodes.filter(n => ALIGNABLE_KINDS.has(n.kind));
  const standardDefsMap = new Map(standardDefinitions.map(s => [s.code, s]));
  const standardNodesMap = new Map<string, KnowledgeSpaceNode>();
  const lessonStandardsBySlug = new Map<string, LessonStandardMapping[]>();
  const familyObjectivesByModuleLesson = new Map<string, FamilyObjectiveMapping[]>();
  const cedTopicsBySlug = new Map<string, CEDTopicMapping[]>();

  // Index lesson standards by slug
  for (const ls of lessonStandards) {
    const list = lessonStandardsBySlug.get(ls.lessonSlug) ?? [];
    list.push(ls);
    lessonStandardsBySlug.set(ls.lessonSlug, list);
  }

  // Index family objectives by module.lesson key
  for (const fo of familyObjectives) {
    const key = `${fo.module}.${fo.lesson}`;
    const list = familyObjectivesByModuleLesson.get(key) ?? [];
    list.push(fo);
    familyObjectivesByModuleLesson.set(key, list);
  }

  // Index CED topics by slug
  for (const ct of cedTopics) {
    const list = cedTopicsBySlug.get(ct.lessonSlug) ?? [];
    list.push(ct);
    cedTopicsBySlug.set(ct.lessonSlug, list);
  }

  const allEdges: KnowledgeSpaceEdge[] = [];
  const exceptions: AlignmentException[] = [];
  const missingStandardsMap = new Map<string, MissingStandard>();
  const reviewQueue: ReviewQueueItem[] = [];

  for (const node of alignableNodes) {
    const nodeModule = String(node.metadata.module ?? '');
    const nodeLesson = String(node.metadata.lesson ?? '');
    const lessonKey = `${nodeModule}.${nodeLesson}`;

    // Collect all candidates for this node, keyed by target standard ID
    const nodeCandidates = new Map<string, AlignmentCandidate>();

    // Helper: register a candidate, merging confidence if higher
    const addCandidate = (candidate: AlignmentCandidate) => {
      const existing = nodeCandidates.get(candidate.targetId);
      if (!existing) {
        nodeCandidates.set(candidate.targetId, candidate);
      } else {
        // Upgrade confidence if higher
        if (CONFIDENCE_PRIORITY[candidate.confidence] > CONFIDENCE_PRIORITY[existing.confidence]) {
          existing.confidence = candidate.confidence;
        }
        // Merge source refs
        existing.sourceRefs = [...existing.sourceRefs, ...candidate.sourceRefs];
        // Merge rationale
        if (!existing.rationale.includes(candidate.rationale)) {
          existing.rationale = `${existing.rationale}; ${candidate.rationale}`;
        }
        // Upgrade isPrimary
        if (candidate.isPrimary) existing.isPrimary = true;
        // Take higher weight
        existing.weight = Math.max(existing.weight, candidate.weight);
      }
    };

    const recordMissingStandard = (code: string, source: 'lesson' | 'family', ref: string) => {
      const existing = missingStandardsMap.get(code);
      if (!existing) {
        missingStandardsMap.set(code, {
          code,
          authority: 'ccss',
          referencedInLessonStandards: source === 'lesson' ? [ref] : [],
          referencedInFamilyObjectives: source === 'family' ? [ref] : [],
        });
      } else {
        if (source === 'lesson' && !existing.referencedInLessonStandards.includes(ref)) {
          existing.referencedInLessonStandards.push(ref);
        }
        if (source === 'family' && !existing.referencedInFamilyObjectives.includes(ref)) {
          existing.referencedInFamilyObjectives.push(ref);
        }
      }
    };

    // Strategy 1: Exact lesson-standard mapping (high confidence)
    const lessonSlugs = getLessonSlugsForNode(node, course);
    for (const slug of lessonSlugs) {
      const entries = lessonStandardsBySlug.get(slug) ?? [];
      for (const entry of entries) {
        const stdId = standardCodeToNodeId(entry.standardCode);
        const stdDef = standardDefsMap.get(entry.standardCode);
        const weight = entry.isPrimary ? 0.8 : 0.5;
        addCandidate({
          sourceId: node.id,
          targetId: stdId,
          confidence: 'high',
          weight,
          sourceRefs: [{ source: 'lesson-standards', location: slug, note: `Mapped via lesson standard${entry.isPrimary ? ' (primary)' : ''}` }],
          rationale: `Aligned via lesson standard mapping for ${slug}`,
          isPrimary: entry.isPrimary,
        });

        if (stdDef) {
          const stdNode = buildStandardNode(stdDef);
          standardNodesMap.set(stdId, stdNode);
        } else {
          const stdNode = buildPlaceholderStandardNode(entry.standardCode);
          standardNodesMap.set(stdId, stdNode);
          recordMissingStandard(entry.standardCode, 'lesson', slug);
        }
      }
    }

    // Strategy 2: Problem-family objective IDs (medium confidence)
    const familyEntries = familyObjectivesByModuleLesson.get(lessonKey) ?? [];
    for (const family of familyEntries) {
      const nodeInFamily = !family.skillIds || family.skillIds.length === 0
        ? true
        : family.skillIds.includes(node.id);
      if (!nodeInFamily) continue;

      for (const objId of family.objectiveIds) {
        const stdId = standardCodeToNodeId(objId);
        const stdDef = standardDefsMap.get(objId);
        addCandidate({
          sourceId: node.id,
          targetId: stdId,
          confidence: 'medium',
          weight: 0.4,
          sourceRefs: [`family-objective:${family.familyId}`],
          rationale: `Aligned via problem family ${family.familyId} objective`,
          isPrimary: false,
        });

        if (stdDef) {
          const stdNode = buildStandardNode(stdDef);
          standardNodesMap.set(stdId, stdNode);
        } else {
          recordMissingStandard(objId, 'family', family.familyId);
        }
      }
    }

    // Strategy 3: CED topic alignment for PreCalc (high confidence with CED source)
    if (course === 'precalc') {
      for (const slug of lessonSlugs) {
        const cedEntries = cedTopicsBySlug.get(slug) ?? [];
        for (const ced of cedEntries) {
          for (const stdCode of ced.standardCodes) {
            const stdId = standardCodeToNodeId(stdCode);
            const stdDef = standardDefsMap.get(stdCode);
            addCandidate({
              sourceId: node.id,
              targetId: stdId,
              confidence: 'high',
              weight: 0.7,
              sourceRefs: [{ source: `CED:${ced.cedTopic}`, location: slug }],
              rationale: `Aligned via CED topic ${ced.cedTopic}`,
              isPrimary: false,
            });

            if (stdDef) {
              const stdNode = buildStandardNode(stdDef);
              standardNodesMap.set(stdId, stdNode);
            } else {
              const stdNode = buildPlaceholderStandardNode(stdCode);
              standardNodesMap.set(stdId, stdNode);
            }
          }
        }
      }
    }

    // Strategy 4: Heuristic — title keyword overlap (low confidence)
    if (nodeCandidates.size === 0) {
      const slugPart = node.id.split('.').pop() ?? '';
      const nodeKeywords = skillKeywords(slugPart + ' ' + (node.title ?? ''));

      for (const stdDef of standardDefinitions) {
        const stdId = standardCodeToNodeId(stdDef.code);
        const stdKeywords = skillKeywords(stdDef.description + ' ' + stdDef.code);
        const overlap = nodeKeywords.filter(k => stdKeywords.includes(k));
        if (overlap.length >= 2) {
          addCandidate({
            sourceId: node.id,
            targetId: stdId,
            confidence: 'low',
            weight: 0.2,
            sourceRefs: ['heuristic:title-keyword-overlap'],
            rationale: `Heuristic alignment based on keyword overlap: ${overlap.join(', ')}`,
            isPrimary: false,
          });
          const stdNode = buildStandardNode(stdDef);
          standardNodesMap.set(stdId, stdNode);
        }
      }
    }

    // Still no alignment? Also try lesson-slug fuzzy fallback
    if (nodeCandidates.size === 0 && nodeModule && nodeLesson) {
      for (const [slug, entries] of lessonStandardsBySlug.entries()) {
        const isMatch = slug.includes(`${nodeModule}-${nodeLesson}`) ||
                        slug === `module-${nodeModule}-lesson-${nodeLesson}`;
        if (!isMatch) continue;

        for (const entry of entries) {
          const stdId = standardCodeToNodeId(entry.standardCode);
          const stdDef = standardDefsMap.get(entry.standardCode);
          addCandidate({
            sourceId: node.id,
            targetId: stdId,
            confidence: 'low',
            weight: 0.3,
            sourceRefs: [{ source: 'heuristic:lesson-slug-fuzzy', location: slug }],
            rationale: `Heuristic alignment via matched lesson slug ${slug}`,
            isPrimary: entry.isPrimary,
          });

          if (stdDef) {
            const stdNode = buildStandardNode(stdDef);
            standardNodesMap.set(stdId, stdNode);
          } else {
            recordMissingStandard(entry.standardCode, 'lesson', slug);
          }
        }
      }
    }

    // Record exception if no alignment found
    if (nodeCandidates.size === 0) {
      exceptions.push({
        skillId: node.id,
        reason: `No standard alignment found for ${node.kind} in ${course} module ${nodeModule} lesson ${nodeLesson}`,
      });
    }

    // Collect review queue items for low/medium confidence
    for (const [, candidate] of nodeCandidates.entries()) {
      if (candidate.confidence === 'low') {
        reviewQueue.push({
          skillId: candidate.sourceId,
          standardId: candidate.targetId,
          standardCode: standardCodeFromNodeId(candidate.targetId),
          confidence: candidate.confidence,
          rationale: candidate.rationale,
          sources: candidate.sourceRefs.filter((r): r is string => typeof r === 'string'),
        });
      }
    }

    // Convert candidates to edges
    for (const [, candidate] of nodeCandidates.entries()) {
      const edgeId = buildAlignmentEdgeId(candidate.sourceId, candidate.targetId);
      const edge: KnowledgeSpaceEdge = {
        id: edgeId,
        type: 'aligned_to_standard',
        sourceId: candidate.sourceId,
        targetId: candidate.targetId,
        weight: candidate.isPrimary ? Math.max(candidate.weight, 0.7) : candidate.weight,
        confidence: candidate.confidence,
        sourceRefs: candidate.sourceRefs,
        derived: true,
        derivationMethod: 'standards-alignment-script',
        reviewStatus: 'draft',
        rationale: candidate.rationale,
        metadata: {
          isPrimary: candidate.isPrimary,
          course,
        },
      };
      allEdges.push(edge);
    }
  }

  return {
    edges: allEdges,
    standardNodes: Array.from(standardNodesMap.values()),
    exceptions,
    missingStandards: Array.from(missingStandardsMap.values()),
    reviewQueue,
  };
}