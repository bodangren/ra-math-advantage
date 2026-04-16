import { describe, it, expect } from 'vitest';
import { runBlueprintValidation } from '@/convex/seed/validate-blueprint';

describe('validate-blueprint', () => {
  it('passes when all references are valid', () => {
    const result = runBlueprintValidation({
      timingBaselines: [
        { problemFamilyId: 'pf-1' },
        { problemFamilyId: 'pf-2' },
      ],
      practiceItems: [
        { practiceItemId: 'pi-1', activityId: 'act-1', problemFamilyId: 'pf-1' },
        { practiceItemId: 'pi-2', activityId: 'act-2', problemFamilyId: 'pf-2' },
      ],
      problemFamilies: [
        { problemFamilyId: 'pf-1', objectiveIds: ['std-1'] },
        { problemFamilyId: 'pf-2', objectiveIds: ['std-2'] },
      ],
      activities: [
        { _id: 'act-1' as unknown as import('@/convex/_generated/dataModel').Id<'activities'> },
        { _id: 'act-2' as unknown as import('@/convex/_generated/dataModel').Id<'activities'> },
      ],
      competencyStandards: [
        { _id: 's1' as unknown as import('@/convex/_generated/dataModel').Id<'competency_standards'>, code: 'std-1' },
        { _id: 's2' as unknown as import('@/convex/_generated/dataModel').Id<'competency_standards'>, code: 'std-2' },
      ],
      objectivePolicies: [
        { standardId: 'std-1' },
        { standardId: 'std-2' },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.totalChecks).toBe(10);
    expect(result.violations).toHaveLength(0);
  });

  it('reports missing problem family for timing baseline', () => {
    const result = runBlueprintValidation({
      timingBaselines: [{ problemFamilyId: 'missing-pf' }],
      practiceItems: [],
      problemFamilies: [],
      activities: [],
      competencyStandards: [],
      objectivePolicies: [],
    });

    expect(result.passed).toBe(false);
    expect(result.violations.some((v: { type: string }) => v.type === 'timing_baseline_missing_family')).toBe(true);
  });

  it('reports missing problem family for practice item', () => {
    const result = runBlueprintValidation({
      timingBaselines: [],
      practiceItems: [{ practiceItemId: 'pi-1', activityId: 'act-1', problemFamilyId: 'missing-pf' }],
      problemFamilies: [],
      activities: [{ _id: 'act-1' as unknown as import('@/convex/_generated/dataModel').Id<'activities'> }],
      competencyStandards: [],
      objectivePolicies: [],
    });

    expect(result.passed).toBe(false);
    expect(result.violations.some((v: { type: string }) => v.type === 'practice_item_missing_family')).toBe(true);
  });

  it('reports missing activity for practice item', () => {
    const result = runBlueprintValidation({
      timingBaselines: [],
      practiceItems: [{ practiceItemId: 'pi-1', activityId: 'missing-act', problemFamilyId: 'pf-1' }],
      problemFamilies: [{ problemFamilyId: 'pf-1', objectiveIds: [] }],
      activities: [],
      competencyStandards: [],
      objectivePolicies: [],
    });

    expect(result.passed).toBe(false);
    expect(result.violations.some((v: { type: string }) => v.type === 'practice_item_missing_activity')).toBe(true);
  });

  it('reports missing standard for objective in problem family', () => {
    const result = runBlueprintValidation({
      timingBaselines: [],
      practiceItems: [],
      problemFamilies: [{ problemFamilyId: 'pf-1', objectiveIds: ['missing-std'] }],
      activities: [],
      competencyStandards: [{ _id: 's1' as unknown as import('@/convex/_generated/dataModel').Id<'competency_standards'>, code: 'std-1' }],
      objectivePolicies: [],
    });

    expect(result.passed).toBe(false);
    expect(result.violations.some((v: { type: string }) => v.type === 'problem_family_missing_standard')).toBe(true);
  });

  it('reports missing standard for objective policy', () => {
    const result = runBlueprintValidation({
      timingBaselines: [],
      practiceItems: [],
      problemFamilies: [],
      activities: [],
      competencyStandards: [{ _id: 's1' as unknown as import('@/convex/_generated/dataModel').Id<'competency_standards'>, code: 'std-1' }],
      objectivePolicies: [{ standardId: 'missing-std' }],
    });

    expect(result.passed).toBe(false);
    expect(result.violations.some((v: { type: string }) => v.type === 'objective_policy_missing_standard')).toBe(true);
  });

  it('counts checks correctly with multiple violations', () => {
    const result = runBlueprintValidation({
      timingBaselines: [
        { problemFamilyId: 'pf-1' },
        { problemFamilyId: 'missing-pf' },
      ],
      practiceItems: [],
      problemFamilies: [{ problemFamilyId: 'pf-1', objectiveIds: [] }],
      activities: [],
      competencyStandards: [],
      objectivePolicies: [],
    });

    expect(result.totalChecks).toBe(2);
    expect(result.violations).toHaveLength(1);
    expect(result.passed).toBe(false);
  });
});
