import type {
  GbfConfiguredProgress,
  GbfPriorityInput,
  GbfProgress,
  GbfTeacherAssignment,
  GbfTrajectory,
  GbfTrajectoryProgress,
} from './contracts';
import { GBF_GRAPH_RELEASE, resolveGbfGraphRelease } from './graph';
import {
  GBF_MAPPING_RELEASE,
  GBF_SEQUENCE_RELEASE,
  GBF_UNSEQUENCED_SKILL_IDS,
} from './source';
import type { GbfMappingRelease, GbfSequenceRelease } from './contracts';

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
}

/** Create the immutable current-release snapshot stored with an assignment. */
export function createCurrentGbfAssignment(input: {
  assignmentId: string;
  organizationId: string;
  teacherProfileId: string;
  assignedByAccountId: string;
  requestId: string;
  assignedAt: number;
}): GbfTeacherAssignment {
  return {
    ...input,
    sequenceReleaseId: GBF_SEQUENCE_RELEASE.releaseId,
    graphReleaseId: GBF_GRAPH_RELEASE.releaseId,
    assignedSkillIds: uniqueSorted(GBF_MAPPING_RELEASE.mappings.map((mapping) => mapping.skillId)),
    unresolvedGapSkillIds: [...GBF_UNSEQUENCED_SKILL_IDS],
  };
}

function passes(priority: GbfPriorityInput | undefined) {
  const rating = priority?.currentProficiency.rawRating;
  return rating === 3 || rating === 4;
}

function trajectoryProgress(
  trajectory: GbfTrajectory,
  priorities: ReadonlyMap<string, GbfPriorityInput>,
  sequence: GbfSequenceRelease,
  mapping: GbfMappingRelease,
): GbfTrajectoryProgress {
  const steps = sequence.actionSteps
    .filter((step) => step.status === 'required' && step.trajectory === trajectory)
    .sort((left, right) => left.trajectoryOrder - right.trajectoryOrder);
  const primaryByStep = new Map(steps.map((step) => [
    step.actionStepId,
    mapping.mappings.find((mapping) => (
      mapping.actionStepId === step.actionStepId && mapping.role === 'primary'
    ))?.skillId,
  ]));
  const completed = steps.filter((step) => {
    const skillId = primaryByStep.get(step.actionStepId);
    return skillId ? passes(priorities.get(skillId)) : false;
  });
  const incomplete = steps.find((step) => !completed.some((item) => (
    item.actionStepId === step.actionStepId
  )));
  const primarySkillIds = uniqueSorted([...primaryByStep.values()].filter(
    (skillId): skillId is string => skillId !== undefined,
  ));
  return {
    currentPhaseId: incomplete?.phaseId ?? 'complete',
    requiredActionStepIds: steps.map((step) => step.actionStepId),
    completedActionStepIds: completed.map((step) => step.actionStepId),
    assignedPrimarySkillIds: primarySkillIds,
    proficientPrimarySkillIds: primarySkillIds.filter((skillId) => passes(priorities.get(skillId))),
    duePrimarySkillIds: primarySkillIds.filter((skillId) => priorities.get(skillId)?.due === true),
  };
}

/** Project GBF progress without changing Track 2 evidence or scheduling state. */
export function projectGbfProgress(input: {
  assignment: Pick<
    GbfTeacherAssignment,
    | 'assignmentId'
    | 'sequenceReleaseId'
    | 'graphReleaseId'
    | 'assignedSkillIds'
    | 'unresolvedGapSkillIds'
  > | null;
  priorities: readonly GbfPriorityInput[];
}): GbfProgress {
  if (!input.assignment) {
    return { contractVersion: 'danielson.gbf-progress.v1', state: 'not_configured' };
  }
  if (
    !resolveGbfGraphRelease({
      sequenceReleaseId: input.assignment.sequenceReleaseId,
      graphReleaseId: input.assignment.graphReleaseId,
    })
  ) throw new Error('unknown_gbf_release');
  const sequence = input.assignment.sequenceReleaseId === GBF_SEQUENCE_RELEASE.releaseId
    ? GBF_SEQUENCE_RELEASE
    : {
        ...GBF_SEQUENCE_RELEASE,
        releaseId: input.assignment.sequenceReleaseId,
      };
  const mapping = input.assignment.sequenceReleaseId === GBF_SEQUENCE_RELEASE.releaseId
    ? GBF_MAPPING_RELEASE
    : {
        ...GBF_MAPPING_RELEASE,
        sequenceReleaseId: input.assignment.sequenceReleaseId,
      };
  const priorityBySkill = new Map(input.priorities.map((priority) => [priority.skillId, priority]));
  const trajectories = {
    management: trajectoryProgress('management', priorityBySkill, sequence, mapping),
    rigor: trajectoryProgress('rigor', priorityBySkill, sequence, mapping),
  };
  const proficientSkillIds = input.assignment.assignedSkillIds.filter((skillId) => (
    passes(priorityBySkill.get(skillId))
  ));
  const dueSkillIds = input.assignment.assignedSkillIds.filter((skillId) => (
    priorityBySkill.get(skillId)?.due === true
  ));
  const result: GbfConfiguredProgress = {
    contractVersion: 'danielson.gbf-progress.v1',
    state: trajectories.management.currentPhaseId === 'complete'
      && trajectories.rigor.currentPhaseId === 'complete'
      ? 'proficient'
      : 'in_progress',
    assignmentId: input.assignment.assignmentId,
    sequenceReleaseId: input.assignment.sequenceReleaseId,
    graphReleaseId: input.assignment.graphReleaseId,
    trajectories,
    assignedSkillIds: [...input.assignment.assignedSkillIds],
    proficientSkillIds,
    dueSkillIds,
    unresolvedGapSkillIds: [...input.assignment.unresolvedGapSkillIds],
  };
  return result;
}
