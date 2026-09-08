import { describe, expect, it, vi } from 'vitest';
import {
  createSelectedSubmissionEvidenceHandler,
  type SelectedEvidenceDependencies,
} from '@/convex/learning-evidence';
import {
  PRECALCULUS_PILOT_ACTIVITY_ID,
  PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID,
} from '@/convex/activities';
import { PRECALCULUS_PILOT_NODE_ID } from '@/lib/learning-evidence/precalc-pilot';

const learnerId = 'profiles:student';
const occurredAt = '2026-09-08T00:00:00.000Z';

function submission(mode: 'guided_practice' | 'independent_practice', ordinal = 1) {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_PILOT_ACTIVITY_ID : PRECALCULUS_PILOT_INDEPENDENT_ACTIVITY_ID;
  const answers = mode === 'guided_practice'
    ? { increasingIntervals: '[0,3] ∪ [7,9]', decreasingIntervals: '[3,7]', constantIntervals: 'none' }
    : { increasingIntervals: '[0,2]', decreasingIntervals: '[4,8]', constantIntervals: '[2,4]' };
  const parts = Object.entries(answers).map(([partId, rawAnswer]) => ({
    partId, rawAnswer, isCorrect: true, score: 1, maxScore: 1,
    hintsUsed: mode === 'guided_practice' ? 2 : 0,
    revealStepsSeen: 0, changedCount: 0,
  }));
  return {
    submissionId: `activity_submissions:${mode}:${ordinal}`,
    userId: learnerId,
    activityId: `activities:${mode}`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    submissionData: {
      contractVersion: 'practice.v1', activityId: stableActivityId, mode,
      status: 'graded', attemptNumber: ordinal, submittedAt: occurredAt, answers, parts,
    },
    attemptOrdinal: ordinal, score: 3, maxScore: 3,
    submittedAt: Date.parse(occurredAt), gradedAt: Date.parse(occurredAt),
  };
}

function teacherEvidence(time = '2026-09-07T23:00:00.000Z') {
  return {
    contractVersion: 'learning-evidence.v1' as const,
    nodeId: PRECALCULUS_PILOT_NODE_ID,
    activityId: 'topic11-worked-source', attemptOrdinal: 1,
    origin: 'teacher_led' as const, mode: 'worked_example' as const,
    occurredAt: time, idempotencyKey: `teacher:${time}`,
  };
}

function setup(stored = submission('independent_practice'), history = [teacherEvidence()]) {
  const receipts = new Map<string, any>();
  const evidence: any[] = [...history];
  const deps: SelectedEvidenceDependencies = {
    authenticateLearner: vi.fn(async () => true),
    findReceipt: vi.fn(async (_learner, id) => receipts.get(id) ?? null),
    loadSubmission: vi.fn(async (id) => id === stored.submissionId ? stored : null),
    sourceIsCurrent: vi.fn(async () => true),
    findEvidence: vi.fn(async (_learner, key) => evidence.find((row) => row.idempotencyKey === key) ?? null),
    listHistory: vi.fn(async () => evidence),
    appendEvidence: vi.fn(async (_learner, _id, row) => { evidence.push(row); }),
    applySrs: vi.fn(async () => undefined),
    appendReceipt: vi.fn(async (_learner, id, receipt) => { receipts.set(id, receipt); }),
  };
  return { deps, handler: createSelectedSubmissionEvidenceHandler(deps), evidence, receipts };
}

describe('selected Topic 1.1 stored-submission evidence', () => {
  it('stores ungraded Guided participation and does not update SRS', async () => {
    const state = setup(submission('guided_practice'));
    await expect(state.handler({ learnerId, submissionId: 'activity_submissions:guided_practice:1' }))
      .resolves.toMatchObject({ persisted: true, masteryApplied: false, decision: { reason: 'ungraded_evidence', masteryBearing: false } });
    expect(state.deps.applySrs).not.toHaveBeenCalled();
    expect(state.evidence.at(-1)).not.toHaveProperty('gradedEvidence');
  });

  it('uses the stored Independent grade and assistance for SRS', async () => {
    const stored = submission('independent_practice');
    const state = setup(stored);
    await expect(state.handler({ learnerId, submissionId: stored.submissionId }))
      .resolves.toMatchObject({ persisted: true, masteryApplied: true, decision: { reason: 'eligible' } });
    expect(state.deps.applySrs).toHaveBeenCalledWith(learnerId, stored.submissionId, stored.submissionData);
  });

  it('does not write before verified earlier teacher exposure', async () => {
    const stored = submission('independent_practice');
    const state = setup(stored, []);
    await expect(state.handler({ learnerId, submissionId: stored.submissionId }))
      .resolves.toMatchObject({ persisted: false, decision: { reason: 'awaiting_teacher_exposure' } });
    expect(state.deps.appendEvidence).not.toHaveBeenCalled();
    expect(state.deps.appendReceipt).not.toHaveBeenCalled();
  });

  it('does not use teacher evidence that occurred after the submission', async () => {
    const stored = submission('independent_practice');
    const state = setup(stored, [teacherEvidence('2026-09-08T01:00:00.000Z')]);
    await expect(state.handler({ learnerId, submissionId: stored.submissionId }))
      .resolves.toMatchObject({ persisted: false, decision: { reason: 'awaiting_teacher_exposure' } });
  });

  it('authenticates before it returns a durable receipt replay', async () => {
    const stored = submission('independent_practice');
    const state = setup(stored);
    await state.handler({ learnerId, submissionId: stored.submissionId });
    vi.mocked(state.deps.authenticateLearner).mockResolvedValue(false);
    await expect(state.handler({ learnerId, submissionId: stored.submissionId }))
      .rejects.toThrow('Inactive student identity');
  });

  it('replays one receipt without repeating evidence or SRS', async () => {
    const stored = submission('independent_practice');
    const state = setup(stored);
    await state.handler({ learnerId, submissionId: stored.submissionId });
    vi.mocked(state.deps.sourceIsCurrent).mockResolvedValue(false);
    await expect(state.handler({ learnerId, submissionId: stored.submissionId }))
      .resolves.toMatchObject({ delivery: 'replay', persisted: true });
    expect(state.deps.applySrs).toHaveBeenCalledTimes(1);
    expect(state.deps.appendEvidence).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['top-level field', (stored: any) => { stored.submissionData.unexpected = true; }],
    ['answer field', (stored: any) => { stored.submissionData.answers.unexpected = 'x'; }],
    ['part field', (stored: any) => { stored.submissionData.parts[0].misconceptionTags = ['x']; }],
    ['missing assistance', (stored: any) => { delete stored.submissionData.parts[0].hintsUsed; }],
    ['wrong stored row ID', (stored: any) => { stored.submissionId = 'activity_submissions:other'; }],
  ])('rejects a stored %s mismatch', async (_name, mutate) => {
    const stored = submission('independent_practice');
    mutate(stored);
    const state = setup(stored);
    await expect(state.handler({ learnerId, submissionId: 'activity_submissions:independent_practice:1' }))
      .resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(state.deps.applySrs).not.toHaveBeenCalled();
  });
});
