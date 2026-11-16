const MAX_PARAMS_VERSION_LENGTH = 200;

/**
 * Validate scheduler-parameter provenance at the Convex persistence boundary.
 * Historical rows and administrative reset rows may omit the stamp, but every
 * new learner scheduling write must carry a non-blank canonical version.
 */
export function requireParamsVersion(value: unknown): string {
  if (
    typeof value !== "string"
    || value.length === 0
    || value.length > MAX_PARAMS_VERSION_LENGTH
    || value.trim() !== value
  ) {
    throw new Error("paramsVersion must be a non-blank canonical version without surrounding whitespace");
  }
  return value;
}

/** Enforce the discriminated provenance rule for learner vs admin reviews. */
export function resolveReviewParamsVersion(
  isTeacherReset: boolean,
  value: unknown,
): string | undefined {
  if (isTeacherReset) {
    if (value !== undefined) {
      throw new Error("teacher_reset must not claim an FSRS paramsVersion");
    }
    return undefined;
  }
  return requireParamsVersion(value);
}
