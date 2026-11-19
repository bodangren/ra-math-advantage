import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearnIndex } from "../../components/learn-index";
import { LearnTechniqueView } from "../../components/learn-technique-view";
import {
  LEARN_TECHNIQUES,
  getLearnTechnique,
  getLearnTechniqueNavigation,
} from "../../lib/learn/catalog";

describe("Danielson Learn interfaces", () => {
  it("lists all 63 techniques once under Danielson domains and components", () => {
    render(<LearnIndex techniques={LEARN_TECHNIQUES} />);

    expect(screen.getByRole("heading", { name: "Learn the target skills" })).toBeVisible();
    expect(screen.getAllByRole("heading", { name: /Domain [1-4]:/ })).toHaveLength(4);
    const links = screen.getAllByRole("link", { name: /^Learn / });
    expect(links).toHaveLength(63);
    expect(new Set(links.map((link) => link.getAttribute("href")))).toHaveLength(63);
    expect(screen.getByRole("link", { name: "Learn Cold Call" })).toHaveAttribute(
      "href",
      "/learn/cold-call",
    );
  });

  it("shows approved content, numbered steps, source, and book reference", () => {
    const technique = getLearnTechnique("cold-call");
    if (!technique) throw new Error("Cold Call fixture is missing.");
    render(
      <LearnTechniqueView
        technique={technique}
        navigation={getLearnTechniqueNavigation(technique.id)}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Cold Call" })).toBeVisible();
    expect(screen.getByText("3b: Skillful Questioning and Discussion Methods")).toBeVisible();
    expect(screen.getByText(/Via TLAC 3.0/)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Use the technique" })).toBeVisible();
    expect(
      within(screen.getByRole("list", { name: "Cold Call action steps" })).getAllByRole("listitem"),
    ).toHaveLength(technique.actionSteps.length);
    expect(screen.getByText("Teach Like a Champion 3.0")).toBeVisible();
    expect(screen.getByText("Technique 34")).toBeVisible();
    expect(screen.getByRole("link", { name: "All Learn pages" })).toHaveAttribute("href", "/learn");
  });

  it("shows a video only when the approved module has a video ID", () => {
    const coldCall = getLearnTechnique("cold-call");
    const faseReading = getLearnTechnique("fase-reading");
    if (!coldCall || !faseReading) throw new Error("Learn fixtures are missing.");

    const { rerender } = render(
      <LearnTechniqueView
        technique={coldCall}
        navigation={getLearnTechniqueNavigation(coldCall.id)}
      />,
    );
    expect(screen.getByTitle("Cold Call demonstration")).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/5xdNVAqsiKU"),
    );

    rerender(
      <LearnTechniqueView
        technique={faseReading}
        navigation={getLearnTechniqueNavigation(faseReading.id)}
      />,
    );
    expect(screen.queryByTitle("FASE Reading demonstration")).not.toBeInTheDocument();
  });
});

it("uses canonical component names and explains incomplete framework coverage", () => {
  render(<LearnIndex techniques={LEARN_TECHNIQUES} />);
  expect(
    screen.getByRole("heading", { name: "3e: Adapting Instruction to Student Needs" }),
  ).toBeVisible();
  expect(screen.getByText(/does not cover all 22/)).toBeVisible();
});
