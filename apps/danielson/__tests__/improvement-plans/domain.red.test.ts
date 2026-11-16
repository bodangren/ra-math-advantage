import { describe, expect, it } from 'vitest';

import { buildDanielsonGraph } from '../../lib/proficiency/graph';
import { rankPriorityTargets } from '../../lib/observations/queue';
import {
  normalizePipProposal,
  validatePipTargets,
} from '../../lib/improvement-plans/contracts';
import {
  applyPipPriorityOverlay,
  projectImprovementPlanProgress,
} from '../../lib/improvement-plans/progress';
import { PIP_SOURCE_CONTRACT } from '../../lib/improvement-plans/source';

const APPROVED_AT = Date.parse('2026-09-01T00:00:00.000Z');
const END_AT = Date.parse('2026-10-01T00:00:00.000Z');
const REVIEW_AT = Date.parse('2026-09-20T00:00:00.000Z');
const COMPONENT_ID = 'danielson.framework.component.1e';
const SKILL_ID = 'danielson.tlac.skill.double-plan';

function proposalInput() {
  return {
    teacherProfileId: 'teacher_profiles:one',
    position: 'Mathematics Teacher',
    departmentId: 'departments:math',
    supervisorAccountId: 'accounts:supervisor',
    requestedPlanEndDate: '2026-10-01',
    reviewMeetingDate: '2026-09-20',
    purpose: 'Improve lesson coherence.',
    areasOfConcern: 'Lesson tasks do not follow a clear sequence.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Use Double Plan for each observed lesson.',
    evidenceOfImprovement: 'Walkthrough and formal-observation evidence.',
    schoolSupport: 'Weekly planning meeting with the HOD.',
    successfulCompletionCriteria: 'Rating 3 or higher on the target.',
    targets: [{
      componentId: COMPONENT_ID,
      skillId: SKILL_ID,
      expectedRating: 3 as const,
    }],
  };
}

function basePriority() {
  return {
    teacherId: 'teacher_profiles:one',
    skillId: SKILL_ID,
    componentId: COMPONENT_ID,
    due: false,
    dueAt: '2026-12-01T00:00:00.000Z',
    overdueDays: 0,
    currentProficiency: { rawRating: 2, points: 80, passes: false },
    evidenceGaps: [],
    approvedPriorityInputs: [
      'due_status',
      'overdue_duration',
      'current_proficiency',
      'evidence_gap',
    ],
  };
}

