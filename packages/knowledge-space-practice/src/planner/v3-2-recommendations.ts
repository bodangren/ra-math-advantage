import { z } from "zod";

import {
  plannerGraphReleaseOutputV3_2Schema,
  plannerRecommendationSetV3_2Schema,
  plannerTermsV3_2Schema,
  type PlannerGraphReleaseOutputV3_2,
  type PlannerRecommendationSetV3_2,
  type PlannerWeightsV3_2,
} from "./v3-2-contract";
import {
  utilityResolutionV3_2Schema,
  type UtilityResolutionV3_2,
} from "./v3-2-domain-utility-contract";
import {
  reviewLoadAssessmentV3_2Schema,
  type ReviewLoadAssessmentV3_2,
} from "./v3-2-review-load-contract";
import { rankPlannerPriorityScoresV3_2, scorePlannerCandidateV3_2 } from "./v3-2-planner";

const idSchema = z
  .string()
  .min(1)
  .refine((value) => value.trim() === value);

export interface PlannerCandidateV3_2 {
  readonly nodeId: string;
  readonly readiness: number;
  readonly weaknessFit: number;
  readonly utilityResolution: UtilityResolutionV3_2;
}

export interface PlanRecommendationsInputV3_2 {
  readonly graphRelease: PlannerGraphReleaseOutputV3_2;
  readonly readyThreshold: number;
  readonly requestedCount: number;
  readonly candidates: readonly PlannerCandidateV3_2[];
  readonly weights?: PlannerWeightsV3_2;
  readonly reviewLoad?: ReviewLoadAssessmentV3_2;
}

export type PlanRecommendationsResultV3_2 = PlannerRecommendationSetV3_2 & {
  readonly graphReleaseIdentity: {
    readonly graphReleaseId: string;
    readonly graphContentHash: string;
    readonly precomputeInputHash: string;
    readonly rankingMode: "normalized-prerequisite" | "utility-led";
  };
  readonly utilityResolutions: Readonly<Record<string, UtilityResolutionV3_2>>;
  readonly reviewLoad?: ReviewLoadAssessmentV3_2;
};

export function planRecommendationsV3_2(
  input: PlanRecommendationsInputV3_2,
): PlanRecommendationsResultV3_2 {
  const readyThreshold = z.number().finite().min(0).max(1).parse(input.readyThreshold);
  const requestedCount = z.number().int().min(0).parse(input.requestedCount);
  const graphRelease = plannerGraphReleaseOutputV3_2Schema.parse(input.graphRelease);
  if (graphRelease.rankingMode === "utility-led" && input.weights !== undefined) {
    throw new Error("Utility-led releases use fixed 0.7/0.3 weights");
  }
  const releaseEntryByNode = new Map(
    graphRelease.reachByNode.map((entry) => [entry.nodeId, entry]),
  );
  const reviewLoad = input.reviewLoad
    ? reviewLoadAssessmentV3_2Schema.parse(input.reviewLoad)
    : undefined;
  const ids = new Set<string>();
  const candidates = input.candidates.map((candidate) => {
    const nodeId = idSchema.parse(candidate.nodeId);
    if (ids.has(nodeId)) throw new Error(`Duplicate planner candidate nodeId: ${nodeId}`);
    ids.add(nodeId);
    const releaseEntry = releaseEntryByNode.get(nodeId);
    if (!releaseEntry) {
      throw new Error(
        `Planner candidate ${nodeId} is not in graph release ${graphRelease.graphReleaseId}`,
      );
    }
    const utilityResolution = utilityResolutionV3_2Schema.parse(candidate.utilityResolution);
    const expectedUtilityIdentity = {
      domain: graphRelease.domain,
      graphReleaseId: graphRelease.graphReleaseId,
      graphContentHash: graphRelease.graphContentHash,
      precomputeInputHash: graphRelease.precomputeInputHash,
    };
    if (
      JSON.stringify(utilityResolution.releaseIdentity) !== JSON.stringify(expectedUtilityIdentity)
    ) {
      throw new Error(`Utility resolution does not match graph release for ${nodeId}`);
    }
    const terms = plannerTermsV3_2Schema.parse({
      readiness: candidate.readiness,
      unlockValue: releaseEntry.normalizedUnlockValue,
      goalProximity: releaseEntry.goalProximity,
      weaknessFit: candidate.weaknessFit,
      utility: utilityResolution.utility,
    });
    return {
      nodeId,
      terms,
      diversityGroup: releaseEntry.diversityGroup,
      utilityResolution,
    };
  });

  const graphReleaseIdentity = Object.freeze({
    graphReleaseId: graphRelease.graphReleaseId,
    graphContentHash: graphRelease.graphContentHash,
    precomputeInputHash: graphRelease.precomputeInputHash,
    rankingMode: graphRelease.rankingMode,
  });

  if (reviewLoad?.newSkillAllowance === "zero" || requestedCount === 0) {
    return {
      schemaVersion: "planner.recommendations.v3.2",
      requestedCount,
      diversityCap: 2,
      recommendations: [],
      graphReleaseIdentity,
      utilityResolutions: Object.freeze({}),
      ...(reviewLoad ? { reviewLoad } : {}),
    };
  }

  const groupByNode = new Map(
    candidates.map((candidate) => [candidate.nodeId, candidate.diversityGroup]),
  );
  const ranked = rankPlannerPriorityScoresV3_2(
    candidates
      .filter((candidate) => candidate.terms.readiness >= readyThreshold)
      .map((candidate) =>
        scorePlannerCandidateV3_2({
          nodeId: candidate.nodeId,
          rankingMode: graphRelease.rankingMode,
          terms: candidate.terms,
          ...(input.weights ? { weights: input.weights } : {}),
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
      schemaVersion: "planner.recommendation.v3.2" as const,
      rank: selected.length + 1,
      score,
      diversityGroup,
    });
  }

  const result = plannerRecommendationSetV3_2Schema.parse({
    schemaVersion: "planner.recommendations.v3.2",
    requestedCount,
    diversityCap: 2,
    recommendations: selected,
  });
  const selectedIds = new Set(result.recommendations.map((entry) => entry.score.nodeId));
  const utilityResolutions = Object.freeze(
    Object.fromEntries(
      candidates
        .filter((candidate) => selectedIds.has(candidate.nodeId))
        .map((candidate) => [candidate.nodeId, candidate.utilityResolution]),
    ),
  );
  return {
    ...result,
    graphReleaseIdentity,
    utilityResolutions,
    ...(reviewLoad ? { reviewLoad } : {}),
  };
}
