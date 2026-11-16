import { describe, expect, it, vi } from 'vitest';

import {
  EVALUATION_CONTRACT_VERSION,
  MAX_DETERMINISTIC_SEED,
  MAX_SIMULATION_DAYS,
  MAX_SYNTHETIC_COHORT_SIZE,
  SYNTHETIC_INVARIANT_NAMES,
  syntheticCohortSchema,
} from '../srs/evaluation-contract';
import {
  computeSyntheticCorrectnessProbability,
  evaluateSyntheticInvariants,
  generateSyntheticCohort,
  runSyntheticEvaluation,
  simulateSyntheticAttempts,
} from '../srs/synthetic-evaluation';
import type { SyntheticEvaluationEngine } from '../srs/synthetic-evaluation';

const CONFIG_HASH = 'a'.repeat(64);

const validCohortInput = {
  cohortId: 'cohort-71',
  seed: 71,
  configHash: CONFIG_HASH,
  simulationDays: 180,
  learnerCount: 32,
} as const;

const passingAudit = {
  recommendations: [{ hardGateReady: true }],
  dailyQueues: [{ queueSize: 12, queueCap: 12, newCardCount: 3, newCardsPerDay: 3 }],
  placements: [{ terminated: true, probeCount: 24, probeBudget: 24 }],
  provisionalMastery: [{
    reviewed: false,
    elapsedDays: 7,
    previousMastery: 0.8,
    currentMastery: 0.7,
  }],
  progressionDecisions: [{
    activeMisconception: true,
    nextAction: 'misconception_remediation',
  }],
} as const;

describe('v3.1 synthetic cohort generation', () => {
  it('uses its seeded PRNG to produce deterministic, valid, unique learners', () => {
    const mathRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used');
    });

    try {
      const first = generateSyntheticCohort(validCohortInput);
      const repeated = generateSyntheticCohort(validCohortInput);
      const differentSeed = generateSyntheticCohort({ ...validCohortInput, seed: 72 });

      expect(first).toEqual(repeated);
      expect(differentSeed.learners).not.toEqual(first.learners);
      expect(first).toMatchObject({
        contractVersion: EVALUATION_CONTRACT_VERSION,
        cohortId: validCohortInput.cohortId,
        seed: validCohortInput.seed,
        configHash: validCohortInput.configHash,
        simulationDays: validCohortInput.simulationDays,
      });
      expect(first.learners).toHaveLength(validCohortInput.learnerCount);
      expect(new Set(first.learners.map((learner) => learner.learnerId)).size)
        .toBe(validCohortInput.learnerCount);
      expect(syntheticCohortSchema.parse(first)).toEqual(first);
    } finally {
      mathRandom.mockRestore();
    }
  });

  it('does not mutate its input', () => {
    const input = { ...validCohortInput };
    const snapshot = structuredClone(input);

    generateSyntheticCohort(input);

    expect(input).toEqual(snapshot);
  });

  it('accepts both seed boundaries and keeps seed zero distinct', () => {
    const zeroSeed = generateSyntheticCohort({
      ...validCohortInput,
      seed: 0,
      learnerCount: 1,
    });
    const oneSeed = generateSyntheticCohort({
      ...validCohortInput,
      seed: 1,
      learnerCount: 1,
    });
    const maximumSeed = generateSyntheticCohort({
      ...validCohortInput,
      seed: MAX_DETERMINISTIC_SEED,
      simulationDays: MAX_SIMULATION_DAYS,
      learnerCount: 1,
    });

    expect(zeroSeed.learners).not.toEqual(oneSeed.learners);
    expect(maximumSeed.seed).toBe(MAX_DETERMINISTIC_SEED);
  });

  it.each([
    [{ ...validCohortInput, cohortId: '' }, /cohortId/i],
    [{ ...validCohortInput, seed: -1 }, /seed/i],
    [{ ...validCohortInput, seed: MAX_DETERMINISTIC_SEED + 1 }, /seed/i],
    [{ ...validCohortInput, seed: 1.5 }, /seed/i],
    [{ ...validCohortInput, configHash: 'A'.repeat(64) }, /configHash/i],
    [{ ...validCohortInput, simulationDays: 0 }, /simulationDays/i],
    [{ ...validCohortInput, simulationDays: MAX_SIMULATION_DAYS + 1 }, /simulationDays/i],
    [{ ...validCohortInput, learnerCount: 0 }, /learnerCount/i],
    [{ ...validCohortInput, learnerCount: MAX_SYNTHETIC_COHORT_SIZE + 1 }, /learnerCount/i],
  ])('rejects invalid bounded cohort input %#', (input, expectedMessage) => {
    expect(() => generateSyntheticCohort(input)).toThrow(expectedMessage);
  });
});

