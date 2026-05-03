import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT3_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Similar Figures and Scale Factors
  {
    problemFamilyId: "step-by-step-solver:similar-figures-scale-factors",
    componentKey: "step-by-step-solver",
    displayName: "Similar Figures and Scale Factors",
    description: "Identify similar figures and use scale factors to find missing side lengths",
    objectiveIds: ["G-SRT.A.1", "G-SRT.A.2"],
    difficulty: "introductory",
    metadata: { unit: 3, topic: "similar-figures" },
  },
  // AA Similarity
  {
    problemFamilyId: "comprehension-quiz:aa-similarity",
    componentKey: "comprehension-quiz",
    displayName: "AA Similarity",
    description: "Determine triangle similarity using the AA criterion",
    objectiveIds: ["G-SRT.A.2", "G-SRT.A.3"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "aa-similarity" },
  },
  // SAS and SSS Similarity
  {
    problemFamilyId: "step-by-step-solver:sas-sss-similarity",
    componentKey: "step-by-step-solver",
    displayName: "SAS and SSS Similarity",
    description: "Use SAS and SSS similarity criteria to prove triangles are similar",
    objectiveIds: ["G-SRT.A.2", "G-SRT.A.3"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "similarity-criteria" },
  },
  // Proportions in Triangles
  {
    problemFamilyId: "step-by-step-solver:proportions-similar-triangles",
    componentKey: "step-by-step-solver",
    displayName: "Proportions in Similar Triangles",
    description: "Set up and solve proportions using similar triangle relationships",
    objectiveIds: ["G-SRT.B.4", "G-SRT.B.5"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "proportions" },
  },
  // Similarity Proofs
  {
    problemFamilyId: "step-by-step-solver:similarity-proofs",
    componentKey: "step-by-step-solver",
    displayName: "Similarity Proofs",
    description: "Write proofs involving triangle similarity and proportional relationships",
    objectiveIds: ["G-SRT.B.4", "G-SRT.B.5"],
    difficulty: "challenging",
    metadata: { unit: 3, topic: "proofs" },
  },
  // Graphing Similar Figures
  {
    problemFamilyId: "graphing-explorer:similarity-transformations",
    componentKey: "graphing-explorer",
    displayName: "Similarity Transformations",
    description: "Explore dilations and similarity transformations on the coordinate plane",
    objectiveIds: ["G-SRT.A.1", "G-SRT.A.2"],
    difficulty: "standard",
    metadata: { unit: 3, topic: "transformations" },
  },
];
