import { describe, expect, it } from 'vitest';

import {
  comparePortfolioRows,
  paginatePortfolioRows,
  projectCurrentProficiency,
  projectOfficialEvaluation,
  projectPortfolioRow,
} from '../../lib/reporting/projections';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';

const NOW = Date.parse('2026-11-01T00:00:00.000Z');

type Priority = {
  teacherId: string;
  skillId: string;
  componentId: string;
  due: boolean;
  dueAt: string | null;
  overdueDays: number;
  currentProficiency: {
    rawRating: number | null;
    points: number | null;
    passes: boolean;
  };
  evidenceGaps: string[];
  approvedPriorityInputs: string[];
};

function approvedSkills() {
  const graph = buildDanielsonGraph().graph;
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === 'contains')
      .filter((edge) => graph.nodes.some((node) => node.id === edge.targetId && node.kind === 'skill'))
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  return graph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => ({ skillId: node.id, componentId: componentBySkill.get(node.id) ?? '' }))
    .sort((left, right) => left.skillId.localeCompare(right.skillId));
}

function priorities(
  teacherId = 'teacher_profiles:one',
  rating: 1 | 2 | 3 | 4 = 3,
): Priority[] {
  const points = { 1: 70, 2: 80, 3: 90, 4: 100 }[rating];
  return approvedSkills().map(({ skillId, componentId }) => ({
    teacherId,
    skillId,
    componentId,
    due: false,
    dueAt: '2027-01-01T00:00:00.000Z',
    overdueDays: 0,
    currentProficiency: { rawRating: rating, points, passes: rating >= 3 },
    evidenceGaps: [],
    approvedPriorityInputs: [
      'due_status',
      'overdue_duration',
      'current_proficiency',
      'evidence_gap',
    ],
  }));
}

function portfolioRow(input: {
  teacherProfileId: string;
  displayName: string;
  priorities?: Priority[];
}) {
  return projectPortfolioRow({
    teacherProfileId: input.teacherProfileId,
    displayName: input.displayName,
    priorities: input.priorities ?? priorities(input.teacherProfileId),
    now: NOW,
  });
}

