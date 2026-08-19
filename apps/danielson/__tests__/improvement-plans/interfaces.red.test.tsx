import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ImprovementPlanProgress,
  ImprovementPlanView as PlanView,
} from '../../lib/improvement-plans/view';

const mockRequireDanielsonApiSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonApiSession: mockRequireDanielsonApiSession,
}));

const { readImprovementPlanRequest } = await import(
  '../../lib/improvement-plans/improvement-plan-route'
);
const { ImprovementPlanProposalForm } = await import(
  '../../components/improvement-plan-proposal-form'
);
const { ImprovementPlanAcknowledgmentForm } = await import(
  '../../components/improvement-plan-acknowledgment-form'
);
const { ImprovementPlanDecisionForms } = await import(
  '../../components/improvement-plan-decision-forms'
);
const { ImprovementPlanView } = await import(
  '../../components/improvement-plan-view'
);

const target = {
  componentId: 'danielson.framework.component.1e',
  componentTitle: '1e: Planning Coherent Instruction',
  skillId: 'danielson.tlac.skill.double-plan',
  skillTitle: 'Double Plan',
};

function planVersion(version: number, purpose: string): NonNullable<PlanView['activeVersion']> {
  return {
    versionId: `improvement_plan_versions:${version}`,
    version,
    teacherName: 'Teacher One',
    position: 'Mathematics Teacher',
    departmentId: 'departments:math',
    departmentName: 'Mathematics',
    supervisorAccountId: 'accounts:supervisor',
    supervisorName: 'Supervisor One',
    requestedPlanEndDate: null,
    reviewMeetingDate: '2026-09-20',
    purpose,
    areasOfConcern: 'Concern.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Required action.',
    evidenceOfImprovement: 'Rated evidence.',
    schoolSupport: 'School support.',
    successfulCompletionCriteria: 'Expected rating met.',
    insufficientImprovementConsequences: 'Consequences.',
    acknowledgmentText: 'Acknowledgment.',
    sourceId: 'school.pip-form.2026-08-19',
    sourceVersion: '1.0.0',
    sourceHash: 'source-hash',
    proposedAt: Date.parse('2026-09-01T00:00:00.000Z'),
    targets: [{
      targetId: 'improvement_plan_targets:one',
      componentId: target.componentId,
      componentTitle: target.componentTitle,
      skillId: target.skillId,
      skillTitle: target.skillTitle,
      expectedRating: 3,
      expectedPoints: 90,
      componentSourceRefs: [{ source: 'Danielson Framework for Teaching 2022' }],
      skillSourceRefs: [{ source: 'Teach Like a Champion 3.0', location: 'Technique 1' }],
    }],
  };
}

function closedPlanView(): { plan: PlanView; progress: ImprovementPlanProgress } {
  const priorApproved = planVersion(1, 'Approved version one purpose.');
  const approved = planVersion(2, 'Active version two purpose.');
  return {
    plan: {
      planId: 'improvement_plans:closed',
      teacherProfileId: 'teacher_profiles:one',
      state: 'closed',
      revision: 5,
      activeVersion: approved,
      pendingVersion: planVersion(3, 'Stale pending revision.'),
      approvedAt: Date.parse('2026-09-01T00:00:00.000Z'),
      planEndAt: Date.parse('2026-10-01T00:00:00.000Z'),
      reviewMeetingAt: Date.parse('2026-09-20T00:00:00.000Z'),
      closedAt: Date.parse('2026-10-02T00:00:00.000Z'),
      closureOutcome: 'successful',
      closureNote: 'Private closure note.',
      approvalEventId: 'improvement_plan_events:approved',
      closureEventId: 'improvement_plan_events:closed',
      history: {
        events: [
          {
            eventId: 'improvement_plan_events:approved',
            kind: 'approved',
            version: 1,
            versionId: priorApproved.versionId,
            occurredAt: Date.parse('2026-09-01T00:00:00.000Z'),
            payload: {},
          },
          {
            eventId: 'improvement_plan_events:approved-current',
            kind: 'approved',
            version: 2,
            versionId: approved.versionId,
            occurredAt: Date.parse('2026-09-15T00:00:00.000Z'),
            payload: {},
          },
          {
            eventId: 'improvement_plan_events:closed',
            kind: 'closed',
            version: 2,
            versionId: approved.versionId,
            occurredAt: Date.parse('2026-10-02T00:00:00.000Z'),
            payload: { outcome: 'successful', note: 'Private closure note.' },
          },
        ],
        priorApprovedVersions: [{
          version: 1,
          versionId: priorApproved.versionId,
          purpose: 'Approved version one purpose.',
        }],
      },
      acknowledgments: [],
    },
    progress: {
      contractVersion: 'danielson.ip-progress.v1',
      state: 'closed',
      planId: 'improvement_plans:closed',
      version: 1,
      daysRemaining: 0,
      outcome: 'successful',
      closedAt: Date.parse('2026-10-02T00:00:00.000Z'),
      targets: [{
        componentId: target.componentId,
        skillId: target.skillId,
        expectedRating: 3,
        currentRating: 3,
        state: 'meets_expected',
        evidenceDueAt: Date.parse('2026-09-08T12:34:56.000Z'),
        evidenceDue: true,
        evidenceOverdue: false,
        sourceRecordId: 'observation_records:source-one',
        evidenceIdempotencyKey: 'evidence:source-one',
      }],
    },
  };
}