describe('v3.1 synthetic invariant evaluation', () => {
  it('returns all five metrics in canonical order', () => {
    expect(evaluateSyntheticInvariants(passingAudit)).toEqual(
      SYNTHETIC_INVARIANT_NAMES.map((name) => ({
        name,
        passed: true,
        checkedCount: 1,
        violationCount: 0,
      })),
    );
  });

  it('does not flag a safely withheld recommendation whose hard gate is unready', () => {
    const [hardGateMetric] = evaluateSyntheticInvariants({
      ...passingAudit,
      recommendations: [{ recommended: false, hardGateReady: false }],
    });

    expect(hardGateMetric).toEqual({
      name: 'hard_gate_readiness',
      passed: true,
      checkedCount: 1,
      violationCount: 0,
    });
  });

  it('counts each invariant independently across every supplied observation', () => {
    const metrics = evaluateSyntheticInvariants({
      recommendations: [
        { hardGateReady: true },
        { hardGateReady: false },
      ],
      dailyQueues: [
        { queueSize: 12, queueCap: 12, newCardCount: 3, newCardsPerDay: 3 },
        { queueSize: 13, queueCap: 12, newCardCount: 3, newCardsPerDay: 3 },
        { queueSize: 12, queueCap: 12, newCardCount: 4, newCardsPerDay: 3 },
      ],
      placements: [
        { terminated: true, probeCount: 24, probeBudget: 24 },
        { terminated: false, probeCount: 24, probeBudget: 24 },
        { terminated: true, probeCount: 25, probeBudget: 24 },
      ],
      provisionalMastery: [
        { reviewed: true, elapsedDays: 7, previousMastery: 0.8, currentMastery: 0.8 },
        { reviewed: false, elapsedDays: 0, previousMastery: 0.8, currentMastery: 0.8 },
        { reviewed: false, elapsedDays: 7, previousMastery: 0.8, currentMastery: 0.7 },
        { reviewed: false, elapsedDays: 7, previousMastery: 0.8, currentMastery: 0.8 },
      ],
      progressionDecisions: [
        { activeMisconception: false, nextAction: 'normal_progression' },
        { activeMisconception: true, nextAction: 'misconception_remediation' },
        { activeMisconception: true, nextAction: 'normal_progression' },
      ],
    });

    expect(metrics).toEqual([
      { name: 'hard_gate_readiness', passed: false, checkedCount: 2, violationCount: 1 },
      { name: 'queue_caps', passed: false, checkedCount: 3, violationCount: 2 },
      { name: 'placement_probe_budget', passed: false, checkedCount: 3, violationCount: 2 },
      { name: 'provisional_mastery_decay', passed: false, checkedCount: 4, violationCount: 1 },
      { name: 'misconception_precedence', passed: false, checkedCount: 3, violationCount: 1 },
    ]);
  });

  it('does not mutate its audit input', () => {
    const input = structuredClone(passingAudit);
    const snapshot = structuredClone(input);

    evaluateSyntheticInvariants(input);

    expect(input).toEqual(snapshot);
  });

  it.each([
    ['recommendations'],
    ['dailyQueues'],
    ['placements'],
    ['provisionalMastery'],
    ['progressionDecisions'],
  ] as const)('fails closed when %s has no observations', (field) => {
    expect(() => evaluateSyntheticInvariants({ ...passingAudit, [field]: [] }))
      .toThrow(field);
  });

  it('rejects malformed audit observations at runtime', () => {
    expect(() => evaluateSyntheticInvariants({
      ...passingAudit,
      dailyQueues: [{ queueSize: -1, queueCap: 12, newCardCount: 3, newCardsPerDay: 3 }],
    })).toThrow(/dailyQueues/i);

    expect(() => evaluateSyntheticInvariants({
      ...passingAudit,
      progressionDecisions: [{
        activeMisconception: true,
        nextAction: 'skip_remediation',
      }],
    })).toThrow(/progressionDecisions/i);
  });
});

