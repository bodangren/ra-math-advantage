import type { ObservationAmendment, SubmittedObservation } from '../observations/contracts';
import { projectEffectiveObservation } from '../observations/amendments';
import { rankPriorityTargets } from '../observations/queue';
import type { PriorityProjection } from '../proficiency/processor';
import { buildDanielsonGraph } from '../proficiency/graph';
import { adaptDanielsonRating, isDanielsonRating } from '../proficiency/rating';
import { applyGbfPhasePriority } from '../gbf/progress';
import type { GbfPhaseId, GbfProgress, GbfTeacherAssignment } from '../gbf/contracts';
import { applyPipPriorityOverlay } from '../improvement-plans/progress';

export type ReportingState = 'below_proficient' | 'proficient' | 'not_enough_evidence';
export type AttentionReason = 'below_proficient' | 'overdue_evidence' | 'ip_off_track';
export type ImprovementPlanPortfolioProjection =
  | { contractVersion: 'danielson.ip-progress.v1'; state: 'not_configured' | 'pending_approval' }
  | {
      contractVersion: 'danielson.ip-progress.v1';
      state: 'active';
      planId: string;
      trackState: 'on_track' | 'off_track';
      daysRemaining: number;
    }
  | {
      contractVersion: 'danielson.ip-progress.v1';
      state: 'closed';
      planId: string;
      outcome: 'successful' | 'insufficient_improvement';
    };
export type ReportingPriority = PriorityProjection & { sourceRecordId?: string | null };

export type ComponentEvidence = {
  componentId: string;
  rawRating: 1 | 2 | 3 | 4;
  sourceRecordId: string | null;
};

/** Apply the same PIP and GBF priority overlays used by the leadership queue. */
export function applyPriorityOverlays(input: {
  priorities: readonly ReportingPriority[];
  pipOverlays: ReadonlyMap<string, {
    approvedAt: number;
    planEndAt: number;
    latestRatedEvidenceAt: number | null;
  }>;
  gbfAssignment: Pick<
    GbfTeacherAssignment,
    'assignmentId' | 'assignedSkillIds' | 'unresolvedGapSkillIds'
  > | null;
  now: number;
}) {
  const pipPriorities = input.priorities.map((priority) => {
    const overlay = input.pipOverlays.get(priority.skillId);
    return overlay
      ? applyPipPriorityOverlay({ priority, ...overlay, now: input.now })
      : priority;
  });
  return applyGbfPhasePriority({ assignment: input.gbfAssignment, priorities: pipPriorities });
}

export type PortfolioRow = {
  coaching?: { activeCount: number; overdueCount: number; nextFollowUpDate: string | null };
  canStartPlan?: boolean;
  teacherProfileId: string;
  displayName: string;
  danielson: {
    state: ReportingState;
    belowComponentIds: string[];
  };
  improvementPlan: ImprovementPlanPortfolioProjection;
  gbf: { contractVersion: 'danielson.gbf-progress.v1'; state: 'not_configured' }
    | {
        contractVersion: 'danielson.gbf-progress.v1';
        state: 'in_progress' | 'proficient';
        managementPhaseId: GbfPhaseId | 'complete';
        rigorPhaseId: GbfPhaseId | 'complete';
        dueSkillCount: number;
        unresolvedGapSkillCount: number;
      };
  evidenceDue: {
    state: 'overdue' | 'due' | 'current';
    dueCount: number;
    overdueCount: number;
    maximumOverdueDays: number;
    nextDueAt: string | null;
  };
  attentionReasons: AttentionReason[];
};

const graph = buildDanielsonGraph().graph;
const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
const allComponentIds = graph.nodes
  .filter((node) => node.kind === 'instructional_unit')
  .map((node) => node.id);
const skillsByComponent = new Map(allComponentIds.map((componentId) => [
  componentId,
  graph.edges
    .filter((edge) => edge.type === 'contains' && edge.sourceId === componentId)
    .map((edge) => edge.targetId)
    .filter((skillId) => nodeById.get(skillId)?.kind === 'skill'),
]));
const componentIds = allComponentIds;

