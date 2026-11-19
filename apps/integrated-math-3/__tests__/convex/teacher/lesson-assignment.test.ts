import { describe, it, expect, vi } from "vitest";
import type { Id } from "@/convex/_generated/dataModel";
import {
  assignLessonToClassHandler,
  unassignLessonFromClassHandler,
  getTeacherClassesWithLessonsHandler,
  getAvailableLessonsHandler,
} from "@/convex/teacher/lessonAssignment";
import type { QueryCtx, MutationCtx } from "@/convex/_generated/server";

function makeQueryMockCtx(
  overrides: {
    profiles?: Array<{
      _id: Id<"profiles">;
      username: string;
      displayName?: string;
      role: "student" | "teacher" | "admin";
      organizationId: Id<"organizations">;
    }>;
    classes?: Array<{
      _id: Id<"classes">;
      name: string;
      teacherId: Id<"profiles">;
      archived?: boolean;
      createdAt: number;
      updatedAt: number;
    }>;
    lessons?: Array<{
      _id: Id<"lessons">;
      title: string;
      slug: string;
      unitNumber: number;
      orderIndex: number;
      createdAt: number;
      updatedAt: number;
    }>;
    classLessons?: Array<{
      _id: Id<"class_lessons">;
      classId: Id<"classes">;
      lessonId: Id<"lessons">;
      assignedAt: number;
      createdAt: number;
    }>;
  } = {},
) {
  const { profiles = [], classes = [], lessons = [], classLessons = [] } = overrides;

  const mockCtx = {
    db: {
      get: vi.fn().mockImplementation((table: string, id: Id<any>) => {
        if (table === "profiles") {
          return Promise.resolve(profiles.find((p) => p._id === id) ?? null);
        }
        if (table === "classes") {
          return Promise.resolve(classes.find((c) => c._id === id) ?? null);
        }
        if (table === "lessons") {
          return Promise.resolve(lessons.find((l) => l._id === id) ?? null);
        }
        return Promise.resolve(null);
      }),
      query: vi.fn().mockImplementation((table: string) => {
        if (table === "classes") {
          return {
            withIndex: vi.fn().mockImplementation((indexName: string, fn: (q: any) => any) => {
              if (indexName === "by_teacher") {
                const mockQ = { eq: vi.fn() };
                fn(mockQ);
                return {
                  collect: vi
                    .fn()
                    .mockResolvedValue(
                      classes.filter((c) => c.teacherId === mockQ.eq.mock.calls[0]?.[1]),
                    ),
                };
              }
              return {
                withIndex: vi.fn().mockReturnThis(),
                collect: vi.fn().mockResolvedValue([]),
              };
            }),
          };
        }
        if (table === "lessons") {
          return {
            withIndex: vi.fn().mockImplementation((indexName: string) => {
              if (indexName === "by_unit_and_order") {
                return {
                  collect: vi.fn().mockResolvedValue(lessons),
                };
              }
              return {
                withIndex: vi.fn().mockReturnThis(),
                collect: vi.fn().mockResolvedValue([]),
              };
            }),
          };
        }
        if (table === "class_lessons") {
          return {
            withIndex: vi.fn().mockImplementation((indexName: string, fn: (q: any) => any) => {
              let capturedClassId: Id<"classes"> | null = null;
              let capturedLessonId: Id<"lessons"> | null = null;
              const mockQ = {
                eq: vi.fn().mockImplementation((field: string, value: unknown) => {
                  if (field === "classId") capturedClassId = value as Id<"classes">;
                  if (field === "lessonId") capturedLessonId = value as Id<"lessons">;
                  return mockQ;
                }),
              };
              fn(mockQ);
              if (indexName === "by_class_and_lesson" && capturedClassId && capturedLessonId) {
                return {
                  first: vi
                    .fn()
                    .mockResolvedValue(
                      classLessons.find(
                        (cl) => cl.classId === capturedClassId && cl.lessonId === capturedLessonId,
                      ) ?? null,
                    ),
                  collect: vi
                    .fn()
                    .mockResolvedValue(
                      classLessons.filter(
                        (cl) => cl.classId === capturedClassId && cl.lessonId === capturedLessonId,
                      ),
                    ),
                };
              }
              if (indexName === "by_class_and_lesson" && capturedClassId) {
                return {
                  first: vi
                    .fn()
                    .mockResolvedValue(
                      classLessons.find((cl) => cl.classId === capturedClassId) ?? null,
                    ),
                  collect: vi
                    .fn()
                    .mockResolvedValue(classLessons.filter((cl) => cl.classId === capturedClassId)),
                };
              }
              return {
                first: vi.fn().mockResolvedValue(null),
                collect: vi.fn().mockResolvedValue([]),
              };
            }),
          };
        }
        return { withIndex: vi.fn().mockReturnThis(), collect: vi.fn().mockResolvedValue([]) };
      }),
    },
  } as unknown as QueryCtx;

  return mockCtx;
}