describe('PIP request boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonApiSession.mockResolvedValue({ sub: 'accounts:current-supervisor' });
  });

  it('uses the server session and removes client identity and scope fields', async () => {
    const result = await readImprovementPlanRequest(new Request('http://localhost/api/improvement-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherProfileId: 'teacher_profiles:one',
        purpose: 'Improve instruction.',
        position: 'Chief Executive Officer',
        actorAccountId: 'accounts:attacker',
        organizationId: 'organizations:other',
        roles: ['slt'],
      }),
    }));

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual({
      claims: { sub: 'accounts:current-supervisor' },
      command: {
        teacherProfileId: 'teacher_profiles:one',
        purpose: 'Improve instruction.',
      },
    });
  });
});

describe('PIP interface', () => {
  it('does not show supervisor actions on the viewer own proposed plan', () => {
    const fixture = closedPlanView();
    const plan: PlanView = {
      ...fixture.plan,
      state: 'proposed',
      activeVersion: null,
      pendingVersion: planVersion(3, 'Pending self proposal.'),
      closedAt: null,
      closureOutcome: null,
      closureNote: null,
    };

    render(<ImprovementPlanView
      plan={plan}
      progress={{ contractVersion: 'danielson.ip-progress.v1', state: 'not_configured' }}
      viewer={{ isSubjectTeacher: true, isFrozenSupervisor: false }}
      roles={['teacher', 'slt']}
    />);

    expect(screen.queryByRole('link', { name: /revised proposal/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('shows every editable form section, fixed text, values, and a structured target', () => {
    render(<ImprovementPlanProposalForm
      teacherProfileId="teacher_profiles:one"
      teacherDisplayName="Teacher One"
      position="Mathematics Teacher"
      departmentId="departments:math"
      departmentName="Mathematics"
      targetOptions={[target]}
    />);

    for (const label of [
      'Plan end date',
      'Review meeting date',
      'Purpose of the plan',
      'Areas of concern',
      'Expected standard',
      'Required actions',
      'Evidence of improvement',
      'Support provided by the school',
      'Successful completion criteria',
      'Target skill',
      'Expected rating',
    ]) expect(screen.getByLabelText(label)).toBeVisible();

    expect(screen.getByRole('group', { name: 'School values' })).toHaveTextContent(
      'Courage Adaptability Persistence',
    );
    expect(screen.getByText(/further disciplinary action/i)).toBeVisible();
    expect(screen.getByText(/support professional improvement/i)).toBeVisible();
    expect(screen.getByRole('option', { name: /Double Plan.*Planning Coherent Instruction/i }))
      .toBeVisible();
    expect(screen.queryByLabelText(/score.*Courage/i)).not.toBeInTheDocument();
  });

  it('focuses a server error after a proposal fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'The proposal was not saved.' }),
    }));
    render(<ImprovementPlanProposalForm
      teacherProfileId="teacher_profiles:one"
      teacherDisplayName="Teacher One"
      position="Mathematics Teacher"
      departmentId="departments:math"
      departmentName="Mathematics"
      targetOptions={[target]}
    />);
    for (const label of [
      'Review meeting date',
      'Purpose of the plan',
      'Areas of concern',
      'Expected standard',
      'Required actions',
      'Evidence of improvement',
      'Support provided by the school',
      'Successful completion criteria',
    ]) {
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: label === 'Review meeting date' ? '2026-09-20' : 'Required text.' },
      });
    }
    fireEvent.submit(screen.getByRole('button', { name: 'Propose plan' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The proposal was not saved.');
    expect(alert).toHaveFocus();
  });

  it('states that acknowledgment is not a legal signature and requires confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    render(<ImprovementPlanAcknowledgmentForm
      planId="improvement_plans:one"
      versionId="improvement_plan_versions:one"
      expectedRevision={2}
    />);

    expect(screen.getByText(/not a legal digital signature/i)).toBeVisible();
    const button = screen.getByRole('button', { name: 'Acknowledge plan' });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByLabelText('I confirm that I reviewed this plan.'));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)))
      .toMatchObject({ expectedRevision: 2 });
  });

  it('reuses the acknowledgment request ID after an unknown response', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockRejectedValueOnce(new Error('The response was lost.'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }));
    render(<ImprovementPlanAcknowledgmentForm
      planId="improvement_plans:retry"
      versionId="improvement_plan_versions:retry"
      expectedRevision={2}
    />);
    fireEvent.click(screen.getByLabelText('I confirm that I reviewed this plan.'));
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge plan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The acknowledgment was not saved.');
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge plan' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const bodies = vi.mocked(fetch).mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
    expect(bodies[0].requestId).toBe(bodies[1].requestId);
  });

  it('requires explicit confirmation for approval and closure', () => {
    render(<ImprovementPlanDecisionForms
      planId="improvement_plans:one"
      versionId="improvement_plan_versions:one"
      revision={1}
      state="proposed"
      canApprove
      canClose
    />);

    const approve = screen.getByRole('button', { name: 'Approve plan' });
    expect(approve).toBeDisabled();
    fireEvent.click(screen.getByLabelText('I confirm that this plan can start.'));
    expect(approve).toBeEnabled();

    render(<ImprovementPlanDecisionForms
      planId="improvement_plans:two"
      versionId="improvement_plan_versions:two"
      revision={2}
      state="active"
      canApprove={false}
      canClose
    />);
    const close = screen.getByRole('button', { name: 'Close plan' });
    expect(close).toBeDisabled();
    fireEvent.click(screen.getByLabelText('I confirm this closure outcome.'));
    fireEvent.change(screen.getByLabelText('Closure note'), { target: { value: 'Human decision.' } });
    expect(close).toBeEnabled();
  });

  it('does not render a stale pending revision or approval action after closure', () => {
    const { plan, progress } = closedPlanView();
    render(<ImprovementPlanView
      plan={plan}
      progress={progress}
      viewer={{ isSubjectTeacher: false, isFrozenSupervisor: false }}
      roles={['slt']}
    />);

    expect(screen.queryByRole('heading', { name: 'Pending version 3' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve plan' })).not.toBeInTheDocument();
  });

  it('renders lifecycle history, prior approved versions, evidence due time, and provenance IDs', () => {
    const { plan, progress } = closedPlanView();
    render(<ImprovementPlanView
      plan={plan}
      progress={progress}
      viewer={{ isSubjectTeacher: false, isFrozenSupervisor: false }}
      roles={[]}
    />);

    expect(screen.getByRole('heading', { name: 'Lifecycle history' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Prior approved versions' })).toBeVisible();
    expect(screen.getByText('Approved version one purpose.')).toBeVisible();
    expect(screen.getByText(/Evidence due at:.*Sep.*2026/i)).toBeVisible();
    expect(screen.getByText('Source record: observation_records:source-one')).toBeVisible();
    expect(screen.getByText('Evidence key: evidence:source-one')).toBeVisible();
  });
});
