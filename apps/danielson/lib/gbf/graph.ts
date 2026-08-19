import {
  getPrerequisiteCycles,
  knowledgeSpaceSchema,
  validateKnowledgeSpace,
  type KnowledgeSpace,
  type KnowledgeSpaceEdge,
} from '@math-platform/knowledge-space-core';

import type {
  GbfActionStep,
  GbfEdgeCandidate,
  GbfGraphRelease,
  GbfValidationResult,
} from './contracts';
import { buildDanielsonGraph } from '../proficiency/graph';
import { GBF_MAPPING_RELEASE, GBF_SEQUENCE_RELEASE } from './source';

const REVIEW_AUTHOR = 'Danielson internal review';
const REVIEW_DATE = '2026-08-19';

const rejectedPrerequisiteTuples = new Set([
  'danielson.tlac.skill.double-plan::danielson.tlac.skill.double-plan',
  'danielson.tlac.skill.what-to-do::danielson.tlac.skill.routine-building',
  'danielson.tlac.skill.least-invasive-intervention::danielson.tlac.skill.means-of-participation',
  'danielson.tlac.skill.habits-of-discussion::danielson.tlac.skill.break-it-down',
]);

function edgeId(type: GbfEdgeCandidate['type'], sourceId: string, targetId: string, stepId: string) {
  const clean = (value: string) => value.replaceAll('.', '-');
  return `danielson.gbf.edge.${type}.${clean(stepId)}.${clean(sourceId)}.${clean(targetId)}`;
}

function primaryFor(step: GbfActionStep) {
  return GBF_MAPPING_RELEASE.mappings.find((item) => (
    item.actionStepId === step.actionStepId && item.role === 'primary'
  ));
}

/** Build a fresh deterministic candidate list from the reviewed mapping release. */
export function buildGbfEdgeCandidates(): GbfEdgeCandidate[] {
  const requiredSteps = GBF_SEQUENCE_RELEASE.actionSteps.filter((step) => step.status === 'required');
  const stepById = new Map(GBF_SEQUENCE_RELEASE.actionSteps.map((step) => [step.actionStepId, step]));
  const supportEdges = GBF_MAPPING_RELEASE.mappings.flatMap((item): GbfEdgeCandidate[] => {
    const step = stepById.get(item.actionStepId);
    const primary = step ? primaryFor(step) : undefined;
    if (!step || step.status !== 'required' || item.role !== 'support' || !primary) return [];
    return [{
      id: edgeId('supports', item.skillId, primary.skillId, step.actionStepId),
      type: 'supports',
      sourceId: item.skillId,
      targetId: primary.skillId,
      sourceActionStepId: step.actionStepId,
      targetActionStepId: step.actionStepId,
      sourceTrajectory: step.trajectory,
      targetTrajectory: step.trajectory,
      weight: 0.5,
      confidence: item.confidence,
      rationale: `${item.rationale} This skill supports the primary skill for the same GBF action step.`,
      reviewAuthor: REVIEW_AUTHOR,
      reviewDate: REVIEW_DATE,
      reviewStatus: 'draft',
      activationState: 'inactive',
    }];
  });
  const prerequisiteEdges: GbfEdgeCandidate[] = [];
  for (const trajectory of ['management', 'rigor'] as const) {
    const steps = requiredSteps
      .filter((step) => step.trajectory === trajectory)
      .sort((left, right) => left.trajectoryOrder - right.trajectoryOrder);
    for (let index = 0; index < steps.length - 1; index += 1) {
      const sourceStep = steps[index];
      const targetStep = steps[index + 1];
      const source = primaryFor(sourceStep);
      const target = primaryFor(targetStep);
      if (!source || !target) continue;
      const tuple = `${source.skillId}::${target.skillId}`;
      const rejected = rejectedPrerequisiteTuples.has(tuple);
      prerequisiteEdges.push({
        id: edgeId('prerequisite_for', source.skillId, target.skillId, `${sourceStep.actionStepId}.to.${targetStep.actionStepId}`),
        type: 'prerequisite_for',
        sourceId: source.skillId,
        targetId: target.skillId,
        sourceActionStepId: sourceStep.actionStepId,
        targetActionStepId: targetStep.actionStepId,
        sourceTrajectory: trajectory,
        targetTrajectory: trajectory,
        weight: 0.5,
        confidence: 'low',
        rationale: rejected
          ? 'The source order creates a self-edge or prerequisite cycle. Keep this candidate rejected.'
          : 'The source places these primary skills in consecutive required steps of one trajectory.',
        reviewAuthor: REVIEW_AUTHOR,
        reviewDate: REVIEW_DATE,
        reviewStatus: rejected ? 'rejected' : 'draft',
        activationState: 'inactive',
      });
    }
  }
  return structuredClone([...supportEdges, ...prerequisiteEdges]);
}

