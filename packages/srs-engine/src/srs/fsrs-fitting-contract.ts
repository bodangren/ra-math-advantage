import { z } from 'zod';
import { BUILTIN_FSRS_PARAMS_VERSION } from './scheduler-policy-contract';

/** Contract-only boundary for the kst-srs.v3.2 §12.10 fitting lifecycle. */
export const FSRS_FITTING_CONTRACT_VERSION = 'fsrs-fitting.v3.1' as const;
export const FSRS_FIT_MIN_REVIEW_COUNT = 10_000 as const;
export const FSRS_FIT_MIN_STUDENT_COUNT = 100 as const;
export const FSRS_FIT_HOLDOUT_FRACTION = 0.2 as const;

export const FSRS_FIT_VOLUME_FAILURE_REASONS = [
  'insufficient_reviews',
  'insufficient_students',
] as const;

export const FSRS_FIT_APPROVAL_STATES = [
  'blocked_volume_gate',
  'blocked_holdout_regression',
  'pending_human_review',
  'approved',
  'rejected',
] as const;

export const FSRS_PARAMETER_AVAILABILITY = [
  'released',
  'missing',
  'unapproved',
  'ineligible',
  'built_in',
] as const;

export const FSRS_PARAMETER_SELECTION_REASONS = [
  'exact_population',
  'domain_fallback',
  'fsrs_defaults',
] as const;

const sha256Schema = z.string().regex(
  /^[a-f0-9]{64}$/,
  'must be a lowercase SHA-256 digest',
);
const paramsVersionSchema = z.string()
  .min(1)
  .refine((version) => version.trim() === version && version.length > 0, {
    message: 'paramsVersion must be non-blank and have no surrounding whitespace',
  });

/** The normative fitting population is the domain × adapter-declared age band. */
export const fsrsPopulationKeySchema = z.strictObject({
  domain: z.string().trim().min(1),
  ageBand: z.string().trim().min(1),
});

export const fsrsFitWindowSchema = z.strictObject({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
}).superRefine((window, ctx) => {
  if (Date.parse(window.startsAt) >= Date.parse(window.endsAt)) {
    ctx.addIssue({
      code: 'custom',
      path: ['endsAt'],
      message: 'endsAt must be later than startsAt',
    });
  }
});

/** Immutable provenance for the review-log corpus presented to a fitter. */
export const fsrsFitDatasetSchema = z.strictObject({
  datasetId: z.string().trim().min(1),
  contentSha256: sha256Schema,
  window: fsrsFitWindowSchema,
  reviewCount: z.number().int().nonnegative(),
  distinctStudentCount: z.number().int().nonnegative(),
  holdoutFraction: z.literal(FSRS_FIT_HOLDOUT_FRACTION),
});

export const fsrsFitVolumeGateSchema = z.strictObject({
  minimumReviewCount: z.literal(FSRS_FIT_MIN_REVIEW_COUNT),
  minimumStudentCount: z.literal(FSRS_FIT_MIN_STUDENT_COUNT),
  passed: z.boolean(),
  failureReasons: z.array(z.enum(FSRS_FIT_VOLUME_FAILURE_REASONS)).max(2),
});

export const fsrsParameterReferenceSchema = z.strictObject({
  paramsVersion: paramsVersionSchema,
  contentSha256: sha256Schema,
});

export const fsrsFittedParameterReferenceSchema = fsrsParameterReferenceSchema.extend({
  optimizerVersion: z.string().trim().min(1),
});

export const fsrsHoldoutComparisonSchema = z.strictObject({
  candidateLogLoss: z.number().finite().nonnegative(),
  incumbentLogLoss: z.number().finite().nonnegative(),
  absoluteImprovement: z.number().finite(),
  improvesIncumbent: z.boolean(),
}).superRefine((comparison, ctx) => {
  const improvement = comparison.incumbentLogLoss - comparison.candidateLogLoss;
  if (Math.abs(comparison.absoluteImprovement - improvement) > 1e-12) {
    ctx.addIssue({
      code: 'custom',
      path: ['absoluteImprovement'],
      message: 'absoluteImprovement must equal incumbentLogLoss - candidateLogLoss',
    });
  }
  if (comparison.improvesIncumbent !== (improvement > 0)) {
    ctx.addIssue({
      code: 'custom',
      path: ['improvesIncumbent'],
      message: 'improvesIncumbent must reflect a strictly lower candidate log-loss',
    });
  }
});

export const fsrsFitApprovalStateSchema = z.enum(FSRS_FIT_APPROVAL_STATES);

