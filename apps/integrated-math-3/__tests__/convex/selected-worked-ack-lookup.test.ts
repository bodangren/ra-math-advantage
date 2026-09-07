import { describe, expect, it } from 'vitest';
import { getSelectedWorkedAcknowledgementHandler } from '@/convex/activities';
import { IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from '@/lib/practice/learning-evidence-pilot';

const publication = {
  nodes: [{ id: IM3_PILOT_NODE, kind: 'skill', reviewStatus: 'approved' }],
  blueprints: [{ nodeId: IM3_PILOT_NODE, reviewStatus: 'approved' }],
};

function context(submissionUser = 'profiles:student') {
  const profile = { _id: 'profiles:student', username: 'student', role: 'student', organizationId: 'org' };
  const activity = {
    _id: 'activities:worked', stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID,
    masteryNodeId: IM3_PILOT_NODE, componentKey: 'graphing-explorer',
    learningEvidenceMode: 'worked_example', srsEligible: false,
    approval: { status: 'approved' }, props: { equation: 'f(x) = x^2', variant: 'plot_from_equation' },
    gradingConfig: { autoGrade: false, partialCredit: false },
  };
  const submission = {
    _id: 'activity_submissions:worked', userId: submissionUser, activityId: activity._id,
    idempotencyKey: 'worked-example:activities:worked', attemptOrdinal: 1,
    masteryContractVersion: 'learning-evidence.v1', submittedAt: Date.parse('2026-09-07T00:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1', activityId: activity._id, mode: 'worked_example',
      status: 'submitted', attemptNumber: 1, submittedAt: '2026-09-07T00:00:00.000Z',
      answers: {}, parts: [],
    },
  };
  const db = {
    get: async (id: string) => id === profile._id ? profile : id === activity._id ? activity : null,
    query: (table: string) => ({
      withIndex: (_name: string, configure: (query: { eq(field: string, value: unknown): unknown }) => unknown) => {
        const filters = new Map<string, unknown>();
        const query = { eq(field: string, value: unknown) { filters.set(field, value); return query; } };
        configure(query);
        return { unique: async () => table === 'auth_credentials'
          ? { profileId: profile._id, username: profile.username, role: profile.role, organizationId: profile.organizationId, isActive: true }
          : filters.get('userId') === submission.userId ? submission : null };
      },
    }),
  };
  return { db, submission };
}

describe('selected Worked acknowledgement lookup', () => {
  it.each([
    ['wrong physical envelope', (row: Record<string, any>) => { row.submissionData.activityId = 'activities:other'; }],
    ['missing evidence contract', (row: Record<string, any>) => { delete row.masteryContractVersion; }],
    ['invalid ordinal', (row: Record<string, any>) => { row.attemptOrdinal = 0; }],
    ['mismatched attempt', (row: Record<string, any>) => { row.submissionData.attemptNumber = 2; }],
  ])('rejects %s on stored acknowledgement', async (_name, change) => {
    const ctx = context();
    change(ctx.submission);
    await expect(getSelectedWorkedAcknowledgementHandler(ctx as never,
      { userId: 'profiles:student', activityId: 'activities:worked' } as never,
      publication,
    )).resolves.toBeNull();
  });

  it('returns the exact learner acknowledgement', async () => {
    await expect(getSelectedWorkedAcknowledgementHandler(
      context() as never,
      { userId: 'profiles:student', activityId: 'activities:worked' } as never,
      publication,
    )).resolves.toEqual({ submissionId: 'activity_submissions:worked', acknowledged: true });
  });

  it('does not return another learner acknowledgement', async () => {
    await expect(getSelectedWorkedAcknowledgementHandler(
      context('profiles:other') as never,
      { userId: 'profiles:student', activityId: 'activities:worked' } as never,
      publication,
    )).resolves.toBeNull();
  });
});
