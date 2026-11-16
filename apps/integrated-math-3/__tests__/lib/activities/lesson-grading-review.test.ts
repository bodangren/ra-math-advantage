import { expect, it } from 'vitest';
import { gradeServerOwnedSubmission } from '@/lib/activities/server-grading';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
const envelope = (answer: string): PracticeSubmissionEnvelope => ({ contractVersion: 'practice.v1', activityId: toConvexActivityId('activity'), mode: 'independent_practice', status: 'submitted', attemptNumber: 1, submittedAt: new Date().toISOString(), answers: { q1: answer }, parts: [{ partId: 'q1', rawAnswer: answer, isCorrect: true, score: 1, maxScore: 1 }] });
it('grades a stored lesson quiz using the server-owned option', () => {
 const activity = { id: 'activity', componentKey: 'comprehension-quiz', props: { questions: [{ question: '2+2?', options: ['3','4'], correctIndex: 1 }] } };
 expect(gradeServerOwnedSubmission(activity, envelope('3')).score).toBe(0);
 expect(gradeServerOwnedSubmission(activity, envelope('4')).score).toBe(1);
});
it('does not grade an exploratory graph from forged client scores', () => {
 expect(gradeServerOwnedSubmission({ id: 'activity', componentKey: 'graphing-explorer', props: { variant: 'explore', equation: 'y=1/x' } }, envelope('4')).score).toBeUndefined();
});
