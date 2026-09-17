import { describe, expect, it } from 'vitest';

import type { Id } from '@/convex/_generated/dataModel';
import * as seedLesson12 from '@/convex/seed/seed_lesson_1_2';
import {
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
} from '@/lib/practice/learning-evidence-pilot';

type OptionalMappingBuilder = ((activityId: Id<"activities">, now: number) => Record<string, unknown>) | undefined;

describe('IM3 two-real-solutions practice mapping documents', () => {
  it('builds the exact two-real-solutions Guided variant and item documents', () => {
    const buildGuidedMappingDocuments = (
      seedLesson12 as {
        buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments?: OptionalMappingBuilder;
      }
    ).buildIm3TwoRealSolutionsGuidedPracticeSeedDocuments;
    expect(typeof buildGuidedMappingDocuments).toBe('function');
    if (typeof buildGuidedMappingDocuments !== 'function') return;

    const activityId = 'activities:two-real-solutions-guided' as Id<"activities">;
    const now = 246810;
    const documents = buildGuidedMappingDocuments(activityId, now);

    expect(documents).toEqual({
      variant: {
        variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        migrationVersion: 'kst-srs.v3.2',
        sourceTimestamp: now,
        componentKey: 'graphing-explorer',
        displayName: 'Guided practice: Find two numbers with a given sum and product by graphing',
        description: 'Guided practice for finding two real numbers with a sum and product by graphing.',
        objectiveIds: [IM3_TWO_REAL_SOLUTIONS_NODE],
        difficulty: 'standard',
        metadata: { stableActivityId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID },
      },
      item: {
        practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID}:seed-5`,
        activityId,
        variantKey: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
        migrationVersion: 'kst-srs.v3.2',
        sourceTimestamp: now,
        variantLabel: 'Seed 5',
      },
    });
    expect(JSON.stringify(documents)).not.toMatch(
      /"(?:expectedAnswer|partAnswers|table_values|placed_points|solutions|score|maxScore|isCorrect|correctness)"\s*:/,
    );
  });

  it('builds the exact two-real-solutions Independent variant and item documents', () => {
    const buildIndependentMappingDocuments = (
      seedLesson12 as {
        buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments?: OptionalMappingBuilder;
      }
    ).buildIm3TwoRealSolutionsIndependentPracticeSeedDocuments;
    expect(typeof buildIndependentMappingDocuments).toBe('function');
    if (typeof buildIndependentMappingDocuments !== 'function') return;

    const activityId = 'activities:two-real-solutions-independent' as Id<"activities">;
    const now = 135790;
    const documents = buildIndependentMappingDocuments(activityId, now);

    expect(documents).toEqual({
      variant: {
        variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: 'kst-srs.v3.2',
        sourceTimestamp: now,
        componentKey: 'graphing-explorer',
        displayName: 'Independent practice: Find two numbers with a given sum and product by graphing',
        description: 'Independent practice for finding two real numbers with a sum and product by graphing.',
        objectiveIds: [IM3_TWO_REAL_SOLUTIONS_NODE],
        difficulty: 'standard',
        metadata: { stableActivityId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID },
      },
      item: {
        practiceItemId: `${IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID}:seed-2`,
        activityId,
        variantKey: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        legacyProblemFamilyId: IM3_TWO_REAL_SOLUTIONS_INDEPENDENT_ACTIVITY_ID,
        migrationVersion: 'kst-srs.v3.2',
        sourceTimestamp: now,
        variantLabel: 'Seed 2',
      },
    });
    expect(JSON.stringify(documents)).not.toMatch(
      /"(?:expectedAnswer|partAnswers|table_values|placed_points|solutions|score|maxScore|isCorrect|correctness)"\s*:/,
    );
  });
});