describe('PIP source and proposal contract', () => {
  it('preserves every source field and fixed text value', () => {
    expect(PIP_SOURCE_CONTRACT).toMatchObject({
      sourceId: 'school.pip-form.2026-08-19',
      sourceVersion: '1.0.0',
      title: 'Performance Improvement Plan',
      schoolValues: ['Courage', 'Adaptability', 'Persistence'],
      fixedText: {
        insufficientImprovementConsequences: expect.stringContaining('termination'),
        acknowledgmentText: expect.stringContaining('support professional improvement'),
      },
    });
    expect(PIP_SOURCE_CONTRACT.fields).toEqual(expect.arrayContaining([
      'teacher',
      'position',
      'department',
      'supervisor',
      'planEndDate',
      'reviewMeetingDate',
      'purpose',
      'areasOfConcern',
      'expectedStandard',
      'requiredActions',
      'evidenceOfImprovement',
      'schoolSupport',
      'successfulCompletionCriteria',
      'insufficientImprovementConsequences',
      'acknowledgmentText',
      'teacherAcknowledgment',
      'supervisorAcknowledgment',
    ]));
    expect(JSON.stringify(PIP_SOURCE_CONTRACT.schoolValues)).not.toMatch(/score|weight|rating/i);
  });

  it('normalizes the complete form and restores fixed source text', () => {
    const normalized = normalizePipProposal(proposalInput());
    expect(normalized).toMatchObject({
      ...proposalInput(),
      sourceId: PIP_SOURCE_CONTRACT.sourceId,
      sourceVersion: PIP_SOURCE_CONTRACT.sourceVersion,
      insufficientImprovementConsequences:
        PIP_SOURCE_CONTRACT.fixedText.insufficientImprovementConsequences,
      acknowledgmentText: PIP_SOURCE_CONTRACT.fixedText.acknowledgmentText,
    });
    expect(normalizePipProposal(proposalInput())).toEqual(normalized);
  });

  it('preserves internal narrative whitespace and line breaks', () => {
    const narrative = 'First paragraph.\n\n  Second paragraph keeps  two spaces.';
    const normalized = normalizePipProposal({
      ...proposalInput(),
      purpose: `  ${narrative}\n`,
      requiredActions: `\n${narrative}  `,
    });

    expect(normalized.purpose).toBe(narrative);
    expect(normalized.requiredActions).toBe(narrative);
  });

  it('requires a real ISO review date and rejects calendar rollover dates', () => {
    expect(() => normalizePipProposal({ ...proposalInput(), reviewMeetingDate: '' }))
      .toThrow('invalid_reviewMeetingDate');
    expect(() => normalizePipProposal({ ...proposalInput(), reviewMeetingDate: '2026-02-30' }))
      .toThrow('invalid_reviewMeetingDate');
    expect(() => normalizePipProposal({ ...proposalInput(), requestedPlanEndDate: '2026-02-30' }))
      .toThrow('invalid_requestedPlanEndDate');
    expect(normalizePipProposal({
      ...proposalInput(),
      reviewMeetingDate: '2028-02-29',
      requestedPlanEndDate: '2028-03-01',
    })).toMatchObject({
      reviewMeetingDate: '2028-02-29',
      requestedPlanEndDate: '2028-03-01',
    });
  });

  it('rejects missing narratives, duplicate targets, and mismatched graph parents', () => {
    expect(() => normalizePipProposal({ ...proposalInput(), purpose: ' ' }))
      .toThrow('invalid_purpose');
    const graph = buildDanielsonGraph().graph;
    expect(validatePipTargets(proposalInput().targets, graph)).toEqual({ valid: true });
    expect(validatePipTargets([
      ...proposalInput().targets,
      ...proposalInput().targets,
    ], graph)).toEqual({ valid: false, reason: 'duplicate_target' });
    expect(validatePipTargets([{
      componentId: 'danielson.framework.component.2c',
      skillId: SKILL_ID,
      expectedRating: 3,
    }], graph)).toEqual({ valid: false, reason: 'target_component_mismatch' });
    expect(validatePipTargets([{
      componentId: COMPONENT_ID,
      skillId: SKILL_ID,
      expectedRating: 2,
    }], graph)).toEqual({ valid: false, reason: 'invalid_expected_rating' });

    const graphWithDraftSkill = structuredClone(graph);
    const draftSkill = graphWithDraftSkill.nodes.find((node) => node.id === SKILL_ID);
    if (!draftSkill) throw new Error('The target skill fixture is missing.');
    draftSkill.reviewStatus = 'draft' as never;
    expect(validatePipTargets(proposalInput().targets, graphWithDraftSkill))
      .toEqual({ valid: false, reason: 'unapproved_target' });
  });
});