/** A release is never implicit: an auditable human identity and decision are required. */
export const fsrsHumanReleaseSchema = z.strictObject({
  decision: z.enum(['approved', 'rejected']),
  reviewId: z.string().trim().min(1),
  humanReviewerId: z.string().trim().min(1),
  paramsVersion: paramsVersionSchema,
  decidedAt: z.string().datetime(),
  rationale: z.string().trim().min(1),
});

function expectedVolumeFailureReasons(dataset: FsrsFitDataset): FsrsFitVolumeFailureReason[] {
  const reasons: FsrsFitVolumeFailureReason[] = [];
  if (dataset.reviewCount < FSRS_FIT_MIN_REVIEW_COUNT) {
    reasons.push('insufficient_reviews');
  }
  if (dataset.distinctStudentCount < FSRS_FIT_MIN_STUDENT_COUNT) {
    reasons.push('insufficient_students');
  }
  return reasons;
}

/**
 * Auditable fitting artifact. It validates lifecycle consistency only; parameter
 * optimization and dataset splitting deliberately live outside this module.
 */
export const fsrsFitArtifactSchema = z.strictObject({
  contractVersion: z.literal(FSRS_FITTING_CONTRACT_VERSION),
  artifactId: z.string().trim().min(1),
  population: fsrsPopulationKeySchema,
  dataset: fsrsFitDatasetSchema,
  volumeGate: fsrsFitVolumeGateSchema,
  incumbent: fsrsParameterReferenceSchema,
  candidate: fsrsFittedParameterReferenceSchema.nullable(),
  holdoutComparison: fsrsHoldoutComparisonSchema.nullable(),
  approvalState: fsrsFitApprovalStateSchema,
  humanRelease: fsrsHumanReleaseSchema.nullable(),
}).superRefine((artifact, ctx) => {
  const expectedFailures = expectedVolumeFailureReasons(artifact.dataset);
  const actualFailures = [...new Set(artifact.volumeGate.failureReasons)].sort();
  if (
    expectedFailures.length !== actualFailures.length
    || expectedFailures.some((reason) => !actualFailures.includes(reason))
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['volumeGate', 'failureReasons'],
      message: 'failureReasons must exactly reflect the dataset volume gates',
    });
  }

  const gatePassed = expectedFailures.length === 0;
  if (artifact.volumeGate.passed !== gatePassed) {
    ctx.addIssue({
      code: 'custom',
      path: ['volumeGate', 'passed'],
      message: 'passed must exactly reflect both dataset volume gates',
    });
  }

  if (!gatePassed) {
    if (artifact.candidate !== null || artifact.holdoutComparison !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['candidate'],
        message: 'fitting and holdout comparison are forbidden below the volume gate',
      });
    }
    if (artifact.approvalState !== 'blocked_volume_gate') {
      ctx.addIssue({
        code: 'custom',
        path: ['approvalState'],
        message: 'a below-volume artifact must be blocked_volume_gate',
      });
    }
    if (artifact.humanRelease !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['humanRelease'],
        message: 'a below-volume artifact cannot receive a release decision',
      });
    }
    return;
  }

  if (artifact.candidate === null || artifact.holdoutComparison === null) {
    ctx.addIssue({
      code: 'custom',
      path: ['candidate'],
      message: 'a gate-passing artifact requires candidate parameters and holdout metrics',
    });
    return;
  }

  if (artifact.candidate.paramsVersion === artifact.incumbent.paramsVersion) {
    ctx.addIssue({
      code: 'custom',
      path: ['candidate', 'paramsVersion'],
      message: 'candidate and incumbent paramsVersion values must differ',
    });
  }

  const populationVersionPrefix = `fsrs-params.${artifact.population.domain}.${artifact.population.ageBand}.v`;
  const candidateRevision = artifact.candidate.paramsVersion.slice(populationVersionPrefix.length);
  if (
    !artifact.candidate.paramsVersion.startsWith(populationVersionPrefix)
    || !/^[1-9]\d*$/.test(candidateRevision)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['candidate', 'paramsVersion'],
      message: 'candidate paramsVersion must identify its domain and age-band population',
    });
  }

  if (artifact.incumbent.paramsVersion.startsWith(populationVersionPrefix)) {
    const incumbentRevision = artifact.incumbent.paramsVersion.slice(populationVersionPrefix.length);
    if (!/^[1-9]\d*$/.test(incumbentRevision)) {
      ctx.addIssue({
        code: 'custom',
        path: ['incumbent', 'paramsVersion'],
        message: 'population incumbent paramsVersion must end in a positive integer revision',
      });
    } else if (
      /^[1-9]\d*$/.test(candidateRevision)
      && BigInt(candidateRevision) <= BigInt(incumbentRevision)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['candidate', 'paramsVersion'],
        message: 'candidate population revision must advance the incumbent revision',
      });
    }
  }

  if (
    artifact.humanRelease !== null
    && Date.parse(artifact.humanRelease.decidedAt) < Date.parse(artifact.dataset.window.endsAt)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['humanRelease', 'decidedAt'],
      message: 'human release decision cannot predate the fitting dataset window',
    });
  }

  if (!artifact.holdoutComparison.improvesIncumbent) {
    if (artifact.approvalState !== 'blocked_holdout_regression') {
      ctx.addIssue({
        code: 'custom',
        path: ['approvalState'],
        message: 'a non-improving candidate must be blocked_holdout_regression',
      });
    }
    if (artifact.humanRelease !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['humanRelease'],
        message: 'a non-improving candidate cannot receive a release decision',
      });
    }
    return;
  }

  if (artifact.approvalState === 'blocked_volume_gate'
    || artifact.approvalState === 'blocked_holdout_regression') {
    ctx.addIssue({
      code: 'custom',
      path: ['approvalState'],
      message: 'an improving, volume-eligible candidate requires human review',
    });
  }
  if (artifact.approvalState === 'pending_human_review' && artifact.humanRelease !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['humanRelease'],
      message: 'pending_human_review cannot include a completed release decision',
    });
  }
  if (artifact.approvalState === 'approved' || artifact.approvalState === 'rejected') {
    if (artifact.humanRelease?.decision !== artifact.approvalState) {
      ctx.addIssue({
        code: 'custom',
        path: ['humanRelease'],
        message: `approvalState ${artifact.approvalState} requires a matching human decision`,
      });
    }
    if (artifact.humanRelease?.paramsVersion !== artifact.candidate.paramsVersion) {
      ctx.addIssue({
        code: 'custom',
        path: ['humanRelease', 'paramsVersion'],
        message: 'human release must name the candidate paramsVersion',
      });
    }
  }
});

