/**
 * Module 3: Polynomial Equations and Identities
 *
 * Question bank for Module 3 practice tests.
 * 4 questions per lesson covering the full module scope.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_3_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 3-1: Solving Polynomial Equations by Graphing
  {
    id: 'm3-l1-q1',
    lessonId: 'lesson-3-1',
    lessonTitle: 'Solving Polynomial Equations by Graphing',
    prompt: 'The graph of y = x^3 - 2x^2 - 5x + 6 crosses the x-axis at x = -2, x = 1, and x = 3. What are the solutions to x^3 - 2x^2 - 5x + 6 = 0?',
    correctAnswer: 'x = -2, x = 1, and x = 3',
    distractors: ['x = 2, x = -1, and x = -3', 'x = -2 and x = 1 only', 'x = 6, x = -5, and x = -2'],
    explanation: 'The x-intercepts of the graph correspond to the solutions of the equation when y = 0.',
    objectiveTags: ['A-REI.4', 'F-IF.7'],
  },
  {
    id: 'm3-l1-q2',
    lessonId: 'lesson-3-1',
    lessonTitle: 'Solving Polynomial Equations by Graphing',
    prompt: 'How many real solutions does a cubic function have if its graph crosses the x-axis exactly once?',
    correctAnswer: '1 real solution',
    distractors: ['2 real solutions', '3 real solutions', '0 real solutions'],
    explanation: 'A cubic polynomial always has at least one real root, but if the graph crosses the x-axis only once, there is exactly 1 real solution and 2 complex solutions.',
    objectiveTags: ['F-IF.7', 'N-CN.9'],
  },
  {
    id: 'm3-l1-q3',
    lessonId: 'lesson-3-1',
    lessonTitle: 'Solving Polynomial Equations by Graphing',
    prompt: 'Using a graphing calculator, what is the approximate real solution to x^3 + x - 4 = 0?',
    correctAnswer: 'x ≈ 1.38',
    distractors: ['x ≈ 1.00', 'x ≈ 2.00', 'x ≈ 0.75'],
    explanation: 'Graphing y = x^3 + x - 4 shows the x-intercept is approximately at x ≈ 1.38.',
    objectiveTags: ['A-REI.4', 'F-IF.7'],
  },
  {
    id: 'm3-l1-q4',
    lessonId: 'lesson-3-1',
    lessonTitle: 'Solving Polynomial Equations by Graphing',
    prompt: 'Which polynomial equation could have the graph with x-intercepts at (-3, 0), (0, 0), and (2, 0)?',
    correctAnswer: 'x(x + 3)(x - 2) = 0',
    distractors: ['(x - 3)(x - 2) = 0', 'x(x - 3)(x + 2) = 0', '(x + 3)(x - 2)^2 = 0'],
    explanation: 'If the x-intercepts are -3, 0, and 2, the factors are (x + 3), x, and (x - 2).',
    objectiveTags: ['A-APR.3', 'F-IF.7'],
  },

  // Lesson 3-2: Solving Polynomial Equations Algebraically
  {
    id: 'm3-l2-q1',
    lessonId: 'lesson-3-2',
    lessonTitle: 'Solving Polynomial Equations Algebraically',
    prompt: 'Solve: x^3 - 4x = 0',
    correctAnswer: 'x = 0, x = 2, and x = -2',
    distractors: ['x = 0 and x = 4', 'x = 2 and x = -2 only', 'x = 0 and x = ±4'],
    explanation: 'Factor out x: x(x^2 - 4) = x(x + 2)(x - 2) = 0. Solutions are x = 0, x = 2, and x = -2.',
    objectiveTags: ['A-REI.4', 'A-SSE.2'],
  },
  {
    id: 'm3-l2-q2',
    lessonId: 'lesson-3-2',
    lessonTitle: 'Solving Polynomial Equations Algebraically',
    prompt: 'Solve: x^4 - 5x^2 + 4 = 0',
    correctAnswer: 'x = ±1 and x = ±2',
    distractors: ['x = ±1 only', 'x = 1, 2, 4', 'x = ±√5 and x = ±2'],
    explanation: 'Let u = x^2. Then u^2 - 5u + 4 = 0 factors to (u - 1)(u - 4) = 0. So x^2 = 1 or x^2 = 4, giving x = ±1 and x = ±2.',
    objectiveTags: ['A-REI.4', 'A-SSE.2'],
  },
  {
    id: 'm3-l2-q3',
    lessonId: 'lesson-3-2',
    lessonTitle: 'Solving Polynomial Equations Algebraically',
    prompt: 'Solve: 2x^3 - 16 = 0',
    correctAnswer: 'x = 2',
    distractors: ['x = 4', 'x = ±2', 'x = 8'],
    explanation: 'Add 16 and divide by 2: x^3 = 8. The only real solution is x = 2.',
    objectiveTags: ['A-REI.4'],
  },
  {
    id: 'm3-l2-q4',
    lessonId: 'lesson-3-2',
    lessonTitle: 'Solving Polynomial Equations Algebraically',
    prompt: 'What is the first step in solving x^3 + 2x^2 - 9x - 18 = 0 algebraically?',
    correctAnswer: 'Factor by grouping',
    distractors: ['Use the quadratic formula', 'Divide by x', 'Complete the square'],
    explanation: 'Group terms: (x^3 + 2x^2) + (-9x - 18) = x^2(x + 2) - 9(x + 2) = (x^2 - 9)(x + 2) = 0.',
    objectiveTags: ['A-SSE.2', 'A-REI.4'],
  },

  // Lesson 3-3: Proving Polynomial Identities
  {
    id: 'm3-l3-q1',
    lessonId: 'lesson-3-3',
    lessonTitle: 'Proving Polynomial Identities',
    prompt: 'Which identity is equivalent to (a + b)^3?',
    correctAnswer: 'a^3 + 3a^2b + 3ab^2 + b^3',
    distractors: ['a^3 + b^3', 'a^3 + 2a^2b + 2ab^2 + b^3', 'a^3 + 3ab + b^3'],
    explanation: 'Expanding (a + b)^3 gives a^3 + 3a^2b + 3ab^2 + b^3 using the binomial theorem or repeated multiplication.',
    objectiveTags: ['A-APR.4'],
  },
  {
    id: 'm3-l3-q2',
    lessonId: 'lesson-3-3',
    lessonTitle: 'Proving Polynomial Identities',
    prompt: 'The identity a^3 - b^3 = (a - b)(a^2 + ab + b^2) is known as what?',
    correctAnswer: 'Difference of cubes',
    distractors: ['Sum of cubes', 'Perfect square trinomial', 'Difference of squares'],
    explanation: 'The expression a^3 - b^3 factors into (a - b)(a^2 + ab + b^2), which is the difference of cubes identity.',
    objectiveTags: ['A-APR.4'],
  },
  {
    id: 'm3-l3-q3',
    lessonId: 'lesson-3-3',
    lessonTitle: 'Proving Polynomial Identities',
    prompt: 'Use the identity a^2 - b^2 = (a + b)(a - b) to simplify 49x^2 - 16.',
    correctAnswer: '(7x + 4)(7x - 4)',
    distractors: ['(7x - 4)^2', '(49x + 16)(49x - 16)', '(7x + 16)(7x - 16)'],
    explanation: '49x^2 = (7x)^2 and 16 = 4^2, so 49x^2 - 16 = (7x + 4)(7x - 4).',
    objectiveTags: ['A-APR.4', 'A-SSE.2'],
  },
  {
    id: 'm3-l3-q4',
    lessonId: 'lesson-3-3',
    lessonTitle: 'Proving Polynomial Identities',
    prompt: 'Which of the following is an identity?',
    correctAnswer: '(x + y)^2 = x^2 + 2xy + y^2',
    distractors: ['(x + y)^2 = x^2 + y^2', '(x - y)^2 = x^2 - y^2', '(x + y)^3 = x^3 + y^3'],
    explanation: 'An identity is true for all values of the variables. Only (x + y)^2 = x^2 + 2xy + y^2 holds for all x and y.',
    objectiveTags: ['A-APR.4'],
  },

  // Lesson 3-4: The Remainder and Factor Theorems
  {
    id: 'm3-l4-q1',
    lessonId: 'lesson-3-4',
    lessonTitle: 'The Remainder and Factor Theorems',
    prompt: 'Use the Remainder Theorem to find the remainder when P(x) = x^3 - 2x^2 + 4x - 5 is divided by (x - 2).',
    correctAnswer: '3',
    distractors: ['-5', '11', '0'],
    explanation: 'By the Remainder Theorem, P(2) = 8 - 8 + 8 - 5 = 3.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm3-l4-q2',
    lessonId: 'lesson-3-4',
    lessonTitle: 'The Remainder and Factor Theorems',
    prompt: 'Is (x - 3) a factor of P(x) = x^3 - 6x^2 + 11x - 6?',
    correctAnswer: 'Yes',
    distractors: ['No', 'Only when x = 0', 'Cannot be determined'],
    explanation: 'P(3) = 27 - 54 + 33 - 6 = 0. Since the remainder is 0, (x - 3) is a factor.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm3-l4-q3',
    lessonId: 'lesson-3-4',
    lessonTitle: 'The Remainder and Factor Theorems',
    prompt: 'For what value of k is (x + 1) a factor of P(x) = 2x^3 + kx^2 - 5x + 1?',
    correctAnswer: '-6',
    distractors: ['6', '4', '-4'],
    explanation: 'By the Factor Theorem, P(-1) = 0. So 2(-1)^3 + k(-1)^2 - 5(-1) + 1 = -2 + k + 5 + 1 = 0. Thus k = -6.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm3-l4-q4',
    lessonId: 'lesson-3-4',
    lessonTitle: 'The Remainder and Factor Theorems',
    prompt: 'Given that (x - 2) is a factor of x^3 - 3x^2 - 4x + 12, which of the following is also a factor?',
    correctAnswer: '(x + 2)',
    distractors: ['(x - 3)', '(x + 3)', '(x - 1)'],
    explanation: 'Dividing x^3 - 3x^2 - 4x + 12 by (x - 2) gives x^2 - x - 6, which factors to (x - 3)(x + 2). So (x + 2) is also a factor.',
    objectiveTags: ['A-APR.2', 'A-SSE.2'],
  },

  // Lesson 3-5: Roots and Zeros
  {
    id: 'm3-l5-q1',
    lessonId: 'lesson-3-5',
    lessonTitle: 'Roots and Zeros',
    prompt: 'What are all the zeros of P(x) = x^3 - 4x^2 + 9x - 36, given that x = 4 is a real zero?',
    correctAnswer: '4, 3i, and -3i',
    distractors: ['4, 3, and -3', '4, 9, and -9', '4, i, and -i'],
    explanation: 'Dividing by (x - 4) gives x^2 + 9 = 0, so x = ±3i. The zeros are 4, 3i, and -3i.',
    objectiveTags: ['N-CN.9', 'A-APR.3'],
  },
  {
    id: 'm3-l5-q2',
    lessonId: 'lesson-3-5',
    lessonTitle: 'Roots and Zeros',
    prompt: 'Write a polynomial of least degree with real coefficients that has zeros at 2, -1, and 1 + i.',
    correctAnswer: '(x - 2)(x + 1)(x - 1 - i)(x - 1 + i)',
    distractors: ['(x - 2)(x + 1)(x - 1 + i)', '(x - 2)(x + 1)(x - 1 - i)', '(x - 2)(x + 1)(x^2 - 2x + 2)'],
    explanation: 'Complex roots come in conjugate pairs for polynomials with real coefficients. Since 1 + i is a root, 1 - i must also be a root.',
    objectiveTags: ['N-CN.9', 'A-APR.3'],
  },
  {
    id: 'm3-l5-q3',
    lessonId: 'lesson-3-5',
    lessonTitle: 'Roots and Zeros',
    prompt: 'According to the Fundamental Theorem of Algebra, how many total zeros (real and complex) does a polynomial of degree 5 have?',
    correctAnswer: '5',
    distractors: ['4', '3', 'At most 5'],
    explanation: 'The Fundamental Theorem of Algebra states that a polynomial of degree n has exactly n complex roots, counting multiplicity.',
    objectiveTags: ['N-CN.9'],
  },
  {
    id: 'm3-l5-q4',
    lessonId: 'lesson-3-5',
    lessonTitle: 'Roots and Zeros',
    prompt: 'A polynomial with real coefficients has 2 + i as a zero. What must also be a zero?',
    correctAnswer: '2 - i',
    distractors: ['-2 + i', '-2 - i', '2 + i only'],
    explanation: 'For polynomials with real coefficients, complex zeros occur in conjugate pairs. If 2 + i is a zero, then 2 - i must also be a zero.',
    objectiveTags: ['N-CN.9', 'A-APR.3'],
  },
];

const MODULE_3_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 3,
  title: 'Polynomial Equations and Identities',
  description:
    'Solve polynomial equations graphically and algebraically. Apply the Remainder and Factor Theorems, prove polynomial identities, and analyze roots and zeros including complex solutions.',
  lessons: [
    { lessonId: 'lesson-3-1', lessonNumber: 1, title: 'Solving Polynomial Equations by Graphing' },
    { lessonId: 'lesson-3-2', lessonNumber: 2, title: 'Solving Polynomial Equations Algebraically' },
    { lessonId: 'lesson-3-3', lessonNumber: 3, title: 'Proving Polynomial Identities' },
    { lessonId: 'lesson-3-4', lessonNumber: 4, title: 'The Remainder and Factor Theorems' },
    { lessonId: 'lesson-3-5', lessonNumber: 5, title: 'Roots and Zeros' },
  ],
  questions: MODULE_3_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 3 Practice Test',
      body: 'Polynomial Equations and Identities. Select the lessons you want to include and choose how many questions to answer.',
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

registerModuleConfig(MODULE_3_CONFIG);

export default MODULE_3_CONFIG;
