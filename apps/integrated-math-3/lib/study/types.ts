export type { GlossaryTerm } from '@math-platform/math-content/glossary';

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
