import type { ProblemFamilyInput } from '@math-platform/practice-core';

export const UNIT5_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  // Circle Vocabulary
  {
    problemFamilyId: "fill-in-the-blank:circle-vocabulary",
    componentKey: "fill-in-the-blank",
    displayName: "Circle Vocabulary",
    description: "Identify and define parts of a circle including radius, chord, diameter, arc, and sector",
    objectiveIds: ["G-C.A.1"],
    difficulty: "introductory",
    metadata: { unit: 5, topic: "vocabulary" },
  },
  // Central and Inscribed Angles
  {
    problemFamilyId: "step-by-step-solver:central-inscribed-angles",
    componentKey: "step-by-step-solver",
    displayName: "Central and Inscribed Angles",
    description: "Find measures of central and inscribed angles and their intercepted arcs",
    objectiveIds: ["G-C.A.2"],
    difficulty: "standard",
    metadata: { unit: 5, topic: "angles" },
  },
  // Arcs and Chords
  {
    problemFamilyId: "step-by-step-solver:arcs-and-chords",
    componentKey: "step-by-step-solver",
    displayName: "Arcs and Chords",
    description: "Apply relationships between arcs, chords, and circle theorems",
    objectiveIds: ["G-C.A.2", "G-C.A.3"],
    difficulty: "standard",
    metadata: { unit: 5, topic: "arcs-chords" },
  },
  // Tangents and Secants
  {
    problemFamilyId: "step-by-step-solver:tangents-secants",
    componentKey: "step-by-step-solver",
    displayName: "Tangents and Secants",
    description: "Solve problems involving tangent lines, secant lines, and their angle/segment relationships",
    objectiveIds: ["G-C.A.2", "G-C.A.3"],
    difficulty: "standard",
    metadata: { unit: 5, topic: "tangents-secants" },
  },
  // Circle Equations
  {
    problemFamilyId: "graphing-explorer:circle-equations",
    componentKey: "graphing-explorer",
    displayName: "Circle Equations",
    description: "Write and graph equations of circles from center and radius on the coordinate plane",
    objectiveIds: ["G-GPE.A.1"],
    difficulty: "standard",
    metadata: { unit: 5, topic: "circle-equations" },
  },
];
