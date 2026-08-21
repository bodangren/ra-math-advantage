import { describe, expect, it } from 'vitest';

import { authorizeDanielsonAction } from '../../lib/foundation/authorization';
import { buildDemoScenario } from '../../lib/demo/scenarios';
import { scopeTeacherCandidates } from '../../lib/observations/queue';

const REFERENCE_TIME = Date.parse('2026-08-21T12:00:00.000Z');
const ORGANIZATION_ID = 'organizations:demo';

function candidates(scenario: ReturnType<typeof buildDemoScenario>) {
  return scenario.teachers.map((teacher) => ({
    teacherProfileId: teacher.username,
    organizationId: ORGANIZATION_ID,
    isActive: true,
    departmentIds: teacher.departmentKeys,
  }));
}

describe('Danielson local demo sales acceptance', () => {
  it('contains the visible teacher states and the three-target Noah path', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const byUsername = new Map(scenario.teachers.map((teacher) => [teacher.username, teacher]));

    expect(byUsername.get('demo.teacher.new')?.expectedState).toBe('not_enough_evidence');
    expect(byUsername.get('demo.teacher.developing')?.expectedState).toBe('below_proficient');
    expect(byUsername.get('demo.teacher.experienced')?.expectedState).toBe('proficient');
    expect(byUsername.get('demo.teacher.developing')?.walkthroughPriorityCount).toBe(3);
    expect(byUsername.get('demo.teacher.developing')?.observations).toHaveLength(3);
    expect(byUsername.get('demo.teacher.pip')?.pip).toMatchObject({ state: 'active' });
    expect(byUsername.get('demo.teacher.growth')?.pip).toMatchObject({ state: 'closed', outcome: 'successful' });
    expect(byUsername.get('demo.teacher.growth')?.responseCount).toBe(1);
  });

  it('keeps HOD and coach portfolios scoped to their assignments', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const allCandidates = candidates(scenario);
    const hod = scopeTeacherCandidates(allCandidates, {
      actorAccountId: 'demo.hod.math',
      actorTeacherProfileId: 'demo.hod.math',
      organizationId: ORGANIZATION_ID,
      roles: ['hod'],
      hodDepartmentIds: ['mathematics'],
      coachTeacherProfileIds: [],
    });
    const coach = scopeTeacherCandidates(allCandidates, {
      actorAccountId: 'demo.coach.primary',
      actorTeacherProfileId: null,
      organizationId: ORGANIZATION_ID,
      roles: ['coach'],
      hodDepartmentIds: [],
      coachTeacherProfileIds: scenario.coachAssignments.map((assignment) => assignment.teacherUsername),
    });

    expect(hod.map((candidate) => candidate.teacherProfileId)).toEqual([
      'demo.slt',
      'demo.teacher.experienced',
      'demo.teacher.pip',
    ]);
    expect(coach.map((candidate) => candidate.teacherProfileId)).toEqual([
      'demo.teacher.new',
      'demo.teacher.developing',
      'demo.teacher.growth',
    ]);
  });

  it('does not grant the system administrator evaluation report access', () => {
    const decision = authorizeDanielsonAction({
      actor: {
        accountId: 'demo.sysadmin',
        organizationId: ORGANIZATION_ID,
        isActive: true,
        organizationIsActive: true,
      },
      subject: {
        accountId: 'demo.teacher.developing',
        organizationId: ORGANIZATION_ID,
        departmentIds: ['primary-school'],
        isActive: true,
      },
      roleAssignments: [{
        accountId: 'demo.sysadmin',
        organizationId: ORGANIZATION_ID,
        role: 'sysadmin',
        status: 'active',
      }],
      hodDepartmentAssignments: [],
      coachTeacherAssignments: [],
    }, 'teacher_report:read');

    expect(decision).toEqual({ allowed: false, reason: 'capability_not_granted' });
  });
});
