import { describe, it, expect, beforeEach } from "vitest";
import {
  registerActivity,
  getActivityComponent,
  getRegisteredActivityKeys,
  clearActivityRegistry,
} from "../registry";

describe("Activity Registry", () => {
  beforeEach(() => {
    clearActivityRegistry();
  });

  describe("registerActivity", () => {
    it("should register a component under a key", () => {
      const TestComponent = () => null;
      registerActivity("test-activity", TestComponent);
      expect(getActivityComponent("test-activity")).toBe(TestComponent);
    });

    it("should overwrite an existing registration", () => {
      const Comp1 = () => null;
      const Comp2 = () => null;
      registerActivity("test", Comp1);
      registerActivity("test", Comp2);
      expect(getActivityComponent("test")).toBe(Comp2);
    });
  });

  describe("getActivityComponent", () => {
    it("should return undefined for unregistered keys", () => {
      expect(getActivityComponent("nonexistent")).toBeUndefined();
    });

    it("should return the registered component", () => {
      const Comp = () => null;
      registerActivity("my-activity", Comp);
      expect(getActivityComponent("my-activity")).toBe(Comp);
    });
  });

  describe("getRegisteredActivityKeys", () => {
    it("should return empty array when no activities registered", () => {
      clearActivityRegistry();
      expect(getRegisteredActivityKeys()).toEqual([]);
    });

    it("should return all registered keys", () => {
      registerActivity("a", () => null);
      registerActivity("b", () => null);
      registerActivity("c", () => null);
      const keys = getRegisteredActivityKeys();
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys).toContain("c");
      expect(keys.length).toBe(3);
    });
  });

  describe("clearActivityRegistry", () => {
    it("should remove all registered activities", () => {
      registerActivity("a", () => null);
      registerActivity("b", () => null);
      clearActivityRegistry();
      expect(getRegisteredActivityKeys()).toEqual([]);
      expect(getActivityComponent("a")).toBeUndefined();
      expect(getActivityComponent("b")).toBeUndefined();
    });
  });
});
