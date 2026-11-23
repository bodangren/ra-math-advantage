import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AI_ROLES, resolveRoleModel, buildProviderPreferences, type AiRole } from "../index";
import { logAiRequest } from "../usage-log";

const ORIGINAL_ENV = process.env;

describe("package entry exports", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "vendor/model-entry";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = ORIGINAL_ENV;
  });

  it("exposes the four new exports through the package entry", () => {
    const role: AiRole = "studentTutor";

    expect(AI_ROLES[role].env).toBe("OPENROUTER_MODEL_STUDENT_TUTOR");
    expect(resolveRoleModel(role)).toEqual({ ok: true, model: "vendor/model-entry" });
    expect(buildProviderPreferences({ structured: false, sendsPii: false })).toBeUndefined();

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    logAiRequest({
      role,
      model: "vendor/model-entry",
      latencyMs: 1,
      promptTokens: 1,
      completionTokens: 1,
      totalTokens: 2,
      outcome: "ok",
      status: null,
    });
    expect(info).toHaveBeenCalledTimes(1);
  });
});
