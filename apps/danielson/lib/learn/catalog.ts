import { officialTechniques } from "@/content/learn/techniques";

export { learnHref } from "./href";
export type { Technique } from "@/content/learn/types";

export const LEARN_TECHNIQUES = Object.freeze([...officialTechniques]);

const techniqueById = new Map(LEARN_TECHNIQUES.map((technique) => [technique.id, technique]));

export function getLearnTechnique(slug: string) {
  return techniqueById.get(slug);
}

export function getLearnTechniqueNavigation(slug: string) {
  const index = LEARN_TECHNIQUES.findIndex((technique) => technique.id === slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: LEARN_TECHNIQUES[index - 1] ?? null,
    next: LEARN_TECHNIQUES[index + 1] ?? null,
  };
}
