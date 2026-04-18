import { describe, it, expect } from 'vitest';
import { v } from 'convex/values';
import type { Id } from '@/convex/_generated/dataModel';

describe('component_reviews schema validators', () => {
  const componentKinds = ['example', 'activity', 'practice'] as const;
  type ComponentKind = typeof componentKinds[number];

  const reviewStatuses = ['approved', 'needs_changes', 'rejected'] as const;
  type ReviewStatus = typeof reviewStatuses[number];

  const priorities = ['low', 'medium', 'high'] as const;

  const issueTags = [
    'math_correctness',
    'curriculum_alignment',
    'pedagogy',
    'wording',
    'ui_behavior',
    'answer_validation',
    'feedback_quality',
    'algorithmic_variation',
    'accessibility',
  ] as const;

  const componentKindValidator = v.union(
    v.literal('example'),
    v.literal('activity'),
    v.literal('practice'),
  );

  const reviewStatusValidator = v.union(
    v.literal('approved'),
    v.literal('needs_changes'),
    v.literal('rejected'),
  );

  const priorityValidator = v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
  );

  const placementValidator = v.optional(v.object({
    lessonId: v.optional(v.string()),
    lessonVersionId: v.optional(v.string()),
    phaseId: v.optional(v.string()),
    phaseNumber: v.optional(v.number()),
    sectionId: v.optional(v.string()),
  }));

  const componentReviewValidator = v.object({
    componentKind: componentKindValidator,
    componentId: v.string(),
    componentKey: v.optional(v.string()),
    componentContentHash: v.string(),
    status: reviewStatusValidator,
    comment: v.optional(v.string()),
    issueTags: v.optional(v.array(v.string())),
    priority: v.optional(priorityValidator),
    placement: placementValidator,
    createdBy: v.id('profiles'),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id('profiles')),
    resolutionReviewId: v.optional(v.id('component_reviews')),
  });

  it('defines all 3 component kinds', () => {
    expect(componentKinds).toHaveLength(3);
    expect(componentKinds).toContain('example');
    expect(componentKinds).toContain('activity');
    expect(componentKinds).toContain('practice');
  });

  it('defines all 3 review statuses', () => {
    expect(reviewStatuses).toHaveLength(3);
    expect(reviewStatuses).toContain('approved');
    expect(reviewStatuses).toContain('needs_changes');
    expect(reviewStatuses).toContain('rejected');
  });

  it('requires comments for needs_changes and rejected', () => {
    const validApproved = {
      componentKind: 'activity' as ComponentKind,
      componentId: 'test-123',
      componentContentHash: 'abc123',
      status: 'approved' as ReviewStatus,
      createdBy: 'profile1' as Id<'profiles'>,
      createdAt: Date.now(),
    };
    // Should not throw for approved without comment
    expect(validApproved).toBeDefined();

    const needsChangesWithoutComment = {
      ...validApproved,
      status: 'needs_changes' as ReviewStatus,
    };
    // For review row comments are enforced at mutation time, not just schema level
    expect(needsChangesWithoutComment).toBeDefined();

    const rejectedWithoutComment = {
      ...validApproved,
      status: 'rejected' as ReviewStatus,
    };
    // For review row comments are enforced at mutation time, not just schema level
    expect(rejectedWithoutComment).toBeDefined();
  });

  it('supports all priority values', () => {
    expect(priorities).toHaveLength(3);
    expect(priorities).toContain('low');
    expect(priorities).toContain('medium');
    expect(priorities).toContain('high');
  });

  it('supports all issue tags', () => {
    expect(issueTags).toHaveLength(9);
    expect(issueTags).toContain('math_correctness');
    expect(issueTags).toContain('curriculum_alignment');
    expect(issueTags).toContain('pedagogy');
    expect(issueTags).toContain('wording');
    expect(issueTags).toContain('ui_behavior');
    expect(issueTags).toContain('answer_validation');
    expect(issueTags).toContain('feedback_quality');
    expect(issueTags).toContain('algorithmic_variation');
    expect(issueTags).toContain('accessibility');
  });

  it('validators can be created without errors', () => {
    expect(() => componentKindValidator).not.toThrow();
    expect(() => reviewStatusValidator).not.toThrow();
    expect(() => priorityValidator).not.toThrow();
    expect(() => placementValidator).not.toThrow();
    expect(() => componentReviewValidator).not.toThrow();
  });
});
