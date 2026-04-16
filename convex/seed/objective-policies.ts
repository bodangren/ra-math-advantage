import type { ObjectivePriority } from '../../lib/practice/objective-proficiency';

export type SeedObjectivePolicy = {
  standardId: string;
  policy: ObjectivePriority;
  courseKey: string;
  priority: number;
};

/**
 * Objective practice policies for Integrated Math 3.
 *
 * Policies drive queue prioritization in daily practice sessions:
 * - essential: Must-master objectives; appear first in queues (priority 1)
 * - supporting: Secondary objectives; appear after essential (priority 2)
 * - extension: Enrichment objectives; appear when essentials are met (priority 3)
 */
export const OBJECTIVE_POLICIES: SeedObjectivePolicy[] = [
  // Module 1 — Quadratic Functions
  { standardId: "HSA-SSE.B.3", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-REI.B.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-CED.A.1", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "N-CN.A.1", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "N-CN.C.7", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 2 — Polynomial Functions
  { standardId: "HSA-APR.A.1", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-APR.B.2", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-APR.B.3", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.C.7c", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 3 — Polynomial Equations
  { standardId: "HSA-APR.C.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-REI.C.7", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.A.2", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 4 — Inverses and Radical Functions
  { standardId: "N-RN.A.1", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "N-RN.A.2", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.B.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-BF.B.3", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-BF.B.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.C.7a", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 5 — Exponential Functions and Geometric Series
  { standardId: "HSF-LE.A.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.C.7e", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-BF.B.5", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 6 — Logarithmic Functions
  { standardId: "HSF-LE.A.1", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSF-LE.A.2", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSF-LE.B.5", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },

  // Module 7 — Rational Functions and Equations
  { standardId: "HSA-CED.A.2", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSA-APR.D.6", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-IF.C.7d", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSA-REI.A.2", policy: "essential", courseKey: "integrated-math-3", priority: 1 },

  // Module 8 — Inferential Statistics
  { standardId: "HSS-ID.A.1", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSS-ID.A.2", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSS-ID.A.3", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSS-ID.B.6", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSS-IC.A.1", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSS-IC.B.3", policy: "extension", courseKey: "integrated-math-3", priority: 3 },
  { standardId: "HSS-IC.B.4", policy: "extension", courseKey: "integrated-math-3", priority: 3 },
  { standardId: "HSS-IC.B.5", policy: "extension", courseKey: "integrated-math-3", priority: 3 },
  { standardId: "HSS-IC.B.6", policy: "extension", courseKey: "integrated-math-3", priority: 3 },

  // Module 9 — Trigonometric Functions
  { standardId: "HSF-TF.A.1", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-TF.A.2", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-TF.A.4", policy: "essential", courseKey: "integrated-math-3", priority: 1 },
  { standardId: "HSF-TF.B.5", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },

  // Cross-module modeling and application standards
  { standardId: "HSF-BF.A.1", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSF-BF.A.1a", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
  { standardId: "HSA-CED.A.3", policy: "supporting", courseKey: "integrated-math-3", priority: 2 },
];
