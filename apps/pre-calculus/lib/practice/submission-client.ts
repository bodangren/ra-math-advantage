import { z } from "zod";

const delivery = z.enum(["new", "replay"]);
const evidenceResponseSchema = z
  .object({
    persisted: z.boolean(),
    masteryApplied: z.boolean(),
    kstApplied: z.boolean(),
    delivery,
    decision: z
      .object({
        idempotency: delivery,
        exposureState: z.enum(["awaiting_teacher_exposure", "introduced"]),
        eligible: z.boolean(),
        masteryBearing: z.boolean(),
        reason: z.enum([
          "node_not_enabled",
          "idempotency_conflict",
          "teacher_led",
          "awaiting_teacher_exposure",
          "ungraded_evidence",
          "eligible",
        ]),
      })
      .strict(),
  })
  .strict();

export function parseEvidenceResponse(value: unknown, message: string) {
  const result = evidenceResponseSchema.safeParse(value);
  if (!result.success) throw new Error(message);
  return result.data;
}

/** Retries receive the same serialized body and creation key from the caller. */
export async function postPracticeJson(
  url: string,
  body: string,
  message: string,
  idempotencyKey?: string,
): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body,
  });
  if (!response.ok) throw new Error(message);
  return response.json().catch(() => null);
}
