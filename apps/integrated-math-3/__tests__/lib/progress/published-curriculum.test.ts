import { describe, expect, it } from 'vitest';
import { buildLessonPhaseProgress, buildPublishedUnitProgressRows } from '@/lib/progress/published-curriculum';

describe('buildLessonPhaseProgress', () => {
  it('includes phaseType in the returned phase data', () => {
    const phases = [
      {
        _id: 'phase1',
        phaseNumber: 1,
        phaseType: 'explore' as const,
      },
      {
        _id: 'phase2',
        phaseNumber: 2,
        phaseType: 'learn' as const,
      },
      {
        _id: 'phase3',
        phaseNumber: 3,
        phaseType: 'worked_example' as const,
      },
    ];

    const progressRows = [
      {
        phaseId: 'phase1',
        status: 'completed' as const,
        startedAt: 1000,
        completedAt: 2000,
        timeSpentSeconds: 60,
        updatedAt: 2000,
      },
    ];

    const result = buildLessonPhaseProgress({ phases, progressRows });

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('phaseType', 'explore');
    expect(result[1]).toHaveProperty('phaseType', 'learn');
    expect(result[2]).toHaveProperty('phaseType', 'worked_example');
  });

  it('handles phases with all 10 phase types correctly', () => {
    const phaseTypes = [
      'explore',
      'vocabulary',
      'learn',
      'key_concept',
      'worked_example',
      'guided_practice',
      'independent_practice',
      'assessment',
      'discourse',
      'reflection',
    ] as const;

    const phases = phaseTypes.map((phaseType, index) => ({
      _id: `phase${index}`,
      phaseNumber: index + 1,
      phaseType,
    }));

    const result = buildLessonPhaseProgress({ phases, progressRows: [] });

    expect(result).toHaveLength(10);
    result.forEach((phase, index) => {
      expect(phase.phaseType).toBe(phaseTypes[index]);
    });
  });

  it('maintains correct phase ordering with phaseType included', () => {
    const phases = [
      {
        _id: 'phase3',
        phaseNumber: 3,
        phaseType: 'independent_practice' as const,
      },
      {
        _id: 'phase1',
        phaseNumber: 1,
        phaseType: 'explore' as const,
      },
      {
        _id: 'phase2',
        phaseNumber: 2,
        phaseType: 'learn' as const,
      },
    ];

    const result = buildLessonPhaseProgress({ phases, progressRows: [] });

    expect(result).toHaveLength(3);
    expect(result[0].phaseNumber).toBe(1);
    expect(result[0].phaseType).toBe('explore');
    expect(result[1].phaseNumber).toBe(2);
    expect(result[1].phaseType).toBe('learn');
    expect(result[2].phaseNumber).toBe(3);
    expect(result[2].phaseType).toBe('independent_practice');
  });
});

describe('buildPublishedUnitProgressRows', () => {
  it('counts skipped phases toward completedPhases for lesson unlock', () => {
    const lessons = [
      { _id: 'l1', unitNumber: 1, orderIndex: 0, title: 'Lesson 1', slug: 'lesson-1' },
      { _id: 'l2', unitNumber: 1, orderIndex: 1, title: 'Lesson 2', slug: 'lesson-2' },
    ];
    const lessonVersions = [
      { _id: 'lv1', lessonId: 'l1', version: 1, status: 'published', title: 'Lesson 1', description: null },
      { _id: 'lv2', lessonId: 'l2', version: 1, status: 'published', title: 'Lesson 2', description: null },
    ];
    const phaseVersions = [
      { _id: 'pv1', lessonVersionId: 'lv1', phaseType: 'explore' },
      { _id: 'pv2', lessonVersionId: 'lv1', phaseType: 'learn' },
      { _id: 'pv3', lessonVersionId: 'lv1', phaseType: 'assessment' },
      { _id: 'pv4', lessonVersionId: 'lv2', phaseType: 'explore' },
    ];
    // Student completed phase 1, skipped phase 2, completed phase 3
    const progressRows = [
      { phaseId: 'pv1', status: 'completed' as const },
      { phaseId: 'pv2', status: 'skipped' as const },
      { phaseId: 'pv3', status: 'completed' as const },
    ];

    const result = buildPublishedUnitProgressRows({ lessons, lessonVersions, phaseVersions, progressRows });

    expect(result).toHaveLength(1);
    expect(result[0].lessons).toHaveLength(2);
    // Lesson 1: 3 phases, all completed or skipped → completedPhases = 3
    expect(result[0].lessons[0].completedPhases).toBe(3);
    expect(result[0].lessons[0].totalPhases).toBe(3);
    expect(result[0].lessons[0].progressPercentage).toBe(100);
  });

  it('does not count in_progress phases toward completedPhases', () => {
    const lessons = [
      { _id: 'l1', unitNumber: 1, orderIndex: 0, title: 'Lesson 1', slug: 'lesson-1' },
    ];
    const lessonVersions = [
      { _id: 'lv1', lessonId: 'l1', version: 1, status: 'published', title: 'Lesson 1', description: null },
    ];
    const phaseVersions = [
      { _id: 'pv1', lessonVersionId: 'lv1', phaseType: 'explore' },
      { _id: 'pv2', lessonVersionId: 'lv1', phaseType: 'learn' },
    ];
    const progressRows = [
      { phaseId: 'pv1', status: 'completed' as const },
      { phaseId: 'pv2', status: 'in_progress' as const },
    ];

    const result = buildPublishedUnitProgressRows({ lessons, lessonVersions, phaseVersions, progressRows });

    expect(result[0].lessons[0].completedPhases).toBe(1);
    expect(result[0].lessons[0].totalPhases).toBe(2);
    expect(result[0].lessons[0].progressPercentage).toBe(50);
  });
});
