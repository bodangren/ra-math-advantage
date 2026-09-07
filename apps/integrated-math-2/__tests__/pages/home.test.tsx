import { it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Home from "../../app/page";
import lessons from "../../curriculum/lessons.json";
import units from "../../curriculum/units.json";
it("uses source lesson counts in every unit card", () => {
  render(<Home />);
  for (const unit of units) {
    const title = screen.getByRole("heading", {
      name: unit.title,
      level: 4,
    });
    expect(
      within(title.parentElement!.parentElement!).getByText(
        `${lessons.filter((l) => l.unitNumber === unit.number).length} lessons`,
      ),
    ).toBeInTheDocument();
  }
  expect(screen.queryByText("100+")).not.toBeInTheDocument();
});
