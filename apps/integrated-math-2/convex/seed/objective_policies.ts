import type { ObjectivePriority } from '@math-platform/srs-engine';

export type SeedObjectivePolicy = {
  standardId: string;
  policy: ObjectivePriority;
  courseKey: string;
  priority: number;
};

/**
 * Objective practice policies for Integrated Math 2.
 *
 * Policies drive queue prioritization in daily practice sessions:
 * - essential: Must-master objectives; appear first in queues (priority 1)
 * - supporting: Secondary objectives; appear after essential (priority 2)
 * - extension: Enrichment objectives; appear when essentials are met (priority 3)
 */
export const OBJECTIVE_POLICIES: SeedObjectivePolicy[] = [
  // Unit 1 — Relationships in Triangles (congruence core)
  { standardId: "G-CO.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-CO.A.2", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-CO.A.4", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-CO.A.5", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-CO.B.6", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-CO.B.7", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-CO.B.8", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-CO.C.10", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-CO.D.12", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },

  // Unit 2 — Quadrilaterals
  { standardId: "G-CO.C.11", policy: "essential", courseKey: "integrated-math-2", priority: 1 },

  // Units 3–4 — Similarity & Trigonometry
  { standardId: "G-SRT.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.A.2", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.A.3", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.B.4", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.B.5", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.C.6", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-SRT.C.8", policy: "essential", courseKey: "integrated-math-2", priority: 1 },

  // Unit 5 — Circles
  { standardId: "G-C.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-C.A.2", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-C.A.3", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-C.B.5", policy: "extension", courseKey: "integrated-math-2", priority: 3 },

  // Units 5, 9 — Geometric Properties with Equations
  { standardId: "G-GPE.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-GPE.B.4", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-GPE.B.5", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-GPE.B.6", policy: "extension", courseKey: "integrated-math-2", priority: 3 },
  { standardId: "G-GPE.B.7", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },

  // Unit 6 — Geometric Measurement
  { standardId: "G-GMD.A.1", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-GMD.A.3", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "G-GMD.B.4", policy: "essential", courseKey: "integrated-math-2", priority: 1 },

  // Modeling with Geometry
  { standardId: "G-MG.A.1", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "G-MG.A.2", policy: "extension", courseKey: "integrated-math-2", priority: 3 },
  { standardId: "G-MG.A.3", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },

  // Unit 7 — Conditional Probability
  { standardId: "S-CP.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "S-CP.A.2", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "S-CP.A.3", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "S-CP.A.4", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "S-CP.A.5", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "S-CP.B.6", policy: "essential", courseKey: "integrated-math-2", priority: 1 },

  // Units 8–12 — Functions
  { standardId: "HSF-IF.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-IF.A.2", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-IF.B.4", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-IF.B.5", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "HSF-IF.B.6", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
  { standardId: "HSF-IF.C.7", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-IF.C.9", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },

  // Building Functions
  { standardId: "HSF-BF.A.1", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-BF.B.3", policy: "essential", courseKey: "integrated-math-2", priority: 1 },
  { standardId: "HSF-BF.B.4", policy: "supporting", courseKey: "integrated-math-2", priority: 2 },
];