function projectComponentStates(
  priorities: readonly ReportingPriority[],
  componentEvidence: readonly ComponentEvidence[] = [],
) {
  const priorityBySkill = new Map(priorities.map((priority) => [priority.skillId, priority]));
  const evidenceByComponent = new Map(componentEvidence.map((evidence) => [evidence.componentId, evidence]));
  return componentIds.map((componentId) => {
    const skillIds = skillsByComponent.get(componentId) ?? [];
    const skills = skillIds.map((skillId) => {
      const priority = priorityBySkill.get(skillId);
      const rawRating = priority?.currentProficiency.rawRating ?? null;
      return {
        skillId,
        title: nodeById.get(skillId)?.title ?? skillId,
        rawRating: isDanielsonRating(rawRating) ? rawRating : null,
        points: isDanielsonRating(rawRating) ? adaptDanielsonRating(rawRating).points : null,
        state: isDanielsonRating(rawRating)
          ? rawRating >= 3 ? 'proficient' as const : 'below_proficient' as const
          : 'not_enough_evidence' as const,
        due: priority?.due ?? true,
        dueAt: priority?.dueAt ?? null,
        overdueDays: priority?.overdueDays ?? 0,
        sourceRecordId: priority?.sourceRecordId ?? null,
      };
    });
    const skillState: ReportingState = skills.some((skill) => skill.state === 'below_proficient')
      ? 'below_proficient'
      : skills.length > 0 && skills.every((skill) => skill.state === 'proficient')
        ? 'proficient'
        : 'not_enough_evidence';
    const componentEvidenceEntry = evidenceByComponent.get(componentId);
    const componentRating = componentEvidenceEntry?.rawRating;
    const usesComponentEvidence = skillState === 'not_enough_evidence' && componentRating !== undefined;
    const state: ReportingState = usesComponentEvidence
      ? componentRating >= 3 ? 'proficient' : 'below_proficient'
      : skillState;
    return {
      componentId,
      title: nodeById.get(componentId)?.title ?? componentId,
      state,
      rawRating: usesComponentEvidence ? componentRating : null,
      points: usesComponentEvidence ? adaptDanielsonRating(componentRating).points : null,
      sourceRecordId: usesComponentEvidence && componentEvidenceEntry
        ? componentEvidenceEntry.sourceRecordId
        : null,
      skills,
    };
  });
}

function overallState(components: ReturnType<typeof projectComponentStates>): ReportingState {
  if (components.some((component) => component.state === 'below_proficient')) {
    return 'below_proficient';
  }
  return components.length > 0 && components.every((component) => component.state === 'proficient')
    ? 'proficient'
    : 'not_enough_evidence';
}

function projectEvidenceDue(priorities: readonly ReportingPriority[]) {
  const due = priorities.filter((priority) => priority.due);
  const overdue = due.filter((priority) => priority.overdueDays > 0);
  const knownDueDates = priorities
    .map((priority) => priority.dueAt)
    .filter((dueAt): dueAt is string => typeof dueAt === 'string' && Number.isFinite(Date.parse(dueAt)))
    .sort((left, right) => Date.parse(left) - Date.parse(right));
  return {
    state: overdue.length > 0 ? 'overdue' as const : due.length > 0 ? 'due' as const : 'current' as const,
    dueCount: due.length,
    overdueCount: overdue.length,
    maximumOverdueDays: overdue.reduce(
      (maximum, priority) => Math.max(maximum, priority.overdueDays),
      0,
    ),
    nextDueAt: knownDueDates[0] ?? null,
  };
}

/** Project one compact portfolio row without changing proficiency state. */
export function projectPortfolioRow(input: {
  teacherProfileId: string;
  displayName: string;
  priorities: readonly ReportingPriority[];
  now: number;
  componentEvidence?: readonly ComponentEvidence[];
  improvementPlan?: ImprovementPlanPortfolioProjection;
  gbf?: GbfProgress;
}): PortfolioRow {
  void input.now;
  const components = projectComponentStates(input.priorities, input.componentEvidence);
  const state = overallState(components);
  const belowComponentIds = components
    .filter((component) => component.state === 'below_proficient')
    .map((component) => component.componentId);
  const evidenceDue = projectEvidenceDue(input.priorities);
  const attentionReasons: AttentionReason[] = [];
  if (state === 'below_proficient') attentionReasons.push('below_proficient');
  if (evidenceDue.state === 'overdue') attentionReasons.push('overdue_evidence');
  if (input.improvementPlan?.state === 'active'
    && input.improvementPlan.trackState === 'off_track') attentionReasons.push('ip_off_track');
  return {
    teacherProfileId: input.teacherProfileId,
    displayName: input.displayName,
    danielson: { state, belowComponentIds },
    improvementPlan: input.improvementPlan ?? {
      contractVersion: 'danielson.ip-progress.v1',
      state: 'not_configured',
    },
    gbf: input.gbf && input.gbf.state !== 'not_configured'
      ? {
          contractVersion: input.gbf.contractVersion,
          state: input.gbf.state,
          managementPhaseId: input.gbf.trajectories.management.currentPhaseId,
          rigorPhaseId: input.gbf.trajectories.rigor.currentPhaseId,
          dueSkillCount: input.gbf.dueSkillIds.length,
          unresolvedGapSkillCount: input.gbf.unresolvedGapSkillIds.length,
        }
      : {
          contractVersion: 'danielson.gbf-progress.v1',
          state: 'not_configured',
        },
    evidenceDue,
    attentionReasons,
  };
}

