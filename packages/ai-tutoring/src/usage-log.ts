/**
 * Usage logging for the OpenRouter AI layer.
 *
 * One usage record is written for each request. No record holds a key, a
 * prompt, or an answer. A missing setting writes one error line.
 */

/**
 * One usage record for a completed or failed AI request. It never holds
 * prompt text, answer text, or the API key.
 */
export interface AiRequestRecord {
  role: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  outcome: "ok" | "error";
  status: number | null;
}

/** Writes one usage record for a request. */
export function logAiRequest(record: AiRequestRecord): void {
  console.info("[ai-tutoring] request", JSON.stringify(record));
}

/** Writes one line when a role setting or the API key is missing. */
export function logRoleNotConfigured(role: string, missing: string, reason: string): void {
  console.error("[ai-tutoring] AI role not configured", JSON.stringify({ role, missing, reason }));
}
