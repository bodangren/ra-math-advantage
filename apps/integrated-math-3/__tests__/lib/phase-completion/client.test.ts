import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { completePhaseRequest } from "@/lib/phase-completion/client";

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

describe("completePhaseRequest", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the opaque completion key in the established JSON body", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, nextPhaseUnlocked: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      completePhaseRequest({
        lessonId: "module-3-lesson-2",
        phaseNumber: 4,
        timeSpent: 75,
        linkedStandardId: "CCSS.MATH.HSF.IF.C.7",
        idempotencyKey: "client-completion-key",
      }),
    ).resolves.toStrictEqual({ success: true, nextPhaseUnlocked: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestCall = fetchMock.mock.calls[0];
    if (!requestCall) throw new Error("Expected one completion request");
    const [url, init] = requestCall;
    if (!init) throw new Error("Expected completion request options");

    expect(url).toBe("/api/phases/complete");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).has("Idempotency-Key")).toBe(false);
    expect(JSON.parse(String(init.body))).toStrictEqual({
      lessonId: "module-3-lesson-2",
      phaseNumber: 4,
      timeSpent: 75,
      linkedStandardId: "CCSS.MATH.HSF.IF.C.7",
      idempotencyKey: "client-completion-key",
    });
  });
});