export const fsrsParameterScopeSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('population'),
    domain: z.string().trim().min(1),
    ageBand: z.string().trim().min(1),
  }),
  z.strictObject({
    kind: z.literal('domain'),
    domain: z.string().trim().min(1),
  }),
  z.strictObject({ kind: z.literal('defaults') }),
]);

export const fsrsParameterAvailabilitySchema = z.enum(FSRS_PARAMETER_AVAILABILITY);

/** One ordered lookup attempt retained as fallback provenance. */
export const fsrsParameterResolutionAttemptSchema = z.strictObject({
  scope: fsrsParameterScopeSchema,
  paramsVersion: paramsVersionSchema.nullable(),
  availability: fsrsParameterAvailabilitySchema,
}).superRefine((attempt, ctx) => {
  if ((attempt.availability === 'released' || attempt.availability === 'built_in')
    && attempt.paramsVersion === null) {
    ctx.addIssue({
      code: 'custom',
      path: ['paramsVersion'],
      message: `${attempt.availability} parameters require a paramsVersion`,
    });
  }
  if (attempt.availability === 'missing' && attempt.paramsVersion !== null) {
    ctx.addIssue({
      code: 'custom',
      path: ['paramsVersion'],
      message: 'missing parameters cannot name a paramsVersion',
    });
  }
  if (attempt.scope.kind === 'defaults' && attempt.availability !== 'built_in') {
    ctx.addIssue({
      code: 'custom',
      path: ['availability'],
      message: 'defaults must be recorded as built_in',
    });
  }
  if (attempt.scope.kind !== 'defaults' && attempt.availability === 'built_in') {
    ctx.addIssue({
      code: 'custom',
      path: ['availability'],
      message: 'built_in availability is reserved for FSRS defaults',
    });
  }
});

export const fsrsParameterSelectionReasonSchema = z.enum(FSRS_PARAMETER_SELECTION_REASONS);

export const fsrsParameterSelectionSchema = z.strictObject({
  scope: fsrsParameterScopeSchema,
  paramsVersion: paramsVersionSchema,
  reason: fsrsParameterSelectionReasonSchema,
});

function scopesMatch(left: FsrsParameterScope, right: FsrsParameterScope): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'defaults' && right.kind === 'defaults') return true;
  if (left.kind === 'domain' && right.kind === 'domain') {
    return left.domain === right.domain;
  }
  return left.kind === 'population'
    && right.kind === 'population'
    && left.domain === right.domain
    && left.ageBand === right.ageBand;
}

/**
 * Fail-closed scheduling resolution. The selected version must be the first
 * usable entry in the normative population → domain → defaults chain.
 */
