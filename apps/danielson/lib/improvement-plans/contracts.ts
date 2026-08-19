import type { KnowledgeSpace } from '@math-platform/knowledge-space-core';

import { adaptDanielsonRating } from '../proficiency/rating';
import { PIP_SOURCE_CONTRACT, PIP_SOURCE_HASH } from './source';

export type PipTargetInput = {
  componentId: string;
  skillId: string;
  expectedRating?: number;
};

export type PipProposalInput = {
  teacherProfileId: string;
  position: string;
  departmentId: string;
  supervisorAccountId: string;
  requestedPlanEndDate: string | null;
  reviewMeetingDate: string;
  purpose: string;
  areasOfConcern: string;
  expectedStandard: string;
  requiredActions: string;
  evidenceOfImprovement: string;
  schoolSupport: string;
  successfulCompletionCriteria: string;
  targets: PipTargetInput[];
};

function requiredText(value: unknown, name: string) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`invalid_${name}`);
  return value.trim().replace(/\s+/g, ' ');
}

function optionalDate(value: unknown, name: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  const normalized = requiredText(value, name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || !Number.isFinite(Date.parse(`${normalized}T00:00:00.000Z`))) {
    throw new Error(`invalid_${name}`);
  }
  return normalized;
}

function stableFingerprint(value: string) {
  const segments = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    for (let salt = 0; salt < segments.length; salt += 1) {
      segments[salt] = Math.imul(segments[salt] ^ (code + salt), 0x01000193) >>> 0;
    }
  }
  const half = segments.map((segment) => segment.toString(16).padStart(8, '0')).join('');
  return `${half}${half}`;
}

/** Normalize one complete proposal and restore the reviewed fixed source text. */
export function normalizePipProposal(input: PipProposalInput) {
  const targets = [...input.targets]
    .map((target) => {
      const expectedRating = target.expectedRating ?? 3;
      if (expectedRating !== 3 && expectedRating !== 4) throw new Error('invalid_expected_rating');
      return {
        componentId: requiredText(target.componentId, 'componentId'),
        skillId: requiredText(target.skillId, 'skillId'),
        expectedRating,
      };
    })
    .sort((left, right) => left.skillId.localeCompare(right.skillId));
  if (targets.length < 1 || targets.length > 63) throw new Error('invalid_targets');
  const normalized = {
    teacherProfileId: requiredText(input.teacherProfileId, 'teacherProfileId'),
    position: requiredText(input.position, 'position'),
    departmentId: requiredText(input.departmentId, 'departmentId'),
    supervisorAccountId: requiredText(input.supervisorAccountId, 'supervisorAccountId'),
    requestedPlanEndDate: optionalDate(input.requestedPlanEndDate, 'requestedPlanEndDate'),
    reviewMeetingDate: optionalDate(input.reviewMeetingDate, 'reviewMeetingDate') as string,
    purpose: requiredText(input.purpose, 'purpose'),
    areasOfConcern: requiredText(input.areasOfConcern, 'areasOfConcern'),
    expectedStandard: requiredText(input.expectedStandard, 'expectedStandard'),
    requiredActions: requiredText(input.requiredActions, 'requiredActions'),
    evidenceOfImprovement: requiredText(input.evidenceOfImprovement, 'evidenceOfImprovement'),
    schoolSupport: requiredText(input.schoolSupport, 'schoolSupport'),
    successfulCompletionCriteria: requiredText(
      input.successfulCompletionCriteria,
      'successfulCompletionCriteria',
    ),
    targets,
    sourceId: PIP_SOURCE_CONTRACT.sourceId,
    sourceVersion: PIP_SOURCE_CONTRACT.sourceVersion,
    sourceHash: PIP_SOURCE_HASH,
    insufficientImprovementConsequences:
      PIP_SOURCE_CONTRACT.fixedText.insufficientImprovementConsequences,
    acknowledgmentText: PIP_SOURCE_CONTRACT.fixedText.acknowledgmentText,
  };
  return { ...normalized, fingerprint: stableFingerprint(JSON.stringify(normalized)) };
}

/** Validate distinct approved skill targets and their direct Danielson parents. */
export function validatePipTargets(targets: readonly PipTargetInput[], graph: KnowledgeSpace) {
  if (targets.length < 1 || targets.length > 63) {
    return { valid: false as const, reason: 'invalid_target_count' as const };
  }
  const seen = new Set<string>();
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const target of targets) {
    if (seen.has(target.skillId)) return { valid: false as const, reason: 'duplicate_target' as const };
    seen.add(target.skillId);
    if (target.expectedRating !== undefined && target.expectedRating !== 3 && target.expectedRating !== 4) {
      return { valid: false as const, reason: 'invalid_expected_rating' as const };
    }
    if (nodes.get(target.skillId)?.kind !== 'skill'
      || nodes.get(target.componentId)?.kind !== 'instructional_unit') {
      return { valid: false as const, reason: 'invalid_target' as const };
    }
    const contained = graph.edges.some((edge) =>
      edge.type === 'contains'
      && edge.sourceId === target.componentId
      && edge.targetId === target.skillId,
    );
    if (!contained) return { valid: false as const, reason: 'target_component_mismatch' as const };
  }
  return { valid: true as const };
}

export function projectExpectedTarget(target: PipTargetInput) {
  const expectedRating = target.expectedRating ?? 3;
  if (expectedRating !== 3 && expectedRating !== 4) throw new Error('invalid_expected_rating');
  return { ...target, expectedRating, expectedPoints: adaptDanielsonRating(expectedRating).points };
}