const declaredParameterGrid = [
  {
    learner: {
      learnerId: 'zero-ability',
      ability: 0,
      forgetRateMultiplier: 1,
      guessProb: 1,
      slipProb: 0,
      complianceRate: 1,
    },
    initialMastery: 0.5,
  },
  {
    learner: {
      learnerId: 'high-ability',
      ability: 1,
      forgetRateMultiplier: 1,
      guessProb: 1,
      slipProb: 0,
      complianceRate: 1,
    },
    initialMastery: 0.5,
  },
  {
    learner: {
      learnerId: 'noncompliant-fast-forgetter',
      ability: 0.5,
      forgetRateMultiplier: 10,
      guessProb: 0.2,
      slipProb: 0.1,
      complianceRate: 0,
    },
    initialMastery: 0.8,
  },
] as const;

const validSimulationInput = {
  seed: 71,
  configHash: CONFIG_HASH,
  runLength: 3,
  learnerParameters: declaredParameterGrid,
  activeMisconceptionLearnerIds: ['high-ability'],
} as const;

const conformingEngine: SyntheticEvaluationEngine = {
  engineVersion: 'synthetic.engine.v1',
  evaluateHardGateRecommendation: (state) => ({
    recommended: true,
    hardGateReady: state.finalMastery >= 0,
    predictedReadiness: state.finalMastery,
  }),
  constructDailyQueue: () => ({
    queueSize: 3,
    queueCap: 3,
    newCardCount: 1,
    newCardsPerDay: 1,
  }),
  runPlacement: () => ({
    terminated: true,
    probeCount: 3,
    probeBudget: 3,
  }),
  projectProvisionalMastery: (state) => ({
    currentMastery: state.finalMastery * 0.9,
  }),
  selectNextAction: (state) => ({
    nextAction: state.activeMisconception
      ? 'misconception_remediation'
      : 'normal_progression',
  }),
};

