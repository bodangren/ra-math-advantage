/**
 * Internal served-model validator for the OpenRouter AI layer.
 *
 * A served model is a bounded model id. A key-shaped token (for example
 * `sk-...`) is never a model and never reaches a usage record. A model id
 * equal to the configured model, or the configured model plus a bounded
 * suffix, stays valid. Other bounded ids stay valid for upstream variants.
 *
 * This module is not a package export. Both the chat path and the structured
 * helper import the same validator from here.
 */

const MODEL_ID = /^(?!sk-)[A-Za-z0-9_.:~/-]{1,128}$/;

/**
 * Accepts only a bounded model identifier for a usage record. Any other text,
 * including prompt, answer, or key text, is recorded as null.
 */
export function safeModel(value: unknown): string | null {
  return typeof value === "string" && MODEL_ID.test(value) ? value : null;
}
