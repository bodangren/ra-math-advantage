import { describe, expect, it } from 'vitest';

import {
  applyGbfPhasePriority,
  createCurrentGbfAssignment,
  projectGbfProgress,
} from '../../lib/gbf/progress';
import { GBF_ACTION_STEPS, GBF_MAPPINGS } from '../../lib/gbf/source';

const TEACHER = 'teacher_profiles:one';

function priority(skillId: string, rating: 1 | 2 | 3 | 4 | null, due = false) {
  return {
    teacherId: TEACHER,
    skillId,
    due,
    dueAt: due ? '2026-08-19T00:00:00.000Z' : '2027-01-01T00:00:00.000Z',
    overdueDays: due ? 1 : 0,
    currentProficiency: {
      rawRating: rating,
      points: rating === null ? null : { 1: 70, 2: 80, 3: 90, 4: 100 }[rating],
      passes: rating !== null && rating >= 3,
    },
    evidenceGaps: rating === null ? ['no_valid_rated_evidence'] : [],
    approvedPriorityInputs: ['due_status', 'current_proficiency'],
  };
}

describe('GBF teacher progress', () => {
  it('marks the current Management and Rigor phase skills as walkthrough priorities', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:one',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:leader',
      assignedAt: 1,
    });
    const priorities = [
      priority('danielson.tlac.skill.routine-building', null),
      priority('danielson.tlac.skill.strong-voice', null),
      priority('danielson.tlac.skill.stretch-it', null),
    ];

    const result = applyGbfPhasePriority({ assignment, priorities });

    expect(result.find((row) => row.skillId === 'danielson.tlac.skill.routine-building')
      ?.approvedPriorityInputs).toContain('gbf_phase_priority');
    expect(result.find((row) => row.skillId === 'danielson.tlac.skill.strong-voice')
      ?.approvedPriorityInputs).toContain('gbf_phase_priority');
    expect(result.find((row) => row.skillId === 'danielson.tlac.skill.stretch-it')
      ?.approvedPriorityInputs).not.toContain('gbf_phase_priority');
  });

  it('returns the neutral versioned projection without an assignment', () => {
    expect(projectGbfProgress({ assignment: null, priorities: [] })).toEqual({
      contractVersion: 'danielson.gbf-progress.v1',
      state: 'not_configured',
    });
  });

  it('keeps Management and Rigor phases independent and excludes previews', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:one',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      assignedAt: Date.parse('2026-08-19T00:00:00.000Z'),
    });
    const managementPrimary = GBF_ACTION_STEPS
      .filter((step) => step.status === 'required' && step.trajectory === 'management')
      .map((step) => GBF_MAPPINGS.find((mapping) => (
        mapping.actionStepId === step.actionStepId && mapping.role === 'primary'
      ))?.skillId)
      .filter((skillId): skillId is string => skillId !== undefined);
    const rigorFirst = GBF_MAPPINGS.find((mapping) => (
      mapping.actionStepId === 'phase_1.rigor.1' && mapping.role === 'primary'
    ))?.skillId;
    expect(rigorFirst).toBeDefined();
    const priorities = [
      ...managementPrimary.map((skillId) => priority(skillId, 3)),
      ...(rigorFirst ? [priority(rigorFirst, 2, true)] : []),
    ];

    const result = projectGbfProgress({ assignment, priorities });
    expect(result).toMatchObject({
      contractVersion: 'danielson.gbf-progress.v1',
      state: 'in_progress',
      trajectories: {
        management: { currentPhaseId: 'complete' },
        rigor: { currentPhaseId: 'phase_1' },
      },
    });
    if (result.state === 'not_configured') throw new Error('Expected assigned progress');
    expect(result.trajectories.management.requiredActionStepIds).toHaveLength(12);
    expect(result.trajectories.rigor.requiredActionStepIds).toHaveLength(13);
    expect(result.dueSkillIds).toContain(rigorFirst);
    expect(result.unresolvedGapSkillIds).toHaveLength(13);
  });

  it('applies each current phase only to its own trajectory', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:one',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      assignedAt: 1,
    });
    const priorities = [
      priority('danielson.tlac.skill.routine-building', 3),
      priority('danielson.tlac.skill.strong-voice', 3),
      priority('danielson.tlac.skill.double-plan', 3),
      priority('danielson.tlac.skill.exemplar-planning', 3),
      priority('danielson.tlac.skill.silent-solo', 3),
      priority('danielson.tlac.skill.active-observation', 3),
      priority('danielson.tlac.skill.what-to-do', null),
      priority('danielson.tlac.skill.accountable-independent-reading', null),
      priority('danielson.tlac.skill.brighten-the-lines', null),
    ];

    expect(projectGbfProgress({ assignment, priorities })).toMatchObject({
      trajectories: {
        management: { currentPhaseId: 'phase_2' },
        rigor: { currentPhaseId: 'phase_3' },
      },
    });

    const result = applyGbfPhasePriority({ assignment, priorities });
    const inputsFor = (skillId: string) => result.find((row) => row.skillId === skillId)
      ?.approvedPriorityInputs;
    expect(inputsFor('danielson.tlac.skill.what-to-do')).toContain('gbf_phase_priority');
    expect(inputsFor('danielson.tlac.skill.accountable-independent-reading'))
      .toContain('gbf_phase_priority');
    expect(inputsFor('danielson.tlac.skill.brighten-the-lines'))
      .not.toContain('gbf_phase_priority');
    expect(inputsFor('danielson.tlac.skill.silent-solo'))
      .not.toContain('gbf_phase_priority');
  });

  it('uses raw ratings 3 and 4 as proficiency and does not change the input', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:one',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      assignedAt: 1,
    });
    const primaryIds = [...new Set(GBF_MAPPINGS
      .filter((mapping) => mapping.role === 'primary')
      .map((mapping) => mapping.skillId))];
    const priorities = primaryIds.map((skillId, index) => priority(skillId, index % 2 === 0 ? 3 : 4));
    const before = structuredClone(priorities);

    const result = projectGbfProgress({ assignment, priorities });

    expect(result).toMatchObject({ state: 'proficient' });
    expect(priorities).toEqual(before);
    expect(priorities.map((row) => row.currentProficiency.rawRating))
      .toEqual(before.map((row) => row.currentProficiency.rawRating));
  });

  it('does not change an assignment while it projects progress', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:historic',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      assignedAt: 1,
    });
    const snapshot = structuredClone(assignment);

    projectGbfProgress({ assignment, priorities: [] });

    expect(assignment).toEqual(snapshot);
  });
});
