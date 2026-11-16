import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectIM1VerbalToNumerical } from '@math-platform/math-content/knowledge-space';

const { publication, item } = vi.hoisted(() => ({
  publication: { approved: false },
  item: { card: { variantKey: 'translation-independent', objectiveId: 'math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express' } },
}));
vi.mock('@math-platform/srs-engine', () => ({ buildDailyQueue: () => [item] }));
vi.mock('@/convex/activities', () => ({
  IM1_TRANSLATION_NODE_ID: item.card.objectiveId,
  isTranslationPilotPublished: () => publication.approved,
  isTranslationPilotReady: () => publication.approved,
}));
import { resolveDailyPracticeQueue } from '@/convex/queue/queue';

function context() {
  const activity = { _id: 'activity-1', stableActivityId: `${item.card.objectiveId}.independent_practice`, masteryNodeId: item.card.objectiveId,
    learningEvidenceMode: 'independent_practice', componentKey: 'fill-in-the-blank', generatorSeed: 1103, generatorDifficulty: 1,
    approval: { status: 'approved' }, srsEligible: true, props: { expectedAnswer: 'private stale answer' } };
  return { db: {
    get: async () => activity,
    query: () => ({ withIndex: () => ({ take: async () => [], collect: async () => [], first: async () => ({ activityId: activity._id }) }) }),
  } };
}

describe('IM1 translation daily queue boundary', () => {
  beforeEach(() => { publication.approved = false; });
  it('does not route an approved stored activity around curriculum publication', async () => {
    expect(await resolveDailyPracticeQueue(context() as never, { studentId: 'student-1' })).toEqual([]);
  });
  it('regenerates approved Independent display props instead of forwarding stored answers', async () => {
    publication.approved = true;
    const queue = await resolveDailyPracticeQueue(context() as never, { studentId: 'student-1' });
    expect(queue).toHaveLength(1);
    expect(queue[0].props).toEqual(projectIM1VerbalToNumerical({ nodeId: item.card.objectiveId, seed: 1103, difficulty: 1 }, 'independent_practice', `${item.card.objectiveId}.independent_practice`).props);
  });
});
