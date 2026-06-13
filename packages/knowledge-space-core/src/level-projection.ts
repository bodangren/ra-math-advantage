import { z } from 'zod';

export const knowledgeStateSchema = z.object({
  skills: z.array(z.object({
    nodeId: z.string().min(1),
    mastery: z.number().min(0).max(1),
  })),
});

export const displayLevelSchema = z.array(z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  minMastery: z.number().min(0).max(1),
}));

export type KnowledgeState = z.infer<typeof knowledgeStateSchema>;
export type DisplayLevel = z.infer<typeof displayLevelSchema>[number];

export type LevelProjectionFn = (state: KnowledgeState) => string;

export function projectDisplayLevel(
  state: KnowledgeState,
  levels: DisplayLevel[],
): string {
  const sorted = [...levels].sort((a, b) => a.minMastery - b.minMastery);
  const avg =
    state.skills.length === 0
      ? 0
      : state.skills.reduce((sum, s) => sum + s.mastery, 0) /
        state.skills.length;
  let result = sorted[0]!.id;
  for (const level of sorted) {
    if (avg >= level.minMastery) {
      result = level.id;
    }
  }
  return result;
}
