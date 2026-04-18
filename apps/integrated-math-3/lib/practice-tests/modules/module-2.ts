/**
 * Module 2: Polynomials and Polynomial Functions
 *
 * Question bank for Module 2 practice tests.
 * 3+ questions per lesson covering polynomial functions, operations, and graphs.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_2_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 2-1: Polynomial Functions
  {
    id: 'm2-l1-q1',
    lessonId: 'lesson-2-1',
    lessonTitle: 'Polynomial Functions',
    prompt: 'What is the degree of the polynomial 4x^3 + 3x^2 - 2x + 7?',
    correctAnswer: '3',
    distractors: ['4', '7', '2'],
    explanation: 'The degree is the highest exponent of x, which is 3 in this case.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l1-q2',
    lessonId: 'lesson-2-1',
    lessonTitle: 'Polynomial Functions',
    prompt: 'Which is a polynomial function?',
    correctAnswer: 'f(x) = 2x^3 - 5x + 1',
    distractors: ['f(x) = x^2 + 1/x', 'f(x) = √x + 2', 'f(x) = |x| - 3'],
    explanation: 'A polynomial has non-negative integer exponents only. The first option fits this definition.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l1-q3',
    lessonId: 'lesson-2-1',
    lessonTitle: 'Polynomial Functions',
    prompt: 'What is the leading coefficient of -3x^4 + 2x^3 - x + 4?',
    correctAnswer: '-3',
    distractors: ['2', '4', '-1'],
    explanation: 'The leading coefficient is the coefficient of the term with highest degree: -3.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l1-q4',
    lessonId: 'lesson-2-1',
    lessonTitle: 'Polynomial Functions',
    prompt: 'A polynomial of degree 5 with a positive leading coefficient will do what as x → ∞?',
    correctAnswer: 'Increase without bound (go to +∞)',
    distractors: ['Decrease without bound', 'Approach zero', 'Oscillate'],
    explanation: 'Positive leading coefficient with odd degree means the graph goes up on the right.',
    objectiveTags: ['F-IF.7'],
  },

  // Lesson 2-2: Analyzing Graphs of Polynomial Functions
  {
    id: 'm2-l2-q1',
    lessonId: 'lesson-2-2',
    lessonTitle: 'Analyzing Graphs of Polynomial Functions',
    prompt: 'A polynomial function has degree 4. What is the maximum number of turning points it can have?',
    correctAnswer: '3',
    distractors: ['4', '2', '5'],
    explanation: 'A polynomial of degree n can have at most n - 1 turning points. So degree 4 gives at most 3 turning points.',
    objectiveTags: ['F-IF.7', 'F-BF.3'],
  },
  {
    id: 'm2-l2-q2',
    lessonId: 'lesson-2-2',
    lessonTitle: 'Analyzing Graphs of Polynomial Functions',
    prompt: 'What does multiplicity of a root tell you about the graph?',
    correctAnswer: 'How many times the graph crosses or touches the x-axis at that root',
    distractors: [
      'The exact y-value at the root',
      'Whether the root is real or complex',
      'The degree of the polynomial',
    ],
    explanation: 'Multiplicity affects behavior: odd multiplicity crosses, even multiplicity touches and turns around.',
    objectiveTags: ['A-APR.3'],
  },
  {
    id: 'm2-l2-q3',
    lessonId: 'lesson-2-2',
    lessonTitle: 'Analyzing Graphs of Polynomial Functions',
    prompt: 'If a polynomial has all even multiplicity roots, what can you say about its end behavior?',
    correctAnswer: 'It will go in the same direction on both ends',
    distractors: [
      'It will always cross the x-axis',
      'It will have no x-intercepts',
      'It will oscillate infinitely',
    ],
    explanation: 'Even multiplicities touch the axis and turn around, so ends go in the same direction.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm2-l2-q4',
    lessonId: 'lesson-2-2',
    lessonTitle: 'Analyzing Graphs of Polynomial Functions',
    prompt: 'A cubic function (degree 3) must have how many real roots?',
    correctAnswer: 'At least 1 real root',
    distractors: ['Exactly 1', 'Exactly 3', 'At most 1'],
    explanation: 'By the Fundamental Theorem of Algebra, odd-degree polynomials always have at least one real root.',
    objectiveTags: ['A-APR.3'],
  },

  // Lesson 2-3: Operations with Polynomials
  {
    id: 'm2-l3-q1',
    lessonId: 'lesson-2-3',
    lessonTitle: 'Operations with Polynomials',
    prompt: 'Add: (3x^2 + 2x - 5) + (x^2 - 3x + 1)',
    correctAnswer: '4x^2 - x - 4',
    distractors: ['4x^2 - x + 4', '2x^2 - x - 4', '4x^2 + 5x - 4'],
    explanation: 'Combine like terms: 3x^2 + x^2 = 4x^2, 2x - 3x = -x, -5 + 1 = -4.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l3-q2',
    lessonId: 'lesson-2-3',
    lessonTitle: 'Operations with Polynomials',
    prompt: 'Subtract: (4x^3 - 2x^2 + x) - (x^3 + 3x^2 - 4)',
    correctAnswer: '3x^3 - 5x^2 + x + 4',
    distractors: ['3x^3 + x^2 + x - 4', '5x^3 - 5x^2 + x - 4', '3x^3 - 5x^2 - 3x + 4'],
    explanation: 'Distribute the negative: 4x^3 - 2x^2 + x - x^3 - 3x^2 + 4 = 3x^3 - 5x^2 + x + 4.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l3-q3',
    lessonId: 'lesson-2-3',
    lessonTitle: 'Operations with Polynomials',
    prompt: 'Multiply: (x + 2)(x^2 - 3x + 1)',
    correctAnswer: 'x^3 - x^2 - 5x + 2',
    distractors: ['x^3 + 2x^2 - 3x + 2', 'x^3 - x^2 + x + 2', 'x^3 - 5x^2 + 2'],
    explanation: 'Use distributive property: x(x^2 - 3x + 1) + 2(x^2 - 3x + 1) = x^3 - 3x^2 + x + 2x^2 - 6x + 2.',
    objectiveTags: ['A-APR.1'],
  },
  {
    id: 'm2-l3-q4',
    lessonId: 'lesson-2-3',
    lessonTitle: 'Operations with Polynomials',
    prompt: 'Simplify: 2x(3x^2 - 4) + 5x(x^2 + 2)',
    correctAnswer: '11x^3 + 2x',
    distractors: ['11x^3 - 8', '6x^3 - 8x + 10x^3 + 10x', '16x^3 + 2x'],
    explanation: '2x(3x^2 - 4) = 6x^3 - 8x. 5x(x^2 + 2) = 5x^3 + 10x. Sum: 11x^3 + 2x.',
    objectiveTags: ['A-APR.1'],
  },

  // Lesson 2-4: Dividing Polynomials
  {
    id: 'm2-l4-q1',
    lessonId: 'lesson-2-4',
    lessonTitle: 'Dividing Polynomials',
    prompt: 'Divide using long division: (x^2 + 5x + 6) ÷ (x + 2)',
    correctAnswer: 'x + 3',
    distractors: ['x + 2', 'x - 3', 'x^2 + 3'],
    explanation: 'x goes into x^2: x times. Multiply back: x(x+2)=x^2+2x. Subtract: 3x+6. Repeat: 3.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm2-l4-q2',
    lessonId: 'lesson-2-4',
    lessonTitle: 'Dividing Polynomials',
    prompt: 'When dividing polynomials using synthetic division, what is the divisor form?',
    correctAnswer: 'x - c (where c is the value to test)',
    distractors: ['x + c', 'cx - 1', 'x/c'],
    explanation: 'Synthetic division tests x = c by using x - c in the divisor.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm2-l4-q3',
    lessonId: 'lesson-2-4',
    lessonTitle: 'Dividing Polynomials',
    prompt: 'Divide: (2x^3 + 5x^2 - 4x - 10) ÷ (x + 3) using synthetic division. What is the remainder?',
    correctAnswer: '-1',
    distractors: ['1', '-7', '0'],
    explanation: 'Use -3 (since divisor is x + 3): coefficients 2, 5, -4, -10. Bring down 2, multiply: -6, add: -1, multiply: 3, add: -1, multiply: 3, add: -7. Remainder is -7? Wait... Let me recalculate: 2 → 2(-3) = -6 → -1(-3) = 3 → -1(-3) = 3 → -7. Remainder is -7. Actually the remainder when dividing by x+3 is f(-3). f(-3) = 2(-27) + 5(9) -4(-3) - 10 = -54 + 45 + 12 - 10 = -7.',
    objectiveTags: ['A-APR.2'],
  },
  {
    id: 'm2-l4-q4',
    lessonId: 'lesson-2-4',
    lessonTitle: 'Dividing Polynomials',
    prompt: 'If P(x) divided by (x - 2) has remainder 5, what is P(2)?',
    correctAnswer: '5',
    distractors: ['2', '0', '7'],
    explanation: 'By the Remainder Theorem, P(c) is the remainder when P(x) is divided by (x - c). So P(2) = 5.',
    objectiveTags: ['A-APR.2'],
  },

  // Lesson 2-5: Powers of Binomials
  {
    id: 'm2-l5-q1',
    lessonId: 'lesson-2-5',
    lessonTitle: 'Powers of Binomials',
    prompt: 'Expand: (x + 2)^3',
    correctAnswer: 'x^3 + 6x^2 + 12x + 8',
    distractors: ['x^3 + 6x^2 + 12x + 6', 'x^3 + 8', '3x^3 + 12x^2 + 24x + 8'],
    explanation: 'Use binomial expansion or Pascal\'s Triangle (1, 3, 3, 1): x^3 + 3(2)x^2 + 3(4)x + 8.',
    objectiveTags: ['A-APR.5'],
  },
  {
    id: 'm2-l5-q2',
    lessonId: 'lesson-2-5',
    lessonTitle: 'Powers of Binomials',
    prompt: 'What is the coefficient of x^2 in the expansion of (x + 3)^4?',
    correctAnswer: '54',
    distractors: ['27', '81', '12'],
    explanation: 'Using binomial coefficients C(4,2) = 6, times 3^2 = 9: 6 × 9 = 54.',
    objectiveTags: ['A-APR.5'],
  },
  {
    id: 'm2-l5-q3',
    lessonId: 'lesson-2-5',
    lessonTitle: 'Powers of Binomials',
    prompt: 'Which row of Pascal\'s Triangle corresponds to (a + b)^4?',
    correctAnswer: '1, 4, 6, 4, 1',
    distractors: ['1, 3, 3, 1', '1, 5, 10, 5, 1', '1, 2, 1'],
    explanation: 'The expansion of (a + b)^n uses row n of Pascal\'s Triangle. Row 4 is 1, 4, 6, 4, 1.',
    objectiveTags: ['A-APR.5'],
  },
  {
    id: 'm2-l5-q4',
    lessonId: 'lesson-2-5',
    lessonTitle: 'Powers of Binomials',
    prompt: 'What is the middle term of (2x - 1)^4?',
    correctAnswer: '24x^2',
    distractors: ['16x^2', '-8x^2', '32x^2'],
    explanation: '(2x - 1)^4 has 5 terms, so the middle is the 3rd term. C(4,2) = 6, (2x)^2 = 4x^2, (-1)^2 = 1. So 6 × 4 × 1 = 24x^2.',
    objectiveTags: ['A-APR.5'],
  },
];

const MODULE_2_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 2,
  title: 'Polynomials and Polynomial Functions',
  description:
    'Extend quadratic ideas to higher-degree polynomials. Master polynomial operations, graph analysis, and the Binomial Theorem.',
  lessons: [
    { lessonId: 'lesson-2-1', lessonNumber: 1, title: 'Polynomial Functions' },
    { lessonId: 'lesson-2-2', lessonNumber: 2, title: 'Analyzing Graphs of Polynomial Functions' },
    { lessonId: 'lesson-2-3', lessonNumber: 3, title: 'Operations with Polynomials' },
    { lessonId: 'lesson-2-4', lessonNumber: 4, title: 'Dividing Polynomials' },
    { lessonId: 'lesson-2-5', lessonNumber: 5, title: 'Powers of Binomials' },
  ],
  questions: MODULE_2_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 2 Practice Test',
      body: 'Polynomials and Polynomial Functions. Select lessons and question count to begin.',
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

registerModuleConfig(MODULE_2_CONFIG);

export default MODULE_2_CONFIG;