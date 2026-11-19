import { z } from "zod";

const EPSILON = 1e-9;
const normalizedSchema = z.number().finite().min(0).max(1);
const idSchema = z
  .string()
  .min(1)
  .refine((value) => value.trim() === value, {
    message: "Identifiers must not have surrounding whitespace",
  });

export const DEFAULT_PLANNER_V3_2_WEIGHTS = Object.freeze({
  a: 0.35,
  b: 0.2,
  c: 0.15,
  d: 0.1,
  e: 0.2,
});

export const plannerTermsV3_2Schema = z
  .object({
    readiness: normalizedSchema,
    unlockValue: normalizedSchema,
    goalProximity: normalizedSchema,
    weaknessFit: normalizedSchema,
    utility: normalizedSchema,
  })
  .strict();

const weightsBaseSchema = z
  .object({
    a: normalizedSchema,
    b: normalizedSchema,
    c: normalizedSchema,
    d: normalizedSchema,
    e: normalizedSchema,
  })
  .strict()
  .superRefine((weights, ctx) => {
    const total = weights.a + weights.b + weights.c + weights.d + weights.e;
    if (Math.abs(total - 1) > EPSILON) {
      ctx.addIssue({ code: "custom", message: "Planner v3.2 weights must sum to 1" });
    }
  });

export const plannerWeightsV3_2Schema = weightsBaseSchema.default(DEFAULT_PLANNER_V3_2_WEIGHTS);

export const plannerContributionsV3_2Schema = plannerTermsV3_2Schema;
export const plannerRankingModeV3_2Schema = z.enum(["normalized-prerequisite", "utility-led"]);

export const plannerPriorityScoreV3_2Schema = z
  .object({
    schemaVersion: z.literal("planner.priority.v3.2"),
    nodeId: idSchema,
    rankingMode: plannerRankingModeV3_2Schema,
    composite: normalizedSchema,
    terms: plannerTermsV3_2Schema,
    weights: weightsBaseSchema,
    contributions: plannerContributionsV3_2Schema,
    tieBreak: z
      .object({
        rule: z.literal("priority_desc_node_id_asc.v1"),
        priority: normalizedSchema,
        nodeId: idSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine((score, ctx) => {
    if (
      score.rankingMode === "utility-led" &&
      (score.weights.a !== 0 ||
        score.weights.b !== 0 ||
        score.weights.c !== 0 ||
        score.weights.d !== 0.3 ||
        score.weights.e !== 0.7)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["weights"],
        message: "Utility-led mode requires effective weights 0/0/0/0.3/0.7",
      });
    }
    const expected = {
      readiness: score.weights.a * score.terms.readiness,
      unlockValue: score.weights.b * score.terms.unlockValue,
      goalProximity: score.weights.c * score.terms.goalProximity,
      weaknessFit: score.weights.d * score.terms.weaknessFit,
      utility: score.weights.e * score.terms.utility,
    };
    for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
      if (Math.abs(score.contributions[key] - expected[key]) > EPSILON) {
        ctx.addIssue({
          code: "custom",
          path: ["contributions", key],
          message: "Contribution must equal term times its declared weight",
        });
      }
    }
    const expectedComposite = Object.values(expected).reduce((sum, value) => sum + value, 0);
    if (Math.abs(score.composite - expectedComposite) > EPSILON) {
      ctx.addIssue({
        code: "custom",
        path: ["composite"],
        message: "Composite must equal the sum of weighted normalized terms",
      });
    }
    if (score.tieBreak.priority !== score.composite || score.tieBreak.nodeId !== score.nodeId) {
      ctx.addIssue({
        code: "custom",
        path: ["tieBreak"],
        message: "Tie metadata must bind the score and node",
      });
    }
  });

export const plannerDiversityGroupV3_2Schema = z
  .object({
    groupId: idSchema,
    ancestorNodeId: idSchema.nullable(),
    ancestorKind: z.enum(["instructional_unit", "content_group", "self_fallback"]),
    distance: z.number().int().min(0),
  })
  .strict()
  .superRefine((group, ctx) => {
    const isFallback = group.ancestorKind === "self_fallback";
    if (isFallback !== (group.ancestorNodeId === null)) {
      ctx.addIssue({
        code: "custom",
        path: ["ancestorNodeId"],
        message: "Only self fallback groups omit an ancestor node",
      });
    }
    if (isFallback && group.distance !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["distance"],
        message: "Self fallback distance must be zero",
      });
    }
    if (!isFallback && (group.groupId !== group.ancestorNodeId || group.distance < 1)) {
      ctx.addIssue({
        code: "custom",
        message: "Ancestor groups bind their group ID and use a positive distance",
      });
    }
  });

export const plannerRecommendationV3_2Schema = z
  .object({
    schemaVersion: z.literal("planner.recommendation.v3.2"),
    rank: z.number().int().positive(),
    score: plannerPriorityScoreV3_2Schema,
    diversityGroup: plannerDiversityGroupV3_2Schema,
  })
  .strict()
  .superRefine((recommendation, ctx) => {
    if (
      recommendation.diversityGroup.ancestorKind === "self_fallback" &&
      recommendation.diversityGroup.groupId !== recommendation.score.nodeId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["diversityGroup", "groupId"],
        message: "Self fallback groups must be node-specific",
      });
    }
  });

