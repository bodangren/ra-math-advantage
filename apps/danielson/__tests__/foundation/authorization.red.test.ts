import { describe, expect, it } from 'vitest';

import {
  DANIELSON_CAPABILITIES,
  DANIELSON_ROLES,
  authorizeDanielsonAction,
  type DanielsonAccessContext,
  type DanielsonAction,
  type DanielsonRole,
} from '../../lib/foundation/authorization';

const ORGANIZATION_A = 'org-a';
const ORGANIZATION_B = 'org-b';
const ACTOR_ID = 'account-actor';
const SUBJECT_ID = 'account-subject';
const OTHER_SUBJECT_ID = 'account-other-subject';
const MATH_DEPARTMENT_ID = 'department-math';
const SCIENCE_DEPARTMENT_ID = 'department-science';

function roleAssignment(accountId: string, role: DanielsonRole, organizationId = ORGANIZATION_A) {
  return { accountId, role, organizationId };
}

function makeContext(overrides: Partial<DanielsonAccessContext> = {}): DanielsonAccessContext {
  return {
    actor: {
      accountId: ACTOR_ID,
      organizationId: ORGANIZATION_A,
      isActive: true,
      organizationIsActive: true,
    },
    subject: {
      accountId: SUBJECT_ID,
      organizationId: ORGANIZATION_A,
      departmentIds: [MATH_DEPARTMENT_ID],
      isActive: true,
    },
    roleAssignments: [],
    hodDepartmentAssignments: [],
    coachTeacherAssignments: [],
    ...overrides,
  };
}

function decide(context: DanielsonAccessContext, action: DanielsonAction) {
  return authorizeDanielsonAction(context, action);
}

