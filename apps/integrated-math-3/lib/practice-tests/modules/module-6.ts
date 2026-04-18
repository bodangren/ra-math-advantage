/**
 * Module 6: Logarithmic Functions
 *
 * Question bank for Module 6 practice tests.
 * 4 questions per lesson covering logarithmic functions, properties, and applications.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_6_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 6-1: Logarithms and Logarithmic Functions
  {
    id: 'm6-l1-q1',
    lessonId: 'lesson-6-1',
    lessonTitle: 'Logarithms and Logarithmic Functions',
    prompt: 'Convert log_2(8) = 3 to exponential form.',
    correctAnswer: '2^3 = 8',
    distractors: ['3^2 = 8', '8^2 = 3', '2^8 = 3'],
    explanation: 'A logarithm log_b(a) = c is equivalent to b^c = a. So log_2(8) = 3 becomes 2^3 = 8.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l1-q2',
    lessonId: 'lesson-6-1',
    lessonTitle: 'Logarithms and Logarithmic Functions',
    prompt: 'Evaluate: log_5(25)',
    correctAnswer: '2',
    distractors: ['5', '25', '1'],
    explanation: 'log_5(25) asks "5 to what power equals 25?" Since 5^2 = 25, the answer is 2.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l1-q3',
    lessonId: 'lesson-6-1',
    lessonTitle: 'Logarithms and Logarithmic Functions',
    prompt: 'What is the domain of f(x) = log(x - 3)?',
    correctAnswer: 'x > 3',
    distractors: ['x ≥ 3', 'x < 3', 'All real numbers'],
    explanation: 'The argument of a logarithm must be positive, so x - 3 > 0, which means x > 3.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm6-l1-q4',
    lessonId: 'lesson-6-1',
    lessonTitle: 'Logarithms and Logarithmic Functions',
    prompt: 'What is the inverse of the function y = 2^x?',
    correctAnswer: 'y = log_2(x)',
    distractors: ['y = x^2', 'y = 2x', 'y = -2^x'],
    explanation: 'To find the inverse of an exponential function, switch to its corresponding logarithmic form: y = log_2(x).',
    objectiveTags: ['F-BF.5'],
  },

  // Lesson 6-2: Properties of Logarithms
  {
    id: 'm6-l2-q1',
    lessonId: 'lesson-6-2',
    lessonTitle: 'Properties of Logarithms',
    prompt: 'Expand log_b(xy).',
    correctAnswer: 'log_b(x) + log_b(y)',
    distractors: ['log_b(x) · log_b(y)', 'log_b(x) - log_b(y)', 'log_b(x + y)'],
    explanation: 'The product rule states that the log of a product equals the sum of the logs: log_b(xy) = log_b(x) + log_b(y).',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l2-q2',
    lessonId: 'lesson-6-2',
    lessonTitle: 'Properties of Logarithms',
    prompt: 'Simplify: log_3(27) + log_3(3)',
    correctAnswer: '4',
    distractors: ['3', '9', '27'],
    explanation: 'Using the product rule: log_3(27 · 3) = log_3(81). Since 3^4 = 81, the answer is 4.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l2-q3',
    lessonId: 'lesson-6-2',
    lessonTitle: 'Properties of Logarithms',
    prompt: 'Condense: 2 log x + log y',
    correctAnswer: 'log(x^2 y)',
    distractors: ['log(2x + y)', 'log(x^2 + y)', 'log(2xy)'],
    explanation: 'Use the power rule: 2 log x = log(x^2). Then use the product rule: log(x^2) + log(y) = log(x^2 y).',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l2-q4',
    lessonId: 'lesson-6-2',
    lessonTitle: 'Properties of Logarithms',
    prompt: 'Evaluate: log_2(16) - log_2(4)',
    correctAnswer: '2',
    distractors: ['4', '8', '1'],
    explanation: 'Using the quotient rule: log_2(16/4) = log_2(4). Since 2^2 = 4, the answer is 2.',
    objectiveTags: ['F-LE.4'],
  },

  // Lesson 6-3: Common Logarithms
  {
    id: 'm6-l3-q1',
    lessonId: 'lesson-6-3',
    lessonTitle: 'Common Logarithms',
    prompt: 'What is the base of a common logarithm (log x)?',
    correctAnswer: '10',
    distractors: ['e', '2', '1'],
    explanation: 'A common logarithm, written as log x, has base 10 by convention.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l3-q2',
    lessonId: 'lesson-6-3',
    lessonTitle: 'Common Logarithms',
    prompt: 'Evaluate: log(1000)',
    correctAnswer: '3',
    distractors: ['2', '10', '100'],
    explanation: 'log(1000) = log_10(1000). Since 10^3 = 1000, the answer is 3.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l3-q3',
    lessonId: 'lesson-6-3',
    lessonTitle: 'Common Logarithms',
    prompt: 'Solve: 10^x = 0.01',
    correctAnswer: 'x = -2',
    distractors: ['x = 2', 'x = 0.1', 'x = -0.01'],
    explanation: '0.01 = 1/100 = 10^(-2). Therefore, x = -2.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l3-q4',
    lessonId: 'lesson-6-3',
    lessonTitle: 'Common Logarithms',
    prompt: 'Evaluate: log(1)',
    correctAnswer: '0',
    distractors: ['1', '10', 'Undefined'],
    explanation: 'log(1) = log_10(1). Since 10^0 = 1, the answer is 0.',
    objectiveTags: ['F-LE.4'],
  },

  // Lesson 6-4: Natural Logarithms
  {
    id: 'm6-l4-q1',
    lessonId: 'lesson-6-4',
    lessonTitle: 'Natural Logarithms',
    prompt: 'What is the base of a natural logarithm (ln x)?',
    correctAnswer: 'e',
    distractors: ['10', '2', '1'],
    explanation: 'The natural logarithm ln x has base e, where e ≈ 2.71828.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l4-q2',
    lessonId: 'lesson-6-4',
    lessonTitle: 'Natural Logarithms',
    prompt: 'Simplify: ln(e^5)',
    correctAnswer: '5',
    distractors: ['e', 'e^5', '1'],
    explanation: 'A logarithm and its base are inverse operations, so ln(e^5) = 5.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l4-q3',
    lessonId: 'lesson-6-4',
    lessonTitle: 'Natural Logarithms',
    prompt: 'Evaluate: ln(1)',
    correctAnswer: '0',
    distractors: ['1', 'e', 'Undefined'],
    explanation: 'ln(1) asks "e to what power equals 1?" Since e^0 = 1, the answer is 0.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l4-q4',
    lessonId: 'lesson-6-4',
    lessonTitle: 'Natural Logarithms',
    prompt: 'Solve: e^x = 7',
    correctAnswer: 'x = ln(7)',
    distractors: ['x = log(7)', 'x = e^7', 'x = 7/e'],
    explanation: 'To undo the natural exponential function, take the natural log of both sides: ln(e^x) = ln(7), so x = ln(7).',
    objectiveTags: ['F-LE.4'],
  },

  // Lesson 6-5: Using Exponential and Logarithmic Functions
  {
    id: 'm6-l5-q1',
    lessonId: 'lesson-6-5',
    lessonTitle: 'Using Exponential and Logarithmic Functions',
    prompt: 'Solve: 3^x = 27',
    correctAnswer: 'x = 3',
    distractors: ['x = 9', 'x = 27', 'x = 1'],
    explanation: '27 = 3^3, so 3^x = 3^3. Therefore, x = 3.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l5-q2',
    lessonId: 'lesson-6-5',
    lessonTitle: 'Using Exponential and Logarithmic Functions',
    prompt: 'Solve: log_4(x) = 3',
    correctAnswer: 'x = 64',
    distractors: ['x = 12', 'x = 7', 'x = 81'],
    explanation: 'Convert to exponential form: 4^3 = x, so x = 64.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l5-q3',
    lessonId: 'lesson-6-5',
    lessonTitle: 'Using Exponential and Logarithmic Functions',
    prompt: 'Solve: 2^(x+1) = 16',
    correctAnswer: 'x = 3',
    distractors: ['x = 4', 'x = 15', 'x = 2'],
    explanation: '16 = 2^4, so 2^(x+1) = 2^4. Therefore, x + 1 = 4, and x = 3.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm6-l5-q4',
    lessonId: 'lesson-6-5',
    lessonTitle: 'Using Exponential and Logarithmic Functions',
    prompt: 'The formula A = Pe^(rt) describes which type of growth or decay?',
    correctAnswer: 'Continuous exponential growth/decay',
    distractors: ['Linear growth', 'Compound interest', 'Quadratic growth'],
    explanation: 'A = Pe^(rt) uses the natural base e and is the standard formula for continuous exponential growth or decay.',
    objectiveTags: ['F-LE.4', 'A-SSE.3'],
  },
];

const MODULE_6_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 6,
  title: 'Logarithmic Functions',
  description:
    'Explore logarithmic functions, their properties, and applications. Master common and natural logarithms and solve exponential and logarithmic equations.',
  lessons: [
    { lessonId: 'lesson-6-1', lessonNumber: 1, title: 'Logarithms and Logarithmic Functions' },
    { lessonId: 'lesson-6-2', lessonNumber: 2, title: 'Properties of Logarithms' },
    { lessonId: 'lesson-6-3', lessonNumber: 3, title: 'Common Logarithms' },
    { lessonId: 'lesson-6-4', lessonNumber: 4, title: 'Natural Logarithms' },
    { lessonId: 'lesson-6-5', lessonNumber: 5, title: 'Using Exponential and Logarithmic Functions' },
  ],
  questions: MODULE_6_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 6 Practice Test',
      body: 'Logarithmic Functions. Select the lessons you want to include and choose how many questions to answer.',
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

registerModuleConfig(MODULE_6_CONFIG);

export default MODULE_6_CONFIG;
