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
export type DisplayLevel = z.infer<typeof displayLevelSchema>;

export type LevelProjectionFn = (state: KnowledgeState) => string;
