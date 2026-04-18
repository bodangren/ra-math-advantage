/**
 * Practice Test Engine Types
 *
 * Version: practice-test.contract.v1
 *
 * This module defines types for the practice test engine which provides
 * summative assessment experiences with lesson-scoped question selection,
 * timed testing, immediate feedback, and persistent scores.
 */

export const PRACTICE_TEST_CONTRACT_VERSION = 'practice-test.contract.v1' as const;

export type PracticeTestQuestion = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  objectiveTags: string[];
};

export type PracticeTestLessonConfig = {
  lessonId: string;
  lessonNumber: number;
  title: string;
};

export type PracticeTestPhaseContent = {
  introduction: {
    heading: string;
    body: string;
  };
  assessment: {
    questionNumberLabel: string;
    correctFeedback: string;
    incorrectFeedback: string;
    continueButton: string;
  };
  closing: {
    heading: string;
    scoreLabel: string;
    perLessonBreakdownLabel: string;
    retryButton: string;
    backToModulesButton: string;
  };
};

export type PracticeTestMessaging = {
  selectLessons: string;
  questionCountLabel: string;
  questionCountPlaceholder: string;
  startTest: string;
  noQuestionsAvailable: string;
};

export type PracticeTestModuleConfig = {
  moduleNumber: number;
  title: string;
  description: string;
  lessons: PracticeTestLessonConfig[];
  questions: PracticeTestQuestion[];
  phaseContent: PracticeTestPhaseContent;
  messaging: PracticeTestMessaging;
};

export type PracticeTestAnswer = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type PracticeTestPerLessonBreakdown = {
  lessonId: string;
  lessonTitle: string;
  correct: number;
  total: number;
};

export type PracticeTestResult = {
  moduleNumber: number;
  lessonsTested: string[];
  questionCount: number;
  score: number;
  percentage: number;
  perLessonBreakdown: PracticeTestPerLessonBreakdown[];
  completedAt: string;
};

export type PracticeTestEngineState = {
  phase: 'introduction' | 'assessment' | 'closing';
  selectedLessonIds: string[];
  questionCount: number;
  questions: PracticeTestQuestion[];
  currentQuestionIndex: number;
  answers: PracticeTestAnswer[];
  shuffledDistractors: Map<string, string[]>;
};