import {
  authorizeDanielsonAction,
  type DanielsonAccessContext,
  type DanielsonAction,
  type DanielsonDecisionReason,
} from './authorization';

export type FoundationChange = {
  kind: string;
  targetAccountId?: string;
  accountId?: string;
  teacherAccountId?: string;
  departmentId?: string;
  organizationId?: string;
  role?: string;
  displayName?: string;
  username?: string;
  coachAccountId?: string;
  [key: string]: unknown;
};

export interface DanielsonFoundationRepository {
  resolveAccessContext(sessionToken: string, subjectAccountId: string | null): Promise<DanielsonAccessContext>;
  readTeacherReport(subjectAccountId: string): Promise<Record<string, unknown>>;
  readPrivateLeadership(subjectAccountId: string): Promise<Record<string, unknown>>;
  writeProtectedAction(action: DanielsonAction, subjectAccountId: string, payload: unknown): Promise<unknown>;
  commitAdministrationChange(input: {
    actorAccountId: string;
    organizationId: string;
    requestId: string;
    change: FoundationChange;
  }): Promise<unknown>;
  listAccessAuditEvents(input: { organizationId: string; cursor?: string | null }): Promise<unknown>;
}

type Denied = { kind: 'denied'; reason: DanielsonDecisionReason | 'duplicate_request' | 'invalid_role' | 'audit_write_failed' };

function denied(reason: Denied['reason']): Denied {
  return { kind: 'denied', reason };
}

function decisionFailure(context: DanielsonAccessContext, action: DanielsonAction): Denied | null {
  const decision = authorizeDanielsonAction(context, action);
  return decision.allowed ? null : denied(decision.reason);
}

function administrationCapability(change: FoundationChange): DanielsonAction {
  if (change.kind.startsWith('account.')) return 'accounts:manage';
  if (change.kind.startsWith('department.') || change.kind.startsWith('department_membership.')) {
    return 'departments:manage';
  }
  return 'assignments:manage';
}

export function createDanielsonFoundationService(repository: DanielsonFoundationRepository) {
  return {
    async readTeacherReport(input: {
      sessionToken: string;
      subjectAccountId: string;
      includePrivateLeadership?: boolean;
      tokenRole?: string;
      tokenOrganizationId?: string;
    }) {
      const context = await repository.resolveAccessContext(input.sessionToken, input.subjectAccountId);
      const reportFailure = decisionFailure(context, 'teacher_report:read');
      if (reportFailure) return reportFailure;

      const report = await repository.readTeacherReport(input.subjectAccountId);
      const result: Record<string, unknown> = { ...report };

      if (input.includePrivateLeadership) {
        const privateFailure = decisionFailure(context, 'private_leadership:read');
        if (!privateFailure) {
          result.privateLeadership = await repository.readPrivateLeadership(input.subjectAccountId);
        }
      }

      return { kind: 'allowed' as const, report: result };
    },

    async executeTeacherAction(input: {
      sessionToken: string;
      subjectAccountId: string;
      action: Exclude<
        DanielsonAction,
        | 'published_record:read'
        | 'teacher_response:write'
        | 'pip_acknowledgment:write'
        | 'teacher_report:read'
        | 'private_leadership:read'
        | 'accounts:manage'
        | 'departments:manage'
        | 'assignments:manage'
        | 'access_audit:read'
      >;
      payload: unknown;
    }) {
      const context = await repository.resolveAccessContext(input.sessionToken, input.subjectAccountId);
      const failure = decisionFailure(context, input.action);
      if (failure) return failure;

      const result = await repository.writeProtectedAction(input.action, input.subjectAccountId, input.payload);
      return { kind: 'allowed' as const, result };
    },

    async applyAdministrationChange(input: {
      sessionToken: string;
      requestId: string;
      change: FoundationChange;
    }) {
      const context = await repository.resolveAccessContext(input.sessionToken, null);
      const failure = decisionFailure(context, administrationCapability(input.change));
      if (failure) return failure;
      if (!context.actor) return denied('unauthenticated');

      return repository.commitAdministrationChange({
        actorAccountId: context.actor.accountId,
        organizationId: context.actor.organizationId,
        requestId: input.requestId,
        change: input.change,
      });
    },

    async listAdministrationAuditEvents(input: { sessionToken: string; cursor?: string | null }) {
      const context = await repository.resolveAccessContext(input.sessionToken, null);
      const failure = decisionFailure(context, 'access_audit:read');
      if (failure) return failure;
      if (!context.actor) return denied('unauthenticated');

      const events = await repository.listAccessAuditEvents({
        organizationId: context.actor.organizationId,
        cursor: input.cursor,
      });
      return { kind: 'allowed' as const, events };
    },
  };
}
