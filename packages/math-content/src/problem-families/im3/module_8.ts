import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const MODULE8_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Sampling and Study Design (HSS-IC.A.1, HSS-IC.B.3)
  {
    problemFamilyId: "comprehension-quiz:sampling-methods",
    componentKey: "comprehension-quiz",
    displayName: "Sampling Methods and Bias",
    description: "Classify sampling methods and identify bias in samples and survey questions",
    objectiveIds: ["HSS-IC.A.1", "HSS-IC.B.3"],
    difficulty: "introductory",
    metadata: { module: 8, topic: "sampling" },
  },
  // Probability and Simulations (HSS-ID.A.1, HSS-ID.A.2)
  {
    problemFamilyId: "comprehension-quiz:probability-simulations",
    componentKey: "comprehension-quiz",
    displayName: "Probability and Simulations",
    description: "Compare theoretical and experimental probabilities and evaluate simulations",
    objectiveIds: ["HSS-ID.A.1", "HSS-ID.A.2"],
    difficulty: "standard",
    metadata: { module: 8, topic: "probability" },
  },
  // Distributions (HSS-ID.A.2, HSS-ID.A.3)
  {
    problemFamilyId: "comprehension-quiz:data-distributions",
    componentKey: "comprehension-quiz",
    displayName: "Data Distributions",
    description: "Describe distributions by finding mean and standard deviation and comparing data sets",
    objectiveIds: ["HSS-ID.A.2", "HSS-ID.A.3"],
    difficulty: "standard",
    metadata: { module: 8, topic: "distributions" },
  },
  // Two-Variable Data (HSS-ID.B.6)
  {
    problemFamilyId: "comprehension-quiz:two-variable-data",
    componentKey: "comprehension-quiz",
    displayName: "Two-Variable Data",
    description: "Represent data on two quantitative variables and describe how they vary together",
    objectiveIds: ["HSS-ID.B.6"],
    difficulty: "standard",
    metadata: { module: 8, topic: "distributions" },
  },
  // Normal Distribution and z-Values (HSS-IC.B.4, HSS-IC.B.5)
  {
    problemFamilyId: "comprehension-quiz:normal-distribution",
    componentKey: "comprehension-quiz",
    displayName: "Normal Distribution Analysis",
    description: "Analyze normally distributed variables using the Empirical Rule and z-values",
    objectiveIds: ["HSS-IC.B.4", "HSS-IC.B.5"],
    difficulty: "standard",
    metadata: { module: 8, topic: "distributions" },
  },
  // Confidence Intervals (HSS-IC.B.4, HSS-IC.B.5, HSS-IC.B.6)
  {
    problemFamilyId: "comprehension-quiz:confidence-intervals",
    componentKey: "comprehension-quiz",
    displayName: "Confidence Intervals",
    description: "Use sample data to infer population means and proportions with confidence intervals",
    objectiveIds: ["HSS-IC.B.4", "HSS-IC.B.5", "HSS-IC.B.6"],
    difficulty: "challenging",
    metadata: { module: 8, topic: "inference" },
  },
  // Graphing for Statistics (HSS-ID.A.1, HSS-ID.B.6)
  {
    problemFamilyId: "graphing-explorer:statistical-graphs",
    componentKey: "graphing-explorer",
    displayName: "Statistical Graphs",
    description: "Represent data with plots and analyze relationships between variables",
    objectiveIds: ["HSS-ID.A.1", "HSS-ID.B.6"],
    difficulty: "standard",
    metadata: { module: 8, topic: "distributions" },
  },
];
