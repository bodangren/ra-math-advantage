import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import type { ProjectedActivity } from './types';
import type { KnowledgeBlueprint, WorkedExampleSpec, GuidedPracticeSpec, IndependentPracticeSpec } from '../blueprints';
import {
  workedExampleSpecSchema,
  guidedPracticeSpecSchema,
  independentPracticeSpecSchema,
} from '../blueprints';

const MODE_SORT_ORDER: Record<string, number> = {
  worked_example: 0,
  guided_practice: 1,
  independent_practice: 2,
  assessment: 3,
};

const SPEC_TO_MODE: Array<{
  specKey: 'workedExampleSpec' | 'guidedPracticeSpec' | 'independentPracticeSpec';
  rendererModeKey: 'worked' | 'guidedPractice' | 'independentPractice';
  mode: ProjectedActivity['mode'];
}> = [
  { specKey: 'workedExampleSpec', rendererModeKey: 'worked', mode: 'worked_example' },
  { specKey: 'guidedPracticeSpec', rendererModeKey: 'guidedPractice', mode: 'guided_practice' },
  { specKey: 'independentPracticeSpec', rendererModeKey: 'independentPractice', mode: 'independent_practice' },
];

const SPEC_SCHEMAS = {
  workedExampleSpec: workedExampleSpecSchema,
  guidedPracticeSpec: guidedPracticeSpecSchema,
  independentPracticeSpec: independentPracticeSpecSchema,
} as const;

/**
 * Finds direct child skills for callers that inspect concept structure.
 *
 * `findChildSkills` returns the direct child skills of a concept node via
 * `contains` edges where the concept is the source.
 */
export function findChildSkills(
  conceptNode: KnowledgeSpaceNode,
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
): KnowledgeSpaceNode[] {
  if (conceptNode.kind !== 'concept') return [];

  return edges
    .filter((e) => e.type === 'contains' && e.sourceId === conceptNode.id)
    .map((e) => nodes.find((n) => n.id === e.targetId))
    .filter((n): n is KnowledgeSpaceNode => n != null && n.kind === 'skill');
}

/**
 * Picks one child skill in deterministic ID order for callers that inspect
 * concept structure. Activity projection does not use this helper.
 */
export function selectSkill(childSkills: KnowledgeSpaceNode[]): KnowledgeSpaceNode | null {
  if (childSkills.length === 0) return null;
  const sorted = [...childSkills].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[0]!;
}

/**
 * Map knowledge-space nodes, edges, and blueprints into `practice.v1` activity
 * map rows. Each blueprint becomes one or more `ProjectedActivity` rows that
 * reference the underlying graph for provenance.
 *
 * A blueprint projects only when its node is a skill or task blueprint.
 * Concept blueprints emit no rows because they do not prove that the same
 * activity assesses each child skill.
 *
 * Projections are regenerated outputs — they are not source truth. Review diffs
 * against previously generated activity maps before replacing app artifacts.
 *
 * @param {KnowledgeSpaceNode[]} nodes - Knowledge space nodes
 * @param {KnowledgeSpaceEdge[]} edges - Knowledge space edges
 * @param {KnowledgeBlueprint[]} blueprints - Knowledge blueprints (worked example, guided, independent, assessment)
 * @returns {ProjectedActivity[]} Sorted array of projected activities.
 */
export function projectActivityMap(
  nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
  blueprints: KnowledgeBlueprint[],
): ProjectedActivity[] {
  edges = edges.filter(edge => edge.reviewStatus !== 'rejected');
  const rows: ProjectedActivity[] = [];

  for (const bp of blueprints) {
    // Activity and evidence identity must stay on the node that owns the
    // blueprint. A concept blueprint cannot establish that each child skill
    // assesses the same work, so it is not projectable.
    const blueprintNode = nodes.find((n) => n.id === bp.nodeId);
    if (
      !blueprintNode
      || (blueprintNode.kind !== 'skill' && blueprintNode.kind !== 'task_blueprint')
    ) continue;

    // Enrich sourceNodeIds from prerequisite/supports edges targeting this node
    const edgeSourceIds = edges
      .filter(
        (e) =>
          (e.type === 'prerequisite_for' ||
            e.type === 'supports' ||
            e.type === 'extends') &&
          e.targetId === bp.nodeId,
      )
      .map((e) => e.sourceId);

    // Merge blueprint sourceNodeIds with edge-derived sourceNodeIds (deduped)
    const allSourceIds = [...new Set([...bp.sourceNodeIds, ...edgeSourceIds])];

    // Enrich alignmentNodeIds from aligned_to_standard edges
    const edgeAlignmentIds = edges
      .filter(
        (e) => e.type === 'aligned_to_standard' && e.sourceId === bp.nodeId,
      )
      .map((e) => e.targetId);

    const allAlignmentIds = [...new Set([...bp.alignmentNodeIds, ...edgeAlignmentIds])];

    const gradingConfig: Record<string, unknown> = bp.gradingSpec
      ? {
          partIds: bp.gradingSpec.partIds,
          passingScore: bp.gradingSpec.passingScore,
          partialCredit: bp.gradingSpec.partialCredit,
          ...(bp.gradingSpec.rubric === undefined ? {} : { rubric: bp.gradingSpec.rubric }),
        }
      : {};

    for (const { specKey, rendererModeKey, mode } of SPEC_TO_MODE) {
      const spec = bp[specKey];
      if (!spec || !SPEC_SCHEMAS[specKey].safeParse(spec).success) continue;

      const rendererKey = bp.rendererModeMap?.[rendererModeKey] || bp.rendererKey;
      if (!rendererKey) continue;

      const stableActivityId = `${blueprintNode.id}.${mode}`;

      let props: Record<string, unknown> = {};
      if (spec.rendererProps) {
        props = spec.rendererProps;
      } else if (specKey === 'workedExampleSpec') {
        const wspec = spec as WorkedExampleSpec;
        props = {
          prompt: wspec.prompt,
          givens: wspec.givens,
          steps: wspec.steps,
          explanation: wspec.explanation,
        };
      } else if (specKey === 'guidedPracticeSpec') {
        const gspec = spec as GuidedPracticeSpec;
        props = {
          scaffoldedPrompt: gspec.scaffoldedPrompt,
          stepPrompts: gspec.stepPrompts,
          hints: gspec.hints,
          checksPerStep: gspec.checksPerStep,
          revealPolicy: gspec.revealPolicy,
        };
      } else if (specKey === 'independentPracticeSpec') {
        const ispec = spec as IndependentPracticeSpec;
        props = {
          variantParameters: ispec.variantParameters,
          answerSchema: ispec.answerSchema,
          gradingRules: ispec.gradingRules,
          replayPolicy: ispec.replayPolicy,
        };
      }

      rows.push({
        stableActivityId,
        nodeId: blueprintNode.id,
        sourceNodeIds: allSourceIds,
        rendererKey,
        mode,
        alignmentNodeIds: allAlignmentIds,
        props,
        gradingConfig,
        srsEligible:
          (mode === 'guided_practice' || mode === 'independent_practice') &&
          blueprintNode.independentPracticeReady === true &&
          blueprintNode.reviewStatus === 'approved' &&
          bp.reviewStatus === 'approved',
      });
    }
  }

  // Stable sort: by nodeId then mode order
  rows.sort((a, b) => {
    const nodeCmp = a.nodeId.localeCompare(b.nodeId);
    if (nodeCmp !== 0) return nodeCmp;
    return (
      (MODE_SORT_ORDER[a.mode] ?? 99) - (MODE_SORT_ORDER[b.mode] ?? 99)
    );
  });

  return rows;
}
