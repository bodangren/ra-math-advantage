import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/auth/server", () => ({ requireTeacherSessionClaims: mocks.auth }));
vi.mock("@/lib/convex/server", () => ({
  fetchInternalQuery: mocks.query,
  internal: { course: { getTopic11TeacherCandidates: "candidates" } },
}));
import TeacherDashboard from "@/app/teacher/dashboard/page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ sub: "teacher" });
});

it("requires a teacher session and renders the exact candidate choices", async () => {
  mocks.query.mockResolvedValue([
    {
      learnerId: "student",
      learnerName: "Student One",
      submissionId: "submission",
      acknowledgedAt: Date.UTC(2026, 8, 7),
      lessonLabel: "Change in Tandem",
      classChoices: [{ classId: "class", className: "Period 1" }],
    },
  ]);
  render(await TeacherDashboard());
  expect(mocks.auth).toHaveBeenCalledWith("/teacher/dashboard");
  expect(mocks.query).toHaveBeenCalledWith("candidates", { teacherId: "teacher" });
  expect(screen.getByText("Student One")).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Class" })).toHaveValue("class");
  expect(screen.getByRole("link", { name: "View Curriculum" })).toHaveAttribute(
    "href",
    "/curriculum",
  );
  expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
});

it("renders the empty candidate state", async () => {
  mocks.query.mockResolvedValue([]);
  render(await TeacherDashboard());
  expect(
    screen.getByText("No Topic 1.1 classroom introductions are waiting for confirmation."),
  ).toBeInTheDocument();
});
