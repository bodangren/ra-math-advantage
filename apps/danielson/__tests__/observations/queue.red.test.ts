import { describe, expect, it } from 'vitest';

import {
  rankPriorityTargets,
  rankTeacherQueue,
  scopeTeacherCandidates,
  selectWalkthroughTargets,
} from '../../lib/observations/queue';
import { priority, teacherCandidate } from './fixtures';

describe('ranked observation queue', () => {
  it.each([
    {
      role: 'hod' as const,
      scope: { hodDepartmentIds: ['departments:math'], coachTeacherProfileIds: [] },
      expected: ['teacher_profiles:math'],
    },
    {
      role: 'coach' as const,
      scope: { hodDepartmentIds: [], coachTeacherProfileIds: ['teacher_profiles:coach'] },
      expected: ['teacher_profiles:coach'],
    },
    {
      role: 'school_head' as const,
      scope: { hodDepartmentIds: [], coachTeacherProfileIds: [] },
      expected: ['teacher_profiles:coach', 'teacher_profiles:math', 'teacher_profiles:science'],
    },
    {
      role: 'slt' as const,
      scope: { hodDepartmentIds: [], coachTeacherProfileIds: [] },
      expected: ['teacher_profiles:coach', 'teacher_profiles:math', 'teacher_profiles:science'],
    },
  ])('scopes the $role queue and excludes self, inactive, and cross-organization teachers', ({ role, scope, expected }) => {
    const candidates = [
      { teacherProfileId: 'teacher_profiles:self', organizationId: 'organizations:school-a', isActive: true, departmentIds: ['departments:math'] },
      { teacherProfileId: 'teacher_profiles:math', organizationId: 'organizations:school-a', isActive: true, departmentIds: ['departments:math'] },
      { teacherProfileId: 'teacher_profiles:science', organizationId: 'organizations:school-a', isActive: true, departmentIds: ['departments:science'] },
      { teacherProfileId: 'teacher_profiles:coach', organizationId: 'organizations:school-a', isActive: true, departmentIds: [] },
      { teacherProfileId: 'teacher_profiles:inactive', organizationId: 'organizations:school-a', isActive: false, departmentIds: ['departments:math'] },
      { teacherProfileId: 'teacher_profiles:outside', organizationId: 'organizations:school-b', isActive: true, departmentIds: ['departments:math'] },
    ];
    const result = scopeTeacherCandidates(candidates, {
      actorAccountId: 'accounts:observer',
      actorTeacherProfileId: 'teacher_profiles:self',
      organizationId: 'organizations:school-a',
      roles: [role],
      ...scope,
    });

    expect(result.map((candidate) => candidate.teacherProfileId).sort()).toEqual(expected);
  });

  it('uses the frozen reason order and returns the visible reason', () => {
    const ranked = rankPriorityTargets([
      priority({
        skillId: 'skill-due',
        due: true,
        evidenceGaps: [],
        currentProficiency: { rawRating: 3, points: 90, passes: true },
      }),
      priority({
        skillId: 'skill-gap',
        due: false,
        evidenceGaps: ['no_valid_rated_evidence'],
      }),
      priority({
        skillId: 'skill-overdue',
        due: true,
        overdueDays: 12,
        evidenceGaps: [],
        currentProficiency: { rawRating: 3, points: 90, passes: true },
      }),
      priority({
        skillId: 'skill-below',
        due: false,
        evidenceGaps: [],
        currentProficiency: { rawRating: 2, points: 80, passes: false },
      }),
    ]);

    expect(ranked.map((item) => [item.skillId, item.reason])).toEqual([
      ['skill-below', 'below_proficient'],
      ['skill-overdue', 'overdue'],
      ['skill-gap', 'evidence_gap'],
      ['skill-due', 'due'],
    ]);
  });

  it('applies every target tie-break and removes duplicate skills before sorting', () => {
    const ranked = rankPriorityTargets([
      priority({
        skillId: 'skill-z',
        componentId: 'component-z',
        overdueDays: 7,
        evidenceGaps: [],
        currentProficiency: { rawRating: 2, points: 80, passes: false },
      }),
      priority({
        skillId: 'skill-b',
        componentId: 'component-a',
        overdueDays: 7,
        evidenceGaps: [],
        currentProficiency: { rawRating: 1, points: 70, passes: false },
      }),
      priority({
        skillId: 'skill-a',
        componentId: 'component-a',
        overdueDays: 7,
        evidenceGaps: [],
        currentProficiency: { rawRating: 1, points: 70, passes: false },
      }),
      priority({
        skillId: 'skill-a',
        componentId: 'component-a',
        overdueDays: 1,
        evidenceGaps: ['no_valid_rated_evidence'],
      }),
    ]);

    expect(ranked.map((item) => item.skillId)).toEqual(['skill-a', 'skill-b', 'skill-z']);
    expect(ranked[0]).toMatchObject({
      reason: 'below_proficient',
      componentId: 'component-a',
      overdueDays: 7,
    });
  });

  it('sorts teachers by the best target, target count, normalized name, and profile ID', () => {
    const below = priority({
      skillId: 'skill-below',
      due: false,
      evidenceGaps: [],
      currentProficiency: { rawRating: 2, points: 80, passes: false },
    });
    const gap = priority({ skillId: 'skill-gap', due: false });
    const ranked = rankTeacherQueue([
      teacherCandidate({
        teacherProfileId: 'teacher_profiles:z',
        displayName: '  alpha  teacher ',
        targets: [below],
      }),
      teacherCandidate({
        teacherProfileId: 'teacher_profiles:b',
        displayName: 'Beta Teacher',
        targets: [below, gap],
      }),
      teacherCandidate({
        teacherProfileId: 'teacher_profiles:a',
        displayName: 'beta teacher',
        targets: [below, gap],
      }),
    ]);

    expect(ranked.map((teacher) => teacher.teacherProfileId)).toEqual([
      'teacher_profiles:a',
      'teacher_profiles:b',
      'teacher_profiles:z',
    ]);
    expect(ranked[0]).toMatchObject({
      reason: 'below_proficient',
      eligibleTargetCount: 2,
    });
  });
});

