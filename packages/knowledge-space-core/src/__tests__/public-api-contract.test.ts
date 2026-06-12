import { describe, expect, it } from 'vitest';
import {
  displayLevelSchema,
  knowledgeStateSchema,
  masterySnapshotSchema,
  progressTrendHistorySchema,
  type LevelProjectionFn,
} from '@math-platform/knowledge-space-core';
import { progressTrendHistorySchema as progressTrendHistorySubpathSchema } from '@math-platform/knowledge-space-core/progress-trend';
import { knowledgeStateSchema as knowledgeStateSubpathSchema } from '@math-platform/knowledge-space-core/level-projection';

describe('knowledge-space-core public API — lesser holes Phase 1 contracts', () => {
  it('exports Level Projection schemas and type from the package entrypoint and subpath', () => {
    const state = {
      skills: [
        { nodeId: 'math.im3.skill.alpha', mastery: 1 },
      ],
    };
    const levels = [
      { id: 'level.1', title: 'Level 1', minMastery: 0 },
    ];
    const project: LevelProjectionFn = (input) => input.skills[0]?.mastery === 1 ? 'level.1' : 'level.0';

    expect(knowledgeStateSchema.safeParse(state).success).toBe(true);
    expect(knowledgeStateSubpathSchema.safeParse(state).success).toBe(true);
    expect(displayLevelSchema.safeParse(levels).success).toBe(true);
    expect(project(state)).toBe('level.1');
  });

  it('exports progressTrend history schemas from the package entrypoint and subpath', () => {
    const snapshot = {
      timestamp: 1_700_000_000_000,
      masteredNodeIds: ['math.im3.skill.alpha'],
    };
    const history = [
      snapshot,
      { timestamp: 1_700_000_060_000, masteredNodeIds: ['math.im3.skill.alpha', 'math.im3.skill.beta'] },
    ];

    expect(masterySnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(progressTrendHistorySchema.safeParse(history).success).toBe(true);
    expect(progressTrendHistorySubpathSchema.safeParse(history).success).toBe(true);
  });
});