describe('Danielson reporting projections', () => {
  it('uses complete component evidence and never averages away a low skill', () => {
    const complete = priorities();
    expect(portfolioRow({
      teacherProfileId: 'teacher_profiles:one',
      displayName: 'Teacher One',
      priorities: complete,
    })).toMatchObject({
      danielson: { state: 'proficient', belowComponentIds: [] },
      attentionReasons: [],
    });

    const lowComponentId = complete[0].componentId;
    const oneLow = complete.map((item, index) => index === 0 ? {
      ...item,
      currentProficiency: { rawRating: 2, points: 80, passes: false },
    } : item);
    expect(portfolioRow({
      teacherProfileId: 'teacher_profiles:one',
      displayName: 'Teacher One',
      priorities: oneLow,
    })).toMatchObject({
      danielson: {
        state: 'below_proficient',
        belowComponentIds: [lowComponentId],
      },
      attentionReasons: ['below_proficient'],
    });

    expect(portfolioRow({
      teacherProfileId: 'teacher_profiles:one',
      displayName: 'Teacher One',
      priorities: complete.slice(1),
    })).toMatchObject({ danielson: { state: 'not_enough_evidence' } });
  });

  it('returns exact neutral IP and GBF seams before their source tracks are active', () => {
    expect(portfolioRow({
      teacherProfileId: 'teacher_profiles:one',
      displayName: 'Teacher One',
    })).toMatchObject({
      improvementPlan: {
        contractVersion: 'danielson.ip-progress.v1',
        state: 'not_configured',
      },
      gbf: {
        contractVersion: 'danielson.gbf-progress.v1',
        state: 'not_configured',
      },
    });
  });

  it('separates due from overdue and does not turn missing evidence into an overdue failure', () => {
    const dueWithoutCard = priorities().map((item, index) => index === 0 ? {
      ...item,
      due: true,
      dueAt: null,
      currentProficiency: { rawRating: null, points: null, passes: false },
      evidenceGaps: ['no_valid_rated_evidence'],
    } : item);
    const dueRow = portfolioRow({
      teacherProfileId: 'teacher_profiles:due',
      displayName: 'Due Teacher',
      priorities: dueWithoutCard,
    });
    expect(dueRow).toMatchObject({
      evidenceDue: { state: 'due', dueCount: 1, overdueCount: 0 },
      attentionReasons: [],
    });

    const overdue = priorities().map((item, index) => index === 0 ? {
      ...item,
      due: true,
      dueAt: '2026-10-27T00:00:00.000Z',
      overdueDays: 5,
    } : item);
    expect(portfolioRow({
      teacherProfileId: 'teacher_profiles:overdue',
      displayName: 'Overdue Teacher',
      priorities: overdue,
    })).toMatchObject({
      evidenceDue: {
        state: 'overdue',
        dueCount: 1,
        overdueCount: 1,
        maximumOverdueDays: 5,
      },
      attentionReasons: ['overdue_evidence'],
    });
  });

  it('uses the declared attention order and deterministic tie breaks', () => {
    const low = priorities('teacher_profiles:low').map((item, index) => index === 0 ? {
      ...item,
      currentProficiency: { rawRating: 2, points: 80, passes: false },
    } : item);
    const overdue = priorities('teacher_profiles:overdue').map((item, index) => index === 0 ? {
      ...item,
      due: true,
      dueAt: '2026-10-20T00:00:00.000Z',
      overdueDays: 12,
    } : item);
    const rows = [
      portfolioRow({ teacherProfileId: 'teacher_profiles:none', displayName: 'Zulu', priorities: priorities('teacher_profiles:none') }),
      portfolioRow({ teacherProfileId: 'teacher_profiles:overdue', displayName: 'Able', priorities: overdue }),
      portfolioRow({ teacherProfileId: 'teacher_profiles:low', displayName: 'Zulu', priorities: low }),
      portfolioRow({ teacherProfileId: 'teacher_profiles:a', displayName: 'Same', priorities: priorities('teacher_profiles:a') }),
      portfolioRow({ teacherProfileId: 'teacher_profiles:b', displayName: 'Same', priorities: priorities('teacher_profiles:b') }),
    ].sort(comparePortfolioRows);

    expect(rows.map((row) => row.teacherProfileId)).toEqual([
      'teacher_profiles:low',
      'teacher_profiles:overdue',
      'teacher_profiles:a',
      'teacher_profiles:b',
      'teacher_profiles:none',
    ]);
  });

  it('paginates more than 50 sorted teachers without a duplicate or omission', () => {
    const rows = Array.from({ length: 61 }, (_, index) => portfolioRow({
      teacherProfileId: `teacher_profiles:${String(index).padStart(2, '0')}`,
      displayName: `Teacher ${String(index).padStart(2, '0')}`,
      priorities: priorities(`teacher_profiles:${String(index).padStart(2, '0')}`),
    })).sort(comparePortfolioRows);

    const first = paginatePortfolioRows(rows, { cursor: null, pageSize: 25 });
    const second = paginatePortfolioRows(rows, { cursor: first.continueCursor, pageSize: 25 });
    const third = paginatePortfolioRows(rows, { cursor: second.continueCursor, pageSize: 25 });
    const ids = [...first.items, ...second.items, ...third.items]
      .map((row) => row.teacherProfileId);

    expect(first.items).toHaveLength(25);
    expect(second.items).toHaveLength(25);
    expect(third.items).toHaveLength(11);
    expect(third.isDone).toBe(true);
    expect(new Set(ids)).toHaveLength(61);
    expect(ids).toEqual(rows.map((row) => row.teacherProfileId));
    expect(() => paginatePortfolioRows(rows, { cursor: 'teacher_profiles:missing', pageSize: 25 }))
      .toThrow('invalid_cursor');
  });

  it('keeps official ratings and current skill proficiency in separate projections', () => {
    const componentIds = [
      'danielson.framework.component.1a',
      'danielson.framework.component.1b',
      'danielson.framework.component.1c',
      'danielson.framework.component.1d',
    ];
    const record = {
      draftId: 'observation_records:q1',
      observationId: 'observation_records:q1',
      organizationId: 'organizations:one',
      teacherProfileId: 'teacher_profiles:one',
      observerAccountId: 'accounts:observer',
      observationType: 'formal_q1' as const,
      schoolYear: '2026-2027',
      sourceVersion: 'danielson-observation.v1',
      frameworkVersion: 'danielson-2022',
      observedAt: '2026-09-01T00:00:00.000Z',
      status: 'submitted' as const,
      revision: 1,
      createdAt: NOW,
      updatedAt: NOW,
      submissionKey: 'q1-key',
      submissionFingerprint: 'q1-fingerprint',
      submittedAt: NOW,
      publishedAt: NOW,
      items: componentIds.map((componentId, index) => ({
        itemId: componentId,
        componentId,
        outcome: { kind: 'rated' as const, rating: [4, 4, 4, 2][index] as 1 | 2 | 3 | 4 },
        evidenceNote: null,
      })),
    };
    const official = projectOfficialEvaluation({
      record,
      amendments: [],
      observerDisplayName: 'Observer One',
    });
    const current = projectCurrentProficiency({ priorities: priorities() });

    expect(official).toMatchObject({
      observationId: 'observation_records:q1',
      observationType: 'formal_q1',
      status: 'below_proficient',
      components: [
        expect.objectContaining({ componentId: componentIds[0], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[1], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[2], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[3], rawRating: 2, points: 80 }),
      ],
    });
    expect(official).not.toHaveProperty('average');
    expect(current).toMatchObject({ state: 'proficient' });
    expect(current).not.toHaveProperty('officialEvaluations');
  });

  it('maps each official raw rating to the exact derived points', () => {
    const componentIds = [
      'danielson.framework.component.1a',
      'danielson.framework.component.1b',
      'danielson.framework.component.1c',
      'danielson.framework.component.1d',
    ];
    const base = {
      draftId: 'observation_records:q4',
      observationId: 'observation_records:q4',
      organizationId: 'organizations:one',
      teacherProfileId: 'teacher_profiles:one',
      observerAccountId: 'accounts:observer',
      observationType: 'formal_q4' as const,
      schoolYear: '2026-2027',
      sourceVersion: 'danielson-observation.v1',
      frameworkVersion: 'danielson-2022',
      observedAt: '2027-05-01T00:00:00.000Z',
      status: 'submitted' as const,
      revision: 1,
      createdAt: NOW,
      updatedAt: NOW,
      submissionKey: 'q4-key',
      submissionFingerprint: 'q4-fingerprint',
      submittedAt: NOW,
      publishedAt: NOW,
      items: componentIds.map((componentId, index) => ({
        itemId: componentId,
        componentId,
        outcome: { kind: 'rated' as const, rating: (index + 1) as 1 | 2 | 3 | 4 },
        evidenceNote: null,
      })),
    };

    const projected = projectOfficialEvaluation({
      record: base,
      amendments: [],
      observerDisplayName: 'Observer One',
    });
    expect(projected.components.map((component: { rawRating: number | null; points: number | null }) => (
      [component.rawRating, component.points]
    )))
      .toEqual([[1, 70], [2, 80], [3, 90], [4, 100]]);
  });
});