describe('walkthrough target selection', () => {
  it('returns exactly three distinct targets with components and reasons', () => {
    const result = selectWalkthroughTargets([
      priority({ skillId: 'skill-a', componentId: 'component-a' }),
      priority({ skillId: 'skill-b', componentId: 'component-b' }),
      priority({ skillId: 'skill-c', componentId: 'component-c' }),
      priority({ skillId: 'skill-d', componentId: 'component-d' }),
      priority({ skillId: 'skill-a', componentId: 'component-a', overdueDays: 30 }),
    ]);

    expect(result).toMatchObject({
      requested: 3,
      returned: 3,
      shortfall: 0,
      shortfallReason: null,
    });
    expect(new Set(result.targets.map((target) => target.skillId)).size).toBe(3);
    expect(result.targets).toEqual(expect.arrayContaining([
      expect.objectContaining({ componentId: expect.any(String), reason: expect.any(String) }),
    ]));
  });

  it('returns all eligible targets and an explicit shortfall without duplication', () => {
    const result = selectWalkthroughTargets([
      priority({ skillId: 'skill-a' }),
      priority({ skillId: 'skill-a' }),
      priority({ skillId: 'skill-b' }),
      priority({
        skillId: 'skill-ineligible',
        due: false,
        evidenceGaps: [],
        currentProficiency: { rawRating: 3, points: 90, passes: true },
      }),
    ]);

    expect(result).toEqual({
      requested: 3,
      returned: 2,
      shortfall: 1,
      shortfallReason: 'fewer_than_three_eligible_skills',
      targets: expect.arrayContaining([
        expect.objectContaining({ skillId: 'skill-a' }),
        expect.objectContaining({ skillId: 'skill-b' }),
      ]),
    });
  });
});
