import { describe, expect, it } from 'vitest';

import {
  createDanielsonFoundationService,
  type DanielsonFoundationRepository,
} from '../../lib/foundation/server-access';

const ORG_A = 'org-a';
const ORG_B = 'org-b';
const SYSADMIN = 'account-sysadmin';
const HOD = 'account-hod';
const COACH = 'account-coach';
const TEACHER = 'account-teacher';
const OTHER_TEACHER = 'account-other-teacher';
const OUTSIDE_TEACHER = 'account-outside-teacher';
const MATH = 'department-math';

type Role = 'teacher' | 'hod' | 'coach' | 'school_head' | 'slt' | 'sysadmin';
type ProtectedAction =
  | 'walkthrough:submit'
  | 'walkthrough:amend'
  | 'q1_observation:submit'
  | 'q1_observation:amend'
  | 'q4_observation:submit'
  | 'q4_observation:amend'
  | 'pip:propose'
  | 'pip:approve'
  | 'pip:close';

type Account = {
  accountId: string;
  organizationId: string;
  isActive: boolean;
  departmentIds: string[];
};

type Change = {
  kind: string;
  targetAccountId?: string;
  accountId?: string;
  teacherAccountId?: string;
  departmentId?: string;
  organizationId?: string;
  role?: string;
  displayName?: string;
  username?: string;
};

class FakeFoundationRepository {
  readonly accounts = new Map<string, Account>([
    [SYSADMIN, { accountId: SYSADMIN, organizationId: ORG_A, isActive: true, departmentIds: [] }],
    [HOD, { accountId: HOD, organizationId: ORG_A, isActive: true, departmentIds: [MATH] }],
    [COACH, { accountId: COACH, organizationId: ORG_A, isActive: true, departmentIds: [] }],
    [TEACHER, { accountId: TEACHER, organizationId: ORG_A, isActive: true, departmentIds: [MATH] }],
    [OTHER_TEACHER, { accountId: OTHER_TEACHER, organizationId: ORG_A, isActive: true, departmentIds: [] }],
    [OUTSIDE_TEACHER, { accountId: OUTSIDE_TEACHER, organizationId: ORG_B, isActive: true, departmentIds: [] }],
  ]);

  readonly sessions = new Map([
    ['sysadmin-session', SYSADMIN],
    ['hod-session', HOD],
    ['coach-session', COACH],
    ['teacher-session', TEACHER],
  ]);

  roles: Array<{ accountId: string; organizationId: string; role: Role }> = [
    { accountId: SYSADMIN, organizationId: ORG_A, role: 'sysadmin' },
    { accountId: HOD, organizationId: ORG_A, role: 'teacher' },
    { accountId: HOD, organizationId: ORG_A, role: 'hod' },
    { accountId: COACH, organizationId: ORG_A, role: 'coach' },
    { accountId: TEACHER, organizationId: ORG_A, role: 'teacher' },
  ];

  hodDepartments = [{ accountId: HOD, organizationId: ORG_A, departmentId: MATH }];
  coachTeachers = [{ accountId: COACH, organizationId: ORG_A, teacherAccountId: TEACHER }];
  readonly requestIds = new Set<string>();
  readonly auditEvents: Array<Record<string, unknown>> = [];
  readonly commits: Array<{ change: Change; actorAccountId: string }> = [];
  reportReads = 0;
  privateReads = 0;
  protectedWrites = 0;
  failNextTransaction = false;

  async resolveAccessContext(sessionToken: string, subjectAccountId: string | null) {
    const actor = this.accounts.get(this.sessions.get(sessionToken) ?? '') ?? null;
    const subject = subjectAccountId ? this.accounts.get(subjectAccountId) ?? null : null;

    return {
      actor: actor && {
        accountId: actor.accountId,
        organizationId: actor.organizationId,
        isActive: actor.isActive,
        organizationIsActive: true,
      },
      subject: subject && {
        accountId: subject.accountId,
        organizationId: subject.organizationId,
        isActive: subject.isActive,
        departmentIds: subject.departmentIds,
      },
      roleAssignments: actor ? this.roles.filter((item) => item.accountId === actor.accountId) : [],
      hodDepartmentAssignments: actor ? this.hodDepartments.filter((item) => item.accountId === actor.accountId) : [],
      coachTeacherAssignments: actor ? this.coachTeachers.filter((item) => item.accountId === actor.accountId) : [],
    };
  }

