/**
 * Module 8: Inferential Statistics
 *
 * Question bank for Module 8 practice tests.
 * 4 questions per lesson covering random sampling, experiments, and statistical inference.
 */

import type { PracticeTestModuleConfig, PracticeTestQuestion } from '../types';
import { registerModuleConfig } from '../question-banks';

const MODULE_8_QUESTIONS: PracticeTestQuestion[] = [
  // Lesson 8-1: Random Sampling
  {
    id: 'm8-l1-q1',
    lessonId: 'lesson-8-1',
    lessonTitle: 'Random Sampling',
    prompt: 'A principal assigns every student a number and uses a random number generator to select 100 students for a survey. What type of sampling is this?',
    correctAnswer: 'Simple random sampling',
    distractors: ['Convenience sampling', 'Stratified sampling', 'Cluster sampling'],
    explanation: 'Simple random sampling gives every individual an equal chance of being selected using random selection.',
    objectiveTags: ['S-IC.1'],
  },
  {
    id: 'm8-l1-q2',
    lessonId: 'lesson-8-1',
    lessonTitle: 'Random Sampling',
    prompt: 'A researcher surveys every 20th name on an alphabetical list of employees. What type of sampling is this?',
    correctAnswer: 'Systematic sampling',
    distractors: ['Simple random sampling', 'Voluntary response sampling', 'Quota sampling'],
    explanation: 'Systematic sampling selects members from a larger population according to a random starting point and a fixed periodic interval.',
    objectiveTags: ['S-IC.1'],
  },
  {
    id: 'm8-l1-q3',
    lessonId: 'lesson-8-1',
    lessonTitle: 'Random Sampling',
    prompt: 'A school district randomly selects 5 schools and surveys all teachers within those schools. What sampling method is this?',
    correctAnswer: 'Cluster sampling',
    distractors: ['Stratified sampling', 'Simple random sampling', 'Systematic sampling'],
    explanation: 'Cluster sampling divides the population into clusters (schools) and randomly selects entire clusters to survey.',
    objectiveTags: ['S-IC.1'],
  },
  {
    id: 'm8-l1-q4',
    lessonId: 'lesson-8-1',
    lessonTitle: 'Random Sampling',
    prompt: 'Which of the following sampling methods is most likely to produce bias?',
    correctAnswer: 'Surveying only students who are in the cafeteria at lunch time',
    distractors: ['Using a random number generator to select students', 'Selecting every 10th student from an alphabetical roster', 'Randomly selecting 2 students from each grade level'],
    explanation: 'Convenience sampling can introduce bias because the sample may not represent the entire population.',
    objectiveTags: ['S-IC.1', 'S-IC.3'],
  },

  // Lesson 8-2: Using Statistical Experiments
  {
    id: 'm8-l2-q1',
    lessonId: 'lesson-8-2',
    lessonTitle: 'Using Statistical Experiments',
    prompt: 'In an experiment testing a new drug, one group receives the drug and another group receives a placebo. What is the group receiving the placebo called?',
    correctAnswer: 'Control group',
    distractors: ['Treatment group', 'Random sample', 'Experimental group'],
    explanation: 'The control group does not receive the treatment and serves as a baseline for comparison.',
    objectiveTags: ['S-IC.3'],
  },
  {
    id: 'm8-l2-q2',
    lessonId: 'lesson-8-2',
    lessonTitle: 'Using Statistical Experiments',
    prompt: 'A researcher randomly assigns participants to either sleep 8 hours or 4 hours before taking a memory test. What type of study is this?',
    correctAnswer: 'Randomized experiment',
    distractors: ['Observational study', 'Survey', 'Case study'],
    explanation: 'Randomized experiments involve random assignment to treatment groups to establish cause-and-effect relationships.',
    objectiveTags: ['S-IC.3', 'S-IC.5'],
  },
  {
    id: 'm8-l2-q3',
    lessonId: 'lesson-8-2',
    lessonTitle: 'Using Statistical Experiments',
    prompt: 'What is a confounding variable?',
    correctAnswer: 'A variable that influences the outcome but is not the treatment being studied',
    distractors: ['A variable that is intentionally manipulated by the researcher', 'A variable with no effect on the outcome', 'A variable measured only after the experiment ends'],
    explanation: 'Confounding variables can distort the apparent relationship between the treatment and the outcome.',
    objectiveTags: ['S-IC.3'],
  },
  {
    id: 'm8-l2-q4',
    lessonId: 'lesson-8-2',
    lessonTitle: 'Using Statistical Experiments',
    prompt: 'What is the primary purpose of random assignment in a statistical experiment?',
    correctAnswer: 'To create groups that are similar except for the treatment',
    distractors: ['To ensure every person in the population is tested', 'To increase the sample size', 'To eliminate the need for a control group'],
    explanation: 'Random assignment helps distribute confounding variables evenly so differences in outcomes can be attributed to the treatment.',
    objectiveTags: ['S-IC.5'],
  },

  // Lesson 8-3: Analyzing Population Data
  {
    id: 'm8-l3-q1',
    lessonId: 'lesson-8-3',
    lessonTitle: 'Analyzing Population Data',
    prompt: 'A number that describes a characteristic of an entire population is called a:',
    correctAnswer: 'Parameter',
    distractors: ['Statistic', 'Variable', 'Sample'],
    explanation: 'A parameter describes a population, while a statistic describes a sample.',
    objectiveTags: ['S-IC.1'],
  },
  {
    id: 'm8-l3-q2',
    lessonId: 'lesson-8-3',
    lessonTitle: 'Analyzing Population Data',
    prompt: 'The mean height of a random sample of 60 students is 66 inches. What is 66 inches in this context?',
    correctAnswer: 'A statistic',
    distractors: ['A parameter', 'A population', 'A variable'],
    explanation: 'A statistic is a numerical measure that describes a characteristic of a sample.',
    objectiveTags: ['S-IC.1'],
  },
  {
    id: 'm8-l3-q3',
    lessonId: 'lesson-8-3',
    lessonTitle: 'Analyzing Population Data',
    prompt: 'As the sample size increases, the sampling distribution of the sample mean becomes:',
    correctAnswer: 'More normal and less spread out',
    distractors: ['Less normal and more spread out', 'More skewed', 'Unchanged in shape'],
    explanation: 'Larger sample sizes produce sampling distributions that are more normal and have smaller standard errors.',
    objectiveTags: ['S-IC.2'],
  },
  {
    id: 'm8-l3-q4',
    lessonId: 'lesson-8-3',
    lessonTitle: 'Analyzing Population Data',
    prompt: 'Which theorem states that the sampling distribution of the sample mean approaches a normal distribution as sample size increases?',
    correctAnswer: 'Central Limit Theorem',
    distractors: ['Fundamental Theorem of Algebra', 'Law of Large Numbers', 'Pythagorean Theorem'],
    explanation: 'The Central Limit Theorem explains why sample means tend to follow a normal distribution for large sample sizes.',
    objectiveTags: ['S-IC.2'],
  },

  // Lesson 8-4: Normal Distributions
  {
    id: 'm8-l4-q1',
    lessonId: 'lesson-8-4',
    lessonTitle: 'Normal Distributions',
    prompt: 'In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?',
    correctAnswer: '68%',
    distractors: ['95%', '99.7%', '50%'],
    explanation: 'The empirical rule states that about 68% of data in a normal distribution lies within one standard deviation of the mean.',
    objectiveTags: ['S-ID.4'],
  },
  {
    id: 'm8-l4-q2',
    lessonId: 'lesson-8-4',
    lessonTitle: 'Normal Distributions',
    prompt: 'A normally distributed data set has a mean of 50 and a standard deviation of 5. What is the z-score for a value of 60?',
    correctAnswer: '2',
    distractors: ['10', '1', '0'],
    explanation: 'z = (x - μ) / σ = (60 - 50) / 5 = 2.',
    objectiveTags: ['S-ID.4'],
  },
  {
    id: 'm8-l4-q3',
    lessonId: 'lesson-8-4',
    lessonTitle: 'Normal Distributions',
    prompt: 'Approximately what percentage of data in a normal distribution falls more than 2 standard deviations above the mean?',
    correctAnswer: 'About 2.5%',
    distractors: ['About 5%', 'About 16%', 'About 0.3%'],
    explanation: 'By the empirical rule, 95% of data is within 2 standard deviations, leaving 2.5% in each tail.',
    objectiveTags: ['S-ID.4'],
  },
  {
    id: 'm8-l4-q4',
    lessonId: 'lesson-8-4',
    lessonTitle: 'Normal Distributions',
    prompt: 'Test scores are normally distributed with mean 75 and standard deviation 10. What score is approximately at the 84th percentile?',
    correctAnswer: '85',
    distractors: ['75', '95', '65'],
    explanation: 'The 84th percentile is approximately one standard deviation above the mean: 75 + 10 = 85.',
    objectiveTags: ['S-ID.4'],
  },

  // Lesson 8-5: Estimating Population Parameters
  {
    id: 'm8-l5-q1',
    lessonId: 'lesson-8-5',
    lessonTitle: 'Estimating Population Parameters',
    prompt: 'A poll reports that 52% of voters support a candidate with a margin of error of ±3%. What is the confidence interval?',
    correctAnswer: '49% to 55%',
    distractors: ['51% to 53%', '49% to 52%', '50% to 55%'],
    explanation: 'The confidence interval is 52% - 3% = 49% to 52% + 3% = 55%.',
    objectiveTags: ['S-IC.4'],
  },
  {
    id: 'm8-l5-q2',
    lessonId: 'lesson-8-5',
    lessonTitle: 'Estimating Population Parameters',
    prompt: 'Which of the following best describes a point estimate?',
    correctAnswer: 'A single value used to estimate a population parameter',
    distractors: ['A range of plausible values for a parameter', 'The exact value of a population parameter', 'The maximum possible error in a survey'],
    explanation: 'A point estimate uses a single sample statistic, such as a sample mean or proportion, to estimate a population parameter.',
    objectiveTags: ['S-IC.4'],
  },
  {
    id: 'm8-l5-q3',
    lessonId: 'lesson-8-5',
    lessonTitle: 'Estimating Population Parameters',
    prompt: 'As the sample size increases, what happens to the margin of error?',
    correctAnswer: 'It decreases',
    distractors: ['It increases', 'It stays the same', 'It becomes zero'],
    explanation: 'Larger sample sizes provide more information about the population, reducing the margin of error.',
    objectiveTags: ['S-IC.4'],
  },
  {
    id: 'm8-l5-q4',
    lessonId: 'lesson-8-5',
    lessonTitle: 'Estimating Population Parameters',
    prompt: 'A survey of 100 people shows 60% approval with a margin of error of ±10%. If the sample size is increased to 400, approximately what happens to the margin of error?',
    correctAnswer: 'It is approximately halved',
    distractors: ['It stays the same', 'It is approximately doubled', 'It is reduced to one-fourth'],
    explanation: 'Margin of error is inversely proportional to the square root of sample size. Quadrupling the sample size halves the margin of error.',
    objectiveTags: ['S-IC.4'],
  },
];

const MODULE_8_CONFIG: PracticeTestModuleConfig = {
  moduleNumber: 8,
  title: 'Inferential Statistics',
  description:
    'Explore methods of random sampling, statistical experiments, and inference. Learn to analyze population data using normal distributions and estimate parameters with confidence.',
  lessons: [
    { lessonId: 'lesson-8-1', lessonNumber: 1, title: 'Random Sampling' },
    { lessonId: 'lesson-8-2', lessonNumber: 2, title: 'Using Statistical Experiments' },
    { lessonId: 'lesson-8-3', lessonNumber: 3, title: 'Analyzing Population Data' },
    { lessonId: 'lesson-8-4', lessonNumber: 4, title: 'Normal Distributions' },
    { lessonId: 'lesson-8-5', lessonNumber: 5, title: 'Estimating Population Parameters' },
  ],
  questions: MODULE_8_QUESTIONS,
  phaseContent: {
    introduction: {
      heading: 'Module 8 Practice Test',
      body: 'Inferential Statistics. Select the lessons you want to include and choose how many questions to answer.',
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

registerModuleConfig(MODULE_8_CONFIG);

export default MODULE_8_CONFIG;
