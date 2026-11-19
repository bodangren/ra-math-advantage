import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useStudyPreferences,
  useTermMastery,
  useDueTerms,
  useRecentSessions,
  useProcessReview,
  useRecordSession,
  getGlossaryTermDisplay,
} from "../../hooks/useStudy";
const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});
const response = (data: unknown) => new Response(JSON.stringify(data));
describe("study hooks through authenticated routes", () => {
  it("loads preferences without sending a user ID", async () => {
    mockFetch.mockResolvedValue(response({ languageMode: "en_to_zh" }));
    const { result } = renderHook(() => useStudyPreferences());
    expect(result.current.languageMode).toBe("en_to_en");
    await waitFor(() => expect(result.current.languageMode).toBe("en_to_zh"));
    const url = new URL(mockFetch.mock.calls[0][0], "http://localhost");
    expect(JSON.parse(url.searchParams.get("request")!)).toEqual({
      operation: "getStudyPreferences",
      args: {},
    });
  });
  it.each([
    ["getTermMasteryByUnit", () => useTermMastery(2), { unitNumber: 2 }],
    ["getDueTerms", () => useDueTerms(), {}],
    ["getRecentSessions", () => useRecentSessions(5), { limit: 5 }],
  ] as const)("loads %s", async (operation, hook, args) => {
    mockFetch.mockResolvedValue(response([{ id: "result" }]));
    const { result } = renderHook<unknown, void>(hook);
    await waitFor(() => expect(result.current).toEqual([{ id: "result" }]));
    expect(
      JSON.parse(
        new URL(mockFetch.mock.calls[0][0], "http://localhost").searchParams.get("request")!,
      ),
    ).toEqual({ operation, args });
  });
  it("loads recent sessions with the server default limit", async () => {
    mockFetch.mockResolvedValue(response([]));
    const { result } = renderHook(() => useRecentSessions());
    await waitFor(() => expect(result.current).toEqual([]));
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  it("saves preferences and refreshes subscribed data", async () => {
    mockFetch.mockResolvedValue(response({ languageMode: "en_to_en" }));
    const { result } = renderHook(() => useStudyPreferences());
    await waitFor(() => expect(result.current.preferences).toBeDefined());
    mockFetch.mockImplementation(async (_url, options) =>
      response(options?.method === "POST" ? null : { languageMode: "zh_to_en" }),
    );
    await act(() => result.current.updatePreferences({ languageMode: "zh_to_en" }));
    await waitFor(() => expect(result.current.languageMode).toBe("zh_to_en"));
    const call = mockFetch.mock.calls.find(([, options]) => options?.method === "POST")!;
    expect(JSON.parse(call[1].body)).toEqual({
      operation: "updatePreferences",
      args: { languageMode: "zh_to_en" },
    });
  });
  it("exposes server errors to callers of mutations", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 503 }));
    const { result } = renderHook(() => useProcessReview());
    await expect(result.current({ termSlug: "asset", rating: "good" })).rejects.toThrow(
      "Unable to load or save study data.",
    );
  });
  it("returns a stable session save function", () => {
    const { result, rerender } = renderHook(() => useRecordSession());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe("getGlossaryTermDisplay", () => {
  const mockTerm = {
    slug: "asset",
    term_en: "Asset",
    term_zh: "资产",
    def_en: "An economic resource owned by a business",
    def_zh: "企业拥有的经济资源",
    units: [1],
    topics: ["accounting-basics"],
    synonyms: [],
    related: [],
  };

  it("returns en_to_en mode", () => {
    const result = getGlossaryTermDisplay(mockTerm, "en_to_en");
    expect(result).toEqual({ prompt: "Asset", answer: "An economic resource owned by a business" });
  });

  it("returns en_to_zh mode", () => {
    const result = getGlossaryTermDisplay(mockTerm, "en_to_zh");
    expect(result).toEqual({ prompt: "Asset", answer: "资产" });
  });

  it("returns zh_to_en mode", () => {
    const result = getGlossaryTermDisplay(mockTerm, "zh_to_en");
    expect(result).toEqual({ prompt: "资产", answer: "Asset" });
  });

  it("returns zh_to_zh mode", () => {
    const result = getGlossaryTermDisplay(mockTerm, "zh_to_zh");
    expect(result).toEqual({ prompt: "资产", answer: "企业拥有的经济资源" });
  });

  it("returns default en_to_en for unknown mode", () => {
    // @ts-expect-error testing invalid mode
    const result = getGlossaryTermDisplay(mockTerm, "invalid_mode");
    expect(result).toEqual({ prompt: "Asset", answer: "An economic resource owned by a business" });
  });
});
