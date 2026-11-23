/**
 * Role-based model configuration for the OpenRouter AI layer.
 *
 * Each AI use has one model variable. No code holds a default model. A role
 * without a configured model fails closed. Roles never use presets.
 */

/** One AI use with its own model variable. */
export const AI_ROLES = {
  studentTutor: {
    env: "OPENROUTER_MODEL_STUDENT_TUTOR",
    structured: false,
    sendsPii: false,
  },
  spreadsheetEval: {
    env: "OPENROUTER_MODEL_SPREADSHEET_EVAL",
    structured: true,
    sendsPii: false,
  },
  accountingEval: {
    env: "OPENROUTER_MODEL_ACCOUNTING_EVAL",
    structured: true,
    sendsPii: false,
  },
} as const;

/** One AI use with its own model variable. */
export type AiRole = keyof typeof AI_ROLES;

/** The result of reading the configured model of a role. */
export type RoleModelResult =
  | { ok: true; model: string }
  | { ok: false; missing: string; reason: "missing" | "preset" };

/**
 * Reads the model of a role from its own environment variable.
 * An absent, empty, or whitespace value is missing. A preset is rejected.
 */
export function resolveRoleModel(role: AiRole): RoleModelResult {
  const { env } = AI_ROLES[role];
  const raw = process.env[env];

  if (!raw || raw.trim().length === 0) {
    return { ok: false, missing: env, reason: "missing" };
  }

  const model = raw.trim();
  if (model.startsWith("@preset/")) {
    return { ok: false, missing: env, reason: "preset" };
  }

  return { ok: true, model };
}

/** The SDK provider preference fields of a request. */
export interface ProviderPreferences {
  requireParameters?: boolean;
  zdr?: boolean;
}

/**
 * Builds the SDK provider preferences of a role.
 * No preferences gives undefined. Structured output needs
 * `requireParameters`. A role with the PII flag needs `zdr`.
 * These are the SDK field names; the outbound JSON uses snake_case.
 */
export function buildProviderPreferences(input: {
  structured: boolean;
  sendsPii: boolean;
}): ProviderPreferences | undefined {
  if (!input.structured && !input.sendsPii) {
    return undefined;
  }

  const preferences: ProviderPreferences = {};
  if (input.structured) {
    preferences.requireParameters = true;
  }
  if (input.sendsPii) {
    preferences.zdr = true;
  }
  return preferences;
}