function compareCodePoints(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export const plannerRecommendationSetV3_2Schema = z
  .object({
    schemaVersion: z.literal("planner.recommendations.v3.2"),
    requestedCount: z.number().int().min(0),
    diversityCap: z.literal(2).default(2),
    recommendations: z.array(plannerRecommendationV3_2Schema),
  })
  .strict()
  .superRefine((result, ctx) => {
    if (result.recommendations.length > result.requestedCount) {
      ctx.addIssue({
        code: "custom",
        path: ["recommendations"],
        message: "Recommendations cannot exceed the requested count",
      });
    }
    const ids = new Set<string>();
    const groupCounts = new Map<string, number>();
    result.recommendations.forEach((recommendation, index) => {
      const nodeId = recommendation.score.nodeId;
      if (ids.has(nodeId)) {
        ctx.addIssue({
          code: "custom",
          path: ["recommendations", index],
          message: "Duplicate node",
        });
      }
      ids.add(nodeId);
      if (recommendation.rank !== index + 1) {
        ctx.addIssue({
          code: "custom",
          path: ["recommendations", index, "rank"],
          message: "Recommendation ranks must be contiguous and one-based",
        });
      }
      const groupCount = (groupCounts.get(recommendation.diversityGroup.groupId) ?? 0) + 1;
      groupCounts.set(recommendation.diversityGroup.groupId, groupCount);
      if (groupCount > result.diversityCap) {
        ctx.addIssue({
          code: "custom",
          path: ["recommendations", index, "diversityGroup"],
          message: "Recommendation group exceeds the diversity cap",
        });
      }
      const previous = result.recommendations[index - 1];
      if (!previous) return;
      const priorityOrder = previous.score.composite - recommendation.score.composite;
      const idOrder = compareCodePoints(previous.score.nodeId, nodeId);
      if (priorityOrder < 0 || (priorityOrder === 0 && idOrder > 0)) {
        ctx.addIssue({
          code: "custom",
          path: ["recommendations", index],
          message: "Recommendations must use priority descending then node ID ascending",
        });
      }
    });
  });

const graphNodeSchema = z
  .object({
    nodeId: idSchema,
    kind: z.enum([
      "domain",
      "content_group",
      "instructional_unit",
      "standard",
      "skill",
      "concept",
      "worked_example",
      "task_blueprint",
      "generator",
      "renderer",
      "misconception",
    ]),
    domain: idSchema,
  })
  .strict();
const graphEdgeSchema = z
  .object({
    edgeId: idSchema,
    type: z.enum(["prerequisite_for", "contains"]),
    sourceId: idSchema,
    targetId: idSchema,
  })
  .strict();

export const plannerGraphReleaseInputV3_2Schema = z
  .object({
    schemaVersion: z.literal("planner.graph-release-input.v3.2"),
    graphReleaseId: idSchema,
    graphContentHash: idSchema,
    precomputeInputHash: idSchema,
    domain: idSchema,
    sparseThreshold: z.literal(0.05).default(0.05),
    nodes: z.array(graphNodeSchema),
    edges: z.array(graphEdgeSchema),
    goalNodeIds: z.array(idSchema).default([]),
  })
  .strict()
  .superRefine((release, ctx) => {
    const nodeIds = new Set(release.nodes.map((node) => node.nodeId));
    const edgeIds = new Set(release.edges.map((edge) => edge.edgeId));
    if (nodeIds.size !== release.nodes.length) {
      ctx.addIssue({ code: "custom", path: ["nodes"], message: "Node IDs must be unique" });
    }
    if (edgeIds.size !== release.edges.length) {
      ctx.addIssue({ code: "custom", path: ["edges"], message: "Edge IDs must be unique" });
    }
    if (release.nodes.some((node) => node.domain !== release.domain)) {
      ctx.addIssue({
        code: "custom",
        path: ["nodes"],
        message: "Nodes must match the release domain",
      });
    }
    if (release.edges.some((edge) => !nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId))) {
      ctx.addIssue({
        code: "custom",
        path: ["edges"],
        message: "Edges must reference release nodes",
      });
    }
    if (release.goalNodeIds.some((nodeId) => !nodeIds.has(nodeId))) {
      ctx.addIssue({
        code: "custom",
        path: ["goalNodeIds"],
        message: "Goals must reference release nodes",
      });
    }
    if (new Set(release.goalNodeIds).size !== release.goalNodeIds.length) {
      ctx.addIssue({ code: "custom", path: ["goalNodeIds"], message: "Goal IDs must be unique" });
    }
  });

