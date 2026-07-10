import {
  FSRS_FITTING_CONTRACT_VERSION,
  FSRS_FIT_MIN_REVIEW_COUNT,
  FSRS_FIT_MIN_STUDENT_COUNT,
  fsrsFitArtifactSchema,
  fsrsParameterResolutionSchema,
  type FsrsFitArtifactV31,
  type FsrsFitDataset,
  type FsrsFittedParameterReference,
  type FsrsHumanRelease,
  type FsrsParameterAvailability,
  type FsrsParameterReference,
  type FsrsParameterResolutionAttempt,
  type FsrsParameterResolutionV31,
  type FsrsPopulationKey,
} from './fsrs-fitting-contract';
import { BUILTIN_FSRS_PARAMS_VERSION } from './scheduler-policy-contract';

// Keep the `./fsrs-fitting` subpath backward compatible when it points at this
// behavior module: existing contract imports remain available alongside the
// lifecycle functions.
export * from './fsrs-fitting-contract';

export interface FsrsFitResultV31 {
  candidate: FsrsFittedParameterReference;
  candidateLogLoss: number;
  incumbentLogLoss: number;
}

export interface EvaluateFsrsFitLifecycleInputV31 {
  artifactId: string;
  population: FsrsPopulationKey;
  dataset: FsrsFitDataset;
  incumbent: FsrsParameterReference;
  fitResult?: FsrsFitResultV31;
  humanRelease?: FsrsHumanRelease;
}

interface ParameterAvailabilityInput {
  paramsVersion: string | null;
  availability: FsrsParameterAvailability;
}

export interface ResolveReleasedFsrsParametersInputV31 {
  requestedPopulation: FsrsPopulationKey;
  population: ParameterAvailabilityInput;
  domain: ParameterAvailabilityInput;
  defaults: ParameterAvailabilityInput;
}

/**
 * Evaluate the fail-closed lifecycle around an externally produced FSRS fit.
 *
 * This function deliberately does not execute an optimizer or expose fitted
 * weights. It records immutable references and release evidence only.
 */
export function evaluateFsrsFitLifecycle(
  input: EvaluateFsrsFitLifecycleInputV31,
): FsrsFitArtifactV31 {
  const failureReasons: Array<'insufficient_reviews' | 'insufficient_students'> = [];
  if (input.dataset.reviewCount < FSRS_FIT_MIN_REVIEW_COUNT) {
    failureReasons.push('insufficient_reviews');
  }
  if (input.dataset.distinctStudentCount < FSRS_FIT_MIN_STUDENT_COUNT) {
    failureReasons.push('insufficient_students');
  }

  if (failureReasons.length > 0) {
    if (input.fitResult !== undefined) {
      throw new Error('FSRS fitting is forbidden before the volume gate passes');
    }
    if (input.humanRelease !== undefined) {
      throw new Error('FSRS release decisions are forbidden before the volume gate passes');
    }

    return fsrsFitArtifactSchema.parse({
      contractVersion: FSRS_FITTING_CONTRACT_VERSION,
      artifactId: input.artifactId,
      population: input.population,
      dataset: input.dataset,
      volumeGate: {
        minimumReviewCount: FSRS_FIT_MIN_REVIEW_COUNT,
        minimumStudentCount: FSRS_FIT_MIN_STUDENT_COUNT,
        passed: false,
        failureReasons,
      },
      incumbent: input.incumbent,
      candidate: null,
      holdoutComparison: null,
      approvalState: 'blocked_volume_gate',
      humanRelease: null,
    });
  }

  if (input.fitResult === undefined) {
    throw new Error('A volume-eligible FSRS fit requires candidate and holdout results');
  }

  const populationVersionPrefix = `fsrs-params.${input.population.domain}.${input.population.ageBand}.v`;
  if (
    input.incumbent.paramsVersion.startsWith(populationVersionPrefix)
    && input.fitResult.candidate.paramsVersion.startsWith(populationVersionPrefix)
  ) {
    const incumbentRevision = input.incumbent.paramsVersion.slice(populationVersionPrefix.length);
    const candidateRevision = input.fitResult.candidate.paramsVersion.slice(
      populationVersionPrefix.length,
    );
    if (!/^[1-9]\d*$/.test(incumbentRevision) || !/^[1-9]\d*$/.test(candidateRevision)) {
      throw new Error('Population FSRS parameter references require positive integer revisions');
    }
    if (BigInt(candidateRevision) <= BigInt(incumbentRevision)) {
      throw new Error('Candidate FSRS population revision must advance the incumbent revision');
    }
  }

  const rawImprovement = input.fitResult.incumbentLogLoss
    - input.fitResult.candidateLogLoss;
  const improvesIncumbent = rawImprovement > 0;

  if (!improvesIncumbent && input.humanRelease !== undefined) {
    throw new Error('A non-improving FSRS fit cannot receive a human release decision');
  }
  if (
    input.humanRelease !== undefined
    && Date.parse(input.humanRelease.decidedAt) < Date.parse(input.dataset.window.endsAt)
  ) {
    throw new Error('A human FSRS release decision cannot predate the fitting dataset window');
  }

  const approvalState = !improvesIncumbent
    ? 'blocked_holdout_regression'
    : input.humanRelease?.decision ?? 'pending_human_review';

  return fsrsFitArtifactSchema.parse({
    contractVersion: FSRS_FITTING_CONTRACT_VERSION,
    artifactId: input.artifactId,
    population: input.population,
    dataset: input.dataset,
    volumeGate: {
      minimumReviewCount: FSRS_FIT_MIN_REVIEW_COUNT,
      minimumStudentCount: FSRS_FIT_MIN_STUDENT_COUNT,
      passed: true,
      failureReasons: [],
    },
    incumbent: input.incumbent,
    candidate: input.fitResult.candidate,
    holdoutComparison: {
      candidateLogLoss: input.fitResult.candidateLogLoss,
      incumbentLogLoss: input.fitResult.incumbentLogLoss,
      absoluteImprovement: rawImprovement,
      improvesIncumbent,
    },
    approvalState,
    humanRelease: input.humanRelease ?? null,
  });
}

