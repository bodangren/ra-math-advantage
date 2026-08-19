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
  return value.trim();
}

function requiredNarrative(value: unknown, name: string) {
  const normalized = requiredText(value, name);
  if (normalized.length > 4_000) throw new Error(`invalid_${name}`);
  return normalized;
}

function optionalDate(value: unknown, name: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  const normalized = requiredText(value, name);
  if (!isIsoCalendarDate(normalized)) {
    throw new Error(`invalid_${name}`);
  }
  return normalized;
}

function isIsoCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
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
    reviewMeetingDate: (() => {
      const date = optionalDate(input.reviewMeetingDate, 'reviewMeetingDate');
      if (!date) throw new Error('invalid_reviewMeetingDate');
      return date;
    })(),
    purpose: requiredNarrative(input.purpose, 'purpose'),
    areasOfConcern: requiredNarrative(input.areasOfConcern, 'areasOfConcern'),
    expectedStandard: requiredNarrative(input.expectedStandard, 'expectedStandard'),
    requiredActions: requiredNarrative(input.requiredActions, 'requiredActions'),
    evidenceOfImprovement: requiredNarrative(input.evidenceOfImprovement, 'evidenceOfImprovement'),
    schoolSupport: requiredNarrative(input.schoolSupport, 'schoolSupport'),
    successfulCompletionCriteria: requiredNarrative(
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
  return { ...normalized, fingerprint: JSON.stringify(normalized) };
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
    if (nodes.get(target.skillId)?.reviewStatus !== 'approved'
      || nodes.get(target.componentId)?.reviewStatus !== 'approved') {
      return { valid: false as const, reason: 'unapproved_target' as const };
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
