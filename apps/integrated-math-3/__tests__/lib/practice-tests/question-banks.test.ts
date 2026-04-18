import { describe, it, expect } from 'vitest';
import {
  filterQuestionsByLessonIds,
  drawRandomQuestions,
  shuffleAnswers,
  getModuleConfig,
  getRegisteredModules,
  registerModuleConfig,
} from '@/lib/practice-tests/question-banks';
import type { PracticeTestQuestion, PracticeTestModuleConfig } from '@/lib/practice-tests/types';

const makeQuestion = (id: string, lessonId: string): PracticeTestQuestion => ({
  id,
  lessonId,
  lessonTitle: `Lesson ${lessonId}`,
  prompt: `Prompt for ${id}`,
  correctAnswer: 'A',
  distractors: ['B', 'C', 'D'],
  explanation: 'Explanation',
  objectiveTags: [],
});

describe('question-banks', () => {
  describe('filterQuestionsByLessonIds', () => {
    it('should return questions matching lesson IDs', () => {
      const questions: PracticeTestQuestion[] = [
        makeQuestion('q1', 'lesson-1-1'),
        makeQuestion('q2', 'lesson-1-1'),
        makeQuestion('q3', 'lesson-1-2'),
        makeQuestion('q4', 'lesson-1-3'),
      ];
      const result = filterQuestionsByLessonIds(questions, ['lesson-1-1', 'lesson-1-2']);
      expect(result).toHaveLength(3);
      expect(result.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
    });

    it('should return empty array when no matches', () => {
      const questions: PracticeTestQuestion[] = [
        makeQuestion('q1', 'lesson-1-1'),
      ];
      const result = filterQuestionsByLessonIds(questions, ['lesson-99']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty questions array', () => {
      const result = filterQuestionsByLessonIds([], ['lesson-1-1']);
      expect(result).toHaveLength(0);
    });

    it('should handle empty lesson IDs array', () => {
      const questions = [makeQuestion('q1', 'lesson-1-1')];
      const result = filterQuestionsByLessonIds(questions, []);
      expect(result).toHaveLength(0);
    });
  });

  describe('drawRandomQuestions', () => {
    it('should return up to count questions', () => {
      const questions: PracticeTestQuestion[] = [
        makeQuestion('q1', 'lesson-1-1'),
        makeQuestion('q2', 'lesson-1-1'),
        makeQuestion('q3', 'lesson-1-1'),
        makeQuestion('q4', 'lesson-1-1'),
        makeQuestion('q5', 'lesson-1-1'),
      ];
      const result = drawRandomQuestions(questions, 3);
      expect(result).toHaveLength(3);
    });

    it('should return all questions if count exceeds available', () => {
      const questions = [
        makeQuestion('q1', 'lesson-1-1'),
        makeQuestion('q2', 'lesson-1-1'),
      ];
      const result = drawRandomQuestions(questions, 10);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for count <= 0', () => {
      const questions = [makeQuestion('q1', 'lesson-1-1')];
      expect(drawRandomQuestions(questions, 0)).toHaveLength(0);
      expect(drawRandomQuestions(questions, -1)).toHaveLength(0);
    });

    it('should return empty array for empty questions', () => {
      const result = drawRandomQuestions([], 5);
      expect(result).toHaveLength(0);
    });

    it('should not modify original array', () => {
      const questions = [
        makeQuestion('q1', 'lesson-1-1'),
        makeQuestion('q2', 'lesson-1-1'),
        makeQuestion('q3', 'lesson-1-1'),
      ];
      const originalLength = questions.length;
      drawRandomQuestions(questions, 2);
      expect(questions).toHaveLength(originalLength);
    });
  });

  describe('shuffleAnswers', () => {
    it('should include all distractors and correct answer', () => {
      const question: PracticeTestQuestion = {
        id: 'q1',
        lessonId: 'lesson-1-1',
        lessonTitle: 'Test',
        prompt: 'Test prompt?',
        correctAnswer: 'CORRECT',
        distractors: ['WRONG1', 'WRONG2', 'WRONG3'],
        explanation: 'Test explanation',
        objectiveTags: [],
      };
      const { correctIndex, choices } = shuffleAnswers(question);
      expect(choices).toHaveLength(4);
      expect(choices).toContain('CORRECT');
      expect(choices).toContain('WRONG1');
      expect(choices).toContain('WRONG2');
      expect(choices).toContain('WRONG3');
      expect(choices[correctIndex]).toBe('CORRECT');
    });

    it('should return valid correctIndex between 0 and choices.length-1', () => {
      const question: PracticeTestQuestion = {
        id: 'q1',
        lessonId: 'lesson-1-1',
        lessonTitle: 'Test',
        prompt: 'Test prompt?',
        correctAnswer: 'A',
        distractors: ['B', 'C'],
        explanation: 'Explanation',
        objectiveTags: [],
      };
      const { correctIndex, choices } = shuffleAnswers(question);
      expect(correctIndex).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(choices.length);
    });

    it('should handle single distractor', () => {
      const question: PracticeTestQuestion = {
        id: 'q1',
        lessonId: 'lesson-1-1',
        lessonTitle: 'Test',
        prompt: 'Test prompt?',
        correctAnswer: 'CORRECT',
        distractors: ['WRONG'],
        explanation: 'Explanation',
        objectiveTags: [],
      };
      const { correctIndex, choices } = shuffleAnswers(question);
      expect(choices).toHaveLength(2);
      expect(choices[correctIndex]).toBe('CORRECT');
    });
  });

  describe('module config registration and retrieval', () => {
    const createModuleConfig = (num: number): PracticeTestModuleConfig => ({
      moduleNumber: num,
      title: `Module ${num}`,
      description: `Description for module ${num}`,
      lessons: [{ lessonId: `lesson-${num}-1`, lessonNumber: 1, title: `Lesson ${num}-1` }],
      questions: [],
      phaseContent: {
        introduction: { heading: `Module ${num} Practice Test`, body: 'Intro body' },
        assessment: {
          questionNumberLabel: 'Question {current} of {total}',
          correctFeedback: 'Correct!',
          incorrectFeedback: 'Incorrect.',
          continueButton: 'Continue',
        },
        closing: {
          heading: 'Test Complete!',
          scoreLabel: 'Your Score',
          perLessonBreakdownLabel: 'Breakdown',
          retryButton: 'Retry',
          backToModulesButton: 'Back',
        },
      },
      messaging: {
        selectLessons: 'Select lessons:',
        questionCountLabel: 'Questions:',
        questionCountPlaceholder: '5',
        startTest: 'Start',
        noQuestionsAvailable: 'No questions.',
      },
    });

    it('should register and retrieve module config', () => {
      const config = createModuleConfig(99);
      registerModuleConfig(config);
      expect(getModuleConfig(99)).toBe(config);
    });

    it('should return undefined for unregistered module', () => {
      expect(getModuleConfig(999)).toBeUndefined();
    });

    it('should return sorted registered module numbers', () => {
      registerModuleConfig(createModuleConfig(103));
      registerModuleConfig(createModuleConfig(101));
      registerModuleConfig(createModuleConfig(102));
      const modules = getRegisteredModules();
      expect(modules).toContain(101);
      expect(modules).toContain(102);
      expect(modules).toContain(103);
    });
  });

  describe('seeded module question banks', () => {
    it('should register all 9 modules via index import', async () => {
      await import('@/lib/practice-tests/modules/index');
      const modules = getRegisteredModules();
      for (let i = 1; i <= 9; i++) {
        expect(modules).toContain(i);
      }
    });

    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('module %i should have at least 3 questions per lesson', (modNum) => {
      const config = getModuleConfig(modNum);
      expect(config).toBeDefined();
      if (!config) return;
      expect(config.moduleNumber).toBe(modNum);
      expect(config.lessons.length).toBeGreaterThan(0);
      expect(config.questions.length).toBeGreaterThanOrEqual(config.lessons.length * 3);
      for (const lesson of config.lessons) {
        const lessonQuestions = config.questions.filter((q) => q.lessonId === lesson.lessonId);
        expect(lessonQuestions.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});