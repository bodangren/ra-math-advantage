import { z } from "zod";

import {
  EVALUATION_CONTRACT_VERSION,
  MAX_DETERMINISTIC_SEED,
  MAX_SIMULATION_DAYS,
  MAX_SYNTHETIC_COHORT_SIZE,
  syntheticCohortSchema,
  syntheticInvariantMetricSchema,
  syntheticLearnerSchema,
} from "./evaluation-contract";
import type {
  SyntheticCohortV31,
  SyntheticInvariantMetric,
  SyntheticLearnerV31,
} from "./evaluation-contract";

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 hex digest");

const syntheticCohortInputSchema = z.strictObject({
  cohortId: z.string().min(1),
  seed: z.number().int().nonnegative().max(MAX_DETERMINISTIC_SEED),
  configHash: sha256Schema,
  simulationDays: z.number().int().positive().max(MAX_SIMULATION_DAYS),
  learnerCount: z.number().int().positive().max(MAX_SYNTHETIC_COHORT_SIZE),
});

const recommendationAuditSchema = z.strictObject({
  recommended: z.boolean().optional().default(true),
  hardGateReady: z.boolean(),
});

const dailyQueueAuditSchema = z.strictObject({
  queueSize: z.number().int().nonnegative(),
  queueCap: z.number().int().nonnegative(),
  newCardCount: z.number().int().nonnegative(),
  newCardsPerDay: z.number().int().nonnegative(),
});

const placementAuditSchema = z.strictObject({
  terminated: z.boolean(),
  probeCount: z.number().int().nonnegative(),
  probeBudget: z.number().int().nonnegative(),
});

const provisionalMasteryAuditSchema = z.strictObject({
  reviewed: z.boolean(),
  elapsedDays: z.number().finite().nonnegative(),
  previousMastery: z.number().finite().min(0).max(1),
  currentMastery: z.number().finite().min(0).max(1),
});

const progressionDecisionAuditSchema = z.strictObject({
  activeMisconception: z.boolean(),
  nextAction: z.enum(["misconception_remediation", "normal_progression"]),
});

const syntheticInvariantAuditSchema = z.strictObject({
  recommendations: z.array(recommendationAuditSchema).min(1),
  dailyQueues: z.array(dailyQueueAuditSchema).min(1),
  placements: z.array(placementAuditSchema).min(1),
  provisionalMastery: z.array(provisionalMasteryAuditSchema).min(1),
  progressionDecisions: z.array(progressionDecisionAuditSchema).min(1),
});

const syntheticInvariantMetricsSchema = z.array(syntheticInvariantMetricSchema).length(5);

const MAX_TOTAL_SYNTHETIC_ATTEMPTS = 100_000;

const correctnessProbabilityInputSchema = z
  .strictObject({
    guessProb: z.number().finite().min(0).max(1),
    slipProb: z.number().finite().min(0).max(1),
    mastery: z.number().finite().min(0).max(1),
  })
  .refine((input) => input.guessProb + input.slipProb <= 1, {
    path: ["slipProb"],
    message: "guessProb + slipProb must not exceed 1",
  });

const syntheticLearnerParametersSchema = z.strictObject({
  learner: syntheticLearnerSchema,
  initialMastery: z.number().finite().min(0).max(1),
});

const syntheticSimulationInputSchema = z
  .strictObject({
    seed: z.number().int().nonnegative().max(MAX_DETERMINISTIC_SEED),
    configHash: sha256Schema,
    runLength: z.number().int().positive().max(MAX_SIMULATION_DAYS),
    learnerParameters: z
      .array(syntheticLearnerParametersSchema)
      .min(1)
      .max(MAX_SYNTHETIC_COHORT_SIZE),
    activeMisconceptionLearnerIds: z.array(z.string().min(1)),
  })
  .superRefine((input, ctx) => {
    if (input.runLength * input.learnerParameters.length > MAX_TOTAL_SYNTHETIC_ATTEMPTS) {
      ctx.addIssue({
        code: "custom",
        path: ["runLength"],
        message: `runLength × learnerParameters cannot exceed ${MAX_TOTAL_SYNTHETIC_ATTEMPTS}`,
      });
    }

    const learnerIds = new Set<string>();
    input.learnerParameters.forEach((parameters, index) => {
      const learnerId = parameters.learner.learnerId;
      if (learnerIds.has(learnerId)) {
        ctx.addIssue({
          code: "custom",
          path: ["learnerParameters", index, "learner", "learnerId"],
          message: "learnerId must be unique within the parameter grid",
        });
      }
      learnerIds.add(learnerId);
    });

    const misconceptionIds = new Set<string>();
    input.activeMisconceptionLearnerIds.forEach((learnerId, index) => {
      if (misconceptionIds.has(learnerId)) {
        ctx.addIssue({
          code: "custom",
          path: ["activeMisconceptionLearnerIds", index],
          message: "active misconception learner IDs must be unique",
        });
      }
      if (!learnerIds.has(learnerId)) {
        ctx.addIssue({
          code: "custom",
          path: ["activeMisconceptionLearnerIds", index],
          message: "activeMisconceptionLearnerIds must reference the declared parameter grid",
        });
      }
      misconceptionIds.add(learnerId);
    });
  });

