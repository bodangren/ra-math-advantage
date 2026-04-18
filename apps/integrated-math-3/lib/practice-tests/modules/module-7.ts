/**
 * Module 7: Rational Functions and Equations
 *
 * Question bank for Module 7 practice tests.
 * 4 questions per lesson covering rational expressions, functions, and equations.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_7_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 7-1: Multiplying and Dividing Rational Expressions
  {
    id: 'm7-l1-q1',
    lessonId: 'lesson-7-1',
    lessonTitle: 'Multiplying and Dividing Rational Expressions',
    prompt: 'Simplify: (4x^2 / 3y) * (9y / 2x)',
    correctAnswer: '6x',
    distractors: ['2x', '12x^2 / 6xy', '36x^2y / 6xy'],
    explanation: 'Multiply numerators and denominators: (36x^2y) / (6xy) = 6x.',
    objectiveTags: ['A-APR.7'],
  },
  {
    id: 'm7-l1-q2',
    lessonId: 'lesson-7-1',
    lessonTitle: 'Multiplying and Dividing Rational Expressions',
    prompt: 'Divide: [(x + 2) / (x - 3)] ÷ [(x + 2) / (x + 1)]',
    correctAnswer: '(x + 1) / (x - 3)',
    distractors: ['(x - 3) / (x + 1)', '1', '(x + 2)^2 / (x - 3)(x + 1)'],
    explanation: 'Invert and multiply: [(x + 2) / (x - 3)] * [(x + 1) / (x + 2)] = (x + 1) / (x - 3).',
    objectiveTags: ['A-APR.7'],
  },
  {
    id: 'm7-l1-q3',
    lessonId: 'lesson-7-1',
    lessonTitle: 'Multiplying and Dividing Rational Expressions',
    prompt: 'Simplify: (x^2 - 9) / (x + 2) * (x + 2) / (2x - 6)',
    correctAnswer: '(x + 3) / 2',
    distractors: ['(x - 3) / 2', 'x + 3', '(x^2 - 9) / (2x - 6)'],
    explanation: 'Factor: (x - 3)(x + 3)/(x + 2) * (x + 2)/[2(x - 3)] = (x + 3)/2.',
    objectiveTags: ['A-APR.7', 'A-SSE.2'],
  },
  {
    id: 'm7-l1-q4',
    lessonId: 'lesson-7-1',
    lessonTitle: 'Multiplying and Dividing Rational Expressions',
    prompt: 'What is the first step when dividing two rational expressions?',
    correctAnswer: 'Multiply by the reciprocal of the divisor',
    distractors: ['Factor all denominators', 'Find a common denominator', 'Cross-multiply'],
    explanation: 'Division of rational expressions is performed by multiplying by the reciprocal of the divisor.',
    objectiveTags: ['A-APR.7'],
  },

  // Lesson 7-2: Adding and Subtracting Rational Expressions
  {
    id: 'm7-l2-q1',
    lessonId: 'lesson-7-2',
    lessonTitle: 'Adding and Subtracting Rational Expressions',
    prompt: 'Simplify: 5/x + 3/x',
    correctAnswer: '8/x',
    distractors: ['8/(2x)', '15/x', '8/x^2'],
    explanation: 'With a common denominator, add the numerators: (5 + 3)/x = 8/x.',
    objectiveTags: ['A-APR.7'],
  },
  {
    id: 'm7-l2-q2',
    lessonId: 'lesson-7-2',
    lessonTitle: 'Adding and Subtracting Rational Expressions',
    prompt: 'Simplify: 1/(x + 1) + 1/(x - 1)',
    correctAnswer: '2x / (x^2 - 1)',
    distractors: ['2 / (x^2 - 1)', '2 / (2x)', 'x / (x^2 - 1)'],
    explanation: 'Common denominator is (x + 1)(x - 1) = x^2 - 1. [(x - 1) + (x + 1)] / (x^2 - 1) = 2x / (x^2 - 1).',
    objectiveTags: ['A-APR.7'],
  },
  {
    id: 'm7-l2-q3',
    lessonId: 'lesson-7-2',
    lessonTitle: 'Adding and Subtracting Rational Expressions',
    prompt: 'Subtract: (3x)/(x - 4) - 12/(x - 4)',
    correctAnswer: '3',
    distractors: ['(3x - 12)/(x - 4)^2', '3x - 12', '(3x - 12)/(2x - 8)'],
    explanation: 'Combine numerators: (3x - 12)/(x - 4) = 3(x - 4)/(x - 4) = 3.',
    objectiveTags: ['A-APR.7', 'A-SSE.2'],
  },
  {
    id: 'm7-l2-q4',
    lessonId: 'lesson-7-2',
    lessonTitle: 'Adding and Subtracting Rational Expressions',
    prompt: 'What is the least common denominator of 2/x and 3/(x + 2)?',
    correctAnswer: 'x(x + 2)',
    distractors: ['x + 2', 'x^2 + 2', '2x + 4'],
    explanation: 'The LCD is the product of the distinct factors in each denominator: x(x + 2).',
    objectiveTags: ['A-APR.7'],
  },

  // Lesson 7-3: Graphing Reciprocal Functions
  {
    id: 'm7-l3-q1',
    lessonId: 'lesson-7-3',
    lessonTitle: 'Graphing Reciprocal Functions',
    prompt: 'What is the vertical asymptote of y = 1/(x - 3)?',
    correctAnswer: 'x = 3',
    distractors: ['y = 0', 'x = 0', 'y = 3'],
    explanation: 'The denominator is zero when x = 3, creating a vertical asymptote at x = 3.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l3-q2',
    lessonId: 'lesson-7-3',
    lessonTitle: 'Graphing Reciprocal Functions',
    prompt: 'What is the horizontal asymptote of y = 1/x + 2?',
    correctAnswer: 'y = 2',
    distractors: ['y = 0', 'x = 2', 'y = 1'],
    explanation: 'As x approaches ±∞, 1/x approaches 0, so y approaches 2.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l3-q3',
    lessonId: 'lesson-7-3',
    lessonTitle: 'Graphing Reciprocal Functions',
    prompt: 'Which point lies on the graph of y = 1/x?',
    correctAnswer: '(1, 1)',
    distractors: ['(0, 0)', '(1, 0)', '(0, 1)'],
    explanation: 'When x = 1, y = 1/1 = 1. The point (1, 1) is on the graph.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l3-q4',
    lessonId: 'lesson-7-3',
    lessonTitle: 'Graphing Reciprocal Functions',
    prompt: 'The graph of y = 1/x is symmetric about which lines?',
    correctAnswer: 'y = x and y = -x',
    distractors: ['x-axis and y-axis', 'y = x only', 'x = 1 and y = 1'],
    explanation: 'The reciprocal function has symmetry with respect to the lines y = x and y = -x.',
    objectiveTags: ['F-IF.7', 'F-BF.3'],
  },

  // Lesson 7-4: Graphing Rational Functions
  {
    id: 'm7-l4-q1',
    lessonId: 'lesson-7-4',
    lessonTitle: 'Graphing Rational Functions',
    prompt: 'What is the vertical asymptote of f(x) = (x + 2)/(x - 5)?',
    correctAnswer: 'x = 5',
    distractors: ['x = -2', 'y = 1', 'x = 0'],
    explanation: 'Set the denominator equal to zero: x - 5 = 0, so x = 5.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l4-q2',
    lessonId: 'lesson-7-4',
    lessonTitle: 'Graphing Rational Functions',
    prompt: 'What is the horizontal asymptote of f(x) = (3x + 1)/(x - 2)?',
    correctAnswer: 'y = 3',
    distractors: ['y = 1', 'y = 0', 'x = 3'],
    explanation: 'When degrees of numerator and denominator are equal, the horizontal asymptote is the ratio of leading coefficients: 3/1 = 3.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l4-q3',
    lessonId: 'lesson-7-4',
    lessonTitle: 'Graphing Rational Functions',
    prompt: 'Find the x-intercept of y = (x - 4)/(x + 1).',
    correctAnswer: '(4, 0)',
    distractors: ['(-1, 0)', '(0, -4)', '(1, 0)'],
    explanation: 'Set the numerator equal to zero: x - 4 = 0, so x = 4. The x-intercept is (4, 0).',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm7-l4-q4',
    lessonId: 'lesson-7-4',
    lessonTitle: 'Graphing Rational Functions',
    prompt: 'A rational function has a hole in its graph when...',
    correctAnswer: 'A factor cancels in the numerator and denominator',
    distractors: ['The denominator equals zero', 'The degree of the numerator is greater', 'The function is undefined'],
    explanation: 'A hole occurs when the same factor appears in both numerator and denominator and cancels out.',
    objectiveTags: ['F-IF.7', 'A-APR.7'],
  },

  // Lesson 7-5: Variation
  {
    id: 'm7-l5-q1',
    lessonId: 'lesson-7-5',
    lessonTitle: 'Variation',
    prompt: 'y varies directly with x. If y = 12 when x = 3, what is y when x = 5?',
    correctAnswer: '20',
    distractors: ['15', '8', '36'],
    explanation: 'Direct variation: y = kx. k = 12/3 = 4. When x = 5, y = 4(5) = 20.',
    objectiveTags: ['A-CED.1'],
  },
  {
    id: 'm7-l5-q2',
    lessonId: 'lesson-7-5',
    lessonTitle: 'Variation',
    prompt: 'y varies inversely with x. If y = 8 when x = 2, what is y when x = 4?',
    correctAnswer: '4',
    distractors: ['16', '2', '32'],
    explanation: 'Inverse variation: y = k/x. k = 8(2) = 16. When x = 4, y = 16/4 = 4.',
    objectiveTags: ['A-CED.1'],
  },
  {
    id: 'm7-l5-q3',
    lessonId: 'lesson-7-5',
    lessonTitle: 'Variation',
    prompt: 'z varies jointly with x and y. If z = 30 when x = 2 and y = 5, find z when x = 4 and y = 3.',
    correctAnswer: '36',
    distractors: ['24', '20', '45'],
    explanation: 'Joint variation: z = kxy. k = 30/(2*5) = 3. When x = 4 and y = 3, z = 3(4)(3) = 36.',
    objectiveTags: ['A-CED.1'],
  },
  {
    id: 'm7-l5-q4',
    lessonId: 'lesson-7-5',
    lessonTitle: 'Variation',
    prompt: 'Which equation represents inverse variation between y and x?',
    correctAnswer: 'y = 10/x',
    distractors: ['y = 10x', 'y = x + 10', 'y = 10x^2'],
    explanation: 'Inverse variation has the form y = k/x, where k is a constant.',
    objectiveTags: ['A-CED.1'],
  },

  // Lesson 7-6: Solving Rational Equations and Inequalities
  {
    id: 'm7-l6-q1',
    lessonId: 'lesson-7-6',
    lessonTitle: 'Solving Rational Equations and Inequalities',
    prompt: 'Solve: 3/x = 6',
    correctAnswer: 'x = 1/2',
    distractors: ['x = 2', 'x = 18', 'x = 1/6'],
    explanation: 'Multiply both sides by x: 3 = 6x, so x = 3/6 = 1/2.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm7-l6-q2',
    lessonId: 'lesson-7-6',
    lessonTitle: 'Solving Rational Equations and Inequalities',
    prompt: 'Solve: (x + 3)/(x - 2) = 2',
    correctAnswer: 'x = 7',
    distractors: ['x = 1', 'x = 5', 'x = -1'],
    explanation: 'Multiply both sides by (x - 2): x + 3 = 2(x - 2) → x + 3 = 2x - 4 → 7 = x.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm7-l6-q3',
    lessonId: 'lesson-7-6',
    lessonTitle: 'Solving Rational Equations and Inequalities',
    prompt: 'Solve: 1/x = 1/(x + 1) + 1/x',
    correctAnswer: 'No solution',
    distractors: ['x = 0', 'x = -1', 'x = 1'],
    explanation: 'Subtract 1/x from both sides: 0 = 1/(x + 1). This has no solution since 1/(x+1) is never zero.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm7-l6-q4',
    lessonId: 'lesson-7-6',
    lessonTitle: 'Solving Rational Equations and Inequalities',
    prompt: 'Solve: 2/(x - 1) > 0',
    correctAnswer: 'x > 1',
    distractors: ['x < 1', 'x > 0', 'All real numbers except 1'],
    explanation: 'The fraction is positive when the denominator is positive (since numerator is positive). Thus x - 1 > 0, so x > 1.',
    objectiveTags: ['A-REI.2'],
  },
];

const MODULE_7_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 7,
  title: 'Rational Functions and Equations',
  description:
    'Master rational expressions, reciprocal and rational function graphs, variation relationships, and solving rational equations and inequalities.',
  lessons: [
    { lessonId: 'lesson-7-1', lessonNumber: 1, title: 'Multiplying and Dividing Rational Expressions' },
    { lessonId: 'lesson-7-2', lessonNumber: 2, title: 'Adding and Subtracting Rational Expressions' },
    { lessonId: 'lesson-7-3', lessonNumber: 3, title: 'Graphing Reciprocal Functions' },
    { lessonId: 'lesson-7-4', lessonNumber: 4, title: 'Graphing Rational Functions' },
    { lessonId: 'lesson-7-5', lessonNumber: 5, title: 'Variation' },
    { lessonId: 'lesson-7-6', lessonNumber: 6, title: 'Solving Rational Equations and Inequalities' },
  ],
  questions: MODULE_7_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 7 Practice Test',
      body: 'Rational Functions and Equations. Select the lessons you want to include and choose how many questions to answer.',
    },
    assessment: {
      questionNumberLabel: 'Question {current} of {total}',
      correctFeedback: 'Correct!',
      incorrectFeedback: 'Incorrect. See the explanation below.',
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
    selectLessons: 'Select lessons to include in this practice test:',
    questionCountLabel: 'Number of questions:',
    questionCountPlaceholder: '10',
    startTest: 'Start Test',
    noQuestionsAvailable:
      'No questions available for the selected lessons. Please select at least one lesson.',
  },
};

registerModuleConfig(MODULE_7_CONFIG);

export default MODULE_7_CONFIG;
