import { describe, expect, it } from "vitest";
import {
  resolveLatestPublishedLessonVersion,
  buildLatestPublishedLessonVersionMap,
  type LessonVersionLike,
} from "@/lib/progress/published-curriculum";

function makeVersion(lessonId: string, version: number, status: string): LessonVersionLike {
  return { _id: `v_${lessonId}_${version}`, lessonId, version, status };
}

describe("Curriculum query batching equivalence", () => {
  it("buildLatestPublishedLessonVersionMap matches per-lesson resolveLatestPublishedLessonVersion", () => {
    const versions: LessonVersionLike[] = [
      makeVersion("lesson1", 1, "draft"),
      makeVersion("lesson1", 2, "published"),
      makeVersion("lesson1", 3, "published"),
      makeVersion("lesson2", 1, "published"),
      makeVersion("lesson2", 2, "review"),
      makeVersion("lesson3", 1, "draft"),
      makeVersion("lesson3", 2, "review"),
      makeVersion("lesson4", 1, "published"),
      makeVersion("lesson4", 2, "published"),
      makeVersion("lesson4", 3, "published"),
    ];

    const lessonIds = ["lesson1", "lesson2", "lesson3", "lesson4"];
    const batchMap = buildLatestPublishedLessonVersionMap(versions, lessonIds);

    for (const lessonId of lessonIds) {
      const lessonVersions = versions.filter((v) => v.lessonId === lessonId);
      const perLessonResult = resolveLatestPublishedLessonVersion(lessonVersions);
      const batchResult = batchMap.get(lessonId) ?? null;

      expect(batchResult).toEqual(perLessonResult);
    }
  });

  it("handles lessons with no published versions", () => {
    const versions: LessonVersionLike[] = [
      makeVersion("lesson1", 1, "draft"),
      makeVersion("lesson1", 2, "review"),
    ];

    const batchMap = buildLatestPublishedLessonVersionMap(versions, ["lesson1"]);
    const perLessonResult = resolveLatestPublishedLessonVersion(versions);

    expect(batchMap.get("lesson1")).toBeUndefined();
    expect(perLessonResult).toBeNull();
  });

  it("handles empty versions array", () => {
    const batchMap = buildLatestPublishedLessonVersionMap([], []);

    expect(batchMap.size).toBe(0);
  });

  it("picks highest version number among published", () => {
    const versions: LessonVersionLike[] = [
      makeVersion("lesson1", 1, "published"),
      makeVersion("lesson1", 5, "published"),
      makeVersion("lesson1", 3, "published"),
    ];

    const batchMap = buildLatestPublishedLessonVersionMap(versions, ["lesson1"]);
    const perLessonResult = resolveLatestPublishedLessonVersion(versions);

    expect(batchMap.get("lesson1")!.version).toBe(5);
    expect(perLessonResult!.version).toBe(5);
  });

  it("filters to only requested lesson IDs", () => {
    const versions: LessonVersionLike[] = [
      makeVersion("lesson1", 1, "published"),
      makeVersion("lesson2", 1, "published"),
      makeVersion("lesson3", 1, "published"),
    ];

    const batchMap = buildLatestPublishedLessonVersionMap(versions, ["lesson1", "lesson3"]);

    expect(batchMap.has("lesson1")).toBe(true);
    expect(batchMap.has("lesson2")).toBe(false);
    expect(batchMap.has("lesson3")).toBe(true);
  });

  it("handles mixed published/unpublished correctly across multiple lessons", () => {
    const versions: LessonVersionLike[] = [
      makeVersion("A", 1, "published"),
      makeVersion("B", 1, "draft"),
      makeVersion("B", 2, "published"),
      makeVersion("C", 1, "review"),
      makeVersion("D", 1, "published"),
      makeVersion("D", 2, "draft"),
    ];

    const lessonIds = ["A", "B", "C", "D"];
    const batchMap = buildLatestPublishedLessonVersionMap(versions, lessonIds);

    expect(batchMap.get("A")!.version).toBe(1);
    expect(batchMap.get("B")!.version).toBe(2);
    expect(batchMap.has("C")).toBe(false);
    expect(batchMap.get("D")!.version).toBe(1);

    for (const lessonId of lessonIds) {
      const lessonVersions = versions.filter((v) => v.lessonId === lessonId);
      const perLessonResult = resolveLatestPublishedLessonVersion(lessonVersions);
      const batchResult = batchMap.get(lessonId) ?? null;
      expect(batchResult).toEqual(perLessonResult);
    }
  });
});
