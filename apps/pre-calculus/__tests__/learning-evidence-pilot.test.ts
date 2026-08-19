import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateLearningEvidenceV1,
  learningEvidenceFingerprintV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '../../../packages/practice-core/src/practice/learning-evidence';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const SECOND_PRECALCULUS_NODE_ID = 'math.precalc.skill.1.1.describe-covariation-in-tandem-change';
const PILOT_GUIDED_ACTIVITY_ID = `${PILOT_NODE_ID}.guided_practice`;
const SECOND_GUIDED_ACTIVITY_ID = `${SECOND_PRECALCULUS_NODE_ID}.guided_practice`;

// This is the app-owned pilot manifest. It deliberately does not inherit the
// broader Precalculus skill graph or any neighboring graph nodes.
const PRECALCULUS_ENABLED_NODE_IDS = [PILOT_NODE_ID] as const;

type SkillGraph = {
  nodes: Array<{
    id: string;
    kind: string;
    rendererKey: string;
  }>;
};

type PracticeActivityMap = {
  activities: Array<{
    stableActivityId: string;
    nodeId: string;
    mode: string;
    rendererKey: string;
  }>;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(appRoot, relativePath), 'utf8')) as T;
}

function evidence(
  overrides: Partial<Omit<LearningEvidenceV1, 'contractVersion'>> = {},
): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1(
    learningEvidenceV1Schema.parse({
      contractVersion: 'learning-evidence.v1',
      nodeId: PILOT_NODE_ID,
      activityId: PILOT_GUIDED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'mastery_advantage',
      mode: 'guided_practice',
      occurredAt: '2026-08-19T09:00:00.000Z',
      gradedEvidence: {
        isCorrect: true,
        score: 1,
        maxScore: 1,
      },
      idempotencyKey: 'precalc-pilot-attempt-1',
      ...overrides,
    }),
  );
}

/**
 * The shared policy is deliberately pure: the Precalculus persistence adapter
 * supplies accepted evidence and the app-owned one-node manifest. Its
 * `masteryBearing` decision is the only authorization an adapter may use to
 * enter the KST/SRS bridge.
 */
function evaluate(
  candidate: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[] = [],
) {
  return evaluateLearningEvidenceV1({
    evidence: normalizeLearningEvidenceV1(candidate),
    acceptedEvidence: acceptedEvidence.map((item) => normalizeLearningEvidenceV1(item)),
    enabledNodeIds: PRECALCULUS_ENABLED_NODE_IDS,
  });
}

function expectOptionalIntroductionAlias(decision: object, expected: boolean) {
  if ('introduced' in decision) {
    expect(decision).toMatchObject({ introduced: expected });
  }
}