export const fsrsParameterResolutionSchema = z.strictObject({
  contractVersion: z.literal(FSRS_FITTING_CONTRACT_VERSION),
  requestedPopulation: fsrsPopulationKeySchema,
  attempts: z.tuple([
    fsrsParameterResolutionAttemptSchema,
    fsrsParameterResolutionAttemptSchema,
    fsrsParameterResolutionAttemptSchema,
  ]),
  selected: fsrsParameterSelectionSchema,
}).superRefine((resolution, ctx) => {
  const [populationAttempt, domainAttempt, defaultsAttempt] = resolution.attempts;
  if (
    populationAttempt.scope.kind !== 'population'
    || populationAttempt.scope.domain !== resolution.requestedPopulation.domain
    || populationAttempt.scope.ageBand !== resolution.requestedPopulation.ageBand
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['attempts', 0, 'scope'],
      message: 'first attempt must match the requested domain and age band',
    });
  }
  if (
    domainAttempt.scope.kind !== 'domain'
    || domainAttempt.scope.domain !== resolution.requestedPopulation.domain
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['attempts', 1, 'scope'],
      message: 'second attempt must be the requested domain fallback',
    });
  }
  if (defaultsAttempt.scope.kind !== 'defaults') {
    ctx.addIssue({
      code: 'custom',
      path: ['attempts', 2, 'scope'],
      message: 'third attempt must be built-in FSRS defaults',
    });
  }
  if (defaultsAttempt.paramsVersion !== BUILTIN_FSRS_PARAMS_VERSION) {
    ctx.addIssue({
      code: 'custom',
      path: ['attempts', 2, 'paramsVersion'],
      message: `built-in defaults must name ${BUILTIN_FSRS_PARAMS_VERSION}`,
    });
  }

  const selectedAttempt = [populationAttempt, domainAttempt].find(
    (attempt) => attempt.availability === 'released',
  ) ?? defaultsAttempt;
  const expectedReason = selectedAttempt.scope.kind === 'population'
    ? 'exact_population'
    : selectedAttempt.scope.kind === 'domain'
      ? 'domain_fallback'
      : 'fsrs_defaults';

  if (
    selectedAttempt.paramsVersion === null
    || !scopesMatch(resolution.selected.scope, selectedAttempt.scope)
    || resolution.selected.paramsVersion !== selectedAttempt.paramsVersion
    || resolution.selected.reason !== expectedReason
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['selected'],
      message: 'selected must be the first released candidate or built-in defaults',
    });
  }
});

export type FsrsFitVolumeFailureReason = z.infer<typeof fsrsFitVolumeGateSchema>['failureReasons'][number];
export type FsrsFitApprovalState = z.infer<typeof fsrsFitApprovalStateSchema>;
export type FsrsPopulationKey = z.infer<typeof fsrsPopulationKeySchema>;
export type FsrsFitWindow = z.infer<typeof fsrsFitWindowSchema>;
export type FsrsFitDataset = z.infer<typeof fsrsFitDatasetSchema>;
export type FsrsFitVolumeGate = z.infer<typeof fsrsFitVolumeGateSchema>;
export type FsrsParameterReference = z.infer<typeof fsrsParameterReferenceSchema>;
export type FsrsFittedParameterReference = z.infer<typeof fsrsFittedParameterReferenceSchema>;
export type FsrsHoldoutComparison = z.infer<typeof fsrsHoldoutComparisonSchema>;
export type FsrsHumanRelease = z.infer<typeof fsrsHumanReleaseSchema>;
export type FsrsFitArtifactV31 = z.infer<typeof fsrsFitArtifactSchema>;
export type FsrsParameterScope = z.infer<typeof fsrsParameterScopeSchema>;
export type FsrsParameterAvailability = z.infer<typeof fsrsParameterAvailabilitySchema>;
export type FsrsParameterResolutionAttempt = z.infer<typeof fsrsParameterResolutionAttemptSchema>;
export type FsrsParameterSelectionReason = z.infer<typeof fsrsParameterSelectionReasonSchema>;
export type FsrsParameterSelection = z.infer<typeof fsrsParameterSelectionSchema>;
export type FsrsParameterResolutionV31 = z.infer<typeof fsrsParameterResolutionSchema>;

export function isFsrsFitArtifactV31(value: unknown): value is FsrsFitArtifactV31 {
  return fsrsFitArtifactSchema.safeParse(value).success;
}

export function isFsrsParameterResolutionV31(
  value: unknown,
): value is FsrsParameterResolutionV31 {
  return fsrsParameterResolutionSchema.safeParse(value).success;
}