const syntheticAttemptSchema = z
  .strictObject({
    learnerId: z.string().min(1),
    attemptNumber: z.number().int().positive().max(MAX_SIMULATION_DAYS),
    ability: z.number().finite().min(0).max(1),
    forgetRateMultiplier: z.number().finite().gt(0).max(10),
    guessProb: z.number().finite().min(0).max(1),
    slipProb: z.number().finite().min(0).max(1),
    complianceProbability: z.number().finite().min(0).max(1),
    masteryBefore: z.number().finite().min(0).max(1),
    correctnessProbability: z.number().finite().min(0).max(1),
    completionDraw: z.number().finite().min(0).lt(1),
    completed: z.boolean(),
    correctnessDraw: z.number().finite().min(0).lt(1).nullable(),
    correct: z.boolean().nullable(),
    masteryAfter: z.number().finite().min(0).max(1),
  })
  .superRefine((attempt, ctx) => {
    const hasOutcome = attempt.correctnessDraw !== null && attempt.correct !== null;
    if (attempt.completed !== hasOutcome) {
      ctx.addIssue({
        code: "custom",
        path: ["correct"],
        message: "completed attempts require a draw and outcome; skipped attempts require neither",
      });
    }
  });

const syntheticSimulationResultSchema = z.strictObject({
  seed: z.number().int().nonnegative().max(MAX_DETERMINISTIC_SEED),
  configHash: sha256Schema,
  runLength: z.number().int().positive().max(MAX_SIMULATION_DAYS),
  attempts: z.array(syntheticAttemptSchema).min(1).max(MAX_TOTAL_SYNTHETIC_ATTEMPTS),
});

const strictEngineVersionSchema = z
  .string()
  .min(1)
  .refine(
    (version) => version === version.trim(),
    "engineVersion must not have surrounding whitespace",
  );

const hardGateRecommendationSchema = z.strictObject({
  recommended: z.boolean(),
  hardGateReady: z.boolean(),
  predictedReadiness: z.number().finite().min(0).max(1),
});

const provisionalMasteryProjectionSchema = z.strictObject({
  currentMastery: z.number().finite().min(0).max(1),
});

const nextActionSelectionSchema = z.strictObject({
  nextAction: z.enum(["misconception_remediation", "normal_progression"]),
});

const engineCallbackSchema = z.custom<(state: SyntheticEvaluationLearnerState) => unknown>(
  (callback) => typeof callback === "function",
  "engine callback must be a function",
);

const syntheticEvaluationEngineSchema = z.strictObject({
  engineVersion: strictEngineVersionSchema,
  evaluateHardGateRecommendation: engineCallbackSchema,
  constructDailyQueue: engineCallbackSchema,
  runPlacement: engineCallbackSchema,
  projectProvisionalMastery: engineCallbackSchema,
  selectNextAction: engineCallbackSchema,
});

const candidatePredictionSchema = z.strictObject({
  learnerId: z.string().min(1),
  engineVersion: strictEngineVersionSchema,
  configHash: sha256Schema,
  hardGateRecommendation: hardGateRecommendationSchema,
  dailyQueue: dailyQueueAuditSchema,
  placement: placementAuditSchema,
  provisionalMasteryProjection: provisionalMasteryProjectionSchema,
  nextActionSelection: nextActionSelectionSchema,
});

