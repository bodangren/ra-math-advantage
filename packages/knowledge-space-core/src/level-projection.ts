import { z } from 'zod';

export const knowledgeStateSchema = z.object({
  skills: z.array(z.object({
    nodeId: z.string().min(1),
    mastery: z.number().min(0).max(1),
  })),
});

export const displayLevelItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  minMastery: z.number().min(0).max(1),
});

export const displayLevelSchema = z.array(displayLevelItemSchema);

export type KnowledgeState = z.infer<typeof knowledgeStateSchema>;
export type DisplayLevel = z.infer<typeof displayLevelItemSchema>;
export type DisplayLevelBand = z.infer<typeof displayLevelSchema>;

export type LevelProjectionFn = (state: KnowledgeState) => string;

/**
 * Compute the average mastery across all skills in a knowledge state.
 * Returns 0 when the state has no skills.
 */
function averageMastery(state: KnowledgeState): number {
  if (state.skills.length === 0) return 0;
  const total = state.skills.reduce((sum, s) => sum + s.mastery, 0);
  return total / state.skills.length;
}

/**
 * Domain-supplied monotonic function from knowledge state → display level.
 * Presentation-only; never feeds KST/SRS computation.
 *
 * Finds the highest level whose `minMastery` threshold is ≤ the average
 * mastery across all skills. Levels must be sorted by `minMastery` ascending.
 *
 * @param {KnowledgeState} state - The learner's knowledge state (list of skill masteries)
 * @param {DisplayLevel[]} levels - The domain's display-level band definitions, sorted ascending
 * @returns {string} - The `id` of the matching display level
 */
export function projectDisplayLevel(
  state: KnowledgeState,
  levels: DisplayLevel[],
): string {
  const avg = averageMastery(state);
  let result = levels[0]!;
  for (const level of levels) {
    if (avg >= level.minMastery) {
      result = level;
    }
  }
  return result.id;
}
