import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CurriculumPage from "../../app/curriculum/page";
import lessons from "../../curriculum/lessons.json";
describe("public curriculum", () => {
  it("shows all 96 actual source lessons under 13 units", () => {
    render(<CurriculumPage />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(13);
    expect(screen.getByText(/96 lessons/)).toBeInTheDocument();
    for (const lesson of lessons)
      expect(
        screen.getByText(`${lesson.unitNumber}.${lesson.orderIndex} ${lesson.title}`, {
          exact: true,
        }),
      ).toBeInTheDocument();
  });
});