const syntheticEvaluationResultSchema = z.strictObject({
  contractVersion: z.literal(EVALUATION_CONTRACT_VERSION),
  engineVersion: strictEngineVersionSchema,
  configHash: sha256Schema,
  simulation: syntheticSimulationResultSchema,
  candidatePredictions: z.array(candidatePredictionSchema).min(1),
  invariantMetrics: syntheticInvariantMetricsSchema,
});

export type SyntheticCohortInput = z.infer<typeof syntheticCohortInputSchema>;
export type SyntheticInvariantAudit = z.infer<typeof syntheticInvariantAuditSchema>;
export type SyntheticSimulationInput = z.infer<typeof syntheticSimulationInputSchema>;
export type SyntheticAttempt = z.infer<typeof syntheticAttemptSchema>;
export type SyntheticSimulationResult = z.infer<typeof syntheticSimulationResultSchema>;
export type HardGateRecommendation = z.infer<typeof hardGateRecommendationSchema>;
export type SyntheticDailyQueue = z.infer<typeof dailyQueueAuditSchema>;
export type SyntheticPlacement = z.infer<typeof placementAuditSchema>;
export type ProvisionalMasteryProjection = z.infer<typeof provisionalMasteryProjectionSchema>;
export type SyntheticNextActionSelection = z.infer<typeof nextActionSelectionSchema>;
export type SyntheticCandidatePrediction = z.infer<typeof candidatePredictionSchema>;
export type SyntheticEvaluationResult = z.infer<typeof syntheticEvaluationResultSchema>;

export interface SyntheticEvaluationLearnerState {
  readonly learner: SyntheticLearnerV31;
  readonly initialMastery: number;
  readonly finalMastery: number;
  readonly completedAttemptCount: number;
  readonly activeMisconception: boolean;
  readonly attempts: readonly SyntheticAttempt[];
}

export interface SyntheticEvaluationEngine {
  readonly engineVersion: string;
  /** Summarize all emitted recommendations, returning unready when any recommended item violated a hard gate. */
  readonly evaluateHardGateRecommendation: (
    state: SyntheticEvaluationLearnerState,
  ) => HardGateRecommendation;
  /** Return the worst per-day queue/new-card counts observed across the supplied trace. */
  readonly constructDailyQueue: (state: SyntheticEvaluationLearnerState) => SyntheticDailyQueue;
  readonly runPlacement: (state: SyntheticEvaluationLearnerState) => SyntheticPlacement;
  /** Return the worst no-review decay projection needed to falsify immortal provisional mastery. */
  readonly projectProvisionalMastery: (
    state: SyntheticEvaluationLearnerState,
  ) => ProvisionalMasteryProjection;
  /** Return normal progression if any active misconception was allowed to bypass remediation. */
  readonly selectNextAction: (
    state: SyntheticEvaluationLearnerState,
  ) => SyntheticNextActionSelection;
}

function createSeededPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

function metric(
  name: SyntheticInvariantMetric["name"],
  checkedCount: number,
  violationCount: number,
): SyntheticInvariantMetric {
  return {
    name,
    passed: violationCount === 0,
    checkedCount,
    violationCount,
  };
}