describe('Danielson authorization contract', () => {
  it('defines the six application-owned roles and their required capabilities', () => {
    expect(DANIELSON_ROLES).toHaveLength(6);
    expect(DANIELSON_ROLES).toEqual(expect.arrayContaining([
      'teacher',
      'hod',
      'coach',
      'school_head',
      'slt',
      'sysadmin',
    ]));

    expect(DANIELSON_CAPABILITIES.teacher).toEqual(expect.arrayContaining([
      'published_record:read',
      'teacher_response:write',
      'pip_acknowledgment:write',
    ]));
    expect(DANIELSON_CAPABILITIES.hod).toEqual(expect.arrayContaining([
      'teacher_report:read',
      'private_leadership:read',
      'walkthrough:submit',
      'walkthrough:amend',
      'q1_observation:submit',
      'q1_observation:amend',
      'pip:propose',
      'pip_supervisor_acknowledgment:write',
    ]));
    expect(DANIELSON_CAPABILITIES.school_head).toEqual(expect.arrayContaining([
      'q4_observation:submit',
      'q4_observation:amend',
    ]));
    expect(DANIELSON_CAPABILITIES.slt).toEqual(expect.arrayContaining([
      'pip:approve',
      'pip:close',
    ]));
    expect(DANIELSON_CAPABILITIES.sysadmin).toEqual(expect.arrayContaining([
      'accounts:manage',
      'departments:manage',
      'assignments:manage',
      'access_audit:read',
    ]));
  });

  it('allows a teacher to read only the published part of the teacher record', () => {
    const ownRecord = makeContext({
      actor: {
        accountId: SUBJECT_ID,
        organizationId: ORGANIZATION_A,
        isActive: true,
        organizationIsActive: true,
      },
      roleAssignments: [roleAssignment(SUBJECT_ID, 'teacher')],
    });

    expect(decide(ownRecord, 'published_record:read')).toEqual({ allowed: true, reason: null });
    expect(decide(ownRecord, 'teacher_response:write')).toEqual({ allowed: true, reason: null });
    expect(decide(ownRecord, 'pip_acknowledgment:write')).toEqual({ allowed: true, reason: null });
    expect(decide(ownRecord, 'private_leadership:read')).toEqual({
      allowed: false,
      reason: 'self_private_denied',
    });
  });

  it('resolves additive teacher and HOD roles without a second account', () => {
    const context = makeContext({
      roleAssignments: [
        roleAssignment(ACTOR_ID, 'teacher'),
        roleAssignment(ACTOR_ID, 'hod'),
      ],
      hodDepartmentAssignments: [
        { accountId: ACTOR_ID, organizationId: ORGANIZATION_A, departmentId: MATH_DEPARTMENT_ID },
      ],
    });

    for (const action of [
      'teacher_report:read',
      'private_leadership:read',
      'walkthrough:submit',
      'walkthrough:amend',
      'q1_observation:submit',
      'q1_observation:amend',
      'pip:propose',
      'pip_supervisor_acknowledgment:write',
    ] as const) {
      expect(decide(context, action)).toEqual({ allowed: true, reason: null });
    }
  });

  it('resolves additive teacher and SLT roles without a second account', () => {
    const context = makeContext({
      subject: {
        accountId: OTHER_SUBJECT_ID,
        organizationId: ORGANIZATION_A,
        departmentIds: [SCIENCE_DEPARTMENT_ID],
        isActive: true,
      },
      roleAssignments: [
        roleAssignment(ACTOR_ID, 'teacher'),
        roleAssignment(ACTOR_ID, 'slt'),
      ],
    });

    for (const action of [
      'teacher_report:read',
      'q4_observation:submit',
      'q4_observation:amend',
      'pip:approve',
      'pip:close',
    ] as const) {
      expect(decide(context, action)).toEqual({ allowed: true, reason: null });
    }
  });

  it('allows an HOD only for a teacher in an assigned department', () => {
    const assigned = makeContext({
      roleAssignments: [roleAssignment(ACTOR_ID, 'hod')],
      hodDepartmentAssignments: [
        { accountId: ACTOR_ID, organizationId: ORGANIZATION_A, departmentId: MATH_DEPARTMENT_ID },
      ],
    });
    const unassigned = makeContext({
      roleAssignments: [roleAssignment(ACTOR_ID, 'hod')],
      hodDepartmentAssignments: [
        { accountId: ACTOR_ID, organizationId: ORGANIZATION_A, departmentId: SCIENCE_DEPARTMENT_ID },
      ],
    });

    expect(decide(assigned, 'teacher_report:read')).toEqual({ allowed: true, reason: null });
    expect(decide(unassigned, 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'target_out_of_scope',
    });
  });

  it('allows a coach only for an assigned teacher', () => {
    const assigned = makeContext({
      roleAssignments: [roleAssignment(ACTOR_ID, 'coach')],
      coachTeacherAssignments: [
        { accountId: ACTOR_ID, organizationId: ORGANIZATION_A, teacherAccountId: SUBJECT_ID },
      ],
    });
    const unassigned = makeContext({
      roleAssignments: [roleAssignment(ACTOR_ID, 'coach')],
      coachTeacherAssignments: [
        { accountId: ACTOR_ID, organizationId: ORGANIZATION_A, teacherAccountId: OTHER_SUBJECT_ID },
      ],
    });

    expect(decide(assigned, 'q1_observation:submit')).toEqual({ allowed: true, reason: null });
    expect(decide(unassigned, 'q1_observation:submit')).toEqual({
      allowed: false,
      reason: 'target_out_of_scope',
    });
  });

  it.each(['school_head', 'slt'] as const)(
    'allows %s access to each teacher in the actor organization',
    (role) => {
      const context = makeContext({
        subject: {
          accountId: OTHER_SUBJECT_ID,
          organizationId: ORGANIZATION_A,
          departmentIds: [SCIENCE_DEPARTMENT_ID],
          isActive: true,
        },
        roleAssignments: [roleAssignment(ACTOR_ID, role)],
      });

      for (const action of [
        'teacher_report:read',
        'private_leadership:read',
        'walkthrough:submit',
        'q1_observation:submit',
        'pip:propose',
        'q4_observation:submit',
      ] as const) {
        expect(decide(context, action)).toEqual({ allowed: true, reason: null });
      }
    },
  );

  it.each(['hod', 'coach', 'school_head', 'slt'] as const)(
    'denies %s private, evaluation, and PIP operations on the actor teacher record',
    (role) => {
      const self = makeContext({
        actor: {
          accountId: SUBJECT_ID,
          organizationId: ORGANIZATION_A,
          isActive: true,
          organizationIsActive: true,
        },
        roleAssignments: [
          roleAssignment(SUBJECT_ID, 'teacher'),
          roleAssignment(SUBJECT_ID, role),
        ],
        hodDepartmentAssignments: role === 'hod'
          ? [{ accountId: SUBJECT_ID, organizationId: ORGANIZATION_A, departmentId: MATH_DEPARTMENT_ID }]
          : [],
        coachTeacherAssignments: role === 'coach'
          ? [{ accountId: SUBJECT_ID, organizationId: ORGANIZATION_A, teacherAccountId: SUBJECT_ID }]
          : [],
      });

      expect(decide(self, 'private_leadership:read')).toEqual({
        allowed: false,
        reason: 'self_private_denied',
      });
      for (const action of selfEvaluationActions(role)) {
        expect(decide(self, action)).toEqual({
          allowed: false,
          reason: 'self_evaluation_denied',
        });
      }
      for (const action of selfPipActions(role)) {
        expect(decide(self, action)).toEqual({
          allowed: false,
          reason: 'self_pip_denied',
        });
      }
    },
  );

  it('keeps system administration separate from evaluation access', () => {
    const sysadminOnly = makeContext({
      roleAssignments: [roleAssignment(ACTOR_ID, 'sysadmin')],
    });
    const sysadminAndSlt = makeContext({
      roleAssignments: [
        roleAssignment(ACTOR_ID, 'sysadmin'),
        roleAssignment(ACTOR_ID, 'slt'),
      ],
    });

    expect(decide(sysadminOnly, 'accounts:manage')).toEqual({ allowed: true, reason: null });
    expect(decide(sysadminOnly, 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'capability_not_granted',
    });
    expect(decide(sysadminAndSlt, 'teacher_report:read')).toEqual({ allowed: true, reason: null });
  });

  it('denies a request before role scope when the subject is in another organization', () => {
    const crossOrganization = makeContext({
      subject: {
        accountId: SUBJECT_ID,
        organizationId: ORGANIZATION_B,
        departmentIds: [MATH_DEPARTMENT_ID],
        isActive: true,
      },
      roleAssignments: [roleAssignment(ACTOR_ID, 'slt')],
    });

    expect(decide(crossOrganization, 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'cross_organization',
    });
  });

  it('denies unauthenticated and deactivated accounts', () => {
    expect(decide(makeContext({ actor: null }), 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'unauthenticated',
    });
    expect(decide(makeContext({
      actor: {
        accountId: ACTOR_ID,
        organizationId: ORGANIZATION_A,
        isActive: false,
        organizationIsActive: true,
      },
      roleAssignments: [roleAssignment(ACTOR_ID, 'slt')],
    }), 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'account_inactive',
    });
  });

  it('denies an inactive organization before it reads role scope', () => {
    const inactiveOrganization = makeContext({
      actor: {
        accountId: ACTOR_ID,
        organizationId: ORGANIZATION_A,
        isActive: true,
        organizationIsActive: false,
      },
      roleAssignments: [roleAssignment(ACTOR_ID, 'slt')],
    });

    expect(decide(inactiveOrganization, 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'organization_inactive',
    });
  });

  it('denies access to an inactive target before scope resolution', () => {
    const inactiveTarget = makeContext({
      subject: {
        accountId: SUBJECT_ID,
        organizationId: ORGANIZATION_A,
        departmentIds: [MATH_DEPARTMENT_ID],
        isActive: false,
      },
      roleAssignments: [roleAssignment(ACTOR_ID, 'slt')],
    });

    expect(decide(inactiveTarget, 'teacher_report:read')).toEqual({
      allowed: false,
      reason: 'target_inactive',
    });
  });
});

function selfEvaluationActions(role: DanielsonRole): DanielsonAction[] {
  const actions: DanielsonAction[] = [
    'walkthrough:submit',
    'walkthrough:amend',
    'q1_observation:submit',
    'q1_observation:amend',
  ];
  if (role === 'school_head' || role === 'slt') {
    actions.push('q4_observation:submit', 'q4_observation:amend');
  }
  return actions;
}

function selfPipActions(role: DanielsonRole): DanielsonAction[] {
  const actions: DanielsonAction[] = ['pip:propose'];
  if (role === 'slt') actions.push('pip:approve', 'pip:close');
  return actions;
}