function attempt(
  scope: FsrsParameterResolutionAttempt['scope'],
  input: ParameterAvailabilityInput,
): FsrsParameterResolutionAttempt {
  return {
    scope,
    paramsVersion: input.paramsVersion,
    availability: input.availability,
  };
}

/**
 * Resolve references from a trusted release registry in deterministic
 * population → domain → defaults order. A `released` availability value is a
 * registry assertion that human approval already occurred; this resolver does
 * not execute, deploy, or bind the referenced weights to the scheduler.
 */
export function resolveReleasedFsrsParameters(
  input: ResolveReleasedFsrsParametersInputV31,
): FsrsParameterResolutionV31 {
  if (input.defaults.paramsVersion !== BUILTIN_FSRS_PARAMS_VERSION) {
    throw new Error(
      `Built-in FSRS defaults must name the canonical ${BUILTIN_FSRS_PARAMS_VERSION} version`,
    );
  }

  const attempts = [
    attempt({
      kind: 'population',
      domain: input.requestedPopulation.domain,
      ageBand: input.requestedPopulation.ageBand,
    }, input.population),
    attempt({
      kind: 'domain',
      domain: input.requestedPopulation.domain,
    }, input.domain),
    attempt({ kind: 'defaults' }, input.defaults),
  ] as const;

  const selectedAttempt = attempts[0].availability === 'released'
    ? attempts[0]
    : attempts[1].availability === 'released'
      ? attempts[1]
      : attempts[2];

  if (selectedAttempt.paramsVersion === null) {
    throw new Error('FSRS parameter resolution reached an available set without a version');
  }

  const reason = selectedAttempt.scope.kind === 'population'
    ? 'exact_population'
    : selectedAttempt.scope.kind === 'domain'
      ? 'domain_fallback'
      : 'fsrs_defaults';

  return fsrsParameterResolutionSchema.parse({
    contractVersion: FSRS_FITTING_CONTRACT_VERSION,
    requestedPopulation: input.requestedPopulation,
    attempts,
    selected: {
      scope: selectedAttempt.scope,
      paramsVersion: selectedAttempt.paramsVersion,
      reason,
    },
  });
}
