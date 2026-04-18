import { describe, it, expect } from 'vitest';
import type { Doc } from '@/convex/_generated/dataModel';
import {
  resolveComponentKind,
  buildActivityPlacementMap,
  assembleReviewQueueItem,
} from '@/lib/activities/review-queue';

describe('resolveComponentKind', () => {
  it('maps worked_example to example', () => {
    expect(resolveComponentKind('worked_example')).toBe('example');
  });

  it('maps guided_practice to practice', () => {
    expect(resolveComponentKind('guided_practice')).toBe('practice');
  });

  it('maps independent_practice to practice', () => {
    expect(resolveComponentKind('independent_practice')).toBe('practice');
  });

  it('maps assessment to practice', () => {
    expect(resolveComponentKind('assessment')).toBe('practice');
  });

  it('maps explore to activity', () => {
    expect(resolveComponentKind('explore')).toBe('activity');
  });

  it('maps learn to activity', () => {
    expect(resolveComponentKind('learn')).toBe('activity');
  });

  it('maps vocabulary to activity', () => {
    expect(resolveComponentKind('vocabulary')).toBe('activity');
  });

  it('maps discourse to activity', () => {
    expect(resolveComponentKind('discourse')).toBe('activity');
  });

  it('maps reflection to activity', () => {
    expect(resolveComponentKind('reflection')).toBe('activity');
  });

  it('maps key_concept to activity', () => {
    expect(resolveComponentKind('key_concept')).toBe('activity');
  });
});

describe('buildActivityPlacementMap', () => {
  it('maps activity ids to their phase types', () => {
    const sections = [
      {
        _id: 'sec1',
        phaseVersionId: 'phase1',
        content: { activityId: 'act1', componentKey: 'graphing-explorer' },
      },
      {
        _id: 'sec2',
        phaseVersionId: 'phase2',
        content: { activityId: 'act2', componentKey: 'step-by-step-solver' },
      },
    ];
    const phases = [
      { _id: 'phase1', phaseType: 'worked_example', lessonVersionId: 'lv1' },
      { _id: 'phase2', phaseType: 'guided_practice', lessonVersionId: 'lv1' },
    ];

    const map = buildActivityPlacementMap(
      sections as Array<Pick<Doc<"phase_sections">, "_id" | "phaseVersionId" | "content">>,
      phases as unknown as Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">>,
    );

    expect(map.get('act1')).toEqual({
      phaseType: 'worked_example',
      sectionId: 'sec1',
      phaseId: 'phase1',
    });
    expect(map.get('act2')).toEqual({
      phaseType: 'guided_practice',
      sectionId: 'sec2',
      phaseId: 'phase2',
    });
  });

  it('ignores sections without activityId', () => {
    const sections = [
      {
        _id: 'sec1',
        phaseVersionId: 'phase1',
        content: { markdown: 'Some text' },
      },
    ];
    const phases = [
      { _id: 'phase1', phaseType: 'learn', lessonVersionId: 'lv1' },
    ];

    const map = buildActivityPlacementMap(
      sections as Array<Pick<Doc<"phase_sections">, "_id" | "phaseVersionId" | "content">>,
      phases as unknown as Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">>,
    );

    expect(map.size).toBe(0);
  });

  it('prefers the first section when an activity appears in multiple sections', () => {
    const sections = [
      {
        _id: 'sec1',
        phaseVersionId: 'phase1',
        content: { activityId: 'act1', componentKey: 'graphing-explorer' },
      },
      {
        _id: 'sec2',
        phaseVersionId: 'phase2',
        content: { activityId: 'act1', componentKey: 'graphing-explorer' },
      },
    ];
    const phases = [
      { _id: 'phase1', phaseType: 'worked_example', lessonVersionId: 'lv1' },
      { _id: 'phase2', phaseType: 'learn', lessonVersionId: 'lv1' },
    ];

    const map = buildActivityPlacementMap(
      sections as Array<Pick<Doc<"phase_sections">, "_id" | "phaseVersionId" | "content">>,
      phases as unknown as Array<Pick<Doc<"phase_versions">, "_id" | "phaseType">>,
    );

    expect(map.get('act1')).toEqual({
      phaseType: 'worked_example',
      sectionId: 'sec1',
      phaseId: 'phase1',
    });
  });
});

