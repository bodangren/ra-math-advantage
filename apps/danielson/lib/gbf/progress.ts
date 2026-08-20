import type {
  GbfConfiguredProgress,
  GbfPriorityInput,
  GbfProgress,
  GbfTeacherAssignment,
  GbfTrajectory,
  GbfTrajectoryProgress,
} from './contracts';
import {
  GBF_ACTION_STEPS,
  GBF_MAPPINGS,
  GBF_UNSEQUENCED_SKILL_IDS,
} from './source';

function uniqueSorted(values: readonly string[]) {
  return [...new Set(values)].sort();
}

/** Create the skill snapshot stored with an assignment. */
export function createCurrentGbfAssignment(input: {
  assignmentId: string;
  organizationId: string;
  teacherProfileId: string;
  assignedByAccountId: string;
  assignedAt: number;
}): GbfTeacherAssignment {
  return {
    ...input,
    assignedSkillIds: uniqueSorted(GBF_MAPPINGS.map((mapping) => mapping.skillId)),
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
): GbfTrajectoryProgress {
  const steps = GBF_ACTION_STEPS
    .filter((step) => step.status === 'required' && step.trajectory === trajectory)
    .sort((left, right) => left.trajectoryOrder - right.trajectoryOrder);
  const primaryByStep = new Map(steps.map((step) => [
    step.actionStepId,
    GBF_MAPPINGS.find((mapping) => (
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
    | 'assignedSkillIds'
    | 'unresolvedGapSkillIds'
  > | null;
  priorities: readonly GbfPriorityInput[];
}): GbfProgress {
  if (!input.assignment) {
    return { contractVersion: 'danielson.gbf-progress.v1', state: 'not_configured' };
  }
  const priorityBySkill = new Map(input.priorities.map((priority) => [priority.skillId, priority]));
  const trajectories = {
    management: trajectoryProgress('management', priorityBySkill),
    rigor: trajectoryProgress('rigor', priorityBySkill),
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
    trajectories,
    assignedSkillIds: [...input.assignment.assignedSkillIds],
    proficientSkillIds,
    dueSkillIds,
    unresolvedGapSkillIds: [...input.assignment.unresolvedGapSkillIds],
  };
  return result;
}

/** Mark skills in the teacher's current GBF phases for walkthrough selection. */
export function applyGbfPhasePriority<T extends GbfPriorityInput>(input: {
  assignment: Pick<
    GbfTeacherAssignment,
    | 'assignmentId'
    | 'assignedSkillIds'
    | 'unresolvedGapSkillIds'
  > | null;
  priorities: readonly T[];
}): T[] {
  const priorities = input.priorities.map((priority) => structuredClone(priority));
  const progress = projectGbfProgress({ assignment: input.assignment, priorities });
  if (progress.state === 'not_configured') return priorities;

  const currentStepIds = new Set(GBF_ACTION_STEPS
    .filter((step) => (
      step.status === 'required'
      && progress.trajectories[step.trajectory].currentPhaseId === step.phaseId
    ))
    .map((step) => step.actionStepId));
  const currentSkillIds = new Set(GBF_MAPPINGS
    .filter((mapping) => currentStepIds.has(mapping.actionStepId))
    .map((mapping) => mapping.skillId));

  return priorities.map((priority) => currentSkillIds.has(priority.skillId)
    ? {
        ...priority,
        approvedPriorityInputs: uniqueSorted([
          ...(priority.approvedPriorityInputs ?? []),
          'gbf_phase_priority',
        ]),
      }
    : priority);
}