  async readTeacherReport(subjectAccountId: string) {
    this.reportReads += 1;
    return { subjectAccountId, publishedSummary: 'Published Danielson evidence' };
  }

  async readPrivateLeadership(subjectAccountId: string) {
    this.privateReads += 1;
    return { subjectAccountId, privateComments: ['Leadership-only note'] };
  }

  async writeProtectedAction(action: ProtectedAction, subjectAccountId: string, payload: unknown) {
    this.protectedWrites += 1;
    return { action, subjectAccountId, payload };
  }

  async commitAdministrationChange(input: {
    actorAccountId: string;
    organizationId: string;
    requestId: string;
    change: Change;
  }) {
    if (this.requestIds.has(input.requestId)) {
      return { kind: 'denied', reason: 'duplicate_request' };
    }
    if (this.failNextTransaction) {
      this.failNextTransaction = false;
      return { kind: 'failed', reason: 'audit_write_failed' };
    }
    if (this.isFinalSysadminChange(input.change)) {
      return { kind: 'denied', reason: 'final_active_sysadmin' };
    }
    if (input.change.kind === 'role.assign' && !isRole(input.change.role)) {
      return { kind: 'invalid', reason: 'invalid_role' };
    }
    if (input.change.kind === 'role.assign' && this.roles.some((item) =>
      item.accountId === input.change.targetAccountId && item.role === input.change.role,
    )) {
      return { kind: 'denied', reason: 'duplicate_assignment' };
    }

    const targetAccountId = input.change.targetAccountId ?? input.change.accountId ?? null;
    const after = input.change.kind === 'role.assign'
      ? { accountId: targetAccountId, organizationId: input.organizationId, role: input.change.role }
      : input.change;
    const event = {
      organizationId: input.organizationId,
      requestId: input.requestId,
      actorAccountId: input.actorAccountId,
      action: input.change.kind,
      targetType: input.change.kind === 'role.assign' ? 'role_assignment' : 'administration_record',
      targetId: targetAccountId ?? input.change.departmentId ?? 'new-record',
      occurredAt: Date.now(),
      before: null,
      after,
    };
    this.requestIds.add(input.requestId);
    this.commits.push({ change: input.change, actorAccountId: input.actorAccountId });
    this.auditEvents.push(event);
    return { kind: 'applied', auditEvent: event };
  }

  async listAccessAuditEvents(input: { organizationId: string }) {
    return this.auditEvents.filter((event) => event.organizationId === input.organizationId);
  }

  private isFinalSysadminChange(change: Change) {
    if (change.targetAccountId !== SYSADMIN) return false;
    return change.kind === 'account.deactivate'
      || (change.kind === 'role.revoke' && change.role === 'sysadmin');
  }
}

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && ['teacher', 'hod', 'coach', 'school_head', 'slt', 'sysadmin'].includes(value);
}

function createService(repository = new FakeFoundationRepository()) {
  return {
    repository,
    service: createDanielsonFoundationService(repository as unknown as DanielsonFoundationRepository),
  };
}

