import type { ObjectivePriority } from '@math-platform/srs-engine';

export type SeedObjectivePolicy = {
  standardId: string;
  policy: ObjectivePriority;
  courseKey: string;
  priority: number;
};

/**
 * Objective practice policies for AP Precalculus.
 *
 * Policies drive queue prioritization in daily practice sessions:
 * - essential: Must-master objectives; appear first in queues (priority 1)
 * - supporting: Secondary objectives; appear after essential (priority 2)
 * - extension: Enrichment objectives; appear when essentials are met (priority 3)
 */
export const OBJECTIVE_POLICIES: SeedObjectivePolicy[] = [
  // Unit 1 — Polynomial & Rational Functions (core algebra)
  { standardId: "HSF-IF.B.4", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-IF.C.7c", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-IF.C.7d", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSA-APR.A.1", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSA-APR.B.2", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSA-APR.B.3", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSA-APR.D.6", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSA-REI.A.2", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-BF.A.1", policy: "supporting", courseKey: "pre-calculus", priority: 2 },
  { standardId: "HSF-BF.B.3", policy: "supporting", courseKey: "pre-calculus", priority: 2 },

  // Unit 2 — Exponential & Logarithmic Functions
  { standardId: "HSF-LE.A.1", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-LE.A.2", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-LE.A.4", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-LE.B.5", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-IF.C.7e", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-BF.B.4", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-BF.B.5", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-IF.A.2", policy: "supporting", courseKey: "pre-calculus", priority: 2 },
  { standardId: "HSF-BF.A.1a", policy: "supporting", courseKey: "pre-calculus", priority: 2 },

  // Unit 3 — Trigonometric & Polar Functions
  { standardId: "HSF-TF.A.1", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-TF.A.2", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-TF.A.4", policy: "essential", courseKey: "pre-calculus", priority: 1 },
  { standardId: "HSF-TF.B.5", policy: "essential", courseKey: "pre-calculus", priority: 1 },

  // Unit 4 — Parametric, Vectors, Matrices (extension)
  { standardId: "HSA-REI.C.8", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSA-REI.C.9", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.6", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.7", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.8", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.9", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.10", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.C.11", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.A.1", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.A.2", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.A.3", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.B.4", policy: "extension", courseKey: "pre-calculus", priority: 3 },
  { standardId: "HSN-VM.B.5", policy: "extension", courseKey: "pre-calculus", priority: 3 },
];
