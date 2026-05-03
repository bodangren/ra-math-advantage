import { z } from 'zod';

export const glossaryTermSchema = z.object({
  slug: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  courses: z.array(z.string().min(1)).min(1),
  topics: z.array(z.string().min(1)),
  synonyms: z.array(z.string().min(1)),
  related: z.array(z.string().min(1)),
  modules: z.array(z.number()).optional(),
});

export type GlossaryTerm = z.infer<typeof glossaryTermSchema>;

export interface GlossaryFilter {
  course?: string;
  topic?: string;
  module?: number;
  slug?: string;
}
