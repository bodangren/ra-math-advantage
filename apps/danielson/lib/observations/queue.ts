import type { DanielsonRole } from '../foundation/authorization';
import type { PriorityProjection } from '../proficiency/processor';
import {
  cloneValue,
  compareText,
  type ObservationPriorityReason,
} from './contracts';

const REASON_ORDER: Record<ObservationPriorityReason, number> = {
  below_proficient: 0,
  approved_plan_priority: 1,
  overdue: 2,
  evidence_gap: 3,
  due: 4,
};

export type RankedPriorityTarget = PriorityProjection & {
  reason: ObservationPriorityReason;
};

export type TeacherScopeCandidate = {
  teacherProfileId: string;
  organizationId: string;
  isActive: boolean;
  departmentIds: string[];
};

export type ObserverQueueScope = {
  actorAccountId: string;
  actorTeacherProfileId: string | null;
  organizationId: string;
  roles: DanielsonRole[];
  hodDepartmentIds: string[];
  coachTeacherProfileIds: string[];
};

export type TeacherQueueCandidate = {
  teacherProfileId: string;
  displayName: string;
  targets: PriorityProjection[];
};

export type RankedTeacherQueueItem = TeacherQueueCandidate & {
  targets: RankedPriorityTarget[];
  reason: ObservationPriorityReason;
  eligibleTargetCount: number;
};

function reasonFor(priority: PriorityProjection): ObservationPriorityReason | null {
  const rating = priority.currentProficiency.rawRating;
  if (typeof rating === 'number' && rating < 3) return 'below_proficient';
  if (priority.approvedPriorityInputs.includes('approved_plan_priority')) {
    return 'approved_plan_priority';
  }
  if (priority.due && priority.overdueDays > 0) return 'overdue';
  if (priority.evidenceGaps.length > 0) return 'evidence_gap';
  if (priority.due) return 'due';
  return null;
}

function compareOptionalRating(left: number | null, right: number | null): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left - right;
}

export function compareRankedTargets(
  left: RankedPriorityTarget,
  right: RankedPriorityTarget,
): number {
  const reason = REASON_ORDER[left.reason] - REASON_ORDER[right.reason];
  if (reason !== 0) return reason;
  const rating = compareOptionalRating(
    left.currentProficiency.rawRating,
    right.currentProficiency.rawRating,
  );
  if (rating !== 0) return rating;
  const overdue = right.overdueDays - left.overdueDays;
  if (overdue !== 0) return overdue;
  const component = compareText(left.componentId ?? '', right.componentId ?? '');
  if (component !== 0) return component;
  return compareText(left.skillId, right.skillId);
}

/** Return eligible targets in the frozen deterministic order. */
export function rankPriorityTargets(
  priorities: readonly PriorityProjection[],
): RankedPriorityTarget[] {
  const bestBySkill = new Map<string, RankedPriorityTarget>();
  for (const priority of priorities) {
    const reason = reasonFor(priority);
    if (!reason) continue;
    const ranked = { ...cloneValue(priority), reason };
    const existing = bestBySkill.get(ranked.skillId);
    if (!existing || compareRankedTargets(ranked, existing) < 0) {
      bestBySkill.set(ranked.skillId, ranked);
    }
  }
  return [...bestBySkill.values()].sort(compareRankedTargets);
}

/** Apply all active roles as one additive observer scope. */
export function scopeTeacherCandidates<T extends TeacherScopeCandidate>(
  candidates: readonly T[],
  scope: ObserverQueueScope,
): T[] {
  const organizationWide = scope.roles.includes('school_head') || scope.roles.includes('slt');
  const canUseHodScope = scope.roles.includes('hod');
  const canUseCoachScope = scope.roles.includes('coach');
  const hodDepartments = new Set(scope.hodDepartmentIds);
  const coachedTeachers = new Set(scope.coachTeacherProfileIds);

  return candidates
    .filter((candidate) => (
      candidate.isActive
      && candidate.organizationId === scope.organizationId
      && candidate.teacherProfileId !== scope.actorTeacherProfileId
      && (
        organizationWide
        || (canUseHodScope && candidate.departmentIds.some((id) => hodDepartments.has(id)))
        || (canUseCoachScope && coachedTeachers.has(candidate.teacherProfileId))
      )
    ))
    .map(cloneValue);
}

function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

/** Rank teachers by their best eligible target and the frozen tie-breaks. */
export function rankTeacherQueue(
  candidates: readonly TeacherQueueCandidate[],
): RankedTeacherQueueItem[] {
  return candidates
    .map((candidate) => {
      const targets = rankPriorityTargets(candidate.targets);
      if (targets.length === 0) return null;
      return {
        ...cloneValue(candidate),
        targets,
        reason: targets[0].reason,
        eligibleTargetCount: targets.length,
      };
    })
    .filter((candidate): candidate is RankedTeacherQueueItem => candidate !== null)
    .sort((left, right) => {
      const target = compareRankedTargets(left.targets[0], right.targets[0]);
      if (target !== 0) return target;
      const count = right.eligibleTargetCount - left.eligibleTargetCount;
      if (count !== 0) return count;
      const name = compareText(
        normalizeDisplayName(left.displayName),
        normalizeDisplayName(right.displayName),
      );
      if (name !== 0) return name;
      return compareText(left.teacherProfileId, right.teacherProfileId);
    });
}

/** Select the first three distinct eligible targets without filling a shortfall. */
export function selectWalkthroughTargets(priorities: readonly PriorityProjection[]) {
  const targets = rankPriorityTargets(priorities).slice(0, 3);
  const shortfall = 3 - targets.length;
  return {
    requested: 3 as const,
    returned: targets.length,
    shortfall,
    shortfallReason: shortfall > 0
      ? 'fewer_than_three_eligible_skills' as const
      : null,
    targets,
  };
}
