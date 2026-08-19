import type { SrsRating } from '@math-platform/srs-engine';

export type DanielsonRating = 1 | 2 | 3 | 4;

export type DanielsonRatingProjection = {
  rawRating: DanielsonRating;
  points: 70 | 80 | 90 | 100;
  srsRating: SrsRating;
  passes: boolean;
};

const RATING_PROJECTIONS: Record<DanielsonRating, DanielsonRatingProjection> = {
  1: { rawRating: 1, points: 70, srsRating: 'Again', passes: false },
  2: { rawRating: 2, points: 80, srsRating: 'Hard', passes: false },
  3: { rawRating: 3, points: 90, srsRating: 'Good', passes: true },
  4: { rawRating: 4, points: 100, srsRating: 'Easy', passes: true },
};

export function isDanielsonRating(value: unknown): value is DanielsonRating {
  return value === 1 || value === 2 || value === 3 || value === 4;
}
/** Convert the authoritative raw Danielson rating into report/SRS values. */
export function adaptDanielsonRating(value: unknown): DanielsonRatingProjection {
  if (!isDanielsonRating(value)) {
    throw new Error('Danielson rating must be an integer from 1 through 4');
  }
  return { ...RATING_PROJECTIONS[value] };
}

export type ComponentRating = {
  componentId: string;
  rawRating: DanielsonRating;
};

export type ComponentProficiencyProjection = {
  allProficient: boolean;
  belowStandardComponentIds: string[];
};

/**
 * Project component status without averaging ratings across components.
 * The latest supplied value wins when a component appears more than once.
 */
export function projectComponentProficiency(
  ratings: readonly ComponentRating[],
): ComponentProficiencyProjection {
  const latest = new Map<string, DanielsonRating>();
  for (const rating of ratings) {
    if (!isDanielsonRating(rating.rawRating)) {
      throw new Error(`Invalid Danielson rating for ${rating.componentId}`);
    }
    latest.set(rating.componentId, rating.rawRating);
  }
  const belowStandardComponentIds = [...latest.entries()]
    .filter(([, rating]) => rating < 3)
    .map(([componentId]) => componentId)
    .sort();
  return {
    allProficient: latest.size > 0 && belowStandardComponentIds.length === 0,
    belowStandardComponentIds,
  };
}
