import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveRoleModel } from "../roles";

const ORIGINAL_ENV = process.env;

describe("model value preservation", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.OPENROUTER_MODEL_STUDENT_TUTOR;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = ORIGINAL_ENV;
  });

  it("keeps a nonblank model value unchanged and rejects whitespace-only values", () => {
    const padded = "  vendor/model-padded  ";
    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = padded;

    const result = resolveRoleModel("studentTutor");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.model).toBe(padded);
    }

    process.env.OPENROUTER_MODEL_STUDENT_TUTOR = "   ";
    expect(resolveRoleModel("studentTutor")).toEqual({
      ok: false,
      missing: "OPENROUTER_MODEL_STUDENT_TUTOR",
      reason: "missing",
    });
  });
});
