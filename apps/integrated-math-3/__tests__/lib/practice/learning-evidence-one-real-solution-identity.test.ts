import { describe, expect, it } from 'vitest';

import {
  IM3_LEARNING_EVIDENCE_PILOT,
  IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
  IM3_ONE_REAL_SOLUTION_NODE,
  IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

describe('atomic one-real-solution runtime identities', () => {
  it('exports exact identities with the exact evidence mapping', () => {
    expect(IM3_ONE_REAL_SOLUTION_NODE)
      .toBe('math.im3.skill.1.2.solve-a-quadratic-equation-with-one-real-solution-by-graphing');
    expect(IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID)
      .toBe(`${IM3_ONE_REAL_SOLUTION_NODE}.worked_example`);
    expect(IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID)
      .toBe(`${IM3_ONE_REAL_SOLUTION_NODE}.guided_practice`);
    expect(IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID)
      .toBe(`${IM3_ONE_REAL_SOLUTION_NODE}.independent_practice`);

    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter((nodeId) => String(nodeId) === IM3_ONE_REAL_SOLUTION_NODE))
      .toHaveLength(1);
    expect(IM3_LEARNING_EVIDENCE_PILOT.enabledNodeIds.filter((nodeId) => String(nodeId) === IM3_ONE_REAL_SOLUTION_NODE))
      .toHaveLength(1);
    expect(IM3_LEARNING_EVIDENCE_PILOT.mappings.filter(({ nodeId }) => String(nodeId) === IM3_ONE_REAL_SOLUTION_NODE))
      .toStrictEqual([
        {
          nodeId: IM3_ONE_REAL_SOLUTION_NODE,
          source: {
            activityId: IM3_ONE_REAL_SOLUTION_WORKED_ACTIVITY_ID,
            mode: 'worked_example',
          },
          guided: {
            activityId: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
            mode: 'guided_practice',
            variantKey: IM3_ONE_REAL_SOLUTION_GUIDED_ACTIVITY_ID,
          },
          masteryAdvantage: {
            activityId: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
            mode: 'independent_practice',
            variantKey: IM3_ONE_REAL_SOLUTION_INDEPENDENT_ACTIVITY_ID,
          },
        },
      ]);
  });
});
