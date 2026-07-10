import { z } from 'zod';

import {
  plannerDiversityGroupV3_2Schema,
  plannerRecommendationSetV3_2Schema,
  plannerTermsV3_2Schema,
  type PlannerDiversityGroupV3_2,
  type PlannerRecommendationSetV3_2,
} from './v3-2-contract';
import {
  reviewLoadAssessmentV3_2Schema,
  type ReviewLoadAssessmentV3_2,
} from './v3-2-review-load-contract';
import { rankPlannerPriorityScoresV3_2, scorePlannerCandidateV3_2 } from './v3-2-planner';

const idSchema = z.string().min(1).refine((value) => value.trim() === value);

export interface PlannerCandidateV3_2 {
  readonly nodeId: string;
  readonly readiness: number;
  readonly unlockValue: number;
  readonly goalProximity: number;
  readonly weaknessFit: number;
  readonly utility: number;
  readonly diversityGroup: PlannerDiversityGroupV3_2;
}

export interface PlanRecommendationsInputV3_2 {
  readonly rankingMode: 'normalized-prerequisite' | 'utility-led';
  readonly readyThreshold: number;
  readonly requestedCount: number;
  readonly candidates: readonly PlannerCandidateV3_2[];
  readonly reviewLoad?: ReviewLoadAssessmentV3_2;
}

export type PlanRecommendationsResultV3_2 = PlannerRecommendationSetV3_2 & {
  readonly reviewLoad?: ReviewLoadAssessmentV3_2;
};

export function planRecommendationsV3_2(
  input: PlanRecommendationsInputV3_2,
): PlanRecommendationsResultV3_2 {
  const readyThreshold = z.number().finite().min(0).max(1).parse(input.readyThreshold);
  const requestedCount = z.number().int().min(0).parse(input.requestedCount);
  const reviewLoad = input.reviewLoad
    ? reviewLoadAssessmentV3_2Schema.parse(input.reviewLoad)
    : undefined;
  const ids = new Set<string>();
  const candidates = input.candidates.map((candidate) => {
    const nodeId = idSchema.parse(candidate.nodeId);
    if (ids.has(nodeId)) throw new Error(`Duplicate planner candidate nodeId: ${nodeId}`);
    ids.add(nodeId);
    const terms = plannerTermsV3_2Schema.parse({
      readiness: candidate.readiness,
      unlockValue: candidate.unlockValue,
      goalProximity: candidate.goalProximity,
      weaknessFit: candidate.weaknessFit,
      utility: candidate.utility,
    });
    return {
      nodeId,
      terms,
      diversityGroup: plannerDiversityGroupV3_2Schema.parse(candidate.diversityGroup),
    };
  });

  if (reviewLoad?.newSkillAllowance === 'zero' || requestedCount === 0) {
    return {
      schemaVersion: 'planner.recommendations.v3.2',
      requestedCount,
      diversityCap: 2,
      recommendations: [],
      ...(reviewLoad ? { reviewLoad } : {}),
    };
  }

  const groupByNode = new Map(candidates.map((candidate) => [candidate.nodeId, candidate.diversityGroup]));
  const ranked = rankPlannerPriorityScoresV3_2(
    candidates
      .filter((candidate) => candidate.terms.readiness >= readyThreshold)
      .map((candidate) =>
        scorePlannerCandidateV3_2({
          nodeId: candidate.nodeId,
          rankingMode: input.rankingMode,
          terms: candidate.terms,
        }),
      ),
  );
  const groupCounts = new Map<string, number>();
  const selected = [];
  for (const score of ranked) {
    if (selected.length >= requestedCount) break;
    const diversityGroup = groupByNode.get(score.nodeId);
    if (!diversityGroup) throw new Error(`Missing diversity group for ${score.nodeId}`);
    const count = groupCounts.get(diversityGroup.groupId) ?? 0;
    if (count >= 2) continue;
    groupCounts.set(diversityGroup.groupId, count + 1);
    selected.push({
      schemaVersion: 'planner.recommendation.v3.2' as const,
      rank: selected.length + 1,
      score,
      diversityGroup,
    });
  }

  const result = plannerRecommendationSetV3_2Schema.parse({
    schemaVersion: 'planner.recommendations.v3.2',
    requestedCount,
    diversityCap: 2,
    recommendations: selected,
  });
  return { ...result, ...(reviewLoad ? { reviewLoad } : {}) };
}