function makeMutationMockCtx(
  overrides: {
    profiles?: Array<{
      _id: Id<"profiles">;
      username: string;
      displayName?: string;
      role: "student" | "teacher" | "admin";
      organizationId: Id<"organizations">;
    }>;
    classes?: Array<{
      _id: Id<"classes">;
      name: string;
      teacherId: Id<"profiles">;
      archived?: boolean;
      createdAt: number;
      updatedAt: number;
    }>;
    classLessons?: Array<{
      _id: Id<"class_lessons">;
      classId: Id<"classes">;
      lessonId: Id<"lessons">;
      assignedAt: number;
      createdAt: number;
    }>;
  } = {},
) {
  const { profiles = [], classes = [], classLessons = [] } = overrides;

  let nextId = 1;
  const insertCalls: any[] = [];
  const deleteCalls: Id<"class_lessons">[] = [];

  const mockCtx = {
    db: {
      get: vi.fn().mockImplementation((table: string, id: Id<any>) => {
        if (table === "profiles") {
          return Promise.resolve(profiles.find((p) => p._id === id) ?? null);
        }
        if (table === "classes") {
          return Promise.resolve(classes.find((c) => c._id === id) ?? null);
        }
        return Promise.resolve(null);
      }),
      query: vi.fn().mockImplementation((table: string) => {
        if (table === "classes") {
          return {
            withIndex: vi.fn().mockImplementation((indexName: string, fn: (q: any) => any) => {
              if (indexName === "by_teacher") {
                const mockQ = { eq: vi.fn() };
                fn(mockQ);
                return {
                  collect: vi
                    .fn()
                    .mockResolvedValue(
                      classes.filter((c) => c.teacherId === mockQ.eq.mock.calls[0]?.[1]),
                    ),
                };
              }
              return {
                withIndex: vi.fn().mockReturnThis(),
                collect: vi.fn().mockResolvedValue([]),
              };
            }),
          };
        }
        if (table === "class_lessons") {
          return {
            withIndex: vi.fn().mockImplementation((indexName: string, fn: (q: any) => any) => {
              let capturedClassId: Id<"classes"> | null = null;
              let capturedLessonId: Id<"lessons"> | null = null;
              const mockQ = {
                eq: vi.fn().mockImplementation((field: string, value: unknown) => {
                  if (field === "classId") capturedClassId = value as Id<"classes">;
                  if (field === "lessonId") capturedLessonId = value as Id<"lessons">;
                  return mockQ;
                }),
              };
              fn(mockQ);
              if (indexName === "by_class_and_lesson" && capturedClassId && capturedLessonId) {
                return {
                  first: vi
                    .fn()
                    .mockResolvedValue(
                      classLessons.find(
                        (cl) => cl.classId === capturedClassId && cl.lessonId === capturedLessonId,
                      ) ?? null,
                    ),
                };
              }
              return { first: vi.fn().mockResolvedValue(null) };
            }),
          };
        }
        return { withIndex: vi.fn().mockReturnThis(), collect: vi.fn().mockResolvedValue([]) };
      }),
      insert: vi.fn().mockImplementation((table: string, doc: any) => {
        const newDoc = { ...doc, _id: `class_lesson_${nextId++}` as Id<"class_lessons"> };
        insertCalls.push(newDoc);
        return Promise.resolve(newDoc._id);
      }),
      delete: vi.fn().mockImplementation((id: Id<"class_lessons">) => {
        deleteCalls.push(id);
        return Promise.resolve();
      }),
    },
  } as unknown as MutationCtx;

  return { mockCtx, insertCalls, deleteCalls };
}

