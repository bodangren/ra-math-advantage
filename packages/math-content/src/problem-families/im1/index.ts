import type { ProblemFamilyInput } from '@math-platform/practice-core';

export { IM1_GENERATORS, type IM1GeneratorEntry } from './generators';

export const IM1_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  {
    variantKey:
      'step-by-step-solver:translate-verbal-to-numerical',
    componentKey: 'step-by-step-solver',
    displayName: 'Translate Verbal Descriptions to Numerical Expressions',
    description:
      'Translate verbal descriptions into correct numerical expressions using operation symbols and grouping, then evaluate.',
    objectiveIds: [
      'math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'verbal-numerical-translation' },
  },
  {
    variantKey:
      'step-by-step-solver:algebraic-verbal-translation',
    componentKey: 'step-by-step-solver',
    displayName: 'Translate Between Algebraic and Verbal Expressions',
    description:
      'Translate between algebraic expressions and verbal expressions using correct mathematical terminology.',
    objectiveIds: [
      'math.im1.skill.1.2.translate-between-algebraic-expressions-and-verbal-expressio',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'algebraic-verbal-translation' },
  },
  {
    variantKey:
      'fill-in-the-blank:properties-of-equality',
    componentKey: 'fill-in-the-blank',
    displayName: 'Properties of Equality',
    description:
      'Identify and apply the reflexive, symmetric, and transitive properties of equality.',
    objectiveIds: [
      'math.im1.skill.1.3.identify-and-apply-the-reflexive-symmetric-and-transitive-pr',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'properties-of-equality' },
  },
  {
    variantKey:
      'step-by-step-solver:distributive-property',
    componentKey: 'step-by-step-solver',
    displayName: 'Apply the Distributive Property',
    description:
      'Apply the Distributive Property to rewrite and evaluate numerical expressions, including mixed numbers and decimals.',
    objectiveIds: [
      'math.im1.skill.1.4.apply-the-distributive-property-to-rewrite-and-evaluate-nume',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'distributive-property' },
  },
  {
    variantKey:
      'comprehension-quiz:absolute-value-distance',
    componentKey: 'comprehension-quiz',
    displayName: 'Absolute Value and Distance',
    description:
      'Write absolute value expressions that model real-world distances and accuracy as positive differences.',
    objectiveIds: [
      'math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'absolute-value-distance' },
  },
  {
    variantKey:
      'comprehension-quiz:ratios-and-percentages',
    componentKey: 'comprehension-quiz',
    displayName: 'Ratios and Percentages as Metrics',
    description:
      'Use ratios and percentages as metrics to model real-world situations and make decisions.',
    objectiveIds: [
      'math.im1.skill.1.6.use-ratios-and-percentages-as-metrics-to-model-real-world-si',
    ],
    difficulty: 'standard',
    metadata: { module: 1, topic: 'ratios-and-percentages' },
  },
];
