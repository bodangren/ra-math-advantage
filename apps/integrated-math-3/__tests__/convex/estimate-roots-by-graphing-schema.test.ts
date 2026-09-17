import { describe, expect, it } from 'vitest';
import { validate } from 'convex-helpers/validators';

import schema from '@/convex/schema';
import { getGenerator } from '@math-platform/math-content/knowledge-space';

const ESTIMATE_ROOTS_NODE_ID = 'math.im3.skill.1.2.estimate-roots-by-graphing';

describe('estimate-roots-by-graphing activity schema', () => {
  it('accepts the complete generated activity document', () => {
    const output = getGenerator('estimate-roots-by-graphing').generate({
      nodeId: ESTIMATE_ROOTS_NODE_ID,
      seed: 0,
      difficulty: 0.5,
    });
    const activityDocument = {
      componentKey: 'graphing-explorer',
      displayName: 'Estimate roots of a quadratic equation by graphing',
      props: output.data.rendererProps,
      createdAt: 0,
      updatedAt: 0,
    };

    expect(validate(schema.tables.activities.validator, activityDocument)).toBe(true);
  });
});
