/**
 * Usage logging for the OpenRouter AI layer (STUB).
 *
 * Red phase S2 owns this stub only. It exports the names of the S2 Contract
 * task with no behavior, so the Red tests fail on assertions. Green replaces
 * this file with the Contract implementation: one `console.info` line for
 * each request and the `console.error` line for a missing setting.
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

/**
 * Logs one usage record (STUB). It writes nothing.
 */
export function logAiRequest(_record: AiRequestRecord): void {
  // STUB: Green writes console.info('[ai-tutoring] request', JSON.stringify(record)).
}