const reasonOrder: Record<AttentionReason, number> = {
  below_proficient: 0,
  overdue_evidence: 1,
  ip_off_track: 2,
};

function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function compareText(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

/** Compare portfolio rows with the fixed attention order. */
export function comparePortfolioRows(left: PortfolioRow, right: PortfolioRow) {
  const attention = Number(right.attentionReasons.length > 0)
    - Number(left.attentionReasons.length > 0);
  if (attention !== 0) return attention;
  const leftReason = left.attentionReasons[0];
  const rightReason = right.attentionReasons[0];
  const reason = (leftReason === undefined ? 2 : reasonOrder[leftReason])
    - (rightReason === undefined ? 2 : reasonOrder[rightReason]);
  if (reason !== 0) return reason;
  const overdue = right.evidenceDue.maximumOverdueDays - left.evidenceDue.maximumOverdueDays;
  if (overdue !== 0) return overdue;
  const below = right.danielson.belowComponentIds.length - left.danielson.belowComponentIds.length;
  if (below !== 0) return below;
  const name = compareText(
    normalizeDisplayName(left.displayName),
    normalizeDisplayName(right.displayName),
  );
  return name !== 0 ? name : compareText(left.teacherProfileId, right.teacherProfileId);
}

/** Return one cursor page from the sorted portfolio projection. */
export function paginatePortfolioRows(
  rows: readonly PortfolioRow[],
  input: { cursor: string | null; pageSize?: number },
) {
  const pageSize = input.pageSize ?? 25;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    throw new Error('invalid_page_size');
  }
  const start = input.cursor === null
    ? 0
    : rows.findIndex((row) => row.teacherProfileId === input.cursor) + 1;
  if (input.cursor !== null && start === 0) throw new Error('invalid_cursor');
  const items = rows.slice(start, start + pageSize);
  const isDone = start + items.length >= rows.length;
  return {
    items,
    isDone,
    continueCursor: isDone ? '' : items.at(-1)?.teacherProfileId ?? '',
  };
}

/** Project current proficiency at domain, component, and approved-skill levels. */
export function projectCurrentProficiency(input: {
  priorities: readonly ReportingPriority[];
  componentEvidence?: readonly ComponentEvidence[];
}) {
  const components = projectComponentStates(input.priorities, input.componentEvidence);
  const domainById = new Map(graph.nodes
    .filter((node) => node.kind === 'content_group')
    .map((node) => [node.id, node]));
  const domains = [...domainById.values()].map((domain) => {
    const domainComponents = graph.edges
      .filter((edge) => edge.type === 'contains' && edge.sourceId === domain.id)
      .map((edge) => components.find((component) => component.componentId === edge.targetId))
      .filter((component): component is (typeof components)[number] => component !== undefined);
    return {
      domainId: domain.id,
      title: domain.title,
      state: overallState(domainComponents),
      components: domainComponents,
    };
  });
  const priorityTargets = rankPriorityTargets(input.priorities)
    .slice(0, 3)
    .map((target, index) => ({
      rank: (index + 1) as 1 | 2 | 3,
      skillId: target.skillId,
      reason: target.reason,
    }));
  return { state: overallState(components), priorityTargets, domains };
}

/** Project one effective formal evaluation without averaging component ratings. */
export function projectOfficialEvaluation(input: {
  record: SubmittedObservation;
  amendments: readonly ObservationAmendment[];
  observerDisplayName: string;
}) {
  const effective = projectEffectiveObservation(input.record, input.amendments);
  const components = effective.items.map((item) => {
    const rawRating = item.outcome?.kind === 'rated' ? item.outcome.rating : null;
    return {
      componentId: item.componentId,
      title: nodeById.get(item.componentId)?.title ?? item.componentId,
      rawRating,
      points: rawRating === null ? null : adaptDanielsonRating(rawRating).points,
      observedAt: effective.observedAt,
      observerDisplayName: input.observerDisplayName,
      sourceObservationId: effective.observationId,
      amendmentCount: input.amendments.length,
    };
  });
  const status: ReportingState = components.some(
    (component) => component.rawRating !== null && component.rawRating < 3,
  )
    ? 'below_proficient'
    : components.length === allComponentIds.length && components.every(
      (component) => component.rawRating !== null && component.rawRating >= 3,
    )
      ? 'proficient'
      : 'not_enough_evidence';
  return {
    observationId: effective.observationId,
    observationType: effective.observationType,
    schoolYear: effective.schoolYear,
    observedAt: effective.observedAt,
    observerDisplayName: input.observerDisplayName,
    amendmentCount: input.amendments.length,
    status,
    components,
  };
}
