import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LeadershipPortfolioTable } from '../../components/leadership-portfolio-table';
import { TeacherReportView } from '../../components/teacher-report-view';
import type { PublicTeacherReport } from '../../lib/reporting/contracts';
import { projectPortfolioRow } from '../../lib/reporting/projections';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const configuredGbf = {
  contractVersion: 'danielson.gbf-progress.v1' as const,
  state: 'in_progress' as const,
  assignmentId: 'teacher_gbf_assignments:one',
  sequenceReleaseId: 'danielson.gbf.sequence.2026-08-19.v1',
  graphReleaseId: 'danielson.gbf.graph.2026-08-19.v1',
  trajectories: {
    management: {
      currentPhaseId: 'phase_2' as const,
      requiredActionStepIds: ['phase_1.management.1'],
      completedActionStepIds: [],
      assignedPrimarySkillIds: ['danielson.tlac.skill.routine-building'],
      proficientPrimarySkillIds: [],
      duePrimarySkillIds: ['danielson.tlac.skill.routine-building'],
    },
    rigor: {
      currentPhaseId: 'phase_1' as const,
      requiredActionStepIds: ['phase_1.rigor.1'],
      completedActionStepIds: [],
      assignedPrimarySkillIds: ['danielson.tlac.skill.double-plan'],
      proficientPrimarySkillIds: [],
      duePrimarySkillIds: ['danielson.tlac.skill.double-plan'],
    },
  },
  assignedSkillIds: [
    'danielson.tlac.skill.routine-building',
    'danielson.tlac.skill.double-plan',
  ],
  proficientSkillIds: [],
  dueSkillIds: [
    'danielson.tlac.skill.routine-building',
    'danielson.tlac.skill.double-plan',
  ],
  unresolvedGapSkillIds: [
    'danielson.tlac.skill.knowledge-organizers',
    'danielson.tlac.skill.retrieval-practice',
  ],
};

const report = {
  teacherProfileId: 'teacher_profiles:one',
  displayName: 'Teacher One',
  danielsonState: 'not_enough_evidence',
  officialEvaluations: [],
  currentProficiency: {
    state: 'not_enough_evidence',
    domains: [],
  },
  improvementPlan: {
    contractVersion: 'danielson.ip-progress.v1',
    state: 'not_configured',
  },
  gbf: configuredGbf,
  evidenceHistory: [],
  publicComments: [],
  responses: [],
} as unknown as PublicTeacherReport;

const row = {
  teacherProfileId: 'teacher_profiles:one',
  displayName: 'Teacher One',
  danielson: {
    state: 'not_enough_evidence' as const,
    belowComponentIds: [],
  },
  improvementPlan: {
    contractVersion: 'danielson.ip-progress.v1' as const,
    state: 'not_configured' as const,
  },
  gbf: {
    contractVersion: 'danielson.gbf-progress.v1' as const,
    state: 'in_progress' as const,
    managementPhaseId: 'phase_2' as const,
    rigorPhaseId: 'phase_1' as const,
    dueSkillCount: 2,
    unresolvedGapSkillCount: 2,
  },
  evidenceDue: {
    state: 'current' as const,
    dueCount: 0,
    overdueCount: 0,
    maximumOverdueDays: 0,
    nextDueAt: null,
  },
  attentionReasons: [] as const,
} as unknown as Parameters<typeof LeadershipPortfolioTable>[0]['rows'][number];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GBF compact portfolio projection', () => {
  it('keeps due and unresolved-gap counts in the compact portfolio contract', () => {
    const result = projectPortfolioRow({
      teacherProfileId: 'teacher_profiles:one',
      displayName: 'Teacher One',
      priorities: [],
      now: Date.parse('2026-08-20T00:00:00.000Z'),
      gbf: configuredGbf,
    });

    expect(result.gbf as Record<string, unknown>).toMatchObject({
      state: 'in_progress',
      dueSkillCount: 2,
      unresolvedGapSkillCount: 2,
    });
  });
});

describe('GBF report interface', () => {
  it('uses Get Better Faster (GBF) on first use and renders compact counts', () => {
    render(<LeadershipPortfolioTable rows={[row]} nextHref={null} />);

    expect(screen.getByRole('columnheader', { name: 'Get Better Faster (GBF)' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Performance Improvement Plan' })).toBeVisible();
    expect(screen.getByText('Due skills: 2')).toBeVisible();
    expect(screen.getByText('Unresolved gaps: 2')).toBeVisible();
    expect(screen.getByText('Management phase: Phase 2')).toBeVisible();
    expect(screen.getByText('Rigor phase: Phase 1')).toBeVisible();
  });

  it('does not offer a new improvement plan while one is open', () => {
    const activeRow = {
      ...row,
      improvementPlan: {
        contractVersion: 'danielson.ip-progress.v1' as const,
        state: 'active' as const,
        planId: 'improvement_plans:one',
        trackState: 'on_track' as const,
        daysRemaining: 20,
      },
    };
    render(<LeadershipPortfolioTable rows={[activeRow]} nextHref={null} />);

    expect(screen.queryByRole('link', { name: 'Start improvement plan' }))
      .not.toBeInTheDocument();
  });

  it('does not offer a duplicate same-release assignment for a configured report', () => {
    render(<TeacherReportView
      report={report}
      canComment={false}
      canRespond={false}
      canAssignGbf
    />);

    expect(screen.queryByRole('button', { name: 'Assign Get Better Faster' }))
      .not.toBeInTheDocument();
  });

  it('submits an assignment from the existing teacher report without a standalone page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ kind: 'assigned' }),
    }));
    const props = {
      report: {
        ...report,
        gbf: { contractVersion: 'danielson.gbf-progress.v1', state: 'not_configured' },
      },
      canComment: false,
      canRespond: false,
      canAssignGbf: true,
    } as unknown as Parameters<typeof TeacherReportView>[0];
    render(<TeacherReportView {...props} />);

    expect(screen.getByText('Get Better Faster (GBF)')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Assign Get Better Faster' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith(
      '/api/reports/teachers/teacher_profiles%3Aone/gbf-assignment',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
    );

    expect(existsSync(resolve(APP_ROOT, 'app/gbf-assignment/page.tsx'))).toBe(false);
    expect(existsSync(resolve(APP_ROOT, 'app/gbf-assignments/page.tsx'))).toBe(false);
    expect(readFileSync(resolve(APP_ROOT, 'app/reports/teachers/[teacherProfileId]/page.tsx'), 'utf8'))
      .toContain('canAssignGbf');
  });
});
