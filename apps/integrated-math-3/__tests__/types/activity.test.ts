import { describe, it, expect } from 'vitest';
import type {
  Activity,
  ActivityComponentProps,
  PracticeSubmissionEnvelope,
  PracticeMode,
  PracticeSubmissionStatus,
  PracticeSubmissionPart,
} from '@/types/activity';

describe('types/activity', () => {
  describe('PracticeMode type', () => {
    it('includes all expected modes', () => {
      const modes: PracticeMode[] = ['worked_example', 'guided_practice', 'independent_practice', 'assessment', 'teaching'];
      expect(modes).toHaveLength(5);
    });
  });

  describe('PracticeSubmissionStatus type', () => {
    it('includes all expected statuses', () => {
      const statuses: PracticeSubmissionStatus[] = ['draft', 'submitted', 'graded', 'returned'];
      expect(statuses).toHaveLength(4);
    });
  });

  describe('PracticeSubmissionPart', () => {
    it('accepts valid part structure', () => {
      const part: PracticeSubmissionPart = {
        partId: 'part-1',
        rawAnswer: 42,
        normalizedAnswer: '42',
        isCorrect: true,
        score: 10,
        maxScore: 10,
        misconceptionTags: ['common_error_1'],
        hintsUsed: 2,
        revealStepsSeen: 1,
        changedCount: 3,
      };

      expect(part.partId).toBe('part-1');
      expect(part.rawAnswer).toBe(42);
      expect(part.normalizedAnswer).toBe('42');
      expect(part.isCorrect).toBe(true);
    });

    it('accepts minimal part structure', () => {
      const part: PracticeSubmissionPart = {
        partId: 'part-1',
        rawAnswer: 'answer',
      };

      expect(part.partId).toBe('part-1');
      expect(part.rawAnswer).toBe('answer');
    });
  });

  describe('PracticeSubmissionEnvelope', () => {
    it('accepts valid envelope structure', () => {
      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: 'activity-123',
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2024-04-09T20:00:00.000Z',
        answers: {
          'part-1': 'answer 1',
          'part-2': 42,
        },
        parts: [
          {
            partId: 'part-1',
            rawAnswer: 'answer 1',
            normalizedAnswer: 'answer 1',
            isCorrect: true,
            score: 5,
            maxScore: 5,
          },
        ],
        artifact: { graphData: { points: [[0, 0], [1, 1]] } },
        interactionHistory: [{ type: 'hint', timestamp: '2024-04-09T20:01:00.000Z' }],
        analytics: { timeSpentSeconds: 120 },
        studentFeedback: 'This was helpful',
        teacherSummary: 'Good work',
      };

      expect(envelope.contractVersion).toBe('practice.v1');
      expect(envelope.activityId).toBe('activity-123');
      expect(envelope.mode).toBe('independent_practice');
      expect(envelope.parts).toHaveLength(1);
    });

    it('accepts minimal envelope structure', () => {
      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: 'activity-123',
        mode: 'guided_practice',
        status: 'draft',
        attemptNumber: 1,
        submittedAt: '2024-04-09T20:00:00.000Z',
        answers: { 'part-1': 'answer' },
        parts: [{ partId: 'part-1', rawAnswer: 'answer' }],
      };

      expect(envelope.contractVersion).toBe('practice.v1');
      expect(envelope.parts).toHaveLength(1);
    });
  });

  describe('Activity type', () => {
    it('accepts valid activity structure', () => {
      const activity: Activity = {
        _id: 'activity-123',
        componentKey: 'graphing-explorer',
        displayName: 'Graphing Explorer',
        description: 'Interactive graphing tool',
        props: {
          equation: 'y = x^2',
          domain: [-10, 10],
          range: [-10, 10],
        },
        gradingConfig: {
          autoGrade: true,
          passingScore: 80,
          partialCredit: true,
        },
        standardId: 'standard-123',
      };

      expect(activity.componentKey).toBe('graphing-explorer');
      expect(activity.props).toBeDefined();
    });

    it('accepts minimal activity structure', () => {
      const activity: Activity = {
        _id: 'activity-123',
        componentKey: 'comprehension-quiz',
        displayName: 'Quiz',
        props: {},
      };

      expect(activity.componentKey).toBe('comprehension-quiz');
      expect(activity.props).toBeDefined();
    });
  });

  describe('ActivityComponentProps', () => {
    it('accepts valid props structure', () => {
      const activity: Activity = {
        _id: 'activity-123',
        componentKey: 'graphing-explorer',
        displayName: 'Graphing Explorer',
        props: { equation: 'y = x^2' },
      };

      const props: ActivityComponentProps = {
        activity,
        mode: 'practice',
        onSubmit: (envelope: PracticeSubmissionEnvelope) => {
          expect(envelope.activityId).toBe('activity-123');
        },
        onComplete: () => {
          // Handler called on completion
        },
      };

      expect(props.activity.componentKey).toBe('graphing-explorer');
      expect(props.mode).toBe('practice');
      expect(props.onSubmit).toBeDefined();
      expect(props.onComplete).toBeDefined();
    });

    it('accepts props without optional handlers', () => {
      const activity: Activity = {
        _id: 'activity-123',
        componentKey: 'comprehension-quiz',
        displayName: 'Quiz',
        props: {},
      };

      const props: ActivityComponentProps = {
        activity,
        mode: 'guided',
      };

      expect(props.activity.componentKey).toBe('comprehension-quiz');
      expect(props.onSubmit).toBeUndefined();
      expect(props.onComplete).toBeUndefined();
    });

    it('onSubmit callback receives correct envelope type', () => {
      const activity: Activity = {
        _id: 'activity-123',
        componentKey: 'equation-solver',
        displayName: 'Equation Solver',
        props: {},
      };

      let capturedEnvelope: PracticeSubmissionEnvelope | null = null;

      const props: ActivityComponentProps = {
        activity,
        mode: 'practice',
        onSubmit: (envelope: PracticeSubmissionEnvelope) => {
          capturedEnvelope = envelope;
          // TypeScript should enforce envelope is PracticeSubmissionEnvelope
          expect(envelope.contractVersion).toBe('practice.v1');
        },
      };

      // Simulate submission
      const testEnvelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: activity._id,
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: {},
        parts: [],
      };

      if (props.onSubmit) {
        props.onSubmit(testEnvelope);
      }

      expect(capturedEnvelope).not.toBeNull();
      expect(capturedEnvelope!.activityId).toBe(activity._id);
    });
  });
});
