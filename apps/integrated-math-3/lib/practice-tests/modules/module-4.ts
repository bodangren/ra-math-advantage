/**
 * Module 4: Inverses and Radical Functions
 *
 * Question bank for Module 4 practice tests.
 * 4 questions per lesson covering the full module scope.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_4_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 4-1: Operations on Functions
  {
    id: 'm4-l1-q1',
    lessonId: 'lesson-4-1',
    lessonTitle: 'Operations on Functions',
    prompt: 'If f(x) = 2x + 3 and g(x) = x - 1, what is (f + g)(x)?',
    correctAnswer: '3x + 2',
    distractors: ['3x + 4', '2x + 2', 'x + 4'],
    explanation: '(f + g)(x) = f(x) + g(x) = (2x + 3) + (x - 1) = 3x + 2.',
    objectiveTags: ['F-BF.1'],
  },
  {
    id: 'm4-l1-q2',
    lessonId: 'lesson-4-1',
    lessonTitle: 'Operations on Functions',
    prompt: 'If f(x) = x^2 and g(x) = x + 1, what is (f ∘ g)(x)?',
    correctAnswer: '(x + 1)^2',
    distractors: ['x^2 + 1', 'x^2 + x + 1', 'x^3 + x^2'],
    explanation: '(f ∘ g)(x) = f(g(x)) = f(x + 1) = (x + 1)^2.',
    objectiveTags: ['F-BF.1'],
  },
  {
    id: 'm4-l1-q3',
    lessonId: 'lesson-4-1',
    lessonTitle: 'Operations on Functions',
    prompt: 'Let f(x) = 3x - 2 and g(x) = x^2 + 1. Find (f · g)(1).',
    correctAnswer: '2',
    distractors: ['6', '0', '4'],
    explanation: 'f(1) = 3(1) - 2 = 1 and g(1) = 1^2 + 1 = 2. Their product is 1 · 2 = 2.',
    objectiveTags: ['F-BF.1'],
  },
  {
    id: 'm4-l1-q4',
    lessonId: 'lesson-4-1',
    lessonTitle: 'Operations on Functions',
    prompt: 'If h(x) = f(x) / g(x), what is the domain of h when f(x) = x + 3 and g(x) = x - 5?',
    correctAnswer: 'All real numbers except x = 5',
    distractors: ['All real numbers', 'All real numbers except x = -3', 'x > 5'],
    explanation: 'The denominator g(x) = x - 5 cannot equal zero, so x ≠ 5.',
    objectiveTags: ['F-BF.1'],
  },

  // Lesson 4-2: Inverse Relations and Functions
  {
    id: 'm4-l2-q1',
    lessonId: 'lesson-4-2',
    lessonTitle: 'Inverse Relations and Functions',
    prompt: 'What is the inverse of f(x) = 2x + 4?',
    correctAnswer: 'f^{-1}(x) = (x - 4)/2',
    distractors: ['f^{-1}(x) = (x + 4)/2', 'f^{-1}(x) = 2x - 4', 'f^{-1}(x) = x/2 + 4'],
    explanation: 'Swap x and y, then solve: x = 2y + 4 → y = (x - 4)/2.',
    objectiveTags: ['F-BF.4'],
  },
  {
    id: 'm4-l2-q2',
    lessonId: 'lesson-4-2',
    lessonTitle: 'Inverse Relations and Functions',
    prompt: 'Which function does NOT have an inverse that is also a function?',
    correctAnswer: 'f(x) = x^2',
    distractors: ['f(x) = 2x + 1', 'f(x) = x^3', 'f(x) = √x'],
    explanation: 'f(x) = x^2 is not one-to-one (it fails the horizontal line test), so its inverse is not a function unless the domain is restricted.',
    objectiveTags: ['F-BF.4'],
  },
  {
    id: 'm4-l2-q3',
    lessonId: 'lesson-4-2',
    lessonTitle: 'Inverse Relations and Functions',
    prompt: 'If f(3) = 7, what must be true about f^{-1}?',
    correctAnswer: 'f^{-1}(7) = 3',
    distractors: ['f^{-1}(3) = 7', 'f^{-1}(7) = -3', 'f^{-1} does not exist'],
    explanation: 'By definition of inverse functions, if f(a) = b, then f^{-1}(b) = a.',
    objectiveTags: ['F-BF.4'],
  },
  {
    id: 'm4-l2-q4',
    lessonId: 'lesson-4-2',
    lessonTitle: 'Inverse Relations and Functions',
    prompt: 'What is the domain of the inverse of f(x) = √(x - 2)?',
    correctAnswer: '[0, ∞)',
    distractors: ['(-∞, ∞)', '[2, ∞)', '(-∞, 2]'],
    explanation: 'The range of f(x) = √(x - 2) is [0, ∞), which becomes the domain of f^{-1}.',
    objectiveTags: ['F-BF.4', 'F-IF.5'],
  },

  // Lesson 4-3: nth Roots and Rational Exponents
  {
    id: 'm4-l3-q1',
    lessonId: 'lesson-4-3',
    lessonTitle: 'nth Roots and Rational Exponents',
    prompt: 'Rewrite ∛(x^2) using rational exponents.',
    correctAnswer: 'x^(2/3)',
    distractors: ['x^(3/2)', 'x^(1/3)', 'x^6'],
    explanation: 'The nth root corresponds to division by n in the exponent: ∛(x^2) = x^(2/3).',
    objectiveTags: ['N-RN.1'],
  },
  {
    id: 'm4-l3-q2',
    lessonId: 'lesson-4-3',
    lessonTitle: 'nth Roots and Rational Exponents',
    prompt: 'Evaluate 16^(3/4).',
    correctAnswer: '8',
    distractors: ['12', '64', '4'],
    explanation: '16^(3/4) = (∜16)^3 = 2^3 = 8.',
    objectiveTags: ['N-RN.1'],
  },
  {
    id: 'm4-l3-q3',
    lessonId: 'lesson-4-3',
    lessonTitle: 'nth Roots and Rational Exponents',
    prompt: 'Simplify (27^(2/3))^(1/2).',
    correctAnswer: '3',
    distractors: ['9', '27', '√3'],
    explanation: '27^(2/3) = (∛27)^2 = 3^2 = 9. Then 9^(1/2) = 3.',
    objectiveTags: ['N-RN.1', 'N-RN.2'],
  },
  {
    id: 'm4-l3-q4',
    lessonId: 'lesson-4-3',
    lessonTitle: 'nth Roots and Rational Exponents',
    prompt: 'Which expression is equivalent to 1 / ∜(x^3)?',
    correctAnswer: 'x^(-3/4)',
    distractors: ['x^(3/4)', 'x^(-4/3)', 'x^(4/3)'],
    explanation: '1 / ∜(x^3) = 1 / x^(3/4) = x^(-3/4).',
    objectiveTags: ['N-RN.1'],
  },

  // Lesson 4-4: Graphing Radical Functions
  {
    id: 'm4-l4-q1',
    lessonId: 'lesson-4-4',
    lessonTitle: 'Graphing Radical Functions',
    prompt: 'What is the domain of f(x) = √(x + 3)?',
    correctAnswer: 'x ≥ -3',
    distractors: ['x > -3', 'x ≤ -3', 'All real numbers'],
    explanation: 'The expression under the square root must be non-negative: x + 3 ≥ 0, so x ≥ -3.',
    objectiveTags: ['F-IF.7', 'F-IF.5'],
  },
  {
    id: 'm4-l4-q2',
    lessonId: 'lesson-4-4',
    lessonTitle: 'Graphing Radical Functions',
    prompt: 'Which transformation describes the graph of y = √(x - 2) + 1 compared to y = √x?',
    correctAnswer: 'Shifted right 2 units and up 1 unit',
    distractors: ['Shifted left 2 units and up 1 unit', 'Shifted right 2 units and down 1 unit', 'Shifted left 2 units and down 1 unit'],
    explanation: 'Inside the radical, x - 2 shifts right 2; +1 outside shifts up 1.',
    objectiveTags: ['F-BF.3'],
  },
  {
    id: 'm4-l4-q3',
    lessonId: 'lesson-4-4',
    lessonTitle: 'Graphing Radical Functions',
    prompt: 'What is the range of f(x) = -√x + 3?',
    correctAnswer: 'y ≤ 3',
    distractors: ['y ≥ 3', 'y ≥ 0', 'All real numbers'],
    explanation: 'The basic √x has range y ≥ 0. The negative reflects over the x-axis (y ≤ 0), and +3 shifts up to y ≤ 3.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm4-l4-q4',
    lessonId: 'lesson-4-4',
    lessonTitle: 'Graphing Radical Functions',
    prompt: 'Which point lies on the graph of y = ∛x + 2?',
    correctAnswer: '(8, 4)',
    distractors: ['(4, 8)', '(-8, -4)', '(1, 3)'],
    explanation: 'When x = 8, y = ∛8 + 2 = 2 + 2 = 4, so (8, 4) is on the graph.',
    objectiveTags: ['F-IF.7'],
  },

  // Lesson 4-5: Operations with Radical Expressions
  {
    id: 'm4-l5-q1',
    lessonId: 'lesson-4-5',
    lessonTitle: 'Operations with Radical Expressions',
    prompt: 'Simplify √50.',
    correctAnswer: '5√2',
    distractors: ['2√5', '10√5', '25√2'],
    explanation: '√50 = √(25 · 2) = √25 · √2 = 5√2.',
    objectiveTags: ['N-RN.2'],
  },
  {
    id: 'm4-l5-q2',
    lessonId: 'lesson-4-5',
    lessonTitle: 'Operations with Radical Expressions',
    prompt: 'Simplify 3√2 + 5√2 - √2.',
    correctAnswer: '7√2',
    distractors: ['7√6', '8√2', '9√2'],
    explanation: 'Combine like radicals: 3 + 5 - 1 = 7, so the result is 7√2.',
    objectiveTags: ['N-RN.2'],
  },
  {
    id: 'm4-l5-q3',
    lessonId: 'lesson-4-5',
    lessonTitle: 'Operations with Radical Expressions',
    prompt: 'Multiply and simplify: √3 · √6.',
    correctAnswer: '3√2',
    distractors: ['√18', '3√6', '√9'],
    explanation: '√3 · √6 = √18 = √(9 · 2) = 3√2.',
    objectiveTags: ['N-RN.2'],
  },
  {
    id: 'm4-l5-q4',
    lessonId: 'lesson-4-5',
    lessonTitle: 'Operations with Radical Expressions',
    prompt: 'Rationalize the denominator: 5 / √2.',
    correctAnswer: '(5√2)/2',
    distractors: ['5/2', '(5√2)/√4', '10'],
    explanation: 'Multiply numerator and denominator by √2: (5√2) / (√2 · √2) = (5√2)/2.',
    objectiveTags: ['N-RN.2'],
  },

  // Lesson 4-6: Solving Radical Equations
  {
    id: 'm4-l6-q1',
    lessonId: 'lesson-4-6',
    lessonTitle: 'Solving Radical Equations',
    prompt: 'Solve √(x) = 5.',
    correctAnswer: 'x = 25',
    distractors: ['x = √5', 'x = 10', 'x = ±25'],
    explanation: 'Square both sides: (√x)^2 = 5^2, so x = 25.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm4-l6-q2',
    lessonId: 'lesson-4-6',
    lessonTitle: 'Solving Radical Equations',
    prompt: 'Solve √(2x - 1) = 3.',
    correctAnswer: 'x = 5',
    distractors: ['x = 4', 'x = 2', 'x = 8'],
    explanation: 'Square both sides: 2x - 1 = 9 → 2x = 10 → x = 5.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm4-l6-q3',
    lessonId: 'lesson-4-6',
    lessonTitle: 'Solving Radical Equations',
    prompt: 'Solve √(x + 2) = x. What is the solution?',
    correctAnswer: 'x = 2',
    distractors: ['x = -1 and x = 2', 'x = -1', 'x = 4'],
    explanation: 'Square both sides: x + 2 = x^2 → x^2 - x - 2 = 0 → (x - 2)(x + 1) = 0. Check: x = -1 is extraneous since √1 ≠ -1. Only x = 2 works.',
    objectiveTags: ['A-REI.2'],
  },
  {
    id: 'm4-l6-q4',
    lessonId: 'lesson-4-6',
    lessonTitle: 'Solving Radical Equations',
    prompt: 'Solve ∛(x - 4) = 2.',
    correctAnswer: 'x = 12',
    distractors: ['x = 6', 'x = 8', 'x = 2'],
    explanation: 'Cube both sides: x - 4 = 8 → x = 12.',
    objectiveTags: ['A-REI.2'],
  },
];

const MODULE_4_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 4,
  title: 'Inverses and Radical Functions',
  description:
    'Explore operations on functions, inverse relations and functions, nth roots and rational exponents, graphing radical functions, operations with radical expressions, and solving radical equations.',
  lessons: [
    { lessonId: 'lesson-4-1', lessonNumber: 1, title: 'Operations on Functions' },
    { lessonId: 'lesson-4-2', lessonNumber: 2, title: 'Inverse Relations and Functions' },
    { lessonId: 'lesson-4-3', lessonNumber: 3, title: 'nth Roots and Rational Exponents' },
    { lessonId: 'lesson-4-4', lessonNumber: 4, title: 'Graphing Radical Functions' },
    { lessonId: 'lesson-4-5', lessonNumber: 5, title: 'Operations with Radical Expressions' },
    { lessonId: 'lesson-4-6', lessonNumber: 6, title: 'Solving Radical Equations' },
  ],
  questions: MODULE_4_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 4 Practice Test',
      body: 'Inverses and Radical Functions. Select the lessons you want to include and choose how many questions to answer.',
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

registerModuleConfig(MODULE_4_CONFIG);
export default MODULE_4_CONFIG;
