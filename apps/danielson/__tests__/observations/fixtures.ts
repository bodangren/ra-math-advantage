import type { PriorityProjection } from '../../lib/proficiency/processor';

export const OBSERVATION_NOW = '2026-09-15T08:00:00.000Z';
export const OBSERVATION_NOW_MS = Date.parse(OBSERVATION_NOW);
export const ORGANIZATION_A = 'organizations:school-a';
export const ORGANIZATION_B = 'organizations:school-b';
export const OBSERVER_ACCOUNT_ID = 'accounts:observer';
export const TEACHER_ACCOUNT_ID = 'accounts:teacher';
export const TEACHER_PROFILE_ID = 'teacher_profiles:teacher';
export const COMPONENT_1E = 'danielson.framework.component.1e';

export function priority(overrides: Partial<PriorityProjection> = {}): PriorityProjection {
  return {
    teacherId: TEACHER_PROFILE_ID,
    skillId: 'danielson.tlac.skill.double-plan',
    componentId: COMPONENT_1E,
    due: true,
    overdueDays: 0,
    currentProficiency: { rawRating: null, points: null, passes: false },
    evidenceGaps: ['no_valid_rated_evidence'],
    approvedPriorityInputs: [
      'due_status',
      'overdue_duration',
      'current_proficiency',
      'evidence_gap',
    ],
    ...overrides,
  };
}

export function teacherCandidate(overrides: Record<string, unknown> = {}) {
  return {
    teacherProfileId: TEACHER_PROFILE_ID,
    displayName: 'Teacher One',
    targets: [priority()],
    ...overrides,
  };
}

export function walkthroughDraft(overrides: Record<string, unknown> = {}) {
  return {
    draftId: 'observation_drafts:walkthrough-1',
    organizationId: ORGANIZATION_A,
    teacherProfileId: TEACHER_PROFILE_ID,
    observerAccountId: OBSERVER_ACCOUNT_ID,
    observationType: 'walkthrough',
    schoolYear: '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: '2026-09-15T07:45:00.000Z',
    status: 'draft',
    revision: 1,
    createdAt: OBSERVATION_NOW_MS,
    updatedAt: OBSERVATION_NOW_MS,
    items: [
      {
        itemId: 'item-a',
        skillId: 'danielson.tlac.skill.double-plan',
        componentId: COMPONENT_1E,
        priorityReason: 'evidence_gap',
        outcome: null,
        evidenceNote: null,
      },
      {
        itemId: 'item-b',
        skillId: 'danielson.tlac.skill.change-the-pace',
        componentId: COMPONENT_1E,
        priorityReason: 'due',
        outcome: null,
        evidenceNote: null,
      },
      {
        itemId: 'item-c',
        skillId: 'danielson.tlac.skill.engineer-efficiency',
        componentId: COMPONENT_1E,
        priorityReason: 'overdue',
        outcome: null,
        evidenceNote: null,
      },
    ],
    ...overrides,
  };
}

export function formalDraft(
  observationType: 'formal_q1' | 'formal_q4',
  overrides: Record<string, unknown> = {},
) {
  return walkthroughDraft({
    draftId: `observation_drafts:${observationType}`,
    observationType,
    items: [
      {
        itemId: 'component-1e',
        componentId: COMPONENT_1E,
        outcome: { kind: 'rated', rating: 3 },
        evidenceNote: null,
      },
    ],
    ...overrides,
  });
}
