import { describe, expect, it, vi } from "vitest";
import { createElement, Suspense } from "react";
import { render, screen } from "@testing-library/react";
import { getActivityComponent } from "@/lib/activities/registry";
vi.mock("@/components/activities/quiz/ComprehensionCheck", () => ({
  ComprehensionCheck: () => "ComprehensionCheck",
}));
vi.mock("@/components/activities/quiz/TieredAssessment", () => ({
  TieredAssessment: () => "TieredAssessment",
}));
vi.mock("@/components/activities/accounting/JournalEntryActivity", () => ({
  JournalEntryActivity: () => "JournalEntryActivity",
}));
vi.mock("@/components/activities/spreadsheet/DataCleaningActivity", () => ({
  DataCleaningActivity: () => "DataCleaningActivity",
}));
vi.mock("@/components/activities/spreadsheet/SpreadsheetActivityAdapter", () => ({
  SpreadsheetActivityAdapter: () => "SpreadsheetActivityAdapter",
}));
vi.mock("@/components/activities/graphing/GraphingExplorer", () => ({
  GraphingExplorer: () => "GraphingExplorer",
}));
describe("activityRegistry", () => {
  it.each([
    ["comprehension-quiz", "ComprehensionCheck"],
    ["tiered-assessment", "TieredAssessment"],
    ["journal-entry-building", "JournalEntryActivity"],
    ["spreadsheet", "SpreadsheetActivityAdapter"],
    ["data-cleaning", "DataCleaningActivity"],
    ["graphing-explorer", "GraphingExplorer"],
  ])("loads the correct component for %s", async (key, name) => {
    const component = getActivityComponent(key);
    expect(component).not.toBeNull();
    render(createElement(Suspense, { fallback: "Loading" }, createElement(component!)));
    expect(await screen.findByText(name)).toBeInTheDocument();
  });
  it("does not resolve removed aliases", () => {
    for (const key of [
      "general-drag-and-drop",
      "journal-entry-activity",
      "spreadsheet-activity",
      "data-cleaning-activity",
    ]) {
      expect(getActivityComponent(key)).toBeNull();
    }
  });
});