describe('v3.1 end-to-end synthetic attempt simulation', () => {
  it('implements the normative correctness-probability rule at its boundaries', () => {
    expect(computeSyntheticCorrectnessProbability({
      guessProb: 0.2,
      slipProb: 0.1,
      mastery: 0.5,
    })).toBeCloseTo(0.55, 12);
    expect(computeSyntheticCorrectnessProbability({
      guessProb: 0.2,
      slipProb: 0.1,
      mastery: 0,
    })).toBe(0.2);
    expect(computeSyntheticCorrectnessProbability({
      guessProb: 0.2,
      slipProb: 0.1,
      mastery: 1,
    })).toBeCloseTo(0.9, 12);
    expect(() => computeSyntheticCorrectnessProbability({
      guessProb: 0.8,
      slipProb: 0.3,
      mastery: 0.5,
    })).toThrow(/guessProb.*slipProb/i);
  });

  it('simulates auditable attempts deterministically without ambient randomness', () => {
    const mathRandom = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random must not be used');
    });

    try {
      const first = simulateSyntheticAttempts(validSimulationInput);
      const repeated = simulateSyntheticAttempts(validSimulationInput);
      const differentSeed = simulateSyntheticAttempts({ ...validSimulationInput, seed: 72 });

      expect(first).toEqual(repeated);
      expect(differentSeed.attempts).not.toEqual(first.attempts);
      expect(first.attempts).toHaveLength(
        validSimulationInput.runLength * validSimulationInput.learnerParameters.length,
      );
      for (const attempt of first.attempts) {
        expect(attempt.correctnessProbability).toBeCloseTo(
          computeSyntheticCorrectnessProbability({
            guessProb: attempt.guessProb,
            slipProb: attempt.slipProb,
            mastery: attempt.masteryBefore,
          }),
          12,
        );
        expect(attempt.completionDraw).toBeGreaterThanOrEqual(0);
        expect(attempt.completionDraw).toBeLessThan(1);
        if (attempt.completed) {
          expect(attempt.correctnessDraw).toBeGreaterThanOrEqual(0);
          expect(attempt.correctnessDraw).toBeLessThan(1);
          expect(attempt.correct).toBeTypeOf('boolean');
        } else {
          expect(attempt.correctnessDraw).toBeNull();
          expect(attempt.correct).toBeNull();
        }
      }
    } finally {
      mathRandom.mockRestore();
    }
  });

  it('uses ability, forgetting, and compliance in learner state transitions', () => {
    const result = simulateSyntheticAttempts(validSimulationInput);
    const attemptsFor = (learnerId: string) => result.attempts.filter(
      (attempt) => attempt.learnerId === learnerId,
    );
    const zeroAbility = attemptsFor('zero-ability');
    const highAbility = attemptsFor('high-ability');
    const noncompliant = attemptsFor('noncompliant-fast-forgetter');

    expect(zeroAbility[0].correct).toBe(true);
    expect(highAbility[0].correct).toBe(true);
    expect(highAbility[0].masteryAfter).toBeGreaterThan(zeroAbility[0].masteryAfter);
    expect(noncompliant.every((attempt) => !attempt.completed)).toBe(true);
    expect(noncompliant[1].masteryBefore).toBeLessThan(noncompliant[0].masteryAfter);
    expect(noncompliant[2].masteryBefore).toBeLessThan(noncompliant[1].masteryAfter);
  });

  it('does not mutate the declared parameter grid or policy', () => {
    const input = structuredClone(validSimulationInput);
    const snapshot = structuredClone(input);

    simulateSyntheticAttempts(input);

    expect(input).toEqual(snapshot);
  });

  it('composes simulation state through a versioned engine with prediction provenance', () => {
    const result = runSyntheticEvaluation(validSimulationInput, conformingEngine);

    expect(result).toMatchObject({
      contractVersion: EVALUATION_CONTRACT_VERSION,
      engineVersion: conformingEngine.engineVersion,
      configHash: CONFIG_HASH,
    });
    expect(result.candidatePredictions).toHaveLength(3);
    expect(result.candidatePredictions.every((prediction) => (
      prediction.engineVersion === conformingEngine.engineVersion
      && prediction.configHash === CONFIG_HASH
    ))).toBe(true);
    expect(result.invariantMetrics.map((metric) => metric.name))
      .toEqual(SYNTHETIC_INVARIANT_NAMES);
    expect(result.invariantMetrics).toEqual([
      { name: 'hard_gate_readiness', passed: true, checkedCount: 3, violationCount: 0 },
      { name: 'queue_caps', passed: true, checkedCount: 3, violationCount: 0 },
      { name: 'placement_probe_budget', passed: true, checkedCount: 3, violationCount: 0 },
      { name: 'provisional_mastery_decay', passed: true, checkedCount: 3, violationCount: 0 },
      { name: 'misconception_precedence', passed: true, checkedCount: 3, violationCount: 0 },
    ]);
  });

  it('invokes every engine callback with simulation-derived learner state', () => {
    const engine = {
      ...conformingEngine,
      evaluateHardGateRecommendation: vi.fn(
        conformingEngine.evaluateHardGateRecommendation,
      ),
      constructDailyQueue: vi.fn(conformingEngine.constructDailyQueue),
      runPlacement: vi.fn(conformingEngine.runPlacement),
      projectProvisionalMastery: vi.fn(conformingEngine.projectProvisionalMastery),
      selectNextAction: vi.fn(conformingEngine.selectNextAction),
    } satisfies SyntheticEvaluationEngine;

    const result = runSyntheticEvaluation(validSimulationInput, engine);
    const callbacks = [
      engine.evaluateHardGateRecommendation,
      engine.constructDailyQueue,
      engine.runPlacement,
      engine.projectProvisionalMastery,
      engine.selectNextAction,
    ];

    callbacks.forEach((callback) => expect(callback).toHaveBeenCalledTimes(3));
    const highAbilityState = engine.constructDailyQueue.mock.calls[1][0];
    const highAbilityAttempts = result.simulation.attempts.filter(
      (attempt) => attempt.learnerId === 'high-ability',
    );
    expect(highAbilityState.attempts).toEqual(highAbilityAttempts);
    expect(highAbilityState.finalMastery).toBe(highAbilityAttempts.at(-1)?.masteryAfter);
    expect(highAbilityState.activeMisconception).toBe(true);
  });

  it.each([
    ['hard_gate_readiness', {
      evaluateHardGateRecommendation: () => ({
        recommended: true,
        hardGateReady: false,
        predictedReadiness: 0,
      }),
    }],
    ['queue_caps', {
      constructDailyQueue: () => ({
        queueSize: 4,
        queueCap: 3,
        newCardCount: 2,
        newCardsPerDay: 1,
      }),
    }],
    ['placement_probe_budget', {
      runPlacement: () => ({
        terminated: false,
        probeCount: 4,
        probeBudget: 3,
      }),
    }],
    ['provisional_mastery_decay', {
      projectProvisionalMastery: (state: Parameters<
        SyntheticEvaluationEngine['projectProvisionalMastery']
      >[0]) => ({ currentMastery: state.finalMastery }),
    }],
    ['misconception_precedence', {
      selectNextAction: () => ({ nextAction: 'normal_progression' as const }),
    }],
  ] as const)('detects a broken candidate engine for %s', (invariantName, override) => {
    const result = runSyntheticEvaluation(validSimulationInput, {
      ...conformingEngine,
      ...override,
      engineVersion: `broken.${invariantName}.v1`,
    });
    const metric = result.invariantMetrics.find(({ name }) => name === invariantName);

    expect(metric).toMatchObject({ passed: false });
    expect(metric?.violationCount).toBeGreaterThan(0);
    expect(result.invariantMetrics
      .filter(({ name }) => name !== invariantName)
      .every(({ passed }) => passed)).toBe(true);
  });

  it('rejects malformed engine versions and callback outputs', () => {
    expect(() => runSyntheticEvaluation(validSimulationInput, {
      ...conformingEngine,
      engineVersion: ' padded.engine.v1 ',
    })).toThrow(/engineVersion/i);
    expect(() => runSyntheticEvaluation(validSimulationInput, {
      ...conformingEngine,
      constructDailyQueue: () => ({
        queueSize: -1,
        queueCap: 3,
        newCardCount: 1,
        newCardsPerDay: 1,
      }),
    })).toThrow(/queueSize/i);
  });

  it.each([
    [{ ...validSimulationInput, runLength: 0 }, /runLength/i],
    [{ ...validSimulationInput, runLength: MAX_SIMULATION_DAYS + 1 }, /runLength/i],
    [{ ...validSimulationInput, learnerParameters: [] }, /learnerParameters/i],
    [{
      ...validSimulationInput,
      runLength: 100,
      learnerParameters: Array.from({ length: 1_001 }, (_, index) => ({
        learner: {
          ...declaredParameterGrid[0].learner,
          learnerId: `bounded-learner-${index}`,
        },
        initialMastery: 0.5,
      })),
      activeMisconceptionLearnerIds: [],
    }, /cannot exceed/i],
    [{
      ...validSimulationInput,
      learnerParameters: [declaredParameterGrid[0], declaredParameterGrid[0]],
      activeMisconceptionLearnerIds: [],
    }, /learnerId must be unique/i],
    [{
      ...validSimulationInput,
      activeMisconceptionLearnerIds: ['high-ability', 'high-ability'],
    }, /misconception learner IDs must be unique/i],
    [{
      ...validSimulationInput,
      activeMisconceptionLearnerIds: ['unknown-learner'],
    }, /activeMisconceptionLearnerIds/i],
  ])('rejects invalid or unbounded simulation input %#', (input, expectedMessage) => {
    expect(() => simulateSyntheticAttempts(input)).toThrow(expectedMessage);
  });
});