describe('AP Precalculus teacher-led Mastery Advantage pilot', () => {
  it('freezes the app-owned manifest to the audited graph pilot and no other node', () => {
    const graph = readJson<SkillGraph>('curriculum/skill-graph/nodes.json');
    const activityMap = readJson<PracticeActivityMap>(
      'curriculum/skill-graph/projection/practice-v1-activity-map.json',
    );

    expect(PRECALCULUS_ENABLED_NODE_IDS).toEqual([PILOT_NODE_ID]);
    expect(graph.nodes).toContainEqual(expect.objectContaining({
      id: PILOT_NODE_ID,
      kind: 'skill',
      rendererKey: 'graphing-explorer',
    }));
    expect(graph.nodes).toContainEqual(expect.objectContaining({
      id: SECOND_PRECALCULUS_NODE_ID,
      kind: 'skill',
    }));
    expect(activityMap.activities).toContainEqual(expect.objectContaining({
      stableActivityId: PILOT_GUIDED_ACTIVITY_ID,
      nodeId: PILOT_NODE_ID,
      mode: 'guided_practice',
      rendererKey: 'graphing-explorer',
    }));
  });

  it('withholds both a recommendation candidate and a graded submission before exposure', () => {
    const recommendationCandidate = evidence({
      gradedEvidence: undefined,
      idempotencyKey: 'precalc-pilot-recommendation-before-exposure',
    });
    const gradedSubmission = evidence({
      idempotencyKey: 'precalc-pilot-submission-before-exposure',
    });

    for (const decision of [
      evaluate(recommendationCandidate),
      evaluate(gradedSubmission),
    ]) {
      expect(decision).toMatchObject({
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      });
      expectOptionalIntroductionAlias(decision, false);
    }

    expect(evaluate(gradedSubmission)).toEqual(evaluate(gradedSubmission));
  });

  it('introduces the pilot once through teacher-led evidence without authorizing KST/SRS', () => {
    const teacherExposure = evidence({
      activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
      origin: 'teacher_led',
      mode: 'teaching',
      occurredAt: '2026-08-19T10:00:00.000Z',
      idempotencyKey: 'precalc-pilot-teacher-exposure-1',
    });

    const firstIntroduction = evaluate(teacherExposure);
    expect(firstIntroduction).toMatchObject({
      eligible: false,
      masteryBearing: false,
    });
    expectOptionalIntroductionAlias(firstIntroduction, true);

    const replay = evaluate(teacherExposure, [teacherExposure]);
    expect(replay).toMatchObject({
      eligible: false,
      masteryBearing: false,
    });
    expectOptionalIntroductionAlias(replay, false);
    expect(learningEvidenceFingerprintV1(teacherExposure))
      .toBe(learningEvidenceFingerprintV1(normalizeLearningEvidenceV1(teacherExposure)));
  });

  it('authorizes one graded Mastery Advantage attempt only after teacher exposure', () => {
    const teacherExposure = evidence({
      activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
      origin: 'teacher_led',
      mode: 'teaching',
      occurredAt: '2026-08-19T10:00:00.000Z',
      idempotencyKey: 'precalc-pilot-teacher-exposure-2',
    });
    const gradedMasteryAttempt = evidence({
      occurredAt: '2026-08-19T11:00:00.000Z',
      idempotencyKey: 'precalc-pilot-graded-mastery-attempt-1',
    });
    const ungradedMasteryAttempt = evidence({
      occurredAt: '2026-08-19T11:01:00.000Z',
      gradedEvidence: undefined,
      idempotencyKey: 'precalc-pilot-ungraded-mastery-attempt-1',
    });

    const gradedDecision = evaluate(gradedMasteryAttempt, [teacherExposure]);
    expect(gradedDecision).toMatchObject({
      eligible: true,
      masteryBearing: true,
    });
    expectOptionalIntroductionAlias(gradedDecision, false);
    const ungradedDecision = evaluate(ungradedMasteryAttempt, [teacherExposure]);
    expect(ungradedDecision).toMatchObject({
      eligible: false,
      masteryBearing: false,
    });
    expectOptionalIntroductionAlias(ungradedDecision, false);
  });

  it('keeps a second audited Precalculus graph node disabled even after exposure', () => {
    const secondNodeExposure = evidence({
      nodeId: SECOND_PRECALCULUS_NODE_ID,
      activityId: `${SECOND_PRECALCULUS_NODE_ID}.teacher-led-exposure`,
      origin: 'teacher_led',
      mode: 'teaching',
      occurredAt: '2026-08-19T10:00:00.000Z',
      idempotencyKey: 'precalc-second-node-teacher-exposure-1',
    });
    const secondNodeAttempt = evidence({
      nodeId: SECOND_PRECALCULUS_NODE_ID,
      activityId: SECOND_GUIDED_ACTIVITY_ID,
      occurredAt: '2026-08-19T11:00:00.000Z',
      idempotencyKey: 'precalc-second-node-graded-attempt-1',
    });

    const disabled = evaluate(secondNodeAttempt, [secondNodeExposure]);
    expect(disabled).toMatchObject({
      eligible: false,
      masteryBearing: false,
    });
    expectOptionalIntroductionAlias(disabled, false);
    expect(disabled.reason).not.toBe('eligible');
    expect(evaluate(secondNodeAttempt, [secondNodeExposure])).toEqual(disabled);
  });
});
