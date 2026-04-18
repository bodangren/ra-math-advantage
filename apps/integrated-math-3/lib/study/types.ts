export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  modules: number[];
  topics: string[];
  synonyms: string[];
  related: string[];
}

export interface ScheduledTerm {
  termSlug: string;
  fsrsState: unknown;
  scheduledFor: number;
}

export interface ReviewResult {
  masteryDelta: number;
  fsrsState: unknown;
  scheduledFor: number;
}

export type ProficiencyBand = 'new' | 'learning' | 'familiar' | 'mastered';
