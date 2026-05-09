import type { KnowledgeSpaceNode, KnowledgeSpaceEdge } from '@math-platform/knowledge-space-core';
import type { ProjectedActivity } from './types';
import type { KnowledgeBlueprint, WorkedExampleSpec, GuidedPracticeSpec, IndependentPracticeSpec } from '../blueprints';

const MODE_SORT_ORDER: Record<string, number> = {
  worked_example: 0,
  guided_practice: 1,
  independent_practice: 2,
  assessment: 3,
};

const SPEC_TO_MODE: Array<{
  specKey: 'workedExampleSpec' | 'guidedPracticeSpec' | 'independentPracticeSpec';
  mode: ProjectedActivity['mode'];
}> = [
  { specKey: 'workedExampleSpec', mode: 'worked_example' },
  { specKey: 'guidedPracticeSpec', mode: 'guided_practice' },
  { specKey: 'independentPracticeSpec', mode: 'independent_practice' },
];

/**
 * Map knowledge-space nodes, edges, and blueprints into `practice.v1` activity
 * map rows. Each blueprint becomes one or more `ProjectedActivity` rows that
 * reference the underlying graph for provenance.
 *
 * Projections are regenerated outputs — they are not source truth. Review diffs
 * against previously generated activity maps before replacing app artifacts.
 *
 * @param nodes - Knowledge space nodes
 * @param edges - Knowledge space edges
 * @param blueprints - Knowledge blueprints (worked example, guided, independent, assessment)
 * @returns Sorted array of projected activities
 */
export function projectActivityMap(
  _nodes: KnowledgeSpaceNode[],
  edges: KnowledgeSpaceEdge[],
  blueprints: KnowledgeBlueprint[],
): ProjectedActivity[] {
  const rows: ProjectedActivity[] = [];

  for (const bp of blueprints) {
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

    const rendererKey = bp.rendererKey ||
      bp.rendererModeMap?.independentPractice ||
      bp.rendererModeMap?.guidedPractice ||
      bp.rendererModeMap?.worked ||
      'default';

    const gradingConfig: Record<string, unknown> = bp.gradingSpec
      ? {
          partIds: bp.gradingSpec.partIds,
          passingScore: bp.gradingSpec.passingScore,
          partialCredit: bp.gradingSpec.partialCredit,
          rubric: bp.gradingSpec.rubric,
        }
      : {};

    const srsEligible =
      bp.independentPracticeSpec != null ||
      (bp.generatorKey != null && bp.generatorKey.length > 0);

    for (const { specKey, mode } of SPEC_TO_MODE) {
      const spec = bp[specKey];
      if (!spec) continue;

      const stableActivityId = `${bp.nodeId}.${mode}`;

      let props: Record<string, unknown> = {};
      if (specKey === 'workedExampleSpec') {
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
        nodeId: bp.nodeId,
        sourceNodeIds: allSourceIds,
        rendererKey,
        mode,
        alignmentNodeIds: allAlignmentIds,
        props,
        gradingConfig,
        srsEligible,
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
