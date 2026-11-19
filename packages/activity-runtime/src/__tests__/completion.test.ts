import { describe, it, expect, beforeEach } from "vitest";
import { PhaseActivityTracker } from "../index";

describe("PhaseActivityTracker", () => {
  let tracker: PhaseActivityTracker;

  beforeEach(() => {
    tracker = new PhaseActivityTracker();
  });

  describe("markActivityComplete", () => {
    it("marks activity as complete for a student", () => {
      tracker.markActivityComplete("student1", "activity1");
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(true);
    });

    it("can mark multiple activities for same student", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student1", "activity2");
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(true);
      expect(tracker.isActivityComplete("student1", "activity2")).toBe(true);
    });

    it("tracks activities separately for different students", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student2", "activity2");
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(true);
      expect(tracker.isActivityComplete("student1", "activity2")).toBe(false);
      expect(tracker.isActivityComplete("student2", "activity1")).toBe(false);
      expect(tracker.isActivityComplete("student2", "activity2")).toBe(true);
    });
  });

  describe("isActivityComplete", () => {
    it("returns false for incomplete activity", () => {
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(false);
    });

    it("returns false for unknown student", () => {
      expect(tracker.isActivityComplete("unknown", "activity1")).toBe(false);
    });
  });

  describe("areAllActivitiesComplete", () => {
    it("returns true for empty required list", () => {
      expect(tracker.areAllActivitiesComplete("student1", [])).toBe(true);
    });

    it("returns false if any activity is incomplete", () => {
      tracker.markActivityComplete("student1", "activity1");
      expect(tracker.areAllActivitiesComplete("student1", ["activity1", "activity2"])).toBe(false);
    });

    it("returns true if all activities are complete", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student1", "activity2");
      expect(tracker.areAllActivitiesComplete("student1", ["activity1", "activity2"])).toBe(true);
    });

    it("returns false for unknown student", () => {
      expect(tracker.areAllActivitiesComplete("unknown", ["activity1"])).toBe(false);
    });
  });

  describe("getCompletedActivities", () => {
    it("returns empty array for unknown student", () => {
      expect(tracker.getCompletedActivities("unknown")).toEqual([]);
    });

    it("returns list of completed activity IDs", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student1", "activity2");
      expect(tracker.getCompletedActivities("student1")).toEqual(["activity1", "activity2"]);
    });
  });

  describe("clearStudent", () => {
    it("removes all completions for a student", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student1", "activity2");
      tracker.clearStudent("student1");
      expect(tracker.getCompletedActivities("student1")).toEqual([]);
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(false);
    });

    it("does not affect other students", () => {
      tracker.markActivityComplete("student1", "activity1");
      tracker.markActivityComplete("student2", "activity2");
      tracker.clearStudent("student1");
      expect(tracker.isActivityComplete("student1", "activity1")).toBe(false);
      expect(tracker.isActivityComplete("student2", "activity2")).toBe(true);
    });
  });
});
