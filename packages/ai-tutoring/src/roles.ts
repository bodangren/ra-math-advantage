/**
 * Role-based model configuration for the OpenRouter AI layer (STUB).
 *
 * Red phase S2 owns this stub only. It exports the names of the S2 Contract
 * task with placeholder values and no behavior, so the Red tests fail on
 * assertions. Green replaces this file with the Contract implementation:
 * the spec "Roles" table values, `resolveRoleModel` with `{ ok }` results,
 * and `buildProviderPreferences` with the four S2 Contract mappings.
 */

/**
 * AI roles and their model variables. Placeholder values only.
 */
export const AI_ROLES = {
  studentTutor: {
    env: "OPENROUTER_MODEL_STUDENT_TUTOR",
    structured: true,
    sendsPii: true,
  },
  spreadsheetEval: {
    env: "OPENROUTER_MODEL_SPREADSHEET_EVAL",
    structured: true,
    sendsPii: true,
  },
  accountingEval: {
    env: "OPENROUTER_MODEL_ACCOUNTING_EVAL",
    structured: true,
    sendsPii: true,
  },
} as const;

/**
 * One AI use with its own model variable.
 */
export type AiRole = keyof typeof AI_ROLES;

/**
 * Reads the model for a role (STUB). It always reports a placeholder model.
 */
export function resolveRoleModel(_role: AiRole): { ok: true; model: string } {
  return { ok: true, model: "stub-model" };
}

/**
 * Builds the SDK provider preferences for a role (STUB). It always returns
 * a placeholder object.
 */
export function buildProviderPreferences(_input: { structured: boolean; sendsPii: boolean }): {
  require_parameters: boolean;
} {
  return { require_parameters: true };
}
