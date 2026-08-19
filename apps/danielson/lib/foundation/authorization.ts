export const DANIELSON_ROLES = [
  'teacher',
  'hod',
  'coach',
  'school_head',
  'slt',
  'sysadmin',
] as const;

export type DanielsonRole = (typeof DANIELSON_ROLES)[number];

export const DANIELSON_CAPABILITIES = {
  teacher: ['published_record:read', 'teacher_response:write', 'pip_acknowledgment:write'],
  hod: [
    'teacher_report:read',
    'private_leadership:read',
    'walkthrough:submit',
    'walkthrough:amend',
    'q1_observation:submit',
    'q1_observation:amend',
    'pip:propose',
  ],
  coach: [
    'teacher_report:read',
    'private_leadership:read',
    'walkthrough:submit',
    'walkthrough:amend',
    'q1_observation:submit',
    'q1_observation:amend',
    'pip:propose',
  ],
  school_head: [
    'teacher_report:read',
    'private_leadership:read',
    'walkthrough:submit',
    'walkthrough:amend',
    'q1_observation:submit',
    'q1_observation:amend',
    'q4_observation:submit',
    'q4_observation:amend',
    'pip:propose',
  ],
  slt: [
    'teacher_report:read',
    'private_leadership:read',
    'walkthrough:submit',
    'walkthrough:amend',
    'q1_observation:submit',
    'q1_observation:amend',
    'q4_observation:submit',
    'q4_observation:amend',
    'pip:propose',
    'pip:approve',
    'pip:close',
  ],
  sysadmin: ['accounts:manage', 'departments:manage', 'assignments:manage', 'access_audit:read'],
} as const satisfies Record<DanielsonRole, readonly string[]>;

export type DanielsonCapability =
  (typeof DANIELSON_CAPABILITIES)[DanielsonRole][number];

export type DanielsonAction =
  | DanielsonCapability
  | 'teacher_report:read'
  | 'private_leadership:read'
  | 'walkthrough:submit'
  | 'walkthrough:amend'
  | 'q1_observation:submit'
  | 'q1_observation:amend'
  | 'q4_observation:submit'
  | 'q4_observation:amend'
  | 'pip:propose'
  | 'pip:approve'
  | 'pip:close'
  | 'accounts:manage'
  | 'departments:manage'
  | 'assignments:manage'
  | 'access_audit:read';

export type DanielsonDecisionReason =
  | 'unauthenticated'
  | 'account_inactive'
  | 'organization_inactive'
  | 'cross_organization'
  | 'capability_not_granted'
  | 'target_out_of_scope'
  | 'self_private_denied'
  | 'self_evaluation_denied'
  | 'self_pip_denied'
  | 'target_inactive'
  | 'final_active_sysadmin';

export type DanielsonAccessContext = {
  actor: {
    accountId: string;
    organizationId: string;
    isActive: boolean;
    organizationIsActive: boolean;
  } | null;
  subject: {
    accountId: string;
    organizationId: string;
    departmentIds: string[];
    isActive: boolean;
  } | null;
  roleAssignments: Array<{
    accountId: string;
    organizationId: string;
    role: DanielsonRole;
    status?: 'active' | 'revoked';
  }>;
  hodDepartmentAssignments: Array<{
    accountId: string;
    organizationId: string;
    departmentId: string;
    status?: 'active' | 'revoked';
  }>;
  coachTeacherAssignments: Array<{
    accountId: string;
    organizationId: string;
    teacherAccountId: string;
    status?: 'active' | 'revoked';
  }>;
};

export type DanielsonDecision =
  | { allowed: true; reason: null }
  | { allowed: false; reason: DanielsonDecisionReason };

const SUPERVISOR_ROLES = new Set<DanielsonRole>(['hod', 'coach', 'school_head', 'slt']);
const EVALUATION_ACTIONS = new Set<DanielsonAction>([
  'walkthrough:submit',
  'walkthrough:amend',
  'q1_observation:submit',
  'q1_observation:amend',
  'q4_observation:submit',
  'q4_observation:amend',
]);
const PIP_ACTIONS = new Set<DanielsonAction>(['pip:propose', 'pip:approve', 'pip:close']);

function active<T extends { status?: 'active' | 'revoked' }>(value: T): boolean {
  return value.status !== 'revoked';
}

function hasTargetScope(context: DanielsonAccessContext, role: DanielsonRole): boolean {
  const actor = context.actor;
  const subject = context.subject;
  if (!actor || !subject) return false;

  if (role === 'teacher') return actor.accountId === subject.accountId;
  if (role === 'school_head' || role === 'slt') return true;

  if (role === 'hod') {
    const subjectDepartments = new Set(subject.departmentIds);
    return context.hodDepartmentAssignments.some((assignment) =>
      assignment.accountId === actor.accountId
      && assignment.organizationId === actor.organizationId
      && active(assignment)
      && subjectDepartments.has(assignment.departmentId),
    );
  }

  if (role === 'coach') {
    return context.coachTeacherAssignments.some((assignment) =>
      assignment.accountId === actor.accountId
      && assignment.organizationId === actor.organizationId
      && assignment.teacherAccountId === subject.accountId
      && active(assignment),
    );
  }

  return false;
}

function isSelf(context: DanielsonAccessContext): boolean {
  return Boolean(context.actor && context.subject && context.actor.accountId === context.subject.accountId);
}

export function authorizeDanielsonAction(
  context: DanielsonAccessContext,
  action: DanielsonAction,
): DanielsonDecision {
  const actor = context.actor;
  if (!actor) return { allowed: false, reason: 'unauthenticated' };
  if (!actor.isActive) return { allowed: false, reason: 'account_inactive' };
  if (!actor.organizationIsActive) return { allowed: false, reason: 'organization_inactive' };

  const subjectAction = action !== 'accounts:manage'
    && action !== 'departments:manage'
    && action !== 'assignments:manage'
    && action !== 'access_audit:read';

  if (subjectAction) {
    const subject = context.subject;
    if (!subject) return { allowed: false, reason: 'target_inactive' };
    if (subject.organizationId !== actor.organizationId) {
      return { allowed: false, reason: 'cross_organization' };
    }
    if (!subject.isActive) return { allowed: false, reason: 'target_inactive' };

    if (isSelf(context) && action === 'private_leadership:read') {
      return { allowed: false, reason: 'self_private_denied' };
    }

    const activeSupervisor = context.roleAssignments.some((assignment) =>
      assignment.accountId === actor.accountId
      && assignment.organizationId === actor.organizationId
      && SUPERVISOR_ROLES.has(assignment.role)
      && active(assignment),
    );
    if (isSelf(context) && activeSupervisor && EVALUATION_ACTIONS.has(action)) {
      return { allowed: false, reason: 'self_evaluation_denied' };
    }
    if (isSelf(context) && activeSupervisor && PIP_ACTIONS.has(action)) {
      return { allowed: false, reason: 'self_pip_denied' };
    }
  }

  const eligibleRoles = context.roleAssignments
    .filter((assignment) =>
      assignment.accountId === actor.accountId
      && assignment.organizationId === actor.organizationId
      && active(assignment)
      && (DANIELSON_CAPABILITIES[assignment.role] as readonly string[]).includes(action),
    )
    .map((assignment) => assignment.role);

  if (eligibleRoles.length === 0) return { allowed: false, reason: 'capability_not_granted' };
  if (!subjectAction) return { allowed: true, reason: null };

  if (eligibleRoles.some((role) => hasTargetScope(context, role))) {
    return { allowed: true, reason: null };
  }

  return { allowed: false, reason: 'target_out_of_scope' };
}