describe('Danielson server access adapter', () => {
  it('uses current database grants, revocations, and active state on every protected operation', async () => {
    const { repository, service } = createService();
    const request = {
      sessionToken: 'teacher-session',
      subjectAccountId: OTHER_TEACHER,
      includePrivateLeadership: false,
    };

    expect(await service.readTeacherReport(request)).toEqual({
      kind: 'denied', reason: 'capability_not_granted',
    });
    expect(repository.reportReads).toBe(0);

    repository.roles.push({ accountId: TEACHER, organizationId: ORG_A, role: 'slt' });
    expect(await service.readTeacherReport(request)).toMatchObject({ kind: 'allowed' });
    expect(repository.reportReads).toBe(1);

    repository.roles = repository.roles.filter((item) => !(item.accountId === TEACHER && item.role === 'slt'));
    expect(await service.readTeacherReport(request)).toEqual({
      kind: 'denied', reason: 'capability_not_granted',
    });

    repository.accounts.get(TEACHER)!.isActive = false;
    expect(await service.readTeacherReport(request)).toEqual({
      kind: 'denied', reason: 'account_inactive',
    });
    expect(repository.reportReads).toBe(1);
  });

  it('ignores stale role and organization values from a session token', async () => {
    const { repository, service } = createService();
    const forgedRole = {
      sessionToken: 'teacher-session',
      tokenRole: 'slt',
      tokenOrganizationId: ORG_B,
      subjectAccountId: OTHER_TEACHER,
      includePrivateLeadership: false,
    };

    expect(await service.readTeacherReport(forgedRole)).toEqual({
      kind: 'denied', reason: 'capability_not_granted',
    });
    repository.roles.push({ accountId: TEACHER, organizationId: ORG_A, role: 'slt' });

    expect(await service.readTeacherReport({ ...forgedRole, subjectAccountId: OUTSIDE_TEACHER })).toEqual({
      kind: 'denied', reason: 'cross_organization',
    });
    expect(repository.reportReads).toBe(0);
  });

  it('denies out-of-scope record reads and writes before repository access', async () => {
    const { repository, service } = createService();

    expect(await service.readTeacherReport({
      sessionToken: 'hod-session', subjectAccountId: OTHER_TEACHER, includePrivateLeadership: true,
    })).toEqual({ kind: 'denied', reason: 'target_out_of_scope' });
    expect(await service.executeTeacherAction({
      sessionToken: 'hod-session',
      subjectAccountId: OTHER_TEACHER,
      action: 'q1_observation:submit',
      payload: { rating: 3 },
    })).toEqual({ kind: 'denied', reason: 'target_out_of_scope' });
    expect([repository.reportReads, repository.privateReads, repository.protectedWrites]).toEqual([0, 0, 0]);
  });

  it.each([
    ['hod-session', HOD, 'hod'],
    ['coach-session', COACH, 'coach'],
    ['sysadmin-session', SYSADMIN, 'school_head'],
    ['teacher-session', TEACHER, 'slt'],
  ] as const)(
    'removes private data and denies self-evaluation and PIP operations for %s',
    async (sessionToken, actorId, leadershipRole) => {
      const { repository, service } = createService();
      if (!repository.roles.some((item) => item.accountId === actorId && item.role === 'teacher')) {
        repository.roles.push({ accountId: actorId, organizationId: ORG_A, role: 'teacher' });
      }
      repository.roles.push({ accountId: actorId, organizationId: ORG_A, role: leadershipRole });
      if (leadershipRole === 'coach') {
        repository.coachTeachers.push({ accountId: actorId, organizationId: ORG_A, teacherAccountId: actorId });
      }

      const report = await service.readTeacherReport({
        sessionToken, subjectAccountId: actorId, includePrivateLeadership: true,
      });
      expect(report).toMatchObject({ kind: 'allowed' });
      expect(report).not.toHaveProperty('report.privateLeadership');
      expect(repository.privateReads).toBe(0);

      for (const action of selfEvaluationActions(leadershipRole)) {
        expect(await service.executeTeacherAction({
          sessionToken, subjectAccountId: actorId, action, payload: {},
        })).toEqual({ kind: 'denied', reason: 'self_evaluation_denied' });
      }
      for (const action of selfPipActions(leadershipRole)) {
        expect(await service.executeTeacherAction({
          sessionToken, subjectAccountId: actorId, action, payload: {},
        })).toEqual({ kind: 'denied', reason: 'self_pip_denied' });
      }
      expect(repository.protectedWrites).toBe(0);
    },
  );

  it('keeps system administration separate from reports until a current SLT role exists', async () => {
    const { repository, service } = createService();

    expect(await service.readTeacherReport({
      sessionToken: 'sysadmin-session', subjectAccountId: TEACHER, includePrivateLeadership: false,
    })).toEqual({ kind: 'denied', reason: 'capability_not_granted' });

    const changes: Change[] = [
      { kind: 'account.create', accountId: 'account-new', organizationId: ORG_A, displayName: 'New Teacher', username: 'new.teacher' },
      { kind: 'department.create', departmentId: 'department-language', organizationId: ORG_A },
      { kind: 'role.assign', targetAccountId: TEACHER, role: 'coach' },
      { kind: 'hod_assignment.assign', accountId: HOD, departmentId: 'department-language' },
      { kind: 'coach_assignment.assign', accountId: COACH, teacherAccountId: TEACHER },
    ];
    for (const [index, change] of changes.entries()) {
      expect(await service.applyAdministrationChange({
        sessionToken: 'sysadmin-session', requestId: `admin-change-${index}`, change: change as never,
      })).toMatchObject({ kind: 'applied' });
    }
    expect(repository.commits.map((item) => item.change.kind)).toEqual(changes.map((change) => change.kind));

    repository.roles.push({ accountId: SYSADMIN, organizationId: ORG_A, role: 'slt' });
    expect(await service.readTeacherReport({
      sessionToken: 'sysadmin-session', subjectAccountId: TEACHER, includePrivateLeadership: false,
    })).toMatchObject({ kind: 'allowed' });
  });

  it('rejects changes to the final active system administrator', async () => {
    const { repository, service } = createService();

    for (const change of [
      { kind: 'account.deactivate', targetAccountId: SYSADMIN },
      { kind: 'role.revoke', targetAccountId: SYSADMIN, role: 'sysadmin' },
    ]) {
      expect(await service.applyAdministrationChange({
        sessionToken: 'sysadmin-session', requestId: `final-admin-${change.kind}`, change: change as never,
      })).toEqual({ kind: 'denied', reason: 'final_active_sysadmin' });
    }
    expect(repository.commits).toHaveLength(0);
    expect(repository.auditEvents).toHaveLength(0);
  });

  it('validates input, prevents duplicate assignments, and commits audit state atomically', async () => {
    const { repository, service } = createService();

    expect(await service.applyAdministrationChange({
      sessionToken: 'sysadmin-session',
      requestId: 'invalid-role',
      change: { kind: 'role.assign', targetAccountId: TEACHER, role: 'not-a-role' },
    } as never)).toEqual({ kind: 'invalid', reason: 'invalid_role' });
    expect(repository.commits).toHaveLength(0);

    expect(await service.applyAdministrationChange({
      sessionToken: 'sysadmin-session',
      requestId: 'duplicate-role',
      change: { kind: 'role.assign', targetAccountId: TEACHER, role: 'teacher' },
    })).toEqual({ kind: 'denied', reason: 'duplicate_assignment' });
    expect(repository.auditEvents).toHaveLength(0);

    repository.failNextTransaction = true;
    expect(await service.applyAdministrationChange({
      sessionToken: 'sysadmin-session',
      requestId: 'failed-audit-transaction',
      change: { kind: 'role.assign', targetAccountId: TEACHER, role: 'coach' },
    })).toEqual({ kind: 'failed', reason: 'audit_write_failed' });
    expect([repository.commits.length, repository.auditEvents.length]).toEqual([0, 0]);
  });

  it('uses the authenticated actor, records before and after values, and denies a repeated request', async () => {
    const { repository, service } = createService();
    const request = {
      sessionToken: 'sysadmin-session',
      requestId: 'role-assignment-1',
      actorAccountId: 'account-spoofed-by-client',
      change: { kind: 'role.assign' as const, targetAccountId: TEACHER, role: 'coach' },
    };

    expect(await service.applyAdministrationChange(request)).toMatchObject({ kind: 'applied' });
    expect(await service.applyAdministrationChange(request)).toEqual({ kind: 'denied', reason: 'duplicate_request' });
    expect(repository.auditEvents).toHaveLength(1);
    expect(repository.auditEvents[0]).toMatchObject({
      organizationId: ORG_A,
      requestId: 'role-assignment-1',
      actorAccountId: SYSADMIN,
      action: 'role.assign',
      targetType: 'role_assignment',
      before: null,
      after: { accountId: TEACHER, organizationId: ORG_A, role: 'coach' },
    });
    expect(repository.auditEvents[0]).toHaveProperty('occurredAt');
  });

  it('allows organization-scoped audit reads only through the system-administrator capability', async () => {
    const { repository, service } = createService();
    repository.auditEvents.push(
      { organizationId: ORG_A, requestId: 'a', action: 'role.assign' },
      { organizationId: ORG_B, requestId: 'b', action: 'role.assign' },
    );

    expect(await service.listAdministrationAuditEvents({ sessionToken: 'teacher-session' })).toEqual({
      kind: 'denied', reason: 'capability_not_granted',
    });
    const allowed = await service.listAdministrationAuditEvents({ sessionToken: 'sysadmin-session' });
    expect(allowed).toMatchObject({ kind: 'allowed' });
    if (allowed.kind === 'allowed') expect(allowed.events).toHaveLength(1);
  });
});

function selfEvaluationActions(role: Role): ProtectedAction[] {
  const actions: ProtectedAction[] = [
    'walkthrough:submit', 'walkthrough:amend', 'q1_observation:submit', 'q1_observation:amend',
  ];
  if (role === 'school_head' || role === 'slt') {
    actions.push('q4_observation:submit', 'q4_observation:amend');
  }
  return actions;
}

function selfPipActions(role: Role): ProtectedAction[] {
  return role === 'slt'
    ? ['pip:propose', 'pip:approve', 'pip:close']
    : ['pip:propose'];
}
