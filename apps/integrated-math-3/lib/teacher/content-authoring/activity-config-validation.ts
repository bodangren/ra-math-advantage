/**
 * Phase 1 — Authoring Model & Schema-Driven Validation
 *
 * Pure validation of a single activity config `{ componentKey, props }` against
 * the canonical Zod schemas in `@math-platform/math-content/schemas`.
 *
 * This module is intentionally a thin wrapper over `getPropsSchema`. It must:
 *
 *   - Bind the validation to the *key* (not trust the broad Convex union).
 *   - Reject unknown / placeholder keys explicitly so they cannot be saved as
 *     arbitrary `Record<string, unknown>`.
 *   - Surface structured, human-readable errors that include the failing
 *     `componentKey`, a Zod-style field `path`, and a human `message`.
 *   - Never mutate the caller's input props object.
 *
 * Phase 2 (lifecycle, hash, approval queue) reuses the structured error shape
 * defined here as the boundary contract for what counts as a *valid* authored
 * activity config.
 */

import { getPropsSchema, SCHEMA_REGISTRY } from '../../activities/schemas';

/** A single validation issue for an authored activity config. */
export interface ActivityConfigError {
  componentKey: string;
  path: string[];
  message: string;
}

export type ActivityConfigValidationResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; errors: ActivityConfigError[] };

/**
 * Convert a Zod issue `path` (which may contain string or number segments) to
 * a uniform string array so authoring consumers can render the field path
 * deterministically (e.g. `questions.0.prompt`).
 */
function pathToStrings(path: ReadonlyArray<PropertyKey>): string[] {
  const out: string[] = [];
  for (const segment of path) {
    if (typeof segment === 'number') {
      out.push(String(segment));
    } else if (typeof segment === 'string') {
      out.push(segment);
    } else if (typeof segment === 'symbol') {
      out.push(segment.toString());
    } else {
      out.push(String(segment));
    }
  }
  return out;
}

/**
 * Validate a `{ componentKey, props }` pair against the canonical Zod schema
 * for that key.
 *
 * The key is the source of truth: the props are validated with
 * `getPropsSchema(componentKey)`. Cross-key props (e.g. comprehension-quiz
 * `questions` paired with `graphing-explorer`) are rejected by the strict
 * shape of the chosen schema, and the error is bound to `componentKey` —
 * never to the schema family the props happened to match.
 *
 * Unknown or placeholder keys (e.g. `equation-solver`, `drag-drop-categorization`)
 * fail fast with an explicit "no schema is registered" error before any prop
 * parsing is attempted.
 */
export function validateActivityConfig(
  componentKey: string,
  props: Record<string, unknown>,
): ActivityConfigValidationResult {
  if (typeof componentKey !== 'string' || componentKey.length === 0) {
    return {
      success: false,
      errors: [
        {
          componentKey: typeof componentKey === 'string' ? componentKey : '',
          path: [],
          message: 'Activity component key must be a non-empty string',
        },
      ],
    };
  }

  if (!(componentKey in SCHEMA_REGISTRY)) {
    return {
      success: false,
      errors: [
        {
          componentKey,
          path: [],
          message: `No schema is registered for activity key '${componentKey}'. Authoring only accepts canonical activity keys.`,
        },
      ],
    };
  }

  const schema = getPropsSchema(componentKey);
  if (!schema) {
    return {
      success: false,
      errors: [
        {
          componentKey,
          path: [],
          message: `No schema is registered for activity key '${componentKey}'. Authoring only accepts canonical activity keys.`,
        },
      ],
    };
  }

  const result = schema.safeParse(props);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  const issues = result.error.issues ?? [];
  const errors: ActivityConfigError[] = issues.map((issue) => ({
    componentKey,
    path: pathToStrings(issue.path ?? []),
    message: issue.message,
  }));

  if (errors.length === 0) {
    errors.push({
      componentKey,
      path: [],
      message: `Activity config for '${componentKey}' failed schema validation`,
    });
  }

  return { success: false, errors };
}