function clampProbability(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Computes §17.1's domain-neutral probability of a correct attempt.
 *
 * @param input - Guess, slip, and current mastery probabilities.
 * @returns `guess + (1 - guess - slip) * mastery`.
 * @throws {z.ZodError} When any probability is invalid or guess plus slip exceeds one.
 */
export function computeSyntheticCorrectnessProbability(input: unknown): number {
  const parsed = correctnessProbabilityInputSchema.parse(input);
  return parsed.guessProb + (1 - parsed.guessProb - parsed.slipProb) * parsed.mastery;
}

/**
 * Generates a reproducible, contract-valid cohort without ambient randomness.
 *
 * @param input - Bounded cohort configuration to validate before allocation.
 * @returns The deterministic synthetic cohort for the declared seed.
 * @throws {z.ZodError} When the input or generated cohort violates the v3.1 contract.
 */
export function generateSyntheticCohort(input: unknown): SyntheticCohortV31 {
  const parsed = syntheticCohortInputSchema.parse(input);
  const random = createSeededPrng(parsed.seed);
  const learnerIdWidth = String(parsed.learnerCount).length;

  const cohort = {
    contractVersion: EVALUATION_CONTRACT_VERSION,
    cohortId: parsed.cohortId,
    seed: parsed.seed,
    configHash: parsed.configHash,
    simulationDays: parsed.simulationDays,
    learners: Array.from({ length: parsed.learnerCount }, (_, index) => ({
      learnerId: `${parsed.cohortId}:learner:${String(index + 1).padStart(learnerIdWidth, "0")}`,
      ability: random(),
      forgetRateMultiplier: 0.5 + 1.5 * random(),
      guessProb: 0.05 + 0.2 * random(),
      slipProb: 0.03 + 0.17 * random(),
      complianceRate: 0.6 + 0.4 * random(),
    })),
  };

  return syntheticCohortSchema.parse(cohort);
}

/**
 * Runs a bounded daily-attempt simulation over an explicit learner parameter grid.
 *
 * @param input - Seed, config provenance, run length, learner extremes, and mastery values.
 * @returns Validated attempt traces for evaluation by an injected candidate engine.
 * @throws {z.ZodError} When the input or generated simulation violates its bounds.
 */
export function simulateSyntheticAttempts(input: unknown): SyntheticSimulationResult {
  const parsed = syntheticSimulationInputSchema.parse(input);
  const random = createSeededPrng(parsed.seed);
  const attempts: SyntheticAttempt[] = [];

  for (const parameters of parsed.learnerParameters) {
    const { learner, initialMastery } = parameters;
    let masteryAfterPreviousAttempt = initialMastery;

    for (let attemptIndex = 0; attemptIndex < parsed.runLength; attemptIndex += 1) {
      const masteryBefore =
        attemptIndex === 0
          ? initialMastery
          : masteryAfterPreviousAttempt * Math.exp(-learner.forgetRateMultiplier / 30);
      const correctnessProbability = computeSyntheticCorrectnessProbability({
        guessProb: learner.guessProb,
        slipProb: learner.slipProb,
        mastery: masteryBefore,
      });
      const completionDraw = random();
      const completed = completionDraw < learner.complianceRate;
      const correctnessDraw = completed ? random() : null;
      const correct = correctnessDraw === null ? null : correctnessDraw < correctnessProbability;
      const learningMultiplier = correct === null ? 0 : correct ? 0.1 : 0.05;
      const masteryAfter = clampProbability(
        masteryBefore + learner.ability * (1 - masteryBefore) * learningMultiplier,
      );
      const attempt = syntheticAttemptSchema.parse({
        learnerId: learner.learnerId,
        attemptNumber: attemptIndex + 1,
        ability: learner.ability,
        forgetRateMultiplier: learner.forgetRateMultiplier,
        guessProb: learner.guessProb,
        slipProb: learner.slipProb,
        complianceProbability: learner.complianceRate,
        masteryBefore,
        correctnessProbability,
        completionDraw,
        completed,
        correctnessDraw,
        correct,
        masteryAfter,
      });

      attempts.push(attempt);
      masteryAfterPreviousAttempt = masteryAfter;
    }
  }

  return syntheticSimulationResultSchema.parse({
    seed: parsed.seed,
    configHash: parsed.configHash,
    runLength: parsed.runLength,
    attempts,
  });
}

/**
 * Evaluates every simulation invariant independently in canonical contract order.
 *
 * @param input - Non-empty observation families for all five invariants.
 * @returns One validated metric per invariant in canonical order.
 * @throws {z.ZodError} When observations are missing or malformed.
 */
export function evaluateSyntheticInvariants(input: unknown): SyntheticInvariantMetric[] {
  const audit = syntheticInvariantAuditSchema.parse(input);

  const hardGateViolations = audit.recommendations.filter(
    (recommendation) => recommendation.recommended && !recommendation.hardGateReady,
  ).length;
  const queueCapViolations = audit.dailyQueues.filter(
    (queue) => queue.queueSize > queue.queueCap || queue.newCardCount > queue.newCardsPerDay,
  ).length;
  const placementViolations = audit.placements.filter(
    (placement) => !placement.terminated || placement.probeCount > placement.probeBudget,
  ).length;
  const provisionalMasteryViolations = audit.provisionalMastery.filter(
    (observation) =>
      !observation.reviewed &&
      observation.elapsedDays > 0 &&
      observation.previousMastery > 0 &&
      observation.currentMastery >= observation.previousMastery,
  ).length;
  const misconceptionViolations = audit.progressionDecisions.filter(
    (decision) =>
      decision.activeMisconception && decision.nextAction !== "misconception_remediation",
  ).length;

  return syntheticInvariantMetricsSchema.parse([
    metric("hard_gate_readiness", audit.recommendations.length, hardGateViolations),
    metric("queue_caps", audit.dailyQueues.length, queueCapViolations),
    metric("placement_probe_budget", audit.placements.length, placementViolations),
    metric(
      "provisional_mastery_decay",
      audit.provisionalMastery.length,
      provisionalMasteryViolations,
    ),
    metric("misconception_precedence", audit.progressionDecisions.length, misconceptionViolations),
  ]);
}

/**
 * Evaluates a versioned candidate engine against simulation-derived learner state.
 *
 * @param input - Validated by the simulation before any attempt allocation.
 * @param engine - Domain-neutral callbacks whose validated outputs become gate evidence.
 * @returns Simulation traces, attributed candidate predictions, and invariant metrics.
 * @throws {z.ZodError} When simulation input, engine metadata, or callback output is invalid.
 */
export function runSyntheticEvaluation(
  input: unknown,
  engine: SyntheticEvaluationEngine,
): SyntheticEvaluationResult {
  const parsed = syntheticSimulationInputSchema.parse(input);
  const candidateEngine = syntheticEvaluationEngineSchema.parse(engine);
  const simulation = simulateSyntheticAttempts(parsed);
  const activeMisconceptionIds = new Set(parsed.activeMisconceptionLearnerIds);

  const states = parsed.learnerParameters.map((parameters) => {
    const attempts = simulation.attempts
      .filter((attempt) => attempt.learnerId === parameters.learner.learnerId)
      .map((attempt) => Object.freeze({ ...attempt }));
    const finalAttempt = attempts.at(-1);
    if (finalAttempt === undefined) {
      throw new Error(`simulation produced no attempts for ${parameters.learner.learnerId}`);
    }
    return Object.freeze({
      learner: Object.freeze({ ...parameters.learner }),
      initialMastery: parameters.initialMastery,
      finalMastery: finalAttempt.masteryAfter,
      completedAttemptCount: attempts.filter((attempt) => attempt.completed).length,
      activeMisconception: activeMisconceptionIds.has(parameters.learner.learnerId),
      attempts: Object.freeze(attempts),
    }) satisfies SyntheticEvaluationLearnerState;
  });

  const candidatePredictions = states.map((state) =>
    candidatePredictionSchema.parse({
      learnerId: state.learner.learnerId,
      engineVersion: candidateEngine.engineVersion,
      configHash: parsed.configHash,
      hardGateRecommendation: hardGateRecommendationSchema.parse(
        candidateEngine.evaluateHardGateRecommendation(state),
      ),
      dailyQueue: dailyQueueAuditSchema.parse(candidateEngine.constructDailyQueue(state)),
      placement: placementAuditSchema.parse(candidateEngine.runPlacement(state)),
      provisionalMasteryProjection: provisionalMasteryProjectionSchema.parse(
        candidateEngine.projectProvisionalMastery(state),
      ),
      nextActionSelection: nextActionSelectionSchema.parse(candidateEngine.selectNextAction(state)),
    }),
  );

  const audit: SyntheticInvariantAudit = {
    recommendations: candidatePredictions.map(({ hardGateRecommendation }) => ({
      recommended: hardGateRecommendation.recommended,
      hardGateReady: hardGateRecommendation.hardGateReady,
    })),
    dailyQueues: candidatePredictions.map(({ dailyQueue }) => dailyQueue),
    placements: candidatePredictions.map(({ placement }) => placement),
    provisionalMastery: candidatePredictions.map((prediction, index) => ({
      reviewed: false,
      elapsedDays: 1,
      previousMastery: states[index].finalMastery,
      currentMastery: prediction.provisionalMasteryProjection.currentMastery,
    })),
    progressionDecisions: candidatePredictions.map((prediction, index) => ({
      activeMisconception: states[index].activeMisconception,
      nextAction: prediction.nextActionSelection.nextAction,
    })),
  };

  return syntheticEvaluationResultSchema.parse({
    contractVersion: EVALUATION_CONTRACT_VERSION,
    engineVersion: candidateEngine.engineVersion,
    configHash: parsed.configHash,
    simulation,
    candidatePredictions,
    invariantMetrics: evaluateSyntheticInvariants(audit),
  });
}
