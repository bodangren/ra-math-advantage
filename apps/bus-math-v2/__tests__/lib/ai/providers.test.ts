import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOpenRouterProvider } from "@math-platform/ai-tutoring";

describe("lib/ai/providers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createOpenRouterProvider", () => {
    it("should create a provider function", () => {
      const provider = createOpenRouterProvider({
        apiKey: "test-key",
        model: "vendor/model-a",
        role: "studentTutor",
      });
      expect(typeof provider).toBe("function");
    });

    it("should call OpenRouter API with correct parameters", async () => {
      const responseBody = JSON.stringify({
        id: "gen-1",
        created: 1,
        model: "vendor/model-a",
        object: "chat.completion",
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Test response" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      });
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => responseBody,
      });
      vi.stubGlobal("fetch", mockFetch);

      const provider = createOpenRouterProvider({
        apiKey: "test-key",
        model: "vendor/model-a",
        role: "studentTutor",
      });
      const result = await provider("Test prompt");

      expect(result).toBe("Test response");
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const request = mockFetch.mock.calls[0][0] as Request;
      expect(request.url).toBe("https://openrouter.ai/api/v1/chat/completions");
      const body = JSON.parse(await request.clone().text()) as {
        model: string;
        messages: Array<{ role: string; content: string }>;
      };
      expect(body.model).toBe("vendor/model-a");
      expect(body.messages).toEqual([{ role: "user", content: "Test prompt" }]);
    });
  });
});
