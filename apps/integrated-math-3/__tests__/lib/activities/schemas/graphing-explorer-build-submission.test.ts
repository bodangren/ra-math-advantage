import { describe, it, expect, vi } from 'vitest';
import { buildGraphingSubmission, GraphingSubmissionInput } from '@/lib/activities/schemas/graphing-explorer.schema';

describe('buildGraphingSubmission', () => {
  const mockInput: GraphingSubmissionInput = {
    activityId: 'test-activity',
    mode: 'practice',
    placedPoints: [{ x: 0, y: 0 }],
    intercepts: [
      { type: 'intercept', data: { x: -2, y: 0 }, timestamp: Date.now() },
      { type: 'intercept', data: { x: 2, y: 0 }, timestamp: Date.now() },
    ],
    hints: [
      { type: 'vertex', data: { x: 0, y: -4 }, timestamp: Date.now() },
    ],
    interactionHistory: [
      { type: 'hint_used', timestamp: Date.now(), data: { hintType: 'vertex' } },
    ],
    equation: 'y = x^2 - 4',
    domain: [-10, 10],
    range: [-10, 10],
    assessPointsCorrectness: vi.fn(() => true),
    assessInterceptsCorrectness: vi.fn(() => true),
  };

  it('creates a valid submission envelope', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'test-activity',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
    });
    expect(submission.submittedAt).toBeDefined();
  });

  it('includes placed points in answers', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission.answers.placedPoints).toEqual([{ x: 0, y: 0 }]);
  });

  it('includes intercepts in answers', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission.answers.intercepts).toEqual(mockInput.intercepts);
  });

  it('includes parts with correctness assessment', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission.parts).toHaveLength(2);
    expect(submission.parts[0]).toMatchObject({
      partId: 'placed_points',
      isCorrect: true,
    });
    expect(submission.parts[1]).toMatchObject({
      partId: 'intercepts',
      isCorrect: true,
      hintsUsed: 1,
    });
  });

  it('includes graph state in artifact', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission.artifact).toBeDefined();
    expect(submission.artifact?.graphState).toMatchObject({
      equation: 'y = x^2 - 4',
      domain: [-10, 10],
      range: [-10, 10],
      placedPoints: [{ x: 0, y: 0 }],
    });
  });

  it('includes interaction history', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission.interactionHistory).toEqual(mockInput.interactionHistory);
  });

  it('includes comparison answer when provided', () => {
    const inputWithComparison = {
      ...mockInput,
      comparisonAnswerSelected: 'second' as const,
      assessComparisonCorrectness: vi.fn(() => true),
    };

    const submission = buildGraphingSubmission(inputWithComparison);

    expect(submission.answers.comparisonAnswer).toBe('second');
    expect(submission.parts).toHaveLength(3);
    expect(submission.parts[2]).toMatchObject({
      partId: 'comparison',
      rawAnswer: 'second',
      isCorrect: true,
    });
  });

  it('includes intersection points when provided', () => {
    const inputWithIntersections = {
      ...mockInput,
      linearEquation: 'y = x',
      intersectionPoints: [{ x: -2, y: -2 }, { x: 2, y: 2 }],
    };

    const submission = buildGraphingSubmission(inputWithIntersections);

    expect(submission.answers.intersections).toEqual([{ x: -2, y: -2 }, { x: 2, y: 2 }]);
    expect(submission.parts).toHaveLength(3);
    expect(submission.parts[2]).toMatchObject({
      partId: 'intersections',
    });
  });

  it('validates against practice.v1 structure', () => {
    const submission = buildGraphingSubmission(mockInput);

    expect(submission).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: 'test-activity',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: expect.any(String),
      answers: expect.any(Object),
      parts: expect.any(Array),
      artifact: expect.any(Object),
    });
  });
});