export const GBF_GRAPH_RELEASE: GbfGraphRelease = {
  releaseId: 'danielson.gbf.graph.2026-08-19.v1',
  sequenceReleaseId: GBF_SEQUENCE_RELEASE.releaseId,
  mappingReleaseId: GBF_MAPPING_RELEASE.releaseId,
  effectiveDate: '2026-08-19',
  edgeCandidates: buildGbfEdgeCandidates(),
};

function activePrerequisiteEdges(release: GbfGraphRelease): KnowledgeSpaceEdge[] {
  return release.edgeCandidates
    .filter((candidate) => (
      candidate.type === 'prerequisite_for'
      && candidate.reviewStatus === 'approved'
      && candidate.activationState === 'active'
    ))
    .map((candidate) => ({
      id: candidate.id,
      type: candidate.type,
      sourceId: candidate.sourceId,
      targetId: candidate.targetId,
      weight: candidate.weight,
      confidence: candidate.confidence,
      sourceRefs: [{
        source: 'Get Better Faster scope and sequence',
        location: `${candidate.sourceActionStepId} to ${candidate.targetActionStepId}`,
      }],
      derived: true,
      derivationMethod: 'Reviewed consecutive-step inference',
      reviewStatus: candidate.reviewStatus,
      rationale: candidate.rationale,
      metadata: {
        graphReleaseId: release.releaseId,
        sourceActionStepId: candidate.sourceActionStepId,
        targetActionStepId: candidate.targetActionStepId,
      },
    }));
}

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

/** Validate candidate review state and every active prerequisite. */
export function validateGbfGraphRelease(release: GbfGraphRelease): GbfValidationResult {
  const issues: GbfValidationResult['issues'] = [];
  const baseGraph = knowledgeSpaceSchema.parse(buildDanielsonGraph().graph);
  const skillIds = new Set(baseGraph.nodes.filter((node) => node.kind === 'skill').map((node) => node.id));
  for (const id of duplicateValues(release.edgeCandidates.map((edge) => edge.id))) {
    issues.push({ code: 'DUPLICATE_EDGE_ID', message: 'Edge candidate IDs must be unique.', recordId: id });
  }
  const tuples = new Set<string>();
  for (const edge of release.edgeCandidates) {
    const tuple = `${edge.type}::${edge.sourceId}::${edge.targetId}`;
    if (tuples.has(tuple)) {
      issues.push({ code: 'DUPLICATE_EDGE', message: 'Edge candidate tuples must be unique.', recordId: edge.id });
    }
    tuples.add(tuple);
    if (!skillIds.has(edge.sourceId) || !skillIds.has(edge.targetId)) {
      issues.push({ code: 'DANGLING_EDGE', message: 'An edge candidate has an unknown endpoint.', recordId: edge.id });
    }
    if (!(edge.weight > 0 && edge.weight < 1)) {
      issues.push({ code: 'INVALID_WEIGHT', message: 'A candidate cannot use a default hard-gate weight.', recordId: edge.id });
    }
    if (edge.activationState === 'active' && edge.reviewStatus !== 'approved') {
      issues.push({ code: 'UNREVIEWED_ACTIVATION', message: 'Only an approved edge can activate.', recordId: edge.id });
    }
    if (edge.type === 'prerequisite_for') {
      if (edge.sourceTrajectory !== edge.targetTrajectory) {
        issues.push({ code: 'CROSS_TRAJECTORY_PREREQUISITE', message: 'A prerequisite must stay in one trajectory.', recordId: edge.id });
      }
      if (edge.sourceId === edge.targetId && edge.reviewStatus !== 'rejected') {
        issues.push({ code: 'PREREQUISITE_SELF_EDGE', message: 'A prerequisite cannot point to itself.', recordId: edge.id });
      }
    }
  }
  const graph = {
    nodes: structuredClone(baseGraph.nodes),
    edges: [...structuredClone(baseGraph.edges), ...activePrerequisiteEdges(release)],
  };
  for (const cycle of getPrerequisiteCycles(graph, { includeLowConfidence: true })) {
    issues.push({
      code: 'PREREQUISITE_CYCLE',
      message: `The active graph contains a prerequisite cycle: ${cycle.cycle.join(' -> ')}.`,
    });
  }
  const canonical = validateKnowledgeSpace(graph);
  for (const issue of canonical.errors) {
    issues.push({ code: issue.code, message: issue.message, recordId: issue.edgeId ?? issue.nodeId });
  }
  return { valid: issues.length === 0, issues };
}

/** Compose one immutable assignment graph from a base graph and release. */
export function composeAssignedGbfGraph(
  baseGraph: KnowledgeSpace,
  release: GbfGraphRelease,
): KnowledgeSpace {
  const validation = validateGbfGraphRelease(release);
  if (!validation.valid) throw new Error(validation.issues[0]?.code ?? 'INVALID_GBF_GRAPH_RELEASE');
  return {
    nodes: structuredClone(baseGraph.nodes),
    edges: [...structuredClone(baseGraph.edges), ...activePrerequisiteEdges(release)],
  };
}