const graphReachSchema = z
  .object({
    nodeId: idSchema,
    downstreamReach: z.number().int().min(0),
    normalizedUnlockValue: normalizedSchema,
    goalDistance: z.number().int().min(0).nullable(),
    goalProximity: normalizedSchema,
    diversityGroup: plannerDiversityGroupV3_2Schema,
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (
      entry.diversityGroup.ancestorKind === "self_fallback" &&
      entry.diversityGroup.groupId !== entry.nodeId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["diversityGroup", "groupId"],
        message: "Self fallback groups must be node-specific",
      });
    }
  });

export const plannerGraphReleaseOutputV3_2Schema = z
  .object({
    schemaVersion: z.literal("planner.graph-release-output.v3.2"),
    graphReleaseId: idSchema,
    graphContentHash: idSchema,
    precomputeInputHash: idSchema,
    domain: idSchema,
    goalNodeIds: z.array(idSchema),
    skillCount: z.number().int().min(0),
    skillsWithPrerequisiteInEdge: z.number().int().min(0),
    prerequisiteInEdgeRatio: normalizedSchema,
    sparseThreshold: z.literal(0.05),
    rankingMode: plannerRankingModeV3_2Schema,
    maxReach: z.number().int().min(0),
    reachByNode: z.array(graphReachSchema),
  })
  .strict()
  .superRefine((release, ctx) => {
    const canonicalGoals = [...release.goalNodeIds].sort(compareCodePoints);
    if (
      new Set(release.goalNodeIds).size !== release.goalNodeIds.length ||
      canonicalGoals.some((nodeId, index) => nodeId !== release.goalNodeIds[index])
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["goalNodeIds"],
        message: "Goal IDs must be unique and code-point sorted",
      });
    }
    const expectedRatio =
      release.skillCount === 0 ? 0 : release.skillsWithPrerequisiteInEdge / release.skillCount;
    if (release.skillsWithPrerequisiteInEdge > release.skillCount) {
      ctx.addIssue({
        code: "custom",
        path: ["skillsWithPrerequisiteInEdge"],
        message: "Count exceeds skills",
      });
    }
    if (Math.abs(release.prerequisiteInEdgeRatio - expectedRatio) > EPSILON) {
      ctx.addIssue({
        code: "custom",
        path: ["prerequisiteInEdgeRatio"],
        message: "Ratio does not match counts",
      });
    }
    const expectedMode =
      expectedRatio < release.sparseThreshold ? "utility-led" : "normalized-prerequisite";
    if (release.rankingMode !== expectedMode) {
      ctx.addIssue({
        code: "custom",
        path: ["rankingMode"],
        message: "Mode does not match sparse threshold",
      });
    }
    if (release.reachByNode.length !== release.skillCount) {
      ctx.addIssue({
        code: "custom",
        path: ["reachByNode"],
        message: "Every skill requires precomputation",
      });
    }
    const ids = new Set(release.reachByNode.map((entry) => entry.nodeId));
    if (ids.size !== release.reachByNode.length) {
      ctx.addIssue({
        code: "custom",
        path: ["reachByNode"],
        message: "Precomputed node IDs must be unique",
      });
    }
    const observedMax = Math.max(0, ...release.reachByNode.map((entry) => entry.downstreamReach));
    if (observedMax !== release.maxReach) {
      ctx.addIssue({ code: "custom", path: ["maxReach"], message: "maxReach must match entries" });
    }
    release.reachByNode.forEach((entry, index) => {
      const unlock =
        release.maxReach === 0
          ? 0
          : Math.log1p(entry.downstreamReach) / Math.log1p(release.maxReach);
      const proximity = entry.goalDistance === null ? 0 : 1 / (1 + entry.goalDistance);
      if (
        entry.downstreamReach > Math.max(0, release.skillCount - 1) ||
        entry.downstreamReach > release.maxReach ||
        Math.abs(entry.normalizedUnlockValue - unlock) > EPSILON
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["reachByNode", index, "normalizedUnlockValue"],
          message: "Invalid log-scaled unlock value",
        });
      }
      if (Math.abs(entry.goalProximity - proximity) > EPSILON) {
        ctx.addIssue({
          code: "custom",
          path: ["reachByNode", index, "goalProximity"],
          message: "Invalid goal proximity",
        });
      }
    });
  });

export type PlannerTermsV3_2 = z.infer<typeof plannerTermsV3_2Schema>;
export type PlannerWeightsV3_2 = z.infer<typeof plannerWeightsV3_2Schema>;
export type PlannerPriorityScoreV3_2 = z.infer<typeof plannerPriorityScoreV3_2Schema>;
export type PlannerDiversityGroupV3_2 = z.infer<typeof plannerDiversityGroupV3_2Schema>;
export type PlannerRecommendationV3_2 = z.infer<typeof plannerRecommendationV3_2Schema>;
export type PlannerRecommendationSetV3_2 = z.infer<typeof plannerRecommendationSetV3_2Schema>;
export type PlannerGraphReleaseInputV3_2 = z.infer<typeof plannerGraphReleaseInputV3_2Schema>;
export type PlannerGraphReleaseOutputV3_2 = z.infer<typeof plannerGraphReleaseOutputV3_2Schema>;
