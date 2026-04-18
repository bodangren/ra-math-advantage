import { describe, it, expect } from 'vitest';
import type {
  PracticeTestQuestion,
  PracticeTestModuleConfig,
  PracticeTestAnswer,
  PracticeTestResult,
  PracticeTestEngineState,
  PracticeTestLessonConfig,
} from '@/lib/practice-tests/types';
import { PRACTICE_TEST_CONTRACT_VERSION } from '@/lib/practice-tests/types';

describe('practice-tests types', () => {
  describe('PRACTICE_TEST_CONTRACT_VERSION', () => {
    it('should export a version string', () => {
      expect(PRACTICE_TEST_CONTRACT_VERSION).toBe('practice-test.contract.v1');
    });
  });

  describe('PracticeTestQuestion', () => {
    it('should accept a valid question object', () => {
      const question: PracticeTestQuestion = {
        id: 'q1',
        lessonId: 'lesson-1-1',
        lessonTitle: 'Solving Quadratic Equations by Graphing',
        prompt: 'What is the x-intercept of y = x^2 - 4?',
        correctAnswer: '(2, 0) and (-2, 0)',
        distractors: ['(0, -4)', '(1, -3)', '(4, 0)'],
        explanation: 'The x-intercepts occur when y = 0, so x^2 - 4 = 0, giving x = ±2.',
        objectiveTags: ['A-SSE.3', 'F-IF.7'],
      };
      expect(question.id).toBe('q1');
      expect(question.distractors).toHaveLength(3);
      expect(question.objectiveTags).toContain('A-SSE.3');
    });

    it('should require at least one distractor', () => {
      const question: PracticeTestQuestion = {
        id: 'q2',
        lessonId: 'lesson-1-2',
        lessonTitle: 'Factoring Quadratics',
        prompt: 'Factor x^2 + 5x + 6',
        correctAnswer: '(x + 2)(x + 3)',
        distractors: ['(x + 1)(x + 6)', '(x - 2)(x - 3)'],
        explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3.',
        objectiveTags: ['A-SSE.2'],
      };
      expect(question.distractors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('PracticeTestLessonConfig', () => {
    it('should accept a valid lesson config', () => {
      const lesson: PracticeTestLessonConfig = {
        lessonId: 'lesson-1-1',
        lessonNumber: 1,
        title: 'Solving Quadratic Equations by Graphing',
      };
      expect(lesson.lessonNumber).toBe(1);
      expect(lesson.lessonId).toBe('lesson-1-1');
    });
  });

  describe('PracticeTestAnswer', () => {
    it('should track answer with correctness', () => {
      const answer: PracticeTestAnswer = {
        questionId: 'q1',
        selectedAnswer: '(2, 0) and (-2, 0)',
        isCorrect: true,
        answeredAt: '2026-04-17T10:00:00.000Z',
      };
      expect(answer.isCorrect).toBe(true);
    });

    it('should track incorrect answers', () => {
      const answer: PracticeTestAnswer = {
        questionId: 'q2',
        selectedAnswer: '(x + 1)(x + 6)',
        isCorrect: false,
        answeredAt: '2026-04-17T10:01:00.000Z',
      };
      expect(answer.isCorrect).toBe(false);
    });
  });

  describe('PracticeTestResult', () => {
    it('should calculate percentage correctly', () => {
      const result: PracticeTestResult = {
        moduleNumber: 1,
        lessonsTested: ['lesson-1-1', 'lesson-1-2'],
        questionCount: 10,
        score: 8,
        percentage: 80,
        perLessonBreakdown: [
          { lessonId: 'lesson-1-1', lessonTitle: 'Lesson 1-1', correct: 5, total: 6 },
          { lessonId: 'lesson-1-2', lessonTitle: 'Lesson 1-2', correct: 3, total: 4 },
        ],
        completedAt: '2026-04-17T10:30:00.000Z',
      };
      expect(result.percentage).toBe(80);
      expect(result.perLessonBreakdown).toHaveLength(2);
    });
  });

  describe('PracticeTestEngineState', () => {
    it('should track all phases', () => {
      const state: PracticeTestEngineState = {
        phase: 'introduction',
        selectedLessonIds: [],
        questionCount: 5,
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        shuffledDistractors: new Map(),
      };
      expect(state.phase).toBe('introduction');
      expect(state.currentQuestionIndex).toBe(0);
    });

    it('should transition through assessment phase', () => {
      const state: PracticeTestEngineState = {
        phase: 'assessment',
        selectedLessonIds: ['lesson-1-1', 'lesson-1-2'],
        questionCount: 3,
        questions: [],
        currentQuestionIndex: 1,
        answers: [],
        shuffledDistractors: new Map(),
      };
      expect(state.phase).toBe('assessment');
      expect(state.currentQuestionIndex).toBe(1);
    });
  });

  describe('PracticeTestModuleConfig structure', () => {
    it('should require all module config fields', () => {
      const config: PracticeTestModuleConfig = {
        moduleNumber: 1,
        title: 'Quadratic Functions',
        description: 'Explore quadratic functions, their graphs, and applications.',
        lessons: [
          { lessonId: 'lesson-1-1', lessonNumber: 1, title: 'Solving by Graphing' },
          { lessonId: 'lesson-1-2', lessonNumber: 2, title: 'Factoring' },
        ],
        questions: [],
        phaseContent: {
          introduction: {
            heading: 'Module 1 Practice Test',
            body: 'Select the lessons you want to practice and choose your question count.',
          },
          assessment: {
            questionNumberLabel: 'Question {current} of {total}',
            correctFeedback: 'Correct!',
            incorrectFeedback: 'Incorrect.',
            continueButton: 'Continue',
          },
          closing: {
            heading: 'Test Complete!',
            scoreLabel: 'Your Score',
            perLessonBreakdownLabel: 'Breakdown by Lesson',
            retryButton: 'Retry Test',
            backToModulesButton: 'Back to Modules',
          },
        },
        messaging: {
          selectLessons: 'Select lessons to include:',
          questionCountLabel: 'Number of questions:',
          questionCountPlaceholder: '5',
          startTest: 'Start Test',
          noQuestionsAvailable: 'No questions available for selected lessons.',
        },
      };
      expect(config.moduleNumber).toBe(1);
      expect(config.lessons).toHaveLength(2);
      expect(config.phaseContent.introduction.heading).toBe('Module 1 Practice Test');
      expect(config.messaging.startTest).toBe('Start Test');
    });
  });
});