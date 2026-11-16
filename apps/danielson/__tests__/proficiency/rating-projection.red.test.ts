import { describe, expect, it } from 'vitest';

const ratingModule = () => import('../../lib/proficiency/rating');

describe('Danielson rating adapter', () => {
  it.each([
    [1, 70, 'Again'],
    [2, 80, 'Hard'],
    [3, 90, 'Good'],
    [4, 100, 'Easy'],
  ] as const)('maps rating %i to %i points and the %s SRS review', async (rating, points, srsRating) => {
    const { adaptDanielsonRating } = await ratingModule();

    expect(adaptDanielsonRating(rating)).toEqual({
      rawRating: rating,
      points,
      srsRating,
      passes: rating >= 3,
    });
  });

  it('keeps a rating below proficient visible and prevents an all-proficient result', async () => {
    const { projectComponentProficiency } = await ratingModule();

    const result = projectComponentProficiency([
      { componentId: 'danielson.framework.component.1a', rawRating: 4 },
      { componentId: 'danielson.framework.component.1b', rawRating: 4 },
      { componentId: 'danielson.framework.component.1c', rawRating: 4 },
      { componentId: 'danielson.framework.component.1d', rawRating: 2 },
    ]);

    expect(result).toEqual({
      allProficient: false,
      belowStandardComponentIds: ['danielson.framework.component.1d'],
    });
  });
});
