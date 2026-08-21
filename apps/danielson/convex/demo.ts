import { internalMutation, type MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';

import { buildDemoScenario, type DemoObservation, type DemoTeacher } from '../lib/demo/scenarios';
import { createCurrentGbfAssignment } from '../lib/gbf/progress';
import { PIP_SOURCE_CONTRACT } from '../lib/improvement-plans/source';
import { createDanielsonTeacherProficiencyPort } from '../lib/proficiency/convex-repository';
import { buildDanielsonGraph } from '../lib/proficiency/graph';
import { processTeacherEvidence } from '../lib/proficiency/processor';

const credentialInputValidator = v.object({
  username: v.string(),
  passwordHash: v.string(),
  passwordSalt: v.string(),
  passwordHashIterations: v.number(),
  mustChangePassword: v.boolean(),
});

const resultValidator = v.union(
  v.object({ kind: v.literal('created'), organizationId: v.id('organizations'), usernames: v.array(v.string()) }),
  v.object({ kind: v.literal('already_seeded'), organizationId: v.id('organizations'), usernames: v.array(v.string()) }),
  v.object({ kind: v.literal('conflict'), reason: v.string() }),
);

const DAY_MS = 86_400_000;

function observationItems(observation: DemoObservation) {
  const skillId = observation.targetSkillIds[0];
  return [{
    itemId: `demo:${observation.id}:item`,
    componentId: observation.componentId,
    ...(skillId ? { skillId } : {}),
    priorityReason: observation.priorityReason,
    outcome: observation.rating === null
      ? { kind: 'not_enough_evidence' as const }
      : { kind: 'rated' as const, rating: observation.rating },
    evidenceNote: observation.evidenceNote,
  }];
}

async function writeObservation(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  teacher: DemoTeacher,
  profileId: Id<'teacher_profiles'>,
  observerAccountId: Id<'accounts'>,
  observation: DemoObservation,
  referenceTime: number,
  graph: ReturnType<typeof buildDanielsonGraph>['graph'],
) {
  const observedAtMs = Date.parse(observation.observedAt);
  const observationId = await ctx.db.insert('observation_records', {
    organizationId,
    teacherProfileId: profileId,
    observerAccountId,
    observationType: observation.observationType,
    schoolYear: observation.schoolYear,
    sourceVersion: observation.sourceVersion,
    frameworkVersion: observation.frameworkVersion,
    observedAt: observation.observedAt,
    status: 'submitted',
    revision: 1,
    items: observationItems(observation),
    submissionKey: `demo:${observation.id}`,
    submissionFingerprint: `demo:${observation.id}:fingerprint`,
    submittedAt: observedAtMs,
    publishedAt: observedAtMs,
    createdAt: observedAtMs,
    updatedAt: observedAtMs,
  });

  const evidence = {
    kind: observation.rating === null ? 'not_enough_evidence' as const : 'rated' as const,
    organizationId: String(organizationId),
    teacherId: String(profileId),
    sourceRecordId: String(observationId),
    ...(observation.observationType !== 'walkthrough'
      ? { formalObservationId: String(observationId) }
      : {}),
    sourceType: observation.observationType,
    componentId: observation.componentId,
    targetSkillIds: observation.targetSkillIds,
    observerId: String(observerAccountId),
    occurredAt: observation.observedAt,
    sourceVersion: observation.sourceVersion,
    provenanceGroupId: `demo:${teacher.username}`,
    idempotencyKey: `demo:${observation.id}`,
    ...(observation.rating === null ? {} : { rating: observation.rating }),
  };
  const port = createDanielsonTeacherProficiencyPort(ctx, organizationId);
  await processTeacherEvidence({
    evidence,
    graph,
    now: new Date(referenceTime).toISOString(),
    port,
  });
  return observationId;
}

async function writePip(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  teacher: DemoTeacher,
  profileId: Id<'teacher_profiles'>,
  departmentId: Id<'departments'>,
  supervisorAccountId: Id<'accounts'>,
  referenceTime: number,
  graph: ReturnType<typeof buildDanielsonGraph>['graph'],
) {
  const pip = teacher.pip;
  if (!pip) return;
  const teacherProfile = await ctx.db.get(profileId);
  const department = await ctx.db.get(departmentId);
  if (!teacherProfile || !department) throw new Error('demo_pip_context_missing');
  const planId = await ctx.db.insert('improvement_plans', {
    organizationId,
    teacherProfileId: profileId,
    state: pip.state,
    revision: pip.state === 'closed' ? 3 : 2,
    latestVersion: 1,
    activeVersion: 1,
    activeTargets: pip.targets,
    approvedAt: Date.parse(pip.approvedAt),
    planEndAt: Date.parse(`${pip.planEndDate}T23:59:59.999Z`),
    reviewMeetingAt: Date.parse(`${pip.reviewMeetingDate}T00:00:00.000Z`),
    ...(pip.state === 'closed'
      ? {
          closedAt: Date.parse(pip.closedAt ?? new Date(referenceTime).toISOString()),
          closureOutcome: pip.outcome ?? 'successful',
          closureNote: pip.closureNote ?? 'The teacher met the expected standard.',
        }
      : {}),
    createdAt: Date.parse(pip.approvedAt) - DAY_MS,
    updatedAt: referenceTime,
  });
  const versionId = await ctx.db.insert('improvement_plan_versions', {
    organizationId,
    planId,
    teacherProfileId: profileId,
    version: 1,
    proposerAccountId: supervisorAccountId,
    supervisorAccountId,
    teacherName: teacher.displayName,
    position: teacher.position,
    departmentId,
    departmentName: department.name,
    supervisorName: 'Alex Morgan',
    requestedPlanEndDate: pip.planEndDate,
    reviewMeetingDate: pip.reviewMeetingDate,
    purpose: pip.purpose,
    areasOfConcern: pip.areasOfConcern,
    expectedStandard: 'The teacher demonstrates the Danielson standard in published evidence.',
    requiredActions: pip.requiredActions,
    evidenceOfImprovement: pip.evidenceOfImprovement,
    schoolSupport: pip.schoolSupport,
    successfulCompletionCriteria: pip.successfulCompletionCriteria,
    insufficientImprovementConsequences: PIP_SOURCE_CONTRACT.fixedText.insufficientImprovementConsequences,
    acknowledgmentText: PIP_SOURCE_CONTRACT.fixedText.acknowledgmentText,
    sourceId: PIP_SOURCE_CONTRACT.sourceId,
    sourceVersion: PIP_SOURCE_CONTRACT.sourceVersion,
    fingerprint: `demo:${teacher.username}:pip`,
    proposedAt: Date.parse(pip.approvedAt) - DAY_MS,
  });
  for (const [ordinal, target] of pip.targets.entries()) {
    const component = graph.nodes.find((node) => node.id === target.componentId);
    const skill = graph.nodes.find((node) => node.id === target.skillId);
    await ctx.db.insert('improvement_plan_targets', {
      organizationId,
      planId,
      versionId,
      teacherProfileId: profileId,
      ordinal,
      componentId: target.componentId,
      componentTitle: component?.title ?? target.componentId,
      skillId: target.skillId,
      skillTitle: skill?.title ?? target.skillId,
      expectedRating: target.expectedRating,
      expectedPoints: target.expectedRating === 4 ? 100 : 90,
      sourceId: PIP_SOURCE_CONTRACT.sourceId,
      sourceVersion: PIP_SOURCE_CONTRACT.sourceVersion,
      componentSourceRefs: component?.sourceRefs ?? [],
      skillSourceRefs: skill?.sourceRefs ?? [],
      createdAt: Date.parse(pip.approvedAt) - DAY_MS,
    });
  }
  await ctx.db.patch(planId, {
    activeVersionId: versionId,
    ...(pip.state === 'closed' ? { closureEventId: `demo:${teacher.username}:pip-closed` } : { approvalEventId: `demo:${teacher.username}:pip-approved` }),
  });
  await ctx.db.insert('improvement_plan_events', {
    organizationId,
    planId,
    teacherProfileId: profileId,
    version: 1,
    versionId,
    kind: 'proposed',
    requestId: `demo:${teacher.username}:pip-proposed`,
    fingerprint: `demo:${teacher.username}:pip-proposed`,
    actorAccountId: supervisorAccountId,
    occurredAt: Date.parse(pip.approvedAt) - DAY_MS,
    revision: 1,
    payload: {},
  });
  await ctx.db.insert('improvement_plan_events', {
    organizationId,
    planId,
    teacherProfileId: profileId,
    version: 1,
    versionId,
    kind: 'approved',
    requestId: `demo:${teacher.username}:pip-approved`,
    fingerprint: `demo:${teacher.username}:pip-approved`,
    actorAccountId: supervisorAccountId,
    occurredAt: Date.parse(pip.approvedAt),
    revision: 2,
    payload: {
      planStartAt: Date.parse(pip.approvedAt),
      planEndAt: Date.parse(`${pip.planEndDate}T23:59:59.999Z`),
    },
  });
  if (pip.state === 'closed') {
    await ctx.db.insert('improvement_plan_events', {
      organizationId,
      planId,
      teacherProfileId: profileId,
      version: 1,
      versionId,
      kind: 'closed',
      requestId: `demo:${teacher.username}:pip-closed`,
      fingerprint: `demo:${teacher.username}:pip-closed`,
      actorAccountId: supervisorAccountId,
      occurredAt: Date.parse(pip.closedAt ?? new Date(referenceTime).toISOString()),
      revision: 3,
      payload: {
        outcome: pip.outcome ?? 'successful',
        note: pip.closureNote ?? 'The teacher met the expected standard.',
      },
    });
  }
}

export const seedLocalDemo = internalMutation({
  args: {
    organizationSlug: v.string(),
    organizationName: v.string(),
    referenceTime: v.number(),
    credentials: v.array(credentialInputValidator),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.referenceTime)) return { kind: 'conflict' as const, reason: 'invalid_reference_time' };
    const scenario = buildDemoScenario(args.referenceTime);
    if (args.organizationSlug !== scenario.organization.slug || args.organizationName !== scenario.organization.name) {
      return { kind: 'conflict' as const, reason: 'invalid_demo_identity' };
    }
    const byUsername = new Map(args.credentials.map((credential) => [credential.username, credential]));
    if (scenario.accounts.some((account) => !byUsername.has(account.username))) {
      return { kind: 'conflict' as const, reason: 'missing_demo_credential' };
    }
    const organization = await ctx.db.query('organizations')
      .withIndex('by_slug', (query) => query.eq('slug', args.organizationSlug))
      .unique();
    if (organization) {
      const accounts = await Promise.all(scenario.accounts.map((account) => ctx.db.query('accounts')
        .withIndex('by_username', (query) => query.eq('username', account.username))
        .unique()));
      const complete = organization.name === args.organizationName
        && accounts.every((account) => account?.organizationId === organization._id);
      return complete
        ? { kind: 'already_seeded' as const, organizationId: organization._id, usernames: [...scenario.accounts.map((account) => account.username)] }
        : { kind: 'conflict' as const, reason: 'organization_identity_conflict' };
    }
    if ((await ctx.db.query('organizations').take(1)).length > 0) {
      return { kind: 'conflict' as const, reason: 'unrelated_organization_exists' };
    }
    const collidingAccount = await Promise.all(scenario.accounts.map((account) => ctx.db.query('accounts')
      .withIndex('by_username', (query) => query.eq('username', account.username))
      .unique()));
    if (collidingAccount.some((account) => account !== null)) {
      return { kind: 'conflict' as const, reason: 'demo_username_exists' };
    }

    const now = args.referenceTime;
    const createdOrganizationId = await ctx.db.insert('organizations', {
      slug: scenario.organization.slug,
      name: scenario.organization.name,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const accountIds = new Map<string, Id<'accounts'>>();
    for (const account of scenario.accounts) {
      const accountId = await ctx.db.insert('accounts', {
        organizationId: createdOrganizationId,
        username: account.username,
        displayName: account.displayName,
        sharedSessionRole: account.sharedSessionRole,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      accountIds.set(account.username, accountId);
      const credential = byUsername.get(account.username);
      if (!credential) throw new Error('demo_credential_missing_after_validation');
      await ctx.db.insert('auth_credentials', {
        accountId,
        username: account.username,
        passwordHash: credential.passwordHash,
        passwordSalt: credential.passwordSalt,
        passwordHashIterations: credential.passwordHashIterations,
        isActive: true,
        mustChangePassword: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    const systemAdminId = accountIds.get('demo.sysadmin');
    const sltId = accountIds.get('demo.slt');
    if (!systemAdminId || !sltId) throw new Error('demo_admin_accounts_missing');
    for (const account of scenario.accounts) {
      const accountId = accountIds.get(account.username);
      if (!accountId) throw new Error('demo_account_missing');
      for (const role of account.roles) {
        await ctx.db.insert('role_assignments', {
          organizationId: createdOrganizationId,
          accountId,
          role,
          status: 'active',
          createdByAccountId: systemAdminId,
          createdAt: now,
        });
      }
    }
    const departmentIds = new Map<string, Id<'departments'>>();
    for (const department of scenario.departments) {
      const departmentId = await ctx.db.insert('departments', {
        organizationId: createdOrganizationId,
        key: department.key,
        name: department.name,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      departmentIds.set(department.key, departmentId);
    }
    const teacherProfileIds = new Map<string, Id<'teacher_profiles'>>();
    for (const teacher of scenario.teachers) {
      const accountId = accountIds.get(teacher.username);
      if (!accountId) throw new Error('demo_teacher_account_missing');
      const profileId = await ctx.db.insert('teacher_profiles', {
        organizationId: createdOrganizationId,
        accountId,
        position: teacher.position,
        currentGbfAssignmentId: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      teacherProfileIds.set(teacher.username, profileId);
    }
    for (const membership of scenario.departmentMemberships) {
      const departmentId = departmentIds.get(membership.departmentKey);
      const teacherProfileId = teacherProfileIds.get(membership.teacherUsername);
      if (!departmentId || !teacherProfileId) throw new Error('demo_membership_target_missing');
      await ctx.db.insert('department_memberships', {
        organizationId: createdOrganizationId,
        departmentId,
        teacherProfileId,
        status: 'active',
        createdByAccountId: systemAdminId,
        createdAt: now,
      });
    }
    const hodDepartmentId = departmentIds.get(scenario.hodAssignment.departmentKey);
    const hodAccountId = accountIds.get(scenario.hodAssignment.accountUsername);
    if (!hodDepartmentId || !hodAccountId) throw new Error('demo_hod_target_missing');
    await ctx.db.insert('hod_assignments', {
      organizationId: createdOrganizationId,
      accountId: hodAccountId,
      departmentId: hodDepartmentId,
      status: 'active',
      createdByAccountId: systemAdminId,
      createdAt: now,
    });
    for (const assignment of scenario.coachAssignments) {
      const accountId = accountIds.get(assignment.accountUsername);
      const teacherProfileId = teacherProfileIds.get(assignment.teacherUsername);
      if (!accountId || !teacherProfileId) throw new Error('demo_coach_target_missing');
      await ctx.db.insert('coach_assignments', {
        organizationId: createdOrganizationId,
        accountId,
        teacherProfileId,
        status: 'active',
        createdByAccountId: systemAdminId,
        createdAt: now,
      });
    }

    const graph = buildDanielsonGraph().graph;
    const observationIds = new Map<string, Id<'observation_records'>>();
    for (const teacher of scenario.teachers) {
      const profileId = teacherProfileIds.get(teacher.username);
      if (!profileId) throw new Error('demo_teacher_profile_missing');
      for (const observation of teacher.observations) {
        const observationId = await writeObservation(
          ctx,
          createdOrganizationId,
          teacher,
          profileId,
          sltId,
          observation,
          now,
          graph,
        );
        observationIds.set(observation.id, observationId);
      }
    }
    const assignmentSource = scenario.teachers.find((teacher) => teacher.gbf !== null);
    if (assignmentSource?.gbf) {
      const profileId = teacherProfileIds.get(assignmentSource.username);
      if (!profileId) throw new Error('demo_gbf_teacher_missing');
      const assignment = createCurrentGbfAssignment({
        assignmentId: 'pending',
        organizationId: String(createdOrganizationId),
        teacherProfileId: String(profileId),
        assignedByAccountId: String(sltId),
        assignedAt: now,
      });
      const assignmentId = await ctx.db.insert('teacher_gbf_assignments', {
        organizationId: createdOrganizationId,
        teacherProfileId: profileId,
        assignedSkillIds: assignmentSource.gbf.assignedSkillIds.length > 0 ? assignmentSource.gbf.assignedSkillIds : assignment.assignedSkillIds,
        unsequencedGapSkillIds: assignmentSource.gbf.unresolvedGapSkillIds.length > 0 ? assignmentSource.gbf.unresolvedGapSkillIds : assignment.unresolvedGapSkillIds,
        actorAccountId: sltId,
        assignedAt: now,
      });
      await ctx.db.patch(profileId, { currentGbfAssignmentId: assignmentId, updatedAt: now });
    }
    for (const teacher of scenario.teachers) {
      const profileId = teacherProfileIds.get(teacher.username);
      const departmentId = departmentIds.get(teacher.departmentKeys[0]);
      if (!profileId || !departmentId) throw new Error('demo_pip_target_missing');
      await writePip(ctx, createdOrganizationId, teacher, profileId, departmentId, sltId, now, graph);
      for (const content of teacher.publicComments) {
        const observationId = observationIds.get(teacher.observations.at(-1)?.id ?? '');
        if (observationId) await ctx.db.insert('observation_public_comments', {
          organizationId: createdOrganizationId,
          observationId,
          teacherProfileId: profileId,
          authorAccountId: sltId,
          content,
          createdAt: now,
        });
      }
      for (const content of teacher.privateComments) {
        const observationId = observationIds.get(teacher.observations.at(-1)?.id ?? '');
        if (observationId) await ctx.db.insert('observation_private_comments', {
          organizationId: createdOrganizationId,
          observationId,
          teacherProfileId: profileId,
          authorAccountId: sltId,
          content,
          createdAt: now,
        });
      }
      for (const content of teacher.responses) {
        const observationId = observationIds.get(teacher.observations.at(-1)?.id ?? '');
        if (observationId) {
          const accountId = accountIds.get(teacher.username);
          if (!accountId) throw new Error('demo_response_author_missing');
          await ctx.db.insert('teacher_observation_responses', {
            organizationId: createdOrganizationId,
            observationId,
            teacherProfileId: profileId,
            authorAccountId: accountId,
            content,
            submittedAt: now,
          });
        }
      }
    }
    return {
      kind: 'created' as const,
      organizationId: createdOrganizationId,
      usernames: scenario.accounts.map((account) => account.username),
    };
  },
});