describe('assembleReviewQueueItem', () => {
  it('returns activity item when not placed in a lesson', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: { equation: 'y = x^2' },
      gradingConfig: { autoGrade: true },
      approval: { status: 'approved', contentHash: 'hash1' },
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: undefined,
      approvalRecord: undefined,
    });

    expect(item).not.toBeNull();
    expect(item!.componentKind).toBe('activity');
    expect(item!.componentId).toBe('act1');
    expect(item!.approval?.status).toBe('approved');
  });

  it('returns example item for worked_example phase', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Solving Example',
      props: { problemType: 'factoring' },
      gradingConfig: undefined,
      approval: undefined,
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'worked_example', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: undefined,
    });

    expect(item).not.toBeNull();
    expect(item!.componentKind).toBe('example');
    expect(item!.componentId).toBe('act1');
    expect(item!.approval).toBeUndefined();
  });

  it('returns practice item for guided_practice phase', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'comprehension-quiz',
      displayName: 'Quiz Practice',
      props: { questions: [] },
      gradingConfig: { autoGrade: true },
      approval: undefined,
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'guided_practice', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: undefined,
    });

    expect(item).not.toBeNull();
    expect(item!.componentKind).toBe('practice');
    expect(item!.componentId).toBe('act1');
  });

  it('respects componentKind filter', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example',
      props: {},
      approval: undefined,
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'worked_example', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: undefined,
      filterKind: 'practice',
    });

    expect(item).toBeNull();
  });

  it('respects status filter for unreviewed items', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing',
      props: {},
      approval: undefined,
    };

    const itemUnreviewed = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: undefined,
      approvalRecord: undefined,
      filterStatus: 'unreviewed',
    });

    expect(itemUnreviewed).not.toBeNull();

    const itemApproved = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: undefined,
      approvalRecord: undefined,
      filterStatus: 'approved',
    });

    expect(itemApproved).toBeNull();
  });

  it('uses component_approvals for example/practice status', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example',
      props: {},
      approval: undefined,
    };

    const approvalRecord = {
      status: 'needs_changes',
      contentHash: 'hash-old',
      reviewedAt: 123456,
      reviewedBy: 'profile1',
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'worked_example', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: approvalRecord as unknown as Parameters<typeof assembleReviewQueueItem>[0]['approvalRecord'],
    });

    expect(item).not.toBeNull();
    expect(item!.approval?.status).toBe('needs_changes');
  });

  it('marks activity as stale when content hash changes', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: { equation: 'y = x^2' },
      gradingConfig: undefined,
      approval: { status: 'approved', contentHash: 'outdated-hash' },
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: undefined,
      approvalRecord: undefined,
    });

    expect(item).not.toBeNull();
    expect(item!.isStale).toBe(true);
  });

  it('marks example as stale when content hash changes', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'step-by-step-solver',
      displayName: 'Example',
      props: { problemType: 'factoring' },
      approval: undefined,
    };

    const approvalRecord = {
      status: 'approved',
      contentHash: 'outdated-hash',
      reviewedAt: 123456,
      reviewedBy: 'profile1',
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'worked_example', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: approvalRecord as unknown as Parameters<typeof assembleReviewQueueItem>[0]['approvalRecord'],
    });

    expect(item).not.toBeNull();
    expect(item!.isStale).toBe(true);
  });

  it('marks practice as stale when content hash changes', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'comprehension-quiz',
      displayName: 'Quiz Practice',
      props: { questions: [] },
      gradingConfig: { autoGrade: true },
      approval: undefined,
    };

    const approvalRecord = {
      status: 'approved',
      contentHash: 'outdated-hash',
      reviewedAt: 123456,
      reviewedBy: 'profile1',
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: { phaseType: 'guided_practice', sectionId: 'sec1', phaseId: 'phase1' },
      approvalRecord: approvalRecord as unknown as Parameters<typeof assembleReviewQueueItem>[0]['approvalRecord'],
    });

    expect(item).not.toBeNull();
    expect(item!.isStale).toBe(true);
  });

  it('does not mark item as stale when hash matches current content', async () => {
    const activity = {
      _id: 'act1',
      componentKey: 'graphing-explorer',
      displayName: 'Graphing Explorer',
      props: {},
      gradingConfig: undefined,
      approval: undefined,
    };

    const item = await assembleReviewQueueItem({
      activity: activity as unknown as Parameters<typeof assembleReviewQueueItem>[0]['activity'],
      placement: undefined,
      approvalRecord: undefined,
    });

    expect(item).not.toBeNull();
    expect(item!.isStale).toBe(false);
  });
});
