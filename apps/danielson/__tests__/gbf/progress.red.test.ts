import { describe, expect, it } from 'vitest';

import {
  createCurrentGbfAssignment,
  projectGbfProgress,
} from '../../lib/gbf/progress';
import { GBF_MAPPING_RELEASE, GBF_SEQUENCE_RELEASE } from '../../lib/gbf/source';

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
      requestId: 'request:one',
      assignedAt: Date.parse('2026-08-19T00:00:00.000Z'),
    });
    const managementPrimary = GBF_SEQUENCE_RELEASE.actionSteps
      .filter((step) => step.status === 'required' && step.trajectory === 'management')
      .map((step) => GBF_MAPPING_RELEASE.mappings.find((mapping) => (
        mapping.actionStepId === step.actionStepId && mapping.role === 'primary'
      ))?.skillId)
      .filter((skillId): skillId is string => skillId !== undefined);
    const rigorFirst = GBF_MAPPING_RELEASE.mappings.find((mapping) => (
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
      sequenceReleaseId: 'danielson.gbf.sequence.2026-08-19.v1',
      graphReleaseId: 'danielson.gbf.graph.2026-08-19.v1',
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

  it('uses raw ratings 3 and 4 as proficiency and does not change the input', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:one',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      requestId: 'request:one',
      assignedAt: 1,
    });
    const primaryIds = [...new Set(GBF_MAPPING_RELEASE.mappings
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

  it('keeps a historical assignment on its recorded releases', () => {
    const assignment = createCurrentGbfAssignment({
      assignmentId: 'teacher_gbf_assignments:historic',
      organizationId: 'organizations:one',
      teacherProfileId: TEACHER,
      assignedByAccountId: 'accounts:sysadmin',
      requestId: 'request:historic',
      assignedAt: 1,
    });
    const snapshot = structuredClone(assignment);

    projectGbfProgress({ assignment, priorities: [] });

    expect(assignment).toEqual(snapshot);
    expect(assignment.sequenceReleaseId).toBe('danielson.gbf.sequence.2026-08-19.v1');
    expect(assignment.graphReleaseId).toBe('danielson.gbf.graph.2026-08-19.v1');
  });
});
