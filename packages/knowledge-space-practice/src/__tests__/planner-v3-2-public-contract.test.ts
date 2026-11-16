import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PLANNER_V3_2_WEIGHTS as rootWeights,
  plannerPriorityScoreV3_2Schema as rootScoreSchema,
} from '../index';
import {
  DEFAULT_PLANNER_V3_2_WEIGHTS as subpathWeights,
  plannerPriorityScoreV3_2Schema as subpathScoreSchema,
} from '@math-platform/knowledge-space-practice/planner/v3-2-contract';
import { priorityWeightsSchema } from '../planner/types';

describe('planner.v3.2 public contract', () => {
  it('publishes identical root and dedicated-subpath values', () => {
    expect(rootWeights).toBe(subpathWeights);
    expect(rootScoreSchema).toBe(subpathScoreSchema);
  });

  it('does not widen the legacy strict four-weight contract', () => {
    expect(priorityWeightsSchema.safeParse({ a: 0.35, b: 0.2, c: 0.15, d: 0.1, e: 0.2 }).success).toBe(false);
  });
});
