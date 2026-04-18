import { describe, it, expect } from 'vitest';
import {
  resolveComponentKind,
  buildActivityPlacementMap,
  assembleReviewQueueItem,
  type ActivityDoc,
  type ApprovalRecord,
} from '../review-queue';

describe('resolveComponentKind', () => {
  it('should return "example" for worked_example phase', () => {
    expect(resolveComponentKind('worked_example')).toBe('example');
  });

  it('should return "practice" for guided_practice phase', () => {
    expect(resolveComponentKind('guided_practice')).toBe('practice');
  });

  it('should return "practice" for independent_practice phase', () => {
    expect(resolveComponentKind('independent_practice')).toBe('practice');
  });

  it('should return "practice" for assessment phase', () => {
    expect(resolveComponentKind('assessment')).toBe('practice');
  });

  it('should return "activity" for other phase types', () => {
    expect(resolveComponentKind('explore')).toBe('activity');
    expect(resolveComponentKind('discourse')).toBe('activity');
    expect(resolveComponentKind('introduction')).toBe('activity');
  });
});

describe('buildActivityPlacementMap', () => {
  it('should build correct map from sections and phases', () => {
    const sections = [
      { _id: 'section-1', phaseVersionId: 'phase-1', content: { activityId: 'activity-a' } },
      { _id: 'section-2', phaseVersionId: 'phase-2', content: { activityId: 'activity-b' } },
    ];
    const phases = [
      { _id: 'phase-1', phaseType: 'worked_example' },
      { _id: 'phase-2', phaseType: 'independent_practice' },
    ];

    const map = buildActivityPlacementMap(sections, phases);

    expect(map.get('activity-a')).toEqual({
      phaseType: 'worked_example',
      sectionId: 'section-1',
      phaseId: 'phase-1',
    });
    expect(map.get('activity-b')).toEqual({
      phaseType: 'independent_practice',
      sectionId: 'section-2',
      phaseId: 'phase-2',
    });
  });

  it('should skip sections without activityId', () => {
    const sections = [
      { _id: 'section-1', phaseVersionId: 'phase-1', content: { activityId: 'activity-a' } },
      { _id: 'section-2', phaseVersionId: 'phase-1', content: null },
    ];
    const phases = [{ _id: 'phase-1', phaseType: 'explore' }];

    const map = buildActivityPlacementMap(sections, phases);

    expect(map.size).toBe(1);
    expect(map.has('activity-a')).toBe(true);
  });

  it('should not duplicate activity ids', () => {
    const sections = [
      { _id: 'section-1', phaseVersionId: 'phase-1', content: { activityId: 'activity-a' } },
      { _id: 'section-2', phaseVersionId: 'phase-2', content: { activityId: 'activity-a' } },
    ];
    const phases = [
      { _id: 'phase-1', phaseType: 'explore' },
      { _id: 'phase-2', phaseType: 'practice' },
    ];

    const map = buildActivityPlacementMap(sections, phases);

    expect(map.size).toBe(1);
  });

  it('should handle missing phase gracefully', () => {
    const sections = [
      { _id: 'section-1', phaseVersionId: 'phase-missing', content: { activityId: 'activity-a' } },
    ];
    const phases: Array<{ _id: string; phaseType: string }> = [];

    const map = buildActivityPlacementMap(sections, phases);

    expect(map.size).toBe(0);
  });
});

describe('assembleReviewQueueItem', () => {
  it('should assemble activity with placement', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'activity-1',
      componentKey: 'comprehension-quiz',
      displayName: 'Comprehension Quiz',
      props: { questions: 5 },
      gradingConfig: null,
    };
    const placement = {
      phaseType: 'explore',
      sectionId: 'section-1',
      phaseId: 'phase-1',
    };

    const item = await assembleReviewQueueItem({ activity, placement });

    expect(item).not.toBeNull();
    expect(item!.componentKind).toBe('activity');
    expect(item!.componentId).toBe('activity-1');
    expect(item!.componentKey).toBe('comprehension-quiz');
    expect(item!.displayName).toBe('Comprehension Quiz');
    expect(item!.currentHash).toBeTruthy();
    expect(item!.storedHash).toBeUndefined();
    expect(item!.isStale).toBe(false);
  });

  it('should filter by component kind', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'activity-1',
      componentKey: 'test',
      displayName: 'Test',
      gradingConfig: null,
    };
    const placement = { phaseType: 'worked_example', sectionId: 's1', phaseId: 'p1' };

    const item = await assembleReviewQueueItem({
      activity,
      placement,
      filterKind: 'activity',
    });

    expect(item).toBeNull();
  });

  it('should filter by status', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'activity-1',
      componentKey: 'test',
      displayName: 'Test',
      gradingConfig: null,
      approval: { status: 'approved' },
    };
    const placement = { phaseType: 'explore', sectionId: 's1', phaseId: 'p1' };

    const item = await assembleReviewQueueItem({
      activity,
      placement,
      filterStatus: 'needs_changes',
    });

    expect(item).toBeNull();
  });

  it('should mark stale when hashes differ', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'activity-1',
      componentKey: 'test',
      displayName: 'Test',
      props: { answer: 42 },
      gradingConfig: null,
      approval: { status: 'approved', contentHash: 'oldhash' },
    };
    const placement = { phaseType: 'explore', sectionId: 's1', phaseId: 'p1' };

    const item = await assembleReviewQueueItem({ activity, placement });

    expect(item!.isStale).toBe(true);
    expect(item!.storedHash).toBe('oldhash');
  });

  it('should return null for onlyStale when not stale', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'activity-1',
      componentKey: 'test',
      displayName: 'Test',
      gradingConfig: null,
    };
    const placement = { phaseType: 'explore', sectionId: 's1', phaseId: 'p1' };

    const item = await assembleReviewQueueItem({ activity, placement, onlyStale: true });

    expect(item).toBeNull();
  });

  it('should use approval record for non-activity components', async () => {
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'example-1',
      componentKey: 'example-key',
      displayName: 'Example',
      gradingConfig: null,
    };
    const placement = { phaseType: 'worked_example', sectionId: 's1', phaseId: 'p1' };
    const approvalRecord: ApprovalRecord = {
      status: 'approved',
      contentHash: 'example-hash',
      reviewedAt: Date.now(),
      reviewedBy: 'teacher-1',
    };

    const item = await assembleReviewQueueItem({
      activity,
      placement,
      approvalRecord,
    });

    expect(item).not.toBeNull();
    expect(item!.componentKind).toBe('example');
    expect(item!.storedHash).toBe('example-hash');
    expect(item!.approval?.status).toBe('approved');
  });

  it('should extract steps from props', async () => {
    const steps = [
      { expression: 'x^2 - 4', explanation: 'difference of squares' },
      { expression: '(x-2)(x+2)', explanation: 'factoring' },
    ];
    const activity: Pick<ActivityDoc, '_id' | 'componentKey' | 'displayName' | 'props' | 'gradingConfig' | 'approval'> = {
      _id: 'practice-1',
      componentKey: 'step-by-step',
      displayName: 'Step By Step',
      props: { steps },
      gradingConfig: null,
    };
    const placement = { phaseType: 'independent_practice', sectionId: 's1', phaseId: 'p1' };

    const item = await assembleReviewQueueItem({ activity, placement });

    expect(item!.steps).toEqual(steps);
  });
});