describe("getTeacherClassesWithLessons", () => {
  it("returns empty array for non-teacher", async () => {
    const ctx = makeQueryMockCtx({
      profiles: [
        {
          _id: "profile1" as Id<"profiles">,
          username: "student1",
          role: "student",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
    });

    const result = await getTeacherClassesWithLessonsHandler(ctx, {
      userId: "profile1" as Id<"profiles">,
    });

    expect(result).toEqual([]);
  });

  it("returns classes with assigned lessons for teacher", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const ctx = makeQueryMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [
        {
          _id: "cl1" as Id<"class_lessons">,
          classId,
          lessonId,
          assignedAt: Date.now(),
          createdAt: Date.now(),
        },
      ],
    });

    const result = await getTeacherClassesWithLessonsHandler(ctx, { userId: teacherId });

    expect(result).toHaveLength(1);
    expect(result[0].classId).toBe(classId);
    expect(result[0].className).toBe("Period 1");
    expect(result[0].assignedLessonIds).toContain(lessonId);
  });

  it("excludes archived classes", async () => {
    const teacherId = "teacher1" as Id<"profiles">;

    const ctx = makeQueryMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: "class1" as Id<"classes">,
          name: "Active Class",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "class2" as Id<"classes">,
          name: "Archived Class",
          teacherId,
          archived: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    });

    const result = await getTeacherClassesWithLessonsHandler(ctx, { userId: teacherId });

    expect(result).toHaveLength(1);
    expect(result[0].className).toBe("Active Class");
  });
});

describe("getAvailableLessons", () => {
  it("returns all lessons ordered by unit and order", async () => {
    const ctx = makeQueryMockCtx({
      lessons: [
        {
          _id: "lesson2" as Id<"lessons">,
          title: "Lesson 2",
          slug: "lesson-2",
          unitNumber: 1,
          orderIndex: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "lesson1" as Id<"lessons">,
          title: "Lesson 1",
          slug: "lesson-1",
          unitNumber: 1,
          orderIndex: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    });

    const result = await getAvailableLessonsHandler(ctx);

    expect(result).toHaveLength(2);
  });
});

describe("assignLessonToClass", () => {
  it("assigns lesson to class when teacher owns class", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [],
    });

    const result = await assignLessonToClassHandler(mockCtx, {
      userId: teacherId,
      classId,
      lessonId,
    });

    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(false);
  });

  it("returns alreadyExists true when assignment exists", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [
        {
          _id: "existing" as Id<"class_lessons">,
          classId,
          lessonId,
          assignedAt: Date.now(),
          createdAt: Date.now(),
        },
      ],
    });

    const result = await assignLessonToClassHandler(mockCtx, {
      userId: teacherId,
      classId,
      lessonId,
    });

    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(true);
  });

  it("throws error when teacher does not own class", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const otherTeacherId = "teacher2" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
        {
          _id: otherTeacherId,
          username: "teacher2",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId: otherTeacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [],
    });

    await expect(
      assignLessonToClassHandler(mockCtx, {
        userId: teacherId,
        classId,
        lessonId,
      }),
    ).rejects.toThrow("Unauthorized");
  });
});

describe("unassignLessonFromClass", () => {
  it("unassigns lesson from class when assignment exists", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx, deleteCalls } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [
        {
          _id: "cl1" as Id<"class_lessons">,
          classId,
          lessonId,
          assignedAt: Date.now(),
          createdAt: Date.now(),
        },
      ],
    });

    const result = await unassignLessonFromClassHandler(mockCtx, {
      userId: teacherId,
      classId,
      lessonId,
    });

    expect(result.success).toBe(true);
    expect(result.wasDeleted).toBe(true);
    expect(deleteCalls).toHaveLength(1);
  });

  it("returns wasDeleted false when no assignment exists", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx, deleteCalls } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [],
    });

    const result = await unassignLessonFromClassHandler(mockCtx, {
      userId: teacherId,
      classId,
      lessonId,
    });

    expect(result.success).toBe(true);
    expect(result.wasDeleted).toBe(false);
    expect(deleteCalls).toHaveLength(0);
  });

  it("throws error when teacher does not own class", async () => {
    const teacherId = "teacher1" as Id<"profiles">;
    const otherTeacherId = "teacher2" as Id<"profiles">;
    const classId = "class1" as Id<"classes">;
    const lessonId = "lesson1" as Id<"lessons">;

    const { mockCtx } = makeMutationMockCtx({
      profiles: [
        {
          _id: teacherId,
          username: "teacher1",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
        {
          _id: otherTeacherId,
          username: "teacher2",
          role: "teacher",
          organizationId: "org1" as Id<"organizations">,
        },
      ],
      classes: [
        {
          _id: classId,
          name: "Period 1",
          teacherId: otherTeacherId,
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      classLessons: [],
    });

    await expect(
      unassignLessonFromClassHandler(mockCtx, {
        userId: teacherId,
        classId,
        lessonId,
      }),
    ).rejects.toThrow("Unauthorized");
  });
});
