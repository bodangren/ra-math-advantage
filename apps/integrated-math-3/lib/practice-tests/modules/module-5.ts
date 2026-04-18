/**
 * Module 5: Exponential Functions and Geometric Series
 *
 * Question bank for Module 5 practice tests.
 * 4 questions per lesson covering exponential functions and geometric sequences.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_5_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 5-1: Graphing Exponential Functions
  {
    id: 'm5-l1-q1',
    lessonId: 'lesson-5-1',
    lessonTitle: 'Graphing Exponential Functions',
    prompt: 'What is the y-intercept of y = 2^x?',
    correctAnswer: '(0, 1)',
    distractors: ['(0, 2)', '(1, 0)', '(1, 2)'],
    explanation: 'For any exponential function a^x, the y-intercept is (0, 1) because a^0 = 1.',
    objectiveTags: ['F-IF.7', 'F-BF.3'],
  },
  {
    id: 'm5-l1-q2',
    lessonId: 'lesson-5-1',
    lessonTitle: 'Graphing Exponential Functions',
    prompt: 'Which transformation describes y = 3^(x + 2) compared to y = 3^x?',
    correctAnswer: 'Shifted 2 units to the left',
    distractors: ['Shifted 2 units to the right', 'Shifted 2 units up', 'Reflected over the y-axis'],
    explanation: 'Adding inside the exponent shifts the graph horizontally: x + 2 shifts left by 2 units.',
    objectiveTags: ['F-BF.3'],
  },
  {
    id: 'm5-l1-q3',
    lessonId: 'lesson-5-1',
    lessonTitle: 'Graphing Exponential Functions',
    prompt: 'What is the horizontal asymptote of y = 2^x - 3?',
    correctAnswer: 'y = -3',
    distractors: ['y = 0', 'y = 2', 'x = -3'],
    explanation: 'The basic asymptote y = 0 shifts down 3 units, so the new asymptote is y = -3.',
    objectiveTags: ['F-IF.7'],
  },
  {
    id: 'm5-l1-q4',
    lessonId: 'lesson-5-1',
    lessonTitle: 'Graphing Exponential Functions',
    prompt: 'Does the function y = (1/2)^x represent growth or decay?',
    correctAnswer: 'Decay',
    distractors: ['Growth', 'Neither', 'Both'],
    explanation: 'When the base is between 0 and 1, the exponential function represents decay.',
    objectiveTags: ['F-IF.7'],
  },

  // Lesson 5-2: Solving Exponential Equations and Inequalities
  {
    id: 'm5-l2-q1',
    lessonId: 'lesson-5-2',
    lessonTitle: 'Solving Exponential Equations and Inequalities',
    prompt: 'Solve: 2^x = 32',
    correctAnswer: 'x = 5',
    distractors: ['x = 4', 'x = 6', 'x = 16'],
    explanation: '32 = 2^5, so x = 5.',
    objectiveTags: ['A-REI.4', 'F-LE.4'],
  },
  {
    id: 'm5-l2-q2',
    lessonId: 'lesson-5-2',
    lessonTitle: 'Solving Exponential Equations and Inequalities',
    prompt: 'Solve: 3^(2x) = 27',
    correctAnswer: 'x = 3/2',
    distractors: ['x = 2', 'x = 9/2', 'x = 1'],
    explanation: '27 = 3^3, so 2x = 3 and x = 3/2.',
    objectiveTags: ['A-REI.4'],
  },
  {
    id: 'm5-l2-q3',
    lessonId: 'lesson-5-2',
    lessonTitle: 'Solving Exponential Equations and Inequalities',
    prompt: 'Solve the inequality: 4^x > 64',
    correctAnswer: 'x > 3',
    distractors: ['x < 3', 'x > 16', 'x > 2'],
    explanation: '64 = 4^3. Since the base 4 > 1, the inequality preserves direction: x > 3.',
    objectiveTags: ['A-REI.4'],
  },
  {
    id: 'm5-l2-q4',
    lessonId: 'lesson-5-2',
    lessonTitle: 'Solving Exponential Equations and Inequalities',
    prompt: 'What is the first step to solve 5^(x+1) = 25?',
    correctAnswer: 'Write 25 as a power of 5',
    distractors: ['Take the log of both sides', 'Divide both sides by 5', 'Subtract 1 from both sides'],
    explanation: '25 = 5^2, so rewrite the equation as 5^(x+1) = 5^2 and equate exponents.',
    objectiveTags: ['A-REI.4'],
  },

  // Lesson 5-3: Special Exponential Functions
  {
    id: 'm5-l3-q1',
    lessonId: 'lesson-5-3',
    lessonTitle: 'Special Exponential Functions',
    prompt: 'What is the value of e approximately equal to?',
    correctAnswer: '2.718',
    distractors: ['3.142', '1.618', '1.414'],
    explanation: 'The mathematical constant e is approximately 2.71828.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm5-l3-q2',
    lessonId: 'lesson-5-3',
    lessonTitle: 'Special Exponential Functions',
    prompt: 'Simplify: ln(e^5)',
    correctAnswer: '5',
    distractors: ['e^5', '1', 'ln(5)'],
    explanation: 'The natural logarithm ln and the exponential function e^x are inverse functions, so ln(e^5) = 5.',
    objectiveTags: ['F-BF.4', 'F-LE.4'],
  },
  {
    id: 'm5-l3-q3',
    lessonId: 'lesson-5-3',
    lessonTitle: 'Special Exponential Functions',
    prompt: 'What is the derivative (rate of change) property of f(x) = e^x?',
    correctAnswer: 'Its rate of change equals itself',
    distractors: ['Its rate of change is zero', 'Its rate of change is x', 'Its rate of change is ln(x)'],
    explanation: 'A special property of e^x is that its derivative equals itself.',
    objectiveTags: ['F-LE.4'],
  },
  {
    id: 'm5-l3-q4',
    lessonId: 'lesson-5-3',
    lessonTitle: 'Special Exponential Functions',
    prompt: 'Evaluate: e^0',
    correctAnswer: '1',
    distractors: ['0', 'e', 'Undefined'],
    explanation: 'Any nonzero number raised to the power of 0 equals 1, including e^0 = 1.',
    objectiveTags: ['F-LE.4'],
  },

  // Lesson 5-4: Geometric Sequences and Series
  {
    id: 'm5-l4-q1',
    lessonId: 'lesson-5-4',
    lessonTitle: 'Geometric Sequences and Series',
    prompt: 'What is the common ratio of the geometric sequence 3, 6, 12, 24, ...?',
    correctAnswer: '2',
    distractors: ['3', '4', '1/2'],
    explanation: 'Each term is multiplied by 2 to get the next term: 6/3 = 2, 12/6 = 2, etc.',
    objectiveTags: ['F-BF.2', 'F-LE.2'],
  },
  {
    id: 'm5-l4-q2',
    lessonId: 'lesson-5-4',
    lessonTitle: 'Geometric Sequences and Series',
    prompt: 'Find the 5th term of the geometric sequence with first term 2 and common ratio 3.',
    correctAnswer: '162',
    distractors: ['81', '48', '243'],
    explanation: 'Using a_n = a_1 * r^(n-1): 2 * 3^4 = 2 * 81 = 162.',
    objectiveTags: ['F-BF.2'],
  },
  {
    id: 'm5-l4-q3',
    lessonId: 'lesson-5-4',
    lessonTitle: 'Geometric Sequences and Series',
    prompt: 'What is the sum of the first 4 terms of the geometric series 1 + 2 + 4 + 8?',
    correctAnswer: '15',
    distractors: ['16', '14', '31'],
    explanation: '1 + 2 + 4 + 8 = 15.',
    objectiveTags: ['A-SSE.4'],
  },
  {
    id: 'm5-l4-q4',
    lessonId: 'lesson-5-4',
    lessonTitle: 'Geometric Sequences and Series',
    prompt: 'A geometric series has first term 5 and common ratio 1/2. What happens to the sum as the number of terms approaches infinity?',
    correctAnswer: 'It approaches 10',
    distractors: ['It approaches 5', 'It approaches infinity', 'It approaches 0'],
    explanation: 'For |r| < 1, the infinite sum is a/(1-r) = 5/(1-1/2) = 5/(1/2) = 10.',
    objectiveTags: ['A-SSE.4'],
  },

  // Lesson 5-5: Modeling Data
  {
    id: 'm5-l5-q1',
    lessonId: 'lesson-5-5',
    lessonTitle: 'Modeling Data',
    prompt: 'Which type of model is best for data that grows by a constant percent rate?',
    correctAnswer: 'Exponential model',
    distractors: ['Linear model', 'Quadratic model', 'Constant model'],
    explanation: 'Data with constant percent growth is best modeled by an exponential function.',
    objectiveTags: ['S-ID.6', 'F-LE.1'],
  },
  {
    id: 'm5-l5-q2',
    lessonId: 'lesson-5-5',
    lessonTitle: 'Modeling Data',
    prompt: 'A population of bacteria doubles every 3 hours. If the initial population is 500, which equation models the population P after t hours?',
    correctAnswer: 'P = 500 * 2^(t/3)',
    distractors: ['P = 500 * 2^t', 'P = 500 * 3^t', 'P = 500t + 2'],
    explanation: 'The doubling time is 3 hours, so the exponent is t/3 to account for the number of doubling periods.',
    objectiveTags: ['F-LE.2'],
  },
  {
    id: 'm5-l5-q3',
    lessonId: 'lesson-5-5',
    lessonTitle: 'Modeling Data',
    prompt: 'Which regression would you use to fit data showing rapid initial growth that slows over time?',
    correctAnswer: 'Exponential regression',
    distractors: ['Linear regression', 'Quadratic regression', 'No regression needed'],
    explanation: 'Exponential regression models data that changes by a constant percentage, showing rapid then slowing growth.',
    objectiveTags: ['S-ID.6'],
  },
  {
    id: 'm5-l5-q4',
    lessonId: 'lesson-5-5',
    lessonTitle: 'Modeling Data',
    prompt: 'If a car depreciates by 15% per year, what is the decay factor?',
    correctAnswer: '0.85',
    distractors: ['0.15', '1.15', '0.95'],
    explanation: 'A 15% decrease means the value retains 85% each year, so the decay factor is 0.85.',
    objectiveTags: ['F-LE.1', 'F-LE.2'],
  },
];

const MODULE_5_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 5,
  title: 'Exponential Functions and Geometric Series',
  description:
    'Explore exponential functions, their graphs, and equations. Learn about geometric sequences and series and how to model real-world data with exponential growth and decay.',
  lessons: [
    { lessonId: 'lesson-5-1', lessonNumber: 1, title: 'Graphing Exponential Functions' },
    { lessonId: 'lesson-5-2', lessonNumber: 2, title: 'Solving Exponential Equations and Inequalities' },
    { lessonId: 'lesson-5-3', lessonNumber: 3, title: 'Special Exponential Functions' },
    { lessonId: 'lesson-5-4', lessonNumber: 4, title: 'Geometric Sequences and Series' },
    { lessonId: 'lesson-5-5', lessonNumber: 5, title: 'Modeling Data' },
  ],
  questions: MODULE_5_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 5 Practice Test',
      body: 'Exponential Functions and Geometric Series. Select the lessons you want to include and choose how many questions to answer.',
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

registerModuleConfig(MODULE_5_CONFIG);

export default MODULE_5_CONFIG;