describe('PIP cadence and progress', () => {
  it('uses the Track 2 tie-break order for evidence at the same time', () => {
    const evidence = [
      {
        skillId: SKILL_ID,
        kind: 'rated' as const,
        rating: 1 as const,
        occurredAt: APPROVED_AT + 1,
        sourceRecordId: 'observation:a',
        evidenceIdempotencyKey: 'evidence:a',
      },
      {
        skillId: SKILL_ID,
        kind: 'rated' as const,
        rating: 4 as const,
        occurredAt: APPROVED_AT + 1,
        sourceRecordId: 'observation:b',
        evidenceIdempotencyKey: 'evidence:b',
      },
    ];
    const project = (events: typeof evidence) => projectImprovementPlanProgress({
      planId: 'improvement_plans:one',
      version: 1,
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      reviewMeetingAt: REVIEW_AT,
      now: APPROVED_AT + 2,
      targets: [{ componentId: COMPONENT_ID, skillId: SKILL_ID, expectedRating: 3 }],
      evidence: events,
    });

    expect(project(evidence).targets[0]).toMatchObject({
      currentRating: 4,
      sourceRecordId: 'observation:b',
      evidenceIdempotencyKey: 'evidence:b',
    });
    expect(project([...evidence].reverse())).toEqual(project(evidence));
  });

  it('adds high priority and a seven-day first evidence interval without changing SRS data', () => {
    const priority = basePriority();
    const snapshot = structuredClone(priority);
    const result = applyPipPriorityOverlay({
      priority,
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      latestRatedEvidenceAt: null,
      now: APPROVED_AT,
    });

    expect(priority).toEqual(snapshot);
    expect(result).toMatchObject({
      due: false,
      dueAt: '2026-09-08T00:00:00.000Z',
      overdueDays: 0,
      approvedPriorityInputs: expect.arrayContaining(['approved_plan_priority']),
    });
    expect(rankPriorityTargets([result])).toMatchObject([{
      skillId: SKILL_ID,
      reason: 'approved_plan_priority',
    }]);
  });

  it('resets cadence only for rated evidence and caps it at the plan end', () => {
    const beforeEnd = applyPipPriorityOverlay({
      priority: basePriority(),
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      latestRatedEvidenceAt: Date.parse('2026-09-10T00:00:00.000Z'),
      now: Date.parse('2026-09-17T00:00:00.000Z'),
    });
    expect(beforeEnd.dueAt).toBe('2026-09-17T00:00:00.000Z');
    expect(beforeEnd.due).toBe(true);

    const capped = applyPipPriorityOverlay({
      priority: basePriority(),
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      latestRatedEvidenceAt: Date.parse('2026-09-28T00:00:00.000Z'),
      now: Date.parse('2026-10-02T00:00:00.000Z'),
    });
    expect(capped.dueAt).toBe('2026-10-01T00:00:00.000Z');
    expect(capped.overdueDays).toBe(1);
  });

  it('uses effective rated plan-period evidence', () => {
    const input = {
      planId: 'improvement_plans:one',
      version: 1,
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      reviewMeetingAt: REVIEW_AT,
      now: REVIEW_AT,
      targets: [{
        componentId: COMPONENT_ID,
        skillId: SKILL_ID,
        expectedRating: 3 as const,
      }],
      evidence: [
        { skillId: SKILL_ID, kind: 'not_enough_evidence' as const, occurredAt: APPROVED_AT + 1 },
        { skillId: SKILL_ID, kind: 'rated' as const, rating: 2 as const, occurredAt: APPROVED_AT + 2 },
      ],
    };
    const baseline = projectImprovementPlanProgress(input);

    expect(baseline).toMatchObject({
      contractVersion: 'danielson.ip-progress.v1',
      state: 'active',
      trackState: 'off_track',
      targets: [{ state: 'below_expected', currentRating: 2 }],
    });
    expect(JSON.stringify(baseline)).not.toMatch(/retention|termination|disciplinaryRecommendation/);
  });

  it('freezes a human closure outcome without deriving a discipline decision', () => {
    const result = projectImprovementPlanProgress({
      planId: 'improvement_plans:one',
      version: 1,
      approvedAt: APPROVED_AT,
      planEndAt: END_AT,
      reviewMeetingAt: REVIEW_AT,
      now: Date.parse('2026-10-02T00:00:00.000Z'),
      targets: [{ componentId: COMPONENT_ID, skillId: SKILL_ID, expectedRating: 3 }],
      evidence: [{
        skillId: SKILL_ID,
        kind: 'rated',
        rating: 4,
        occurredAt: Date.parse('2026-09-15T00:00:00.000Z'),
      }],
      closure: {
        outcome: 'insufficient_improvement',
        closedAt: Date.parse('2026-10-02T00:00:00.000Z'),
      },
    });
    expect(result).toMatchObject({
      state: 'closed',
      outcome: 'insufficient_improvement',
      targets: [{ state: 'meets_expected', currentRating: 4 }],
    });
    expect(result).not.toHaveProperty('recommendation');
  });
});


describe('review regressions: plan evidence dates', () => {
  it('preserves an existing overdue SRS date', () => {
    const result = applyPipPriorityOverlay({
      priority: { ...basePriority(), due: true, dueAt: '2026-08-31T00:00:00.000Z', overdueDays: 1 },
      approvedAt: APPROVED_AT, planEndAt: END_AT, latestRatedEvidenceAt: null, now: APPROVED_AT,
    });
    expect(result).toMatchObject({ due: true, dueAt: '2026-08-31T00:00:00.000Z', overdueDays: 1 });
  });

  it('excludes future evidence from current plan progress', () => {
    const result = projectImprovementPlanProgress({
      planId: 'plan', version: 1, approvedAt: APPROVED_AT, planEndAt: END_AT,
      reviewMeetingAt: REVIEW_AT, now: APPROVED_AT,
      targets: [{ componentId: COMPONENT_ID, skillId: SKILL_ID, expectedRating: 3 }],
      evidence: [{ skillId: SKILL_ID, kind: 'rated', rating: 4, occurredAt: REVIEW_AT }],
    });
    expect(result.targets[0]).toMatchObject({ currentRating: null, state: 'no_plan_evidence' });
  });
});
