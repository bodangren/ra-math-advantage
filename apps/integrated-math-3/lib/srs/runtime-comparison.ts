export type SrsComparisonSubject =
  | "knowledge_state"
  | "dashboard_recommendation"
  | "daily_queue"
  | "review_day_message"
  | "placement";

export type SrsDivergenceClass = "intended_contract_change" | "data_gap" | "unexpected";

export interface RuntimeComparisonInput {
  readonly subject: SrsComparisonSubject;
  readonly v2: unknown;
  readonly v3_2: unknown;
}

export interface RuntimeComparisonEvent {
  readonly subject: SrsComparisonSubject;
  readonly divergenceClass: SrsDivergenceClass;
  readonly explanationKey: string;
  readonly v2Fingerprint: string;
  readonly v3_2Fingerprint: string;
}

function isSensitiveObservableField(key: string): boolean {
  return /(answer|response|submission|artifact|work|input)/i.test(key);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !isSensitiveObservableField(key))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

function fingerprint(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function getReason(value: unknown): string | undefined {
  if (value === null || typeof value !== "object") return undefined;
  const reason = (value as Record<string, unknown>).reason;
  return typeof reason === "string" && reason.length > 0 ? reason : undefined;
}

const INTENDED_REASONS = new Set(["review-load-saturated"]);
const DATA_GAP_REASONS = new Set(["legacy-card-fallback", "unmigrated-placement"]);

/**
 * Compares externally observable v2 and v3.2 outputs. The result stores only
 * deterministic fingerprints and an explanation key, never learner answers.
 */
export function classifyRuntimeComparison(
  input: RuntimeComparisonInput,
): RuntimeComparisonEvent | null {
  const v2Fingerprint = fingerprint(input.v2);
  const v3_2Fingerprint = fingerprint(input.v3_2);
  if (v2Fingerprint === v3_2Fingerprint) return null;

  const reason = getReason(input.v3_2);
  const divergenceClass =
    reason !== undefined && INTENDED_REASONS.has(reason)
      ? "intended_contract_change"
      : reason !== undefined && DATA_GAP_REASONS.has(reason)
        ? "data_gap"
        : "unexpected";

  return Object.freeze({
    subject: input.subject,
    divergenceClass,
    explanationKey: reason ?? "unclassified-output-change",
    v2Fingerprint,
    v3_2Fingerprint,
  });
}

export interface CutoverPrerequisites {
  readonly verificationComplete: boolean;
  readonly unexpectedDivergenceCount: number;
  readonly approvedAt?: number;
}

/** Returns true only when a human-approved runtime cutover is safe to make. */
export function shouldPermitCutover(input: CutoverPrerequisites): boolean {
  return (
    input.verificationComplete &&
    Number.isInteger(input.unexpectedDivergenceCount) &&
    input.unexpectedDivergenceCount === 0 &&
    Number.isFinite(input.approvedAt) &&
    (input.approvedAt ?? 0) > 0
  );
}
